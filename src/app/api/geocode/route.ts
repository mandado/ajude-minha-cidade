import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

interface GeocodeResult {
  id: string;
  display_name: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  neighborhood: string;
}

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
    };
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "anonymous";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 },
    );
  }

  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim();
  const type = searchParams.get("type") || "address";

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "MAPBOX_ACCESS_TOKEN not configured" },
      { status: 500 },
    );
  }

  const cacheKey = `geocode:${type}:${query.toLowerCase()}`;
  const cached = await redis.get<GeocodeResult[]>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const types =
    type === "city" ? "place" : "address,place,locality,neighborhood";

  const url = new URL(
    "https://api.mapbox.com/search/geocode/v6/forward",
  );
  url.searchParams.set("q", query);
  url.searchParams.set("access_token", token);
  url.searchParams.set("country", "br");
  url.searchParams.set("language", "pt");
  url.searchParams.set("limit", "5");
  url.searchParams.set("types", types);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      const text = await res.text();
      console.error("[geocode] Mapbox error:", res.status, text);
      return NextResponse.json(
        { error: "Geocoding service error" },
        { status: 502 },
      );
    }

    const json = await res.json();
    const features: MapboxFeature[] = json.features || [];

    const results: GeocodeResult[] = features.map((f) => {
      const ctx = f.properties.context;
      const regionCode = ctx?.region?.region_code || "";
      // region_code comes as "BR-XX", extract the state abbreviation
      const state = regionCode.startsWith("BR-")
        ? regionCode.slice(3)
        : regionCode;

      return {
        id: f.id,
        display_name:
          f.properties.full_address || f.properties.name || "",
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        city: ctx?.place?.name || "",
        state,
        neighborhood:
          ctx?.neighborhood?.name || ctx?.locality?.name || "",
      };
    });

    if (results.length > 0) {
      await redis.set(cacheKey, results, { ex: 86400 });
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("[geocode] fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch geocoding data" },
      { status: 500 },
    );
  }
}
