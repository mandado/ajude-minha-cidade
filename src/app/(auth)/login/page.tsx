import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <>
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Bem-vindo</h1>
        <p className="text-sm text-muted-foreground">
          Entre para cadastrar e gerenciar pontos no mapa
        </p>
      </div>

      <AuthForm />
    </>
  );
}
