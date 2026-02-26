/**
 * Seed script: popula o banco com pontos de coleta e abrigos.
 * Usa Nominatim para geocoding (1 req/seg).
 *
 * Uso: bun run scripts/seed-points.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const NEEDS_LIST = [
  "Água e alimentos",
  "Material de limpeza",
  "Colchões",
  "Cobertas",
  "Material de higiene",
  "Travesseiros",
  "Roupas e calçados",
];

interface SeedPoint {
  name: string;
  address: string;
  neighborhood?: string;
  city: string;
  state: string;
  type: "collection" | "shelter";
  priority: "high" | "medium" | "low";
  operating_hours?: string;
  description?: string;
}

const points: SeedPoint[] = [
  // ──── PONTOS OFICIAIS PJF (Juiz de Fora) ────
  { name: "Prédio Sede PJF", address: "Av. Brasil, 2001", neighborhood: "Centro", city: "Juiz de Fora", state: "MG", type: "collection", priority: "high" },
  { name: "Casa da Mulher", address: "Av. Garibaldi Campinhos, 169", neighborhood: "Vitorino Braga", city: "Juiz de Fora", state: "MG", type: "collection", priority: "high" },
  { name: "Uniacademia", address: "Rua Halfeld, 1179", neighborhood: "Centro", city: "Juiz de Fora", state: "MG", type: "collection", priority: "high" },
  { name: "Escola Municipal Murilo Mendes", address: "Rua Dr. Leonel Jaguaribe, 240", neighborhood: "Alto Grajaú", city: "Juiz de Fora", state: "MG", type: "collection", priority: "high" },
  { name: "Escola Municipal Prof. Nilo Camilo Ayupe", address: "Rua Almirante Barroso, 155", neighborhood: "Paineiras", city: "Juiz de Fora", state: "MG", type: "collection", priority: "high" },
  { name: "Shopping Jardim Norte", address: "Av. Brasil, 6345", neighborhood: "Mariano Procópio", city: "Juiz de Fora", state: "MG", type: "collection", priority: "high" },
  { name: "Unimed Juiz de Fora", address: "Avenida Rio Branco, 2540", city: "Juiz de Fora", state: "MG", type: "collection", priority: "high" },
  { name: "EMCASA", address: "Avenida Sete de Setembro, 975", neighborhood: "Costa Carvalho", city: "Juiz de Fora", state: "MG", type: "collection", priority: "high" },
  { name: "IF Sudeste", address: "Rua Bernardo Mascarenhas, 1283", neighborhood: "Fábrica", city: "Juiz de Fora", state: "MG", type: "collection", priority: "high" },
  { name: "Escola Municipal Paulo Rogério dos Santos", address: "Rua Cel. Quintão, 136", neighborhood: "Monte Castelo", city: "Juiz de Fora", state: "MG", type: "collection", priority: "high" },
  { name: "Sindicato dos Bancários", address: "Rua Batista de Oliveira, 745", neighborhood: "Centro", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium", operating_hours: "9h às 18h" },
  { name: "Igreja Metodista em Bela Aurora", address: "Rua Dr. Costa Reis, 380", neighborhood: "Ipiranga", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium" },
  { name: "Independência Shopping", address: "Av. Presidente Itamar Franco, 3600", neighborhood: "Cascatinha", city: "Juiz de Fora", state: "MG", type: "collection", priority: "high" },
  { name: "AACI", address: "Rua Doutor Dias da Cruz, 487", neighborhood: "Nova Era", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium" },

  // ──── DEMAIS PONTOS JF ────
  { name: "Zine Cultural", address: "Praça Menelick de Carvalho, 150", neighborhood: "Santa Helena", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium" },
  { name: "Souza Gomes", address: "Av. Presidente Itamar Franco, 2800", neighborhood: "São Mateus", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium" },
  { name: "Burguesa Store", address: "Rua Bady Geara, 621", neighborhood: "Ipiranga", city: "Juiz de Fora", state: "MG", type: "collection", priority: "low" },
  { name: "Distribuidora do Bê", address: "Rua Adolfo Leonel, 90", neighborhood: "Jardim de Alá", city: "Juiz de Fora", state: "MG", type: "collection", priority: "low" },
  { name: "Igreja Sem Limites por Jesus", address: "Rua Santa Terezinha, 260", neighborhood: "Santa Terezinha", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium" },
  { name: "DCE UFJF", address: "UFJF Campus", neighborhood: "São Pedro", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium", operating_hours: "10h às 18h" },
  { name: "Faculdade de Medicina da UFJF", address: "Av. Eugênio do Nascimento, s/n", neighborhood: "Dom Bosco", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium", operating_hours: "08h às 17h (até 06/03)" },
  { name: "ALLP Fit", address: "Rua Sampaio, 312", neighborhood: "Granbery", city: "Juiz de Fora", state: "MG", type: "collection", priority: "low" },
  { name: "Privilège", address: "Estr. Eng. Gentil Forn, 1000", neighborhood: "São Pedro", city: "Juiz de Fora", state: "MG", type: "collection", priority: "low" },
  { name: "Atlética Aue Estácio", address: "Av. Pres. João Goulart, 600", neighborhood: "Cruzeiro do Sul", city: "Juiz de Fora", state: "MG", type: "collection", priority: "low" },
  { name: "Terreiro Filhos do Rei", address: "Rua Professor José Barata, 180", city: "Santos Dumont", state: "MG", type: "collection", priority: "medium" },
  { name: "Loja Pablo Tênis", address: "Rua Dr. Costa Reis, 569", city: "Juiz de Fora", state: "MG", type: "collection", priority: "low" },
  { name: "Sicredi Centro", address: "Avenida Barão do Rio Branco, 1662", neighborhood: "Centro", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium" },
  { name: "Sicredi Cascatinha", address: "Avenida Doutor Paulo Japiassu Coelho, 339", neighborhood: "Cascatinha", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium" },
  { name: "Sicredi Benfica", address: "Rua Martins Barbosa, 356", neighborhood: "Benfica", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium" },
  { name: "Nossa Senhora Aparecida", address: "Rua Orlando Riani, 218", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium" },
  { name: "Manoel Honório - Linhares", address: "Rua Silvio Romero, 44", neighborhood: "Linhares", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium" },
  { name: "Marumbi - Pimenta Doce", address: "Rua Joaquim Marques Coimbra, 100", neighborhood: "Marumbi", city: "Juiz de Fora", state: "MG", type: "collection", priority: "low" },
  { name: "Progresso - Studio Brenda Palha", address: "Rua Antonieta Maximiniano Sampaio, 73", neighborhood: "Progresso", city: "Juiz de Fora", state: "MG", type: "collection", priority: "low" },
  { name: "Igreja Universal – Av. Francisco Bernardino", address: "Avenida Francisco Bernardino", city: "Juiz de Fora", state: "MG", type: "collection", priority: "medium", description: "Recebe água mineral para distribuição nos bairros atingidos" },
  { name: "Sede da Casa da Gráfica", address: "Av. Presidente Juscelino Kubitschek, 921", neighborhood: "Jardim Natal", city: "Juiz de Fora", state: "MG", type: "collection", priority: "low" },
  { name: "Centro Espírita Pai Benedito das Almas", address: "Rua Talita Jonas, 3", city: "Juiz de Fora", state: "MG", type: "collection", priority: "low" },
  { name: "Ponto de Coleta Dist. Industrial", address: "Rua Galileu Picorelli, 60", neighborhood: "Distrito Industrial", city: "Juiz de Fora", state: "MG", type: "collection", priority: "low" },

  // ──── ABRIGOS JF ────
  { name: "Abrigo - Escola Municipal Amélia Pires", address: "Monte Castelo", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "Abrigo - Escola Municipal Murilo Mendes", address: "Rua Dr. Leonel Jaguaribe, 240", neighborhood: "Alto Grajaú", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "Abrigo - Escola Municipal Nilo Camilo Ayupe", address: "Rua Almirante Barroso, 155", neighborhood: "Paineiras", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Raymundo Hargreaves", address: "Rua Luiz Favero, 383", neighborhood: "Bom Jardim", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Áurea Bicalho", address: "Rua Odilon Braga, 119", neighborhood: "Linhares", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Marlene Barros", address: "Rua Marumbi, 56", neighborhood: "Marumbi", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Dilermando Cruz", address: "Rua Altivo Halfeld, 44", neighborhood: "Vila Ideal", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Belmira Duarte", address: "Rua Adaílton García, 110", neighborhood: "JK", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Irineu Guimarães", address: "Rua José Zacarias dos Santos, 55", neighborhood: "São Benedito", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Dante Jaime Brochado", address: "Rua Francisco Fontainha, 163", neighborhood: "Santo Antônio", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Gabriel Gonçalves", address: "Rua Gabriel Coimbra, 240", neighborhood: "Ipiranga", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Fernão Dias", address: "Rua Gustavo Fernandes Barbosa, 155", neighborhood: "Bandeirantes", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Adhemar Resende", address: "Av. Sr. dos Passos, 1596", neighborhood: "São Pedro", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Henrique José", address: "Rua Cidade do Sol, 370", neighborhood: "Cidade do Sol", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Paulo Rogério dos Santos", address: "Rua Cel. Quintão, 136", neighborhood: "Monte Castelo", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Paulo Japyassu", address: "Rua São João Batista, 104", neighborhood: "Parque Guarani", city: "Juiz de Fora", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },

  // ──── ABRIGOS MATIAS BARBOSA ────
  { name: "E.M. Marieta Miranda Couto", address: "Nossa Senhora da Penha", neighborhood: "Nossa Senhora da Penha", city: "Matias Barbosa", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },
  { name: "E.M. Lucy de Castro Cabral", address: "Centro", neighborhood: "Centro", city: "Matias Barbosa", state: "MG", type: "shelter", priority: "high", description: "Acolhimento de famílias desabrigadas" },

  // ──── MINAS GERAIS (outras cidades) ────
  { name: "Ponto de Coleta Barbacena - Grogotó", address: "BR 265, 3480", neighborhood: "Grogotó", city: "Barbacena", state: "MG", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Barbacena - Caiçaras", address: "Av. Amazonas, 840", neighborhood: "Caiçaras", city: "Barbacena", state: "MG", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Betim - Amazonas", address: "Rua Amazonita, 555", neighborhood: "Amazonas", city: "Betim", state: "MG", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Betim - Texaco", address: "Rua Texaco, 655", city: "Betim", state: "MG", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Divinópolis", address: "Rua Ubá, 100", neighborhood: "Itaí", city: "Divinópolis", state: "MG", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Ipatinga", address: "Av. Ricardo Caram Guimarães, 296", neighborhood: "Distrito Industrial", city: "Ipatinga", state: "MG", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Matias Barbosa", address: "BR 040, Km 800, 20", neighborhood: "Park Sul", city: "Matias Barbosa", state: "MG", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Pouso Alegre", address: "Rua Mário Lopes da Silva, 85", neighborhood: "São Cristóvão", city: "Pouso Alegre", state: "MG", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Uberlândia", address: "Anel Viário", neighborhood: "Distrito Industrial", city: "Uberlândia", state: "MG", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Varginha", address: "Rua Otto Salgado, 1305", neighborhood: "Distrito Industrial", city: "Varginha", state: "MG", type: "collection", priority: "medium" },

  // ──── RIO DE JANEIRO ────
  { name: "Ponto de Coleta Barra Mansa", address: "Rod. Presidente Dutra, Km 268,5", neighborhood: "Vila Principal", city: "Barra Mansa", state: "RJ", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Campos dos Goytacazes", address: "Av. Prof. Carmen Carneiro, 1794", neighborhood: "Pq. Aeroporto", city: "Campos dos Goytacazes", state: "RJ", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Macaé", address: "Rua Conceição M. P. Ferreira, 321", neighborhood: "Vale Encantado", city: "Macaé", state: "RJ", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Nova Friburgo", address: "Av. Gov. Roberto Silveira, 3355", city: "Nova Friburgo", state: "RJ", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Petrópolis", address: "BR 040, Km 56", neighborhood: "Itaipava", city: "Petrópolis", state: "RJ", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Resende", address: "Av. A, 67", neighborhood: "Paraíso 2", city: "Resende", state: "RJ", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Rio Bonito", address: "Rua Antônio P. de Faria, 168", neighborhood: "Boqueirão", city: "Rio Bonito", state: "RJ", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Rio de Janeiro - Pavuna", address: "Rod. Pres. Dutra, 2700", neighborhood: "Pavuna", city: "Rio de Janeiro", state: "RJ", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Rio de Janeiro - Olaria", address: "Av. Brasil, 8683", neighborhood: "Olaria", city: "Rio de Janeiro", state: "RJ", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta São Pedro da Aldeia", address: "Rua da Paz, Lote A3", neighborhood: "São Mateus", city: "São Pedro da Aldeia", state: "RJ", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Três Rios - Ipirangão", address: "BR 040, Km 16,9", city: "Três Rios", state: "RJ", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Três Rios - União Indústria", address: "Estrada União Indústria, 600", city: "Três Rios", state: "RJ", type: "collection", priority: "medium" },

  // ──── ESPÍRITO SANTO ────
  { name: "Ponto de Coleta Colatina", address: "Km 07, Terminal Logístico Santa Teresa", city: "Colatina", state: "ES", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Viana", address: "Rua do Comércio, 346", neighborhood: "Soteco", city: "Viana", state: "ES", type: "collection", priority: "medium" },

  // ──── SÃO PAULO ────
  { name: "Ponto de Coleta Guarulhos", address: "Rua Soldado Antônio Martins Oliveira, 57", city: "Guarulhos", state: "SP", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta São Paulo", address: "Av. Tenente Amaro F. da Silveira, s/n", neighborhood: "Pq. Novo Mundo", city: "São Paulo", state: "SP", type: "collection", priority: "medium" },
  { name: "Ponto de Coleta Sumaré", address: "Marginal Via Anhanguera, s/n", neighborhood: "Nova Veneza", city: "Sumaré", state: "SP", type: "collection", priority: "medium" },
];

// ── Geocoding via Nominatim (1 req/sec) ──

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GeoResult {
  lat: number;
  lng: number;
}

async function geocode(address: string, city: string, state: string): Promise<GeoResult | null> {
  const query = `${address}, ${city}, ${state}, Brazil`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AjudaMinhaCidade-Seed/1.0" },
    });
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // ignore
  }

  // Fallback: try just city + state
  const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${city}, ${state}, Brazil`)}&format=json&limit=1&countrycodes=br`;
  try {
    const res = await fetch(fallbackUrl, {
      headers: { "User-Agent": "AjudaMinhaCidade-Seed/1.0" },
    });
    const data = await res.json();
    if (data.length > 0) {
      console.log(`  ⚠ Fallback para centro de ${city} (endereço exato não encontrado)`);
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // ignore
  }

  return null;
}

// ── Main ──

async function main() {
  console.log(`\nIniciando seed de ${points.length} pontos...\n`);

  let inserted = 0;
  let skipped = 0;

  for (const p of points) {
    console.log(`Geocoding: ${p.name} (${p.city}/${p.state})...`);
    const geo = await geocode(p.address, p.city, p.state);
    await sleep(1100); // Nominatim rate limit

    if (!geo) {
      console.log(`  ✗ Coordenadas não encontradas, pulando.`);
      skipped++;
      continue;
    }

    console.log(`  → ${geo.lat}, ${geo.lng}`);

    // Check if point already exists (same name + city)
    const { data: existing } = await supabase
      .from("points")
      .select("id")
      .eq("name", p.name)
      .eq("city", p.city)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  ⏭ Já existe, pulando.`);
      skipped++;
      continue;
    }

    // Insert point
    const { data: newPoint, error } = await supabase
      .from("points")
      .insert({
        name: p.name,
        description: p.description || null,
        type: p.type,
        status: "active",
        priority: p.priority,
        latitude: geo.lat,
        longitude: geo.lng,
        location: `SRID=4326;POINT(${geo.lng} ${geo.lat})`,
        address: p.address,
        city: p.city,
        state: p.state,
        neighborhood: p.neighborhood || null,
        operating_hours: p.operating_hours || null,
        created_by: null,
      })
      .select("id")
      .single();

    if (error) {
      console.log(`  ✗ Erro ao inserir: ${error.message}`);
      skipped++;
      continue;
    }

    // Insert needs
    const needsToInsert = NEEDS_LIST.map((desc) => ({
      point_id: newPoint.id,
      description: desc,
    }));

    const { error: needsError } = await supabase
      .from("needs")
      .insert(needsToInsert);

    if (needsError) {
      console.log(`  ⚠ Ponto inserido mas erro nas necessidades: ${needsError.message}`);
    }

    console.log(`  ✓ Inserido com ${NEEDS_LIST.length} necessidades`);
    inserted++;
  }

  console.log(`\n── Resultado ──`);
  console.log(`Inseridos: ${inserted}`);
  console.log(`Pulados: ${skipped}`);
  console.log(`Total processados: ${points.length}\n`);
}

main().catch(console.error);
