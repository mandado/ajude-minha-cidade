"use server";

import { createClient } from "@/lib/supabase/server";

export interface BlockedStreetRow {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  state: string | null;
  description: string;
  lat: number;
  lng: number;
  paths: [number, number][][] | null;
  created_by: string | null;
  created_at: string;
}

// ── Busca geometria real da via via Overpass API ──
async function fetchStreetPaths(
  name: string,
  lat: number,
  lng: number,
): Promise<[number, number][][] | null> {
  try {
    const query = `[out:json];way["name"="${name}"](around:600,${lat},${lng});out geom;`;
    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      {
        headers: { "User-Agent": "AjudaMinhaCidade/1.0" },
        next: { revalidate: 0 },
      },
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

export async function getBlockedStreets(): Promise<BlockedStreetRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocked_streets")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getBlockedStreets]", error);
    return [];
  }
  return data ?? [];
}

export async function createBlockedStreet(input: {
  name: string;
  neighborhood: string;
  city: string;
  state: string;
  description: string;
  lat: number;
  lng: number;
}): Promise<{ success: true; id: string } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar logado." };

  if (!input.name.trim()) return { error: "Nome da rua é obrigatório." };
  if (!input.city.trim()) return { error: "Cidade é obrigatória." };

  // Tenta buscar a geometria real via Overpass
  const paths = await fetchStreetPaths(input.name.trim(), input.lat, input.lng);

  const { data, error } = await supabase
    .from("blocked_streets")
    .insert({
      created_by: user.id,
      name: input.name.trim(),
      neighborhood: input.neighborhood.trim(),
      city: input.city.trim(),
      state: input.state || null,
      description: input.description.trim(),
      lat: input.lat,
      lng: input.lng,
      paths: paths ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createBlockedStreet]", error);
    return { error: "Erro ao salvar. Tente novamente." };
  }

  return { success: true, id: data.id };
}

export async function deleteBlockedStreet(
  id: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar logado." };

  const { error } = await supabase
    .from("blocked_streets")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    console.error("[deleteBlockedStreet]", error);
    return { error: "Erro ao remover." };
  }

  return { success: true };
}
