"use server";

import { validateTurnstileToken } from "next-turnstile";

export async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) return true;

  const result = await validateTurnstileToken({
    token,
    secretKey,
  });

  return result.success;
}
