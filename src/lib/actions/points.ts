"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createPointSchema,
  needSchema,
  updatePointSchema,
  updateNeedSchema,
  uuidSchema,
} from "@/lib/validators/point";
import type { NeedInput } from "@/lib/validators/point";

interface CreatePointData {
  point: {
    name: string;
    description?: string;
    type: string;
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      created_by: user?.id ?? null,
      name: pointData.name,
      description: pointData.description || null,
      type: pointData.type,
      status: "active",
      latitude: pointData.latitude,
      longitude: pointData.longitude,
      location: `SRID=4326;POINT(${pointData.longitude} ${pointData.latitude})`,
      address: pointData.address || null,
      city: pointData.city || null,
      state: pointData.state || null,
      neighborhood: pointData.neighborhood || null,
      phone: pointData.phone || null,
      operating_hours: pointData.operating_hours || null,
    })
    .select("id")
    .single();

  if (pointError) {
    console.error("[createPoint]", pointError.message);
    return { error: "Erro ao criar ponto. Tente novamente." };
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
      console.error("[createPoint:needs]", needsError.message);
      return { error: "Erro ao salvar necessidades. Tente novamente." };
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
  // Validate UUID
  if (!uuidSchema.safeParse(pointId).success) {
    return { error: "ID inválido." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado." };
  }


  // Sanitize: convert null to undefined for Zod validation
  const sanitized = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === null ? undefined : v]),
  );

  // Validate with Zod
  const parsed = updatePointSchema.safeParse(sanitized);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const validData = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (validData.name !== undefined) updateData.name = validData.name.trim();
  updateData.description = data.description ?? undefined;
  if (validData.type) updateData.type = validData.type;
  if (validData.latitude !== undefined && validData.longitude !== undefined) {
    updateData.latitude = validData.latitude;
    updateData.longitude = validData.longitude;
    updateData.location = `SRID=4326;POINT(${validData.longitude} ${validData.latitude})`;
  }
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.operating_hours !== undefined)
    updateData.operating_hours = data.operating_hours;

  const { error } = await supabase
    .from("points")
    .update(updateData)
    .eq("id", pointId);

  if (error) {
    console.error("[updatePoint]", error.message);
    return { error: "Erro ao atualizar ponto. Tente novamente." };
  }

  return { success: true };
}

export async function addNeed(
  pointId: string,
  need: { description: string; quantity?: number; unit?: string },
) {
  // Validate UUID
  if (!uuidSchema.safeParse(pointId).success) {
    return { error: "ID inválido." };
  }

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
    console.error("[addNeed]", error.message);
    return { error: "Erro ao adicionar necessidade. Tente novamente." };
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
  // Validate UUID
  if (!uuidSchema.safeParse(needId).success) {
    return { error: "ID inválido." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado." };
  }


  // Validate with Zod
  const parsed = updateNeedSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data: updated, error } = await supabase
    .from("needs")
    .update(parsed.data)
    .eq("id", needId)
    .select()
    .single();

  if (error) {
    console.error("[updateNeed]", error.message);
    return { error: "Erro ao atualizar necessidade. Tente novamente." };
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

  const counts: Record<
    string,
    {
      city: string;
      state: string;
      count: number;
      latSum: number;
      lngSum: number;
    }
  > = {};
  for (const p of points) {
    if (!p.city) continue;
    const key = `${p.city}|${p.state}`;
    if (!counts[key]) {
      counts[key] = {
        city: p.city,
        state: p.state ?? "",
        count: 0,
        latSum: 0,
        lngSum: 0,
      };
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
  // Validate UUID
  if (!uuidSchema.safeParse(needId).success) {
    return { error: "ID inválido." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado." };
  }


  const { error } = await supabase.from("needs").delete().eq("id", needId);

  if (error) {
    console.error("[deleteNeed]", error.message);
    return { error: "Erro ao remover necessidade. Tente novamente." };
  }

  return { success: true };
}

export async function deletePoint(pointId: string) {
  // Validate UUID
  if (!uuidSchema.safeParse(pointId).success) {
    return { error: "ID inválido." };
  }

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
    console.error("[deletePoint]", error.message);
    return { error: "Erro ao remover ponto. Tente novamente." };
  }

  return { success: true };
}
