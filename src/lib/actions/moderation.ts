"use server";

import { createClient } from "@/lib/supabase/server";

export async function reportPoint(pointId: string, reason: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado para denunciar." };
  }

  if (!reason || reason.trim().length < 3) {
    return { error: "Informe o motivo da denúncia (mínimo 3 caracteres)." };
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
    return { error: `Erro ao denunciar: ${error.message}` };
  }

  return { success: true };
}

export async function confirmPoint(pointId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado para confirmar." };
  }

  const { error } = await supabase.from("point_confirmations").insert({
    point_id: pointId,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Você já confirmou este ponto." };
    }
    return { error: `Erro ao confirmar: ${error.message}` };
  }

  return { success: true };
}
