"use client";

import { useState } from "react";
import { Turnstile } from "next-turnstile";
import { createClient } from "@/lib/supabase/client";
import { verifyCaptcha } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;
const IS_DEV = process.env.NODE_ENV === "development";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [turnstileKey, setTurnstileKey] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const resetCaptcha = () => {
    setCaptchaToken(undefined);
    setTurnstileKey((k) => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!IS_DEV) {
      if (!captchaToken) {
        setError("Complete o captcha antes de continuar.");
        setLoading(false);
        return;
      }
      const valid = await verifyCaptcha(captchaToken);
      if (!valid) {
        resetCaptcha();
        setError("Verificação de captcha falhou. Tente novamente.");
        setLoading(false);
        return;
      }
    }

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        resetCaptcha();
        setError(
          error.message === "Invalid login credentials"
            ? "E-mail ou senha incorretos."
            : error.message,
        );
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } else {
      if (!fullName.trim()) {
        setError("Informe seu nome completo.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        resetCaptcha();
        setError(
          error.message === "User already registered"
            ? "Este e-mail já está cadastrado. Faça login."
            : error.message,
        );
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError(null);
    resetCaptcha();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "register" && (
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Como você se chama?"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder={
              mode === "register" ? "Mínimo 6 caracteres" : "••••••••"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
        </div>

        <Turnstile
          key={turnstileKey}
          siteKey={SITE_KEY}
          sandbox={IS_DEV}
          onVerify={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(undefined)}
          onError={() => setCaptchaToken(undefined)}
          theme="auto"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          className="w-full h-11"
          disabled={loading || (!IS_DEV && !captchaToken)}
        >
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Ainda não faz parte?{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="underline hover:text-foreground transition-colors"
            >
              Crie sua conta
            </button>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="underline hover:text-foreground transition-colors"
            >
              Entrar
            </button>
          </>
        )}
      </div>

      {/* Google OAuth — oculto enquanto está em análise pelo Google
      <Button
        className="w-full h-11 text-sm font-medium gap-3"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        Entrar com Google
      </Button>
      */}
    </div>
  );
}
