import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Always redirect to our own origin, not from the request URL
  const redirectUrl = new URL("/", request.url);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback]", error.message);
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "auth_failed");
    }
  }

  return NextResponse.redirect(redirectUrl);
}
