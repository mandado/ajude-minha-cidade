"use server";

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validators/point";

const redis = Redis.fromEnv();
const moderationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "moderation",
});

export async function reportPoint(pointId: string, reason: string) {
  if (!uuidSchema.safeParse(pointId).success) {
    return { error: "ID inválido." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado para denunciar." };
  }

  const { success: withinLimit } = await moderationRateLimit.limit(user.id);
  if (!withinLimit) {
    return { error: "Muitas requisições. Aguarde um momento." };
  }

  if (!reason || reason.trim().length < 3) {
    return { error: "Informe o motivo da denúncia (mínimo 3 caracteres)." };
  }

  if (reason.trim().length > 500) {
    return { error: "Motivo muito longo (máximo 500 caracteres)." };
  }

  const { error } = await supabase.from("point_reports").insert({
    point_id: pointId,
    user_id: user.id,
    reason: reason.trim(),
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Você já denunciou este ponto." };
    }
    console.error("[reportPoint]", error.message);
    return { error: "Erro ao denunciar. Tente novamente." };
  }

  return { success: true };
}

export async function confirmPoint(pointId: string) {
  if (!uuidSchema.safeParse(pointId).success) {
    return { error: "ID inválido." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado para confirmar." };
  }

  const { success: withinLimit } = await moderationRateLimit.limit(user.id);
  if (!withinLimit) {
    return { error: "Muitas requisições. Aguarde um momento." };
  }

  const { error } = await supabase.from("point_confirmations").insert({
    point_id: pointId,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Você já confirmou este ponto." };
    }
    console.error("[confirmPoint]", error.message);
    return { error: "Erro ao confirmar. Tente novamente." };
  }

  return { success: true };
}
