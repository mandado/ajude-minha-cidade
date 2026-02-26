import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <>
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Faça parte da rede</h1>
        <p className="text-sm text-muted-foreground">
          Juntos conseguimos ajudar mais pessoas. Entre para registrar abrigos, pontos de coleta e ocorrências na sua região.
        </p>
      </div>

      <AuthForm />
    </>
  );
}
