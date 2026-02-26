import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acesse sua conta para cadastrar pontos
        </p>
      </div>

      <AuthForm mode="login" />

      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/register" className="font-medium text-primary underline">
          Criar conta
        </Link>
      </p>
    </>
  );
}
