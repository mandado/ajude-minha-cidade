"use server";

import { createClient } from "@/lib/supabase/server";
import { createPointSchema, needSchema } from "@/lib/validators/point";
import type { NeedInput } from "@/lib/validators/point";

interface CreatePointData {
  point: {
    name: string;
    description?: string;
    type: string;
    priority: string;
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    neighborhood?: string;
    phone?: string;
    operating_hours?: string;
  };
  needs: NeedInput[];
}

export async function createPoint(data: CreatePointData) {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado para criar um ponto." };
  }

  // Validate point data
  const pointResult = createPointSchema.safeParse(data.point);
  if (!pointResult.success) {
    return { error: pointResult.error.issues[0].message };
  }

  // Validate needs
  for (const need of data.needs) {
    const needResult = needSchema.safeParse(need);
    if (!needResult.success) {
      return { error: needResult.error.issues[0].message };
    }
  }

  const pointData = pointResult.data;

  // Insert point
  const { data: newPoint, error: pointError } = await supabase
    .from("points")
    .insert({
      created_by: user.id,
      name: pointData.name,
      description: pointData.description || null,
      type: pointData.type,
      priority: pointData.priority,
      status: "active",
      latitude: pointData.latitude,
      longitude: pointData.longitude,
      location: `SRID=4326;POINT(${pointData.longitude} ${pointData.latitude})`,
      address: pointData.address || null,
      city: pointData.city || null,
      state: pointData.state || null,
      neighborhood: data.point.neighborhood || null,
      phone: pointData.phone || null,
      operating_hours: pointData.operating_hours || null,
    })
    .select("id")
    .single();

  if (pointError) {
    return { error: `Erro ao criar ponto: ${pointError.message}` };
  }

  // Insert needs
  if (data.needs.length > 0) {
    const needsToInsert = data.needs.map((need) => ({
      point_id: newPoint.id,
      description: need.description,
      quantity: need.quantity ?? null,
      unit: need.unit || null,
    }));

    const { error: needsError } = await supabase
      .from("needs")
      .insert(needsToInsert);

    if (needsError) {
      return { error: `Erro ao salvar necessidades: ${needsError.message}` };
    }
  }

  return { success: true, pointId: newPoint.id };
}

export async function updatePoint(
  pointId: string,
  data: {
    name?: string;
    description?: string | null;
    type?: string;
    priority?: string;
    latitude?: number;
    longitude?: number;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    neighborhood?: string | null;
    phone?: string | null;
    operating_hours?: string | null;
  },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado." };
  }

  if (data.name !== undefined && data.name.trim().length < 3) {
    return { error: "Nome deve ter pelo menos 3 caracteres." };
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.type) updateData.type = data.type;
  if (data.priority) updateData.priority = data.priority;
  if (data.latitude !== undefined && data.longitude !== undefined) {
    updateData.latitude = data.latitude;
    updateData.longitude = data.longitude;
    updateData.location = `SRID=4326;POINT(${data.longitude} ${data.latitude})`;
  }
  if (data.address !== undefined) updateData.address = data.address || null;
  if (data.city !== undefined) updateData.city = data.city || null;
  if (data.state !== undefined) updateData.state = data.state || null;
  if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood || null;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.operating_hours !== undefined) updateData.operating_hours = data.operating_hours || null;

  const { error } = await supabase
    .from("points")
    .update(updateData)
    .eq("id", pointId);

  if (error) {
    return { error: `Erro ao atualizar ponto: ${error.message}` };
  }

  return { success: true };
}

export async function addNeed(
  pointId: string,
  need: { description: string; quantity?: number; unit?: string },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado." };
  }

  const needResult = needSchema.safeParse(need);
  if (!needResult.success) {
    return { error: needResult.error.issues[0].message };
  }

  const { data: newNeed, error } = await supabase
    .from("needs")
    .insert({
      point_id: pointId,
      description: needResult.data.description,
      quantity: needResult.data.quantity ?? null,
      unit: needResult.data.unit || null,
    })
    .select()
    .single();

  if (error) {
    return { error: `Erro ao adicionar necessidade: ${error.message}` };
  }

  return { success: true, need: newNeed };
}

export async function updateNeed(
  needId: string,
  data: {
    description?: string;
    quantity?: number | null;
    unit?: string | null;
    is_fulfilled?: boolean;
  },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado." };
  }

  const { data: updated, error } = await supabase
    .from("needs")
    .update(data)
    .eq("id", needId)
    .select()
    .single();

  if (error) {
    return { error: `Erro ao atualizar necessidade: ${error.message}` };
  }

  return { success: true, need: updated };
}

export async function getCities(): Promise<
  { city: string; state: string; count: number; lat: number; lng: number }[]
> {
  const supabase = await createClient();

  const { data: points } = await supabase
    .from("points")
    .select("city, state, latitude, longitude")
    .eq("status", "active")
    .not("city", "is", null);

  if (!points) return [];

  const counts: Record<string, { city: string; state: string; count: number; latSum: number; lngSum: number }> = {};
  for (const p of points) {
    if (!p.city) continue;
    const key = `${p.city}|${p.state}`;
    if (!counts[key]) {
      counts[key] = { city: p.city, state: p.state ?? "", count: 0, latSum: 0, lngSum: 0 };
    }
    counts[key].count++;
    counts[key].latSum += p.latitude;
    counts[key].lngSum += p.longitude;
  }
  return Object.values(counts)
    .map((c) => ({
      city: c.city,
      state: c.state,
      count: c.count,
      lat: c.latSum / c.count,
      lng: c.lngSum / c.count,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function deleteNeed(needId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado." };
  }

  const { error } = await supabase.from("needs").delete().eq("id", needId);

  if (error) {
    return { error: `Erro ao remover necessidade: ${error.message}` };
  }

  return { success: true };
}

export async function deletePoint(pointId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado." };
  }

  // Delete needs first
  await supabase.from("needs").delete().eq("point_id", pointId);

  const { error } = await supabase.from("points").delete().eq("id", pointId);

  if (error) {
    return { error: `Erro ao remover ponto: ${error.message}` };
  }

  return { success: true };
}
