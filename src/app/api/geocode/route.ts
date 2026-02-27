import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// ── Tipos públicos ─────────────────────────────────────────────────────────────

export interface GeocodeResult {
  id: string;
  display_name: string;
  lat: number;
  lng: number;
  /** localidade (obrigatório) */
  city: string;
  state: string;
  /** bairro (obrigatório) */
  neighborhood: string;
  street: string;
}

export interface GeocodeError {
  code:
    | "NOT_FOUND"
    | "LOCALITY_MISMATCH"
    | "INCOMPLETE_DATA"
    | "API_ERROR"
    | "RATE_LIMITED"
    | "MISSING_CONFIG";
  error: string;
}

// ── Tipos internos (Mapbox) ───────────────────────────────────────────────────

interface MapboxFeature {
  id: string;
  properties: {
    full_address?: string;
    name?: string;
    context?: {
      place?: { name?: string };
      region?: { region_code?: string; name?: string };
      neighborhood?: { name?: string };
      locality?: { name?: string };
      street?: { name?: string };
    };
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

// ── Tipos internos (Nominatim) ────────────────────────────────────────────────

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    quarter?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    "ISO3166-2-lvl4"?: string; // "BR-MG"
  };
}

// ── Infra ─────────────────────────────────────────────────────────────────────

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// ── API Oficial (Mapbox) ──────────────────────────────────────────────────────

async function resolveViaOfficial(
  query: string,
  type: string,
  proximity?: string,
): Promise<GeocodeResult[] | null> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return null;

  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("access_token", token);
  url.searchParams.set("country", "br");
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("limit", "5");
  if (type === "city") url.searchParams.set("types", "place");
  if (proximity) url.searchParams.set("proximity", proximity);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("[geocode/official] Mapbox error:", res.status);
    return null;
  }

  const json = await res.json();
  const features: MapboxFeature[] = json.features ?? [];

  const results: GeocodeResult[] = features
    .map((f) => {
      const ctx = f.properties.context;
      const regionCode = ctx?.region?.region_code ?? "";
      const state = regionCode.startsWith("BR-") ? regionCode.slice(3) : regionCode;

      return {
        id: f.id,
        display_name: f.properties.full_address ?? f.properties.name ?? "",
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        city: ctx?.place?.name ?? "",
        state,
        neighborhood: ctx?.neighborhood?.name ?? ctx?.locality?.name ?? "",
        street: ctx?.street?.name ?? f.properties.name ?? "",
      };
    })
    // localidade e bairro são obrigatórios
    .filter((r) => r.city.trim() !== "" && r.neighborhood.trim() !== "");

  return results.length > 0 ? results : null;
}

// ── Fallback (Nominatim / OpenStreetMap) ──────────────────────────────────────
// Gratuito, sem chave de API. Respeita as políticas de uso do OSM:
// - User-Agent identificado
// - Cache de 24 h via Redis (evita requisições repetidas)
// Docs: https://nominatim.org/release-docs/develop/api/Search/

async function resolveViaNominatim(query: string): Promise<GeocodeResult[] | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("accept-language", "pt-BR,pt");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "AjudaMinhaCidade/1.0 (contato@ajudeminhacidade.com.br)" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    console.error("[geocode/nominatim] HTTP error:", res.status);
    return null;
  }

  const json: NominatimResult[] = await res.json();
  if (!Array.isArray(json) || json.length === 0) return null;

  const results: GeocodeResult[] = json
    .map((item, idx) => {
      const addr = item.address;

      const city =
        addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? "";

      const neighborhood =
        addr.neighbourhood ?? addr.suburb ?? addr.quarter ?? addr.city_district ?? "";

      const street = addr.road ?? "";

      // estado abreviado: "BR-MG" → "MG"
      const iso = addr["ISO3166-2-lvl4"] ?? "";
      const state = iso.startsWith("BR-") ? iso.slice(3) : (addr.state ?? "");

      return {
        id: `osm-${item.place_id}-${idx}`,
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        city,
        state,
        neighborhood,
        street,
      };
    })
    // localidade e bairro são obrigatórios
    .filter((r) => r.city.trim() !== "" && r.neighborhood.trim() !== "");

  return results.length > 0 ? results : null;
}

// ── Validação de consistência de localidade ───────────────────────────────────

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .trim();
}

function matchesLocality(result: GeocodeResult, locality: string): boolean {
  const normCity = normalize(result.city);
  const normLocality = normalize(locality);
  return normCity.includes(normLocality) || normLocality.includes(normCity);
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "anonymous";

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json<GeocodeError>(
      { code: "RATE_LIMITED", error: "Muitas requisições. Aguarde alguns segundos." },
      { status: 429 },
    );
  }

  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim();
  const type = searchParams.get("type") ?? "address";
  const proximity = searchParams.get("proximity") ?? undefined;
  /** Cidade esperada — usado para filtrar inconsistências de localidade */
  const locality = searchParams.get("locality")?.trim() ?? undefined;

  if (!query || query.length < 2) {
    return NextResponse.json<GeocodeResult[]>([]);
  }

  const cacheKey = `geocode:v4:${type}:${proximity ?? ""}:${locality ?? ""}:${query.toLowerCase()}`;
  const cached = await redis.get<GeocodeResult[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // 1. Tentativa via API oficial (Mapbox)
    let results = await resolveViaOfficial(query, type, proximity);

    // 2. Validação de consistência de localidade para resultados oficiais
    if (results && locality) {
      results = results.filter((r) => matchesLocality(r, locality));
    }

    // 3. Fallback para Nominatim/OSM caso a API oficial não retorne resultado válido
    if (!results || results.length === 0) {
      // Enriquece a query com a localidade esperada para maior precisão
      const osmQuery = locality ? `${query}, ${locality}, Brasil` : `${query}, Brasil`;
      let osmResults = await resolveViaNominatim(osmQuery);

      // Validação de consistência de localidade para resultados do OSM
      if (osmResults && locality) {
        osmResults = osmResults.filter((r) => matchesLocality(r, locality));
      }

      results = osmResults;
    }

    // 4. Erro estruturado caso nenhuma API retorne resultado válido
    if (!results || results.length === 0) {
      return NextResponse.json<GeocodeError>(
        {
          code: "NOT_FOUND",
          error: "Endereço não encontrado. Verifique o nome da rua ou tente incluir o bairro/cidade.",
        },
        { status: 404 },
      );
    }

    await redis.set(cacheKey, results, { ex: 86400 });
    return NextResponse.json<GeocodeResult[]>(results);
  } catch (err) {
    console.error("[geocode] erro inesperado:", err);
    return NextResponse.json<GeocodeError>(
      { code: "API_ERROR", error: "Falha ao consultar o serviço de geocodificação." },
      { status: 500 },
    );
  }
}
