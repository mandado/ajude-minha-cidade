"use server";

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

const redis = Redis.fromEnv();
const feedbackRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "24 h"),
  prefix: "feedback",
});

export type FeedbackType = "suggestion" | "bug" | "praise" | "other";

export async function submitFeedback(data: {
  type: FeedbackType;
  message: string;
}) {
  if (!data.message || data.message.trim().length < 10) {
    return { error: "Mensagem muito curta (mínimo 10 caracteres)." };
  }
  if (data.message.trim().length > 1000) {
    return { error: "Mensagem muito longa (máximo 1000 caracteres)." };
  }
  if (!["suggestion", "bug", "praise", "other"].includes(data.type)) {
    return { error: "Tipo de feedback inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Identificador para rate limiting: user ID se logado, ou IP se anônimo
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "anonymous";
  const identifier = user?.id ?? `ip:${ip}`;

  const { success: withinLimit } = await feedbackRateLimit.limit(identifier);
  if (!withinLimit) {
    return { error: "Limite diário de feedbacks atingido. Obrigado pela participação!" };
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: user?.id ?? null,
    type: data.type,
    message: data.message.trim(),
  });

  if (error) {
    console.error("[submitFeedback]", error.message);
    return { error: "Erro ao enviar feedback. Tente novamente." };
  }

  return { success: true };
}
