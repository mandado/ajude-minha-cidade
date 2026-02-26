"use server";

export async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Em dev ou sem chave configurada, pula verificação
  if (!secret) return true;

  const body = new URLSearchParams({ secret, response: token });

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
  );

  const data = await res.json();
  return data.success === true;
}
