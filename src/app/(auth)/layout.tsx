import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Ajude Minha Cidade"
            width={380}
            height={170}
            className="h-36 w-auto"
            priority
          />
        </div>
        {children}
      </div>
    </div>
  );
}
