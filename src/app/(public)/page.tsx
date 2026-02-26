 "use client";

import dynamic from "next/dynamic";

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
    <main className="h-screen w-full">
      <Map />
    </main>
  );
}
