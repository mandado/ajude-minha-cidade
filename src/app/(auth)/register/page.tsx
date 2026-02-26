import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cadastre-se para adicionar pontos ao mapa
        </p>
      </div>

      <AuthForm mode="register" />

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
