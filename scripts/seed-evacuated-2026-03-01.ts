/**
 * Insere ruas evacuadas em Juiz de Fora (01/03/2026) no banco de dados.
 *
 * Para cada rua:
 *   1. Geocodifica via Nominatim → lat/lng
 *   2. Busca geometria real via Overpass API → paths (polylines)
 *   3. Insere no banco (blocked_streets)
 *
 * Uso:
 *   dotenv -e .env -- tsx scripts/seed-evacuated-2026-03-01.ts
 *
 * Flags:
 *   --dry-run    Mostra o que faria sem inserir no banco
 */

import { createClient } from "@supabase/supabase-js";

// ── Supabase ────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── Flags ───────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");

// ── Ruas evacuadas 01/03/2026 — Prefeitura em Alerta (Juiz de Fora) ────────

const streets = [
  // ── Jardim Natal ──
  { name: "Rua Doutor Augusto Eckman",     osmName: "Rua Doutor Augusto Eckman",     neighborhood: "Jardim Natal",   description: "Rua evacuada" },
  { name: "Rua Tenten Lucas Drumond",      osmName: "Rua Tenten Lucas Drumond",      neighborhood: "Jardim Natal",   description: "Rua evacuada" },
  { name: "Rua Miguel Marcos Peres",       osmName: "Rua Miguel Marcos Peres",       neighborhood: "Jardim Natal",   description: "Rua evacuada — nº 58 ao 205", fromNumber: "58", toNumber: "205" },
  { name: "Rua Pedro Moreira Cavalcanti",  osmName: "Rua Pedro Moreira Cavalcanti",  neighborhood: "Jardim Natal",   description: "Rua evacuada — nº 160 ao 282", fromNumber: "160", toNumber: "282" },

  // ── Vila Ideal ──
  { name: "Avenida Antônio Miranda",       osmName: "Avenida Antônio Miranda",       neighborhood: "Vila Ideal",     description: "Rua evacuada" },
  { name: "Rua Giuseppe Novelino",         osmName: "Rua Giuseppe Novelino",         neighborhood: "Vila Ideal",     description: "Rua evacuada" },
  { name: "Rua Jorge Angel Livraga",       osmName: "Rua Jorge Angel Livraga",       neighborhood: "Vila Ideal",     description: "Rua evacuada" },
  { name: "Rua José Monteiro",             osmName: "Rua José Monteiro",             neighborhood: "Vila Ideal",     description: "Rua evacuada" },
  { name: "Rua Vera Consuelo Nascimento",  osmName: "Rua Vera Consuelo Nascimento",  neighborhood: "Vila Ideal",     description: "Rua evacuada" },
  { name: "Rua Miracema",                  osmName: "Rua Miracema",                  neighborhood: "Vila Ideal",     description: "Rua evacuada" },
  { name: "Rua João Luís Alves",           osmName: "Rua João Luís Alves",           neighborhood: "Vila Ideal",     description: "Rua evacuada" },

  // ── Vitorino Braga ──
  { name: "Rua do Monte",                  osmName: "Rua do Monte",                  neighborhood: "Vitorino Braga", description: "Rua evacuada — nº 314 até 388", fromNumber: "314", toNumber: "388" },
  { name: "Rua Baependi",                  osmName: "Rua Baependi",                  neighborhood: "Vitorino Braga", description: "Rua evacuada" },

  // ── Santa Rita ──
  { name: "Rua Urias Fonseca",             osmName: "Rua Urias Fonseca",             neighborhood: "Santa Rita",     description: "Rua evacuada" },
  { name: "Rua Doutor Geraldo Paleta",     osmName: "Rua Doutor Geraldo Paleta",     neighborhood: "Santa Rita",     description: "Rua evacuada — a partir do nº 400", fromNumber: "400", toNumber: "" },

  // ── São Pedro ──
  { name: "Avenida Pedro Henrique Krambeck", osmName: "Avenida Pedro Henrique Krambeck", neighborhood: "São Pedro", description: "Rua evacuada — nº 225 até 677", fromNumber: "225", toNumber: "677" },

  // ── Progresso ──
  { name: "Rua Jorge Knopp",               osmName: "Rua Jorge Knopp",               neighborhood: "Progresso",      description: "Rua evacuada" },

  // ── Santa Luzia ──
  { name: "Rua Augusto Bragagnolo",        osmName: "Rua Augusto Bragagnolo",        neighborhood: "Santa Luzia",    description: "Rua evacuada" },

  // ── Eldorado ──
  { name: "Rua Arcânjo de Campos Miranda", osmName: "Rua Arcânjo de Campos Miranda", neighborhood: "Eldorado",       description: "Rua evacuada" },
  { name: "Rua Professor Pelino de Oliveira", osmName: "Rua Professor Pelino de Oliveira", neighborhood: "Eldorado", description: "Rua evacuada" },

  // ── Esplanada ──
  { name: "Rua Mammed Camilo",             osmName: "Rua Mammed Camilo",             neighborhood: "Esplanada",      description: "Rua evacuada" },
  // SKIP: Nominatim geocodifica em outra cidade (-21.949) — resolver manualmente
  // { name: "Rua Nicolau Capelli",           osmName: "Rua Nicolau Capelli",           neighborhood: "Esplanada",      description: "Rua evacuada" },
  { name: "Rua Walquirio Seixas de Faria", osmName: "Rua Walquirio Seixas de Faria", neighborhood: "Esplanada",      description: "Rua evacuada" },
  { name: "Rua Expedicionário Antônio Novaes", osmName: "Rua Expedicionário Antônio Novaes", neighborhood: "Esplanada", description: "Rua evacuada (Monte Castelo)" },

  // ── Paineiras (trecho acima da Olegário Maciel) ──
  { name: "Rua Luís Sansão",               osmName: "Rua Luís Sansão",               neighborhood: "Paineiras",      description: "Rua evacuada — trecho acima da Olegário Maciel" },
  { name: "Rua Pasteur",                   osmName: "Rua Pasteur",                   neighborhood: "Paineiras",      description: "Rua evacuada — trecho acima da Olegário Maciel" },
  { name: "Rua Constantino Paleta",        osmName: "Rua Constantino Paleta",        neighborhood: "Paineiras",      description: "Rua evacuada — trecho acima da Olegário Maciel" },
  { name: "Rua Marechal Deodoro",          osmName: "Rua Marechal Deodoro",          neighborhood: "Paineiras",      description: "Rua evacuada — trecho acima da Olegário Maciel" },
  { name: "Rua Halfeld",                   osmName: "Rua Halfeld",                   neighborhood: "Paineiras",      description: "Rua evacuada — trecho acima da Olegário Maciel" },
  { name: "Rua Renato Cruz Frederico",     osmName: "Rua Renato Cruz Frederico",     neighborhood: "Paineiras",      description: "Rua evacuada — trecho acima da Olegário Maciel" },
  { name: "Rua do Carmelo",                osmName: "Rua do Carmelo",                neighborhood: "Paineiras",      description: "Rua evacuada — trecho acima da Olegário Maciel" },
  { name: "Rua Redentor",                  osmName: "Rua Redentor",                  neighborhood: "Paineiras",      description: "Rua evacuada — trecho acima da Olegário Maciel" },

  // ── Três Moinhos ──
  { name: "Rua Maria Florice dos Santos",  osmName: "Rua Maria Florice dos Santos",  neighborhood: "Três Moinhos",   description: "Rua evacuada" },
  { name: "Rua João Luzia",                osmName: "Rua João Luzia",                neighborhood: "Três Moinhos",   description: "Rua evacuada" },
  { name: "Rua José de Castro Ribeiro",    osmName: "Rua José de Castro Ribeiro",    neighborhood: "Três Moinhos",   description: "Rua evacuada" },
  { name: "Rua José Luiz Flores",          osmName: "Rua José Luiz Flores",          neighborhood: "Três Moinhos",   description: "Rua evacuada" },
  { name: "Rua Manoel Clemente",           osmName: "Rua Manoel Clemente",           neighborhood: "Três Moinhos",   description: "Rua evacuada" },
  { name: "Rua Vicente Paulo Bacelar",     osmName: "Rua Vicente Paulo Bacelar",     neighborhood: "Três Moinhos",   description: "Rua evacuada" },
  { name: "Rua Natalina de Andrade Guerra", osmName: "Rua Natalina de Andrade Guerra", neighborhood: "Três Moinhos", description: "Rua evacuada" },

  // ── Parque Burnier ──
  { name: "Rua Natalino Jose de Laula",    osmName: "Rua Natalino Jose de Laula",    neighborhood: "Parque Burnier", description: "Rua evacuada" },
  { name: "Rua C",                         osmName: "Rua C",                         neighborhood: "Parque Burnier", description: "Rua evacuada" },
  { name: "Rua José Roque Souza",          osmName: "Rua José Roque Souza",          neighborhood: "Parque Burnier", description: "Rua evacuada" },
  { name: "Rua Adelaide Campos de Resende", osmName: "Rua Adelaide Campos de Resende", neighborhood: "Parque Burnier", description: "Rua evacuada — final da rua" },
  { name: "Rua Francisco Gonçalo de Faria", osmName: "Rua Francisco Gonçalo de Faria", neighborhood: "Parque Burnier", description: "Rua evacuada — final da rua" },

  // ── Costa Carvalho ──
  { name: "Rua São Vicente",               osmName: "Rua São Vicente",               neighborhood: "Costa Carvalho", description: "Rua evacuada — lado par" },
  { name: "Avenida Mascarenhas",           osmName: "Avenida Mascarenhas",           neighborhood: "Costa Carvalho", description: "Rua evacuada — trecho sobre a Rua São Vicente" },

  // ── Retiro ──
  { name: "Rua José Augusto Araújo",       osmName: "Rua José Augusto Araújo",       neighborhood: "Retiro",         description: "Rua evacuada — nº 53 até 205", fromNumber: "53", toNumber: "205" },

  // ── Dom Bosco ──
  { name: "Rua Silvério da Silveira",      osmName: "Rua Silvério da Silveira",      neighborhood: "Dom Bosco",      description: "Rua evacuada" },
  { name: "Rua José Claro Dia",            osmName: "Rua José Claro Dia",            neighborhood: "Dom Bosco",      description: "Rua evacuada" },
  { name: "Rua Kátia Falconi",             osmName: "Rua Kátia Falconi",             neighborhood: "Dom Bosco",      description: "Rua evacuada" },

  // ── Joquei I ──
  { name: "Rua Detetive José Felipe",      osmName: "Rua Detetive José Felipe",      neighborhood: "Joquei I",       description: "Rua evacuada" },

  // ── Santos Anjos ──
  { name: "Rua Rosalina Praxedes",         osmName: "Rua Rosalina Praxedes",         neighborhood: "Santos Anjos",   description: "Rua evacuada — nº 34 ao 316", fromNumber: "34", toNumber: "316" },

  // ── Cruzeiro do Sul ──
  { name: "Rua Valdomiro Elói do Amaral",  osmName: "Rua Valdomiro Elói do Amaral",  neighborhood: "Cruzeiro do Sul", description: "Rua evacuada — até esquina com Rua Benício de Souza Rocha" },
] as const;

const CITY = "Juiz de Fora";
const STATE = "MG";

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Nominatim ───────────────────────────────────────────────────────────────

async function geocodeNominatim(
  name: string,
  neighborhood: string,
): Promise<{ lat: number; lng: number } | null> {
  const queries = [
    `${name}, ${neighborhood}, ${CITY}, ${STATE}, Brazil`,
    `${name}, ${CITY}, ${STATE}, Brazil`,
    `${name}, ${CITY}, Brazil`,
  ];

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
    await sleep(1100);
  }

  return null;
}

// ── Overpass ─────────────────────────────────────────────────────────────────

async function fetchOverpassPaths(
  streetName: string,
  lat: number,
  lng: number,
): Promise<[number, number][][] | null> {
  const query = `[out:json];way["name"="${streetName}"](around:600,${lat},${lng});out geom;`;
  try {
    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "AjudaMinhaCidade/1.0" } },
    );
    const data = await res.json();

    if (!data.elements?.length) return null;

    const paths: [number, number][][] = data.elements
      .filter(
        (el: { type: string; geometry?: { lat: number; lon: number }[] }) =>
          el.type === "way" && el.geometry?.length,
      )
      .map((el: { geometry: { lat: number; lon: number }[] }) =>
        el.geometry.map((pt) => [pt.lat, pt.lon] as [number, number]),
      );

    return paths.length ? paths : null;
  } catch {
    return null;
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const mode = DRY_RUN ? " [DRY-RUN]" : "";
  console.log(`\n📋 Inserindo ${streets.length} ruas evacuadas (01/03/2026)${mode}\n`);

  let inserted = 0;
  let failed = 0;

  for (const s of streets) {
    process.stdout.write(`  ${s.name} (${s.neighborhood})... `);

    // 1. Geocodifica
    const geo = await geocodeNominatim(s.osmName, s.neighborhood);
    await sleep(1100);

    if (!geo) {
      console.log("✗ coordenadas não encontradas");
      failed++;
      continue;
    }

    // 2. Busca geometria OSM
    const paths = await fetchOverpassPaths(s.osmName, geo.lat, geo.lng);
    await sleep(1100);

    const pathsLabel = paths ? `${paths.length} segmento(s)` : "sem geometria";
    process.stdout.write(`${pathsLabel} → ${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}`);

    // 3. Insere no banco
    if (!DRY_RUN) {
      const record: Record<string, unknown> = {
        name: s.name,
        neighborhood: s.neighborhood,
        city: CITY,
        state: STATE,
        description: s.description,
        lat: geo.lat,
        lng: geo.lng,
        paths: paths ?? null,
        is_active: true,
      };

      if ("fromNumber" in s && s.fromNumber) record.from_number = s.fromNumber;
      if ("toNumber" in s && s.toNumber) record.to_number = s.toNumber;

      const { error } = await supabase.from("blocked_streets").insert(record);

      if (error) {
        console.log(` ✗ erro: ${error.message}`);
        failed++;
        continue;
      }
    }

    console.log(" ✓");
    inserted++;
  }

  console.log(`
─────────────────────────────────────
✓ Inseridas : ${inserted}
✗ Falhas    : ${failed}
Total       : ${streets.length}
─────────────────────────────────────\n`);
}

main().catch((err) => {
  console.error("\n❌ Erro fatal:", err);
  process.exit(1);
});
