"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvent } from "react-leaflet";
import { useRouter } from "next/navigation";
import { PointMarker } from "./PointMarker";
import { MapFilters } from "./MapFilters";

import { CreatePointDialog } from "./CreatePointDialog";
import { PointDetailsSheet } from "./PointDetailsSheet";
import { WeatherAlertBanner } from "./WeatherAlertBanner";
import { WeatherWidget } from "./WeatherWidget";
import { useMapPoints } from "@/hooks/useMapPoints";
import { useAuth } from "@/hooks/useAuth";
import { HelpDialog } from "./HelpDialog";
import { FeedbackDialog } from "./FeedbackDialog";
import { BlockedStreetOverlay } from "./BlockedStreetOverlay";
import { AddBlockedStreetDialog } from "./AddBlockedStreetDialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ChevronRight, Construction, Filter, HelpCircle, LogOut, MapPin, MessageSquareDot, User } from "lucide-react";

import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";
import type { MapPoint } from "@/types/map";

const BRAZIL_CENTER = { lat: -15.77, lng: -47.92 };
const DEFAULT_ZOOM = 4;

function FlyToHandler({
  mapRef,
  onViewChange,
}: {
  mapRef: React.RefObject<LeafletMap | null>;
  onViewChange: (lat: number, lng: number, zoom: number) => void;
}) {
  const map = useMap();
  mapRef.current = map;

  const handleMoveEnd = useCallback(() => {
    const center = map.getCenter();
    onViewChange(center.lat, center.lng, map.getZoom());
  }, [map, onViewChange]);

  useMapEvent("moveend", handleMoveEnd);

  useEffect(() => {
    const center = map.getCenter();
    onViewChange(center.lat, center.lng, map.getZoom());
  }, [map, onViewChange]);

  return null;
}

export default function Map() {
  const mapRef = useRef<LeafletMap | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const {
    points,
    filters,
    toggleType,
    resetFilters,
    totalPoints,
    isLoading,
    cityFilter,
    toggleCity,
  } = useMapPoints();

  const [isMobile, setIsMobile] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [showBlockedStreets, setShowBlockedStreets] = useState(true);
  const [addBlockedStreetOpen, setAddBlockedStreetOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: BRAZIL_CENTER.lat,
    lng: BRAZIL_CENTER.lng,
  });
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleViewChange = useCallback(
    (lat: number, lng: number, zoom: number) => {
      setMapCenter({ lat, lng });
      setMapZoom(zoom);
    },
    [],
  );

  const handleOpenDetails = useCallback((point: MapPoint) => {
    setSelectedPoint(point);
    setSheetOpen(true);
  }, []);

  const handleCityFilterSelect = useCallback(
    (_city: string, lat: number, lng: number) => {
      mapRef.current?.flyTo([lat, lng], 15, { duration: 1.5 });
    },
    [],
  );

  const handlePointCreatedFlyTo = useCallback((lat: number, lng: number) => {
    mapRef.current?.flyTo([lat, lng], 14, { duration: 1.5 });
  }, []);

  // Keep selectedPoint in sync with refreshed data
  const currentSelectedPoint = selectedPoint
    ? (points.find((p) => p.id === selectedPoint.id) ?? selectedPoint)
    : null;

  const canEdit = !!user;
  const hasActiveFilters = points.length !== totalPoints;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={BRAZIL_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToHandler mapRef={mapRef} onViewChange={handleViewChange} />
        <BlockedStreetOverlay show={showBlockedStreets} />
        {points.map((point) => (
          <PointMarker
            key={point.id}
            point={point}
            isMobile={isMobile}
            onOpenDetails={handleOpenDetails}
          />
        ))}
      </MapContainer>

      {/* Painel lateral esquerdo — desktop only */}
      <div className="hidden md:flex absolute top-4 left-4 z-[1000] flex-col w-56 bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg overflow-hidden">
        {/* Logo / branding */}
        <div className="px-4 py-3 border-b">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Ajuda Minha Cidade" className="w-full h-auto" />
        </div>
        {/* Usuário */}
        {user ? (
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="size-4 text-primary" />
              </div>
              <span className="text-sm font-medium truncate">
                {user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário"}
              </span>
            </div>
            <button
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0"
              onClick={async () => {
                const supabase = (await import("@/lib/supabase/client")).createClient();
                await supabase.auth.signOut();
                router.refresh();
              }}
            >
              <LogOut className="size-3.5" />
              Sair
            </button>
          </div>
        ) : (
          <button
            className="flex items-center gap-2 px-3 py-2.5 border-b hover:bg-accent transition-colors text-sm font-medium"
            onClick={() => router.push("/login")}
          >
            <User className="size-4 text-muted-foreground" />
            Entrar na conta
          </button>
        )}

        {/* Ações de contribuição */}
        {user && (
          <div className="py-1 border-b">
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
              onClick={() => setCreateOpen(true)}
            >
              <MapPin className="size-4 text-primary shrink-0" />
              Novo ponto de ajuda
            </button>
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-red-50 text-red-600 transition-colors text-left"
              onClick={() => setAddBlockedStreetOpen(true)}
            >
              <Construction className="size-4 shrink-0" />
              Reportar rua fechada
            </button>
          </div>
        )}

        {/* Suporte */}
        <div className="py-1">
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left"
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle className="size-4 shrink-0" />
            Como usar
          </button>
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left"
            onClick={() => setFeedbackOpen(true)}
          >
            <MessageSquareDot className="size-4 shrink-0" />
            Enviar feedback
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-background/95 backdrop-blur-sm rounded-md border shadow-md px-4 py-2 text-sm text-muted-foreground">
          Carregando pontos...
        </div>
      )}

      {/* Weather alert banner */}
      <WeatherAlertBanner
        cityName={cityFilter.length > 0 ? cityFilter[0] : null}
      />

      {/* Weather widget */}
      <WeatherWidget lat={mapCenter.lat} lng={mapCenter.lng} zoom={mapZoom} />

      <MapFilters
        filters={filters}
        toggleType={toggleType}
        resetFilters={resetFilters}
        filteredCount={points.length}
        totalCount={totalPoints}
        cityFilter={cityFilter}
        onCityToggle={toggleCity}
        onCitySelect={handleCityFilterSelect}
        showBlockedStreets={showBlockedStreets}
        onToggleBlockedStreets={() => setShowBlockedStreets((v) => !v)}
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
      />

      {/* Create point sheet (bottom) */}
      <CreatePointDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onPointCreated={handlePointCreatedFlyTo}
      />

      {/* Add blocked street dialog */}
      <AddBlockedStreetDialog
        open={addBlockedStreetOpen}
        onOpenChange={setAddBlockedStreetOpen}
        proximity={mapCenter}
      />

      {/* Point details sheet */}
      <PointDetailsSheet
        point={currentSelectedPoint}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        isOwner={canEdit}
      />

      {/* Mobile bottom bar — 4 itens fixos */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-[1000] bg-background/95 backdrop-blur-sm border-t pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 px-2 py-1">
          {/* Filtros */}
          <button
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg relative"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="h-6 w-6 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground font-medium">Filtros</span>
            {hasActiveFilters && (
              <span className="absolute top-1.5 right-4 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>

          {/* Contribuir / Entrar */}
          {user ? (
            <button
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg bg-primary mx-1"
              onClick={() => setContributeOpen(true)}
            >
              <MapPin className="h-6 w-6 text-primary-foreground" />
              <span className="text-[11px] text-primary-foreground font-semibold">Contribuir</span>
            </button>
          ) : (
            <button
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg bg-primary mx-1"
              onClick={() => router.push("/login")}
            >
              <User className="h-6 w-6 text-primary-foreground" />
              <span className="text-[11px] text-primary-foreground font-semibold">Entrar</span>
            </button>
          )}

          {/* Ajuda */}
          <button
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg"
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle className="h-6 w-6 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground font-medium">Ajuda</span>
          </button>

          {/* Conta */}
          {user ? (
            <button
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg"
              onClick={async () => {
                const supabase = (await import("@/lib/supabase/client")).createClient();
                await supabase.auth.signOut();
                router.refresh();
              }}
            >
              <LogOut className="h-6 w-6 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-medium">Sair</span>
            </button>
          ) : (
            <button
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg"
              onClick={() => setFeedbackOpen(true)}
            >
              <MessageSquareDot className="h-6 w-6 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-medium">Feedback</span>
            </button>
          )}
        </div>
      </div>

      {/* Mini-sheet de contribuição (mobile) */}
      <Drawer open={contributeOpen} onOpenChange={setContributeOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>O que deseja registrar?</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pt-2 pb-8 space-y-3">
            <button
              className="w-full flex items-center gap-4 rounded-xl border p-4 text-left hover:bg-accent transition-colors"
              onClick={() => { setContributeOpen(false); setCreateOpen(true); }}
            >
              <span className="flex items-center justify-center size-12 rounded-xl bg-primary/10 shrink-0">
                <MapPin className="size-6 text-primary" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">Ponto de ajuda</p>
                <p className="text-sm text-muted-foreground">Abrigo, coleta, distribuição ou risco</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground shrink-0" />
            </button>
            <button
              className="w-full flex items-center gap-4 rounded-xl border p-4 text-left hover:bg-accent transition-colors"
              onClick={() => { setContributeOpen(false); setAddBlockedStreetOpen(true); }}
            >
              <span className="flex items-center justify-center size-12 rounded-xl bg-red-50 shrink-0">
                <Construction className="size-6 text-red-600" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">Reportar rua fechada</p>
                <p className="text-sm text-muted-foreground">Via interditada, alagada ou perigosa</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground shrink-0" />
            </button>
            <button
              className="w-full flex items-center gap-4 rounded-xl border p-4 text-left hover:bg-accent transition-colors"
              onClick={() => { setContributeOpen(false); setFeedbackOpen(true); }}
            >
              <span className="flex items-center justify-center size-12 rounded-xl bg-muted shrink-0">
                <MessageSquareDot className="size-6 text-muted-foreground" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">Enviar feedback</p>
                <p className="text-sm text-muted-foreground">Sugestão, erro ou elogio sobre o app</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground shrink-0" />
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Help dialog */}
      <HelpDialog
        open={helpOpen}
        onOpenChange={setHelpOpen}
        onFeedback={() => setFeedbackOpen(true)}
      />

      {/* Feedback dialog */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />

      {/* Footer links — visíveis para crawlers e Google OAuth verification */}
      <div className="hidden md:flex absolute bottom-2 left-1/2 -translate-x-1/2 z-[999] items-center gap-3 text-[11px] text-muted-foreground/70">
        <span>Ajude Minha Cidade — Mapa colaborativo de apoio humanitário</span>
        <span>·</span>
        <Link href="/privacidade" className="hover:text-foreground underline transition-colors">
          Política de Privacidade
        </Link>
        <span>·</span>
        <Link href="/termos" className="hover:text-foreground underline transition-colors">
          Termos de Uso
        </Link>
      </div>
    </div>
  );
}
