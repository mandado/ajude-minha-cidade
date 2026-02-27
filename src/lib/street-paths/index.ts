/**
 * Street path strategies
 *
 * Troca o provedor via variável de ambiente:
 *   STREET_PATHS_PROVIDER=overpass   (padrão)
 *   STREET_PATHS_PROVIDER=mapbox
 */

type Paths = [number, number][][];

// ── Overpass (OpenStreetMap) ──────────────────────────────────────────────────

async function resolveOsmStreetName(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "User-Agent": "AjudaMinhaCidade/1.0" }, next: { revalidate: 0 } },
    );
    const data = await res.json();
    return (data?.address?.road as string) ?? null;
  } catch {
    return null;
  }
}

async function fetchWithOverpass(name: string, lat: number, lng: number): Promise<Paths | null> {
  const osmName = await resolveOsmStreetName(lat, lng);
  const cleanedName = name.replace(/[\d,]+\s*$/, "").trim();

  const namesToTry = [
    ...(osmName ? [osmName] : []),
    ...(cleanedName !== name ? [cleanedName] : []),
    name,
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  for (const streetName of namesToTry) {
    try {
      const query = `[out:json];way["name"="${streetName}"](around:600,${lat},${lng});out geom;`;
      const res = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
        { headers: { "User-Agent": "AjudaMinhaCidade/1.0" }, next: { revalidate: 0 } },
      );
      const data = await res.json();
      if (!data.elements?.length) continue;

      const paths: Paths = data.elements
        .filter((el: { type: string; geometry?: { lat: number; lon: number }[] }) =>
          el.type === "way" && el.geometry?.length,
        )
        .map((el: { geometry: { lat: number; lon: number }[] }) =>
          el.geometry.map((pt) => [pt.lat, pt.lon] as [number, number]),
        );

      if (paths.length) return paths;
    } catch {
      continue;
    }
  }

  return null;
}

// ── Mapbox Tilequery ──────────────────────────────────────────────────────────
// Docs: https://docs.mapbox.com/api/maps/tilequery/
// Usa o tileset mapbox.mapbox-streets-v8 para obter a geometria da via mais
// próxima das coordenadas, sem precisar do nome da rua.

async function fetchWithMapbox(lat: number, lng: number): Promise<Paths | null> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    console.warn("[street-paths] MAPBOX_ACCESS_TOKEN não configurado");
    return null;
  }

  try {
    const url =
      `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json` +
      `?layers=road&radius=50&limit=5&dedupe&access_token=${token}`;

    const res = await fetch(url, { next: { revalidate: 0 } });
    const data = await res.json();

    if (!data.features?.length) return null;

    const paths: Paths = data.features
      .filter((f: { geometry?: { type: string; coordinates: unknown } }) =>
        f.geometry?.type === "LineString" || f.geometry?.type === "MultiLineString",
      )
      .flatMap((f: { geometry: { type: string; coordinates: unknown } }) => {
        if (f.geometry.type === "LineString") {
          const coords = f.geometry.coordinates as [number, number][];
          return [coords.map(([lng, lat]) => [lat, lng] as [number, number])];
        }
        // MultiLineString
        const coords = f.geometry.coordinates as [number, number][][];
        return coords.map((seg) => seg.map(([lng, lat]) => [lat, lng] as [number, number]));
      });

    return paths.length ? paths : null;
  } catch {
    return null;
  }
}

// ── Clip de trecho ────────────────────────────────────────────────────────────

function distSq(a: [number, number], b: [number, number]): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
}

/**
 * Recorta um conjunto de segmentos de rua entre os dois pontos mais próximos
 * de `from` e `to`. Retorna apenas o trecho entre eles.
 */
export function clipPathBetween(
  paths: Paths,
  from: [number, number],
  to: [number, number],
): Paths {
  let bestPath: [number, number][] | null = null;
  let bestFromIdx = 0;
  let bestToIdx = 0;
  let bestScore = Infinity;

  for (const path of paths) {
    let minFrom = Infinity, fi = 0;
    let minTo = Infinity, ti = 0;
    for (let i = 0; i < path.length; i++) {
      const df = distSq(path[i], from);
      const dt = distSq(path[i], to);
      if (df < minFrom) { minFrom = df; fi = i; }
      if (dt < minTo) { minTo = dt; ti = i; }
    }
    const score = minFrom + minTo;
    if (score < bestScore) {
      bestScore = score;
      bestPath = path;
      bestFromIdx = fi;
      bestToIdx = ti;
    }
  }

  if (!bestPath || bestFromIdx === bestToIdx) return paths;

  const start = Math.min(bestFromIdx, bestToIdx);
  const end = Math.max(bestFromIdx, bestToIdx);
  return [bestPath.slice(start, end + 1)];
}

// ── Interface pública ─────────────────────────────────────────────────────────

export async function fetchStreetPaths(
  name: string,
  lat: number,
  lng: number,
): Promise<Paths | null> {
  const provider = process.env.STREET_PATHS_PROVIDER ?? "overpass";

  switch (provider) {
    case "mapbox":
      return fetchWithMapbox(lat, lng);
    case "overpass":
    default:
      return fetchWithOverpass(name, lat, lng);
  }
}
