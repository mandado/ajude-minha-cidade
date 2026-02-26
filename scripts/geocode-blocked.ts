/**
 * Geocodifica as ruas interditadas e busca a geometria real de cada via via Overpass API.
 * Grava resultado em src/data/blocked-streets.ts.
 *
 * Rode UMA vez: pnpm geocode:blocked
 */

import { writeFileSync } from "fs";
import { join } from "path";

const streets = [
  // ──── JUIZ DE FORA ────
  { name: "Estrada Eng. Gentil Forn",            osmName: "Estrada Engenheiro Gentil Forn",    neighborhood: "Vale do Ipê / Jardim Glória", city: "Juiz de Fora", state: "MG", description: "Interditada entre rotatória Vale do Ipê e Rua José Lourenço Kelmer" },
  { name: "Rua Benjamin Guimarães",               osmName: "Rua Benjamin Guimarães",            neighborhood: "Democrata",                   city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Av. Barão do Rio Branco – Mergulhão",  osmName: "Avenida Barão do Rio Branco",       neighborhood: "Centro",                      city: "Juiz de Fora", state: "MG", description: "Trecho do Mergulhão interditado" },
  { name: "Ponte Vermelha",                        osmName: "Ponte Domingos Alves Pereira",      neighborhood: "Santa Terezinha",             city: "Juiz de Fora", state: "MG", description: "Ponte Vermelha interditada" },
  { name: "Av. Olavo Bilac – Curva da Miséria",   osmName: "Avenida Olavo Bilac",               neighborhood: "Cerâmica",                    city: "Juiz de Fora", state: "MG", description: "Curva da Miséria interditada" },
  { name: "BR-267 – Acesso Vila Ideal",            osmName: "BR-267",                            neighborhood: "Vila Ideal",                  city: "Juiz de Fora", state: "MG", description: "Acesso Vila Ideal interditado" },
  { name: "Rua Diva Garcia",                       osmName: "Rua Diva Garcia",                   neighborhood: "Três Moinhos",                city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Francisco Cerqueira Cruzeiro",      osmName: "Rua Francisco Cerqueira Cruzeiro",  neighborhood: "Santo Antônio",               city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Monsenhor Gustavo Freire",          osmName: "Rua Monsenhor Gustavo Freire",      neighborhood: "Dom Bosco",                   city: "Juiz de Fora", state: "MG", description: "Interditada entre Ruas Cruzador Bahia e Araguari" },
  { name: "Rua Júlio Menini",                      osmName: "Rua Júlio Menini",                  neighborhood: "Borboleta",                   city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Filonilia Carlota de Jesus",        osmName: "Rua Filonilia Carlota de Jesus",    neighborhood: "Vila Olavo Costa",            city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Francisco Altomar",                 osmName: "Rua Francisco Altomar",             neighborhood: "Ipiranguinha",                city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Prof. Clóvis Jaguaribe",            osmName: "Rua Professor Clóvis Jaguaribe",   neighborhood: "Bom Pastor",                  city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Acácia do Paraibuna",               osmName: "Rua Acácia do Paraibuna",           neighborhood: "Bom Pastor",                  city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Eunice Weaver",                     osmName: "Rua Eunice Weaver",                 neighborhood: "Carlos Chagas",               city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Sebastião Nunes da Costa",          osmName: "Rua Sebastião Nunes da Costa",      neighborhood: "Jardim de Alá",               city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Leonora Goretti",                   osmName: "Rua Leonora Goretti",               neighborhood: "Linhares",                    city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Anhanguera",                        osmName: "Rua Anhanguera",                    neighborhood: "Bom Pastor",                  city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Goiás",                             osmName: "Rua Goiás",                         neighborhood: "São Bernardo",                city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Antônio Fellet",                    osmName: "Rua Antônio Fellet",                neighborhood: "Vale do Ipê",                 city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Carlos Palmer",                     osmName: "Rua Carlos Palmer",                 neighborhood: "Vila Ozanan",                 city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Abílio José Gomes",                 osmName: "Rua Abílio José Gomes",             neighborhood: "Vila Ozanan",                 city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Artesão Antônio de Oliveira",       osmName: "Rua Artesão Antônio de Oliveira",   neighborhood: "Adolfo Vireque",              city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Rua Prof. Francisco Faria",             osmName: "Rua Professor Francisco Faria",     neighborhood: "Bairu",                       city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  { name: "Vias do bairro Três Moinhos",           osmName: null,                                neighborhood: "Três Moinhos",                city: "Juiz de Fora", state: "MG", description: "Diversas vias interditadas" },
  { name: "Rua Waldomiro Eloy do Amaral",          osmName: "Rua Waldomiro Eloy do Amaral",      neighborhood: "Graminha",                    city: "Juiz de Fora", state: "MG", description: "Próximo à Rua Benício de Souza" },
  { name: "Rua Joaquim Vicente Guedes",            osmName: "Rua Joaquim Vicente Guedes",        neighborhood: "Graminha",                    city: "Juiz de Fora", state: "MG", description: "Via interditada" },
  // ──── MATIAS BARBOSA ────
  { name: "Centro – alagado pelo Rio Paraibuna",   osmName: null,                                neighborhood: "Centro",                      city: "Matias Barbosa", state: "MG", description: "Ruas do Centro alagadas pelo Rio Paraibuna" },
  { name: "BR-040 km 813 – bloqueio total",        osmName: "BR-040",                            neighborhood: "",                            city: "Matias Barbosa", state: "MG", description: "Bloqueio total – isolamento municipal" },
  { name: "Estrada União e Indústria (LMG-874)",   osmName: "LMG-874",                           neighborhood: "",                            city: "Matias Barbosa", state: "MG", description: "Alagamento total" },
  { name: "Bairro Nossa Senhora da Penha – alagado", osmName: null,                              neighborhood: "Nossa Senhora da Penha",       city: "Matias Barbosa", state: "MG", description: "Alagamentos generalizados no bairro" },
];

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Nominatim: ponto central da rua ──
async function geocode(address: string, neighborhood: string, city: string, state: string) {
  const queries = [
    neighborhood ? `${address}, ${neighborhood}, ${city}, ${state}, Brazil` : null,
    `${address}, ${city}, ${state}, Brazil`,
    `${city}, ${state}, Brazil`,
  ].filter(Boolean) as string[];

  for (const q of queries) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=br`,
        { headers: { "User-Agent": "AjudaMinhaCidade/1.0" } },
      );
      const data = await res.json();
      if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch { /* ignora */ }
    await sleep(1100);
  }
  return null;
}

// ── Overpass: geometria real da via ──
async function getStreetPaths(osmName: string, lat: number, lng: number): Promise<[number, number][][] | null> {
  // Busca ways com esse nome num raio de 600m do ponto geocodificado
  const query = `[out:json];way["name"="${osmName}"](around:600,${lat},${lng});out geom;`;
  try {
    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "AjudaMinhaCidade/1.0" } },
    );
    const data = await res.json();
    if (!data.elements?.length) return null;

    const paths: [number, number][][] = data.elements
      .filter((el: { type: string; geometry?: { lat: number; lon: number }[] }) =>
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

// ── Main ──
async function main() {
  console.log(`\nGeocodificando ${streets.length} ruas interditadas...\n`);

  const results: Array<{
    name: string;
    neighborhood: string;
    city: string;
    description: string;
    lat: number;
    lng: number;
    paths: [number, number][][] | null;
  }> = [];

  for (const s of streets) {
    process.stdout.write(`  ${s.name}... `);

    // 1. Ponto central via Nominatim
    const geoAddress = s.osmName ?? s.neighborhood ?? s.city;
    const geo = await geocode(geoAddress, s.neighborhood, s.city, s.state);
    await sleep(1100);

    if (!geo) {
      console.log("✗ coordenadas não encontradas, pulando");
      continue;
    }

    // 2. Geometria real via Overpass (só se tiver nome OSM)
    let paths: [number, number][][] | null = null;
    if (s.osmName) {
      paths = await getStreetPaths(s.osmName, geo.lat, geo.lng);
      await sleep(1100);
      if (paths) {
        process.stdout.write(`✓ ${paths.length} segmento(s) `);
      } else {
        process.stdout.write(`⚠ sem geometria OSM `);
      }
    }

    console.log(`→ ${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}`);

    results.push({
      name: s.name,
      neighborhood: s.neighborhood,
      city: s.city,
      description: s.description,
      lat: geo.lat,
      lng: geo.lng,
      paths,
    });
  }

  const out = `// Gerado automaticamente por: pnpm geocode:blocked
// Não editar manualmente.

export interface BlockedStreet {
  name: string;
  neighborhood: string;
  city: string;
  description: string;
  lat: number;
  lng: number;
  /** Geometria real da via (segmentos de polyline). Null = só pin. */
  paths: [number, number][][] | null;
}

export const BLOCKED_STREETS: BlockedStreet[] = ${JSON.stringify(results, null, 2)};
`;

  const outPath = join(process.cwd(), "src/data/blocked-streets.ts");
  writeFileSync(outPath, out, "utf-8");
  console.log(`\n✓ ${results.length} ruas gravadas em src/data/blocked-streets.ts\n`);
}

main().catch(console.error);
