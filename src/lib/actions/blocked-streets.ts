"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchStreetPaths, clipPathBetween } from "@/lib/street-paths";

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
  from_number: string | null;
  to_number: string | null;
  created_by: string | null;
  created_at: string;
}

async function geocodeAddress(
  street: string,
  number: string,
  city: string,
  lat: number,
  lng: number,
): Promise<[number, number] | null> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return null;

  const q = `${street}, ${number}, ${city}`;
  const url =
    `https://api.mapbox.com/search/geocode/v6/forward` +
    `?q=${encodeURIComponent(q)}` +
    `&access_token=${token}` +
    `&country=br&language=pt-BR&limit=1` +
    `&proximity=${lng},${lat}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    const data = await res.json();
    const feat = data.features?.[0];
    if (!feat) return null;
    return [feat.geometry.coordinates[1], feat.geometry.coordinates[0]];
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
  fromNumber?: string;
  toNumber?: string;
}): Promise<{ success: true; id: string } | { error: string }> {
  const supabase = await createClient();

  if (!input.name.trim()) return { error: "Nome da rua é obrigatório." };
  if (!input.city.trim()) return { error: "Cidade é obrigatória." };

  // Busca a geometria real via Overpass / Mapbox
  let paths = await fetchStreetPaths(input.name.trim(), input.lat, input.lng);

  // Recorta o trecho com base nos números informados
  const hasRange = input.fromNumber?.trim() && input.toNumber?.trim();
  if (paths && hasRange) {
    const [fromCoord, toCoord] = await Promise.all([
      geocodeAddress(input.name.trim(), input.fromNumber!.trim(), input.city.trim(), input.lat, input.lng),
      geocodeAddress(input.name.trim(), input.toNumber!.trim(), input.city.trim(), input.lat, input.lng),
    ]);
    if (fromCoord && toCoord) {
      paths = clipPathBetween(paths, fromCoord, toCoord);
    }
  }

  const { data, error } = await supabase
    .from("blocked_streets")
    .insert({
      created_by: null,
      name: input.name.trim(),
      neighborhood: input.neighborhood.trim(),
      city: input.city.trim(),
      state: input.state || null,
      description: input.description.trim(),
      lat: input.lat,
      lng: input.lng,
      paths: paths ?? null,
      from_number: input.fromNumber?.trim() || null,
      to_number: input.toNumber?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createBlockedStreet]", error);
    return { error: "Erro ao salvar. Tente novamente." };
  }

  return { success: true, id: data.id };
}

export async function updateBlockedStreet(input: {
  id: string;
  name: string;
  description: string;
  fromNumber?: string;
  toNumber?: string;
  /** Se fornecido, re-busca as coordenadas e geometria real da via */
  lat?: number;
  lng?: number;
  neighborhood?: string;
  city?: string;
  state?: string;
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  if (!input.name.trim()) return { error: "Nome da rua é obrigatório." };

  const locationChanged = input.lat !== undefined && input.lng !== undefined;

  // Re-busca geometria se o local foi alterado
  let paths: [number, number][][] | null | undefined = undefined;
  if (locationChanged) {
    paths = await fetchStreetPaths(input.name.trim(), input.lat!, input.lng!);

    const hasRange = input.fromNumber?.trim() && input.toNumber?.trim();
    if (paths && hasRange && input.city) {
      const [fromCoord, toCoord] = await Promise.all([
        geocodeAddress(input.name.trim(), input.fromNumber!.trim(), input.city.trim(), input.lat!, input.lng!),
        geocodeAddress(input.name.trim(), input.toNumber!.trim(), input.city.trim(), input.lat!, input.lng!),
      ]);
      if (fromCoord && toCoord) {
        paths = clipPathBetween(paths, fromCoord, toCoord);
      }
    }
  }

  const updatePayload: Record<string, unknown> = {
    name: input.name.trim(),
    description: input.description.trim(),
    from_number: input.fromNumber?.trim() || null,
    to_number: input.toNumber?.trim() || null,
  };

  if (locationChanged) {
    updatePayload.lat = input.lat;
    updatePayload.lng = input.lng;
    updatePayload.paths = paths ?? null;
    if (input.neighborhood !== undefined) updatePayload.neighborhood = input.neighborhood;
    if (input.city !== undefined) updatePayload.city = input.city;
    if (input.state !== undefined) updatePayload.state = input.state || null;
  }

  const { error } = await supabase
    .from("blocked_streets")
    .update(updatePayload)
    .eq("id", input.id);

  if (error) {
    console.error("[updateBlockedStreet]", error);
    return { error: "Erro ao salvar. Tente novamente." };
  }

  return { success: true };
}

export async function deleteBlockedStreet(
  id: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("blocked_streets")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteBlockedStreet]", error);
    return { error: "Erro ao remover." };
  }

  return { success: true };
}
