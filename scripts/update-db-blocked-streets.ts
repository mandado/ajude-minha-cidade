/**
 * Atualiza as ruas interditadas no banco com coordenadas reais e geometria OSM.
 *
 * Para cada registro em blocked_streets sem paths (ou com coordenadas aproximadas):
 *   1. Geocodifica via Nominatim → lat/lng precisos
 *   2. Busca geometria real via Overpass API → paths (polylines)
 *   3. Atualiza o registro no banco
 *
 * Uso:
 *   dotenv -e .env -- tsx scripts/update-db-blocked-streets.ts
 *
 * Flags opcionais:
 *   --all        Reprocessa todos os registros (mesmo os que já têm paths)
 *   --id=<uuid>  Reprocessa apenas um registro específico
 *   --dry-run    Mostra o que faria sem gravar no banco
 */

import { createClient } from "@supabase/supabase-js";

// ── Supabase (service role ignora RLS) ────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── Flags de linha de comando ─────────────────────────────────────────────────

const args = process.argv.slice(2);
const ALL = args.includes("--all");
const DRY_RUN = args.includes("--dry-run");
const ONLY_ID = args.find((a) => a.startsWith("--id="))?.split("=")[1];

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── 1. Nominatim: geocodificação forward ──────────────────────────────────────

async function geocodeNominatim(
  name: string,
  neighborhood: string,
  city: string,
): Promise<{ lat: number; lng: number } | null> {
  // Tenta queries do mais específico para o mais genérico
  const queries = [
    neighborhood ? `${name}, ${neighborhood}, ${city}, MG, Brazil` : null,
    `${name}, ${city}, MG, Brazil`,
    `${name}, ${city}, Brazil`,
  ].filter(Boolean) as string[];

  for (const q of queries) {
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      url.searchParams.set("countrycodes", "br");
      url.searchParams.set("accept-language", "pt-BR,pt");

      const res = await fetch(url.toString(), {
        headers: { "User-Agent": "AjudaMinhaCidade/1.0 (contato@ajudeminhacidade.com.br)" },
      });
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch {
      // tenta próxima query
    }
    await sleep(1100); // respeita 1 req/s do Nominatim
  }

  return null;
}

// ── 2. Overpass: geometria real da via ────────────────────────────────────────

async function fetchOverpassPaths(
  streetName: string,
  lat: number,
  lng: number,
): Promise<[number, number][][] | null> {
  // Tenta variações do nome (com e sem sufixos numéricos)
  const cleaned = streetName.replace(/[\d,]+\s*$/, "").trim();
  const namesToTry = [
    streetName,
    ...(cleaned !== streetName ? [cleaned] : []),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  for (const name of namesToTry) {
    const query = `[out:json];way["name"="${name}"](around:600,${lat},${lng});out geom;`;
    try {
      const res = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
        { headers: { "User-Agent": "AjudaMinhaCidade/1.0" } },
      );
      const data = await res.json();

      if (!data.elements?.length) continue;

      const paths: [number, number][][] = data.elements
        .filter(
          (el: { type: string; geometry?: { lat: number; lon: number }[] }) =>
            el.type === "way" && el.geometry?.length,
        )
        .map((el: { geometry: { lat: number; lon: number }[] }) =>
          el.geometry.map((pt) => [pt.lat, pt.lon] as [number, number]),
        );

      if (paths.length) return paths;
    } catch {
      // tenta próximo nome
    }
    await sleep(1100);
  }

  return null;
}

// ── 3. Busca registros do banco ────────────────────────────────────────────────

interface BlockedStreetRow {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  paths: unknown;
}

async function fetchRows(): Promise<BlockedStreetRow[]> {
  let query = supabase
    .from("blocked_streets")
    .select("id, name, neighborhood, city, lat, lng, paths")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (ONLY_ID) {
    query = query.eq("id", ONLY_ID) as typeof query;
  } else if (!ALL) {
    // Padrão: só registros sem geometria OSM
    query = query.is("paths", null) as typeof query;
  }

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao buscar registros: ${error.message}`);
  return (data ?? []) as BlockedStreetRow[];
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔍 Buscando ruas interditadas no banco...");
  const rows = await fetchRows();

  if (rows.length === 0) {
    console.log("✓ Nenhum registro para processar. Use --all para reprocessar todos.\n");
    return;
  }

  const mode = DRY_RUN ? " [DRY-RUN]" : "";
  console.log(`📋 ${rows.length} rua(s) para processar${mode}\n`);

  let updated = 0;
  let failed = 0;

  for (const row of rows) {
    process.stdout.write(`  [${row.id.slice(0, 8)}] ${row.name} (${row.neighborhood || row.city})... `);

    // 1. Geocodifica
    const geo = await geocodeNominatim(row.name, row.neighborhood, row.city);
    await sleep(1100);

    if (!geo) {
      console.log("✗ coordenadas não encontradas");
      failed++;
      continue;
    }

    // 2. Busca geometria OSM
    const paths = await fetchOverpassPaths(row.name, geo.lat, geo.lng);
    await sleep(1100);

    const pathsLabel = paths ? `${paths.length} segmento(s)` : "sem geometria OSM";
    process.stdout.write(`${pathsLabel} → ${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}`);

    // 3. Grava no banco
    if (!DRY_RUN) {
      const { error } = await supabase
        .from("blocked_streets")
        .update({
          lat: geo.lat,
          lng: geo.lng,
          paths: paths ?? null,
        })
        .eq("id", row.id);

      if (error) {
        console.log(` ✗ erro ao salvar: ${error.message}`);
        failed++;
        continue;
      }
    }

    console.log(" ✓");
    updated++;
  }

  console.log(`
─────────────────────────────────────
✓ Atualizadas : ${updated}
✗ Falhas      : ${failed}
Total         : ${rows.length}
─────────────────────────────────────\n`);
}

main().catch((err) => {
  console.error("\n❌ Erro fatal:", err);
  process.exit(1);
});
