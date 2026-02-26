"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const Map = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <p className="text-muted-foreground">Carregando mapa...</p>
    </div>
  ),
});

export default function HomePage() {
  return (
    <main className="h-screen w-full relative flex flex-col">
      <div className="flex-1 relative">
        <Map />
      </div>

      {/* Rodapé visível — satisfaz requisitos do Google OAuth (nome, finalidade, política de privacidade) */}
      <footer className="hidden md:flex w-full bg-background/95 border-t px-4 py-2 flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground z-[1001]">
        <div className="flex items-center gap-1">
          <h1 className="font-semibold text-foreground text-xs">Ajude Minha Cidade</h1>
          <span>— Mapa colaborativo de apoio humanitário em situações de emergência</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/privacidade" className="underline hover:text-foreground transition-colors">
            Política de Privacidade
          </Link>
          <Link href="/termos" className="hover:text-foreground transition-colors">
            Termos de Uso
          </Link>
        </nav>
      </footer>
    </main>
  );
}
