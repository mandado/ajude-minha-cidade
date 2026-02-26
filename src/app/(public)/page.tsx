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
    <main className="h-screen w-full relative">
      {/*
        Conteúdo semântico para crawlers (Google OAuth verification).
        sr-only: invisível na tela, presente no HTML server-rendered.
        Descreve a finalidade do app e inclui o link para Política de Privacidade.
      */}
      <div className="sr-only">
        <h1>Ajude Minha Cidade</h1>
        <p>
          Ajude Minha Cidade é uma plataforma colaborativa e gratuita de apoio
          humanitário. Exibe em tempo real pontos de abrigo, coleta e
          distribuição de doações, além de ocorrências de deslizamentos e
          soterramentos. Ajude sua comunidade em situações de emergência.
        </p>
        <nav>
          <Link href="/privacidade">Política de Privacidade</Link>
          <Link href="/termos">Termos de Uso</Link>
        </nav>
      </div>

      <Map />
    </main>
  );
}
