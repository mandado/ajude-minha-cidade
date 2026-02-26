"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useRouter } from "next/navigation";
import { PointMarker } from "./PointMarker";
import { MapFilters } from "./MapFilters";

import { CreatePointDialog } from "./CreatePointDialog";
import { PointDetailsSheet } from "./PointDetailsSheet";
import { WeatherAlertBanner } from "./WeatherAlertBanner";
import { WeatherWidget } from "./WeatherWidget";
import { UserMenu } from "@/components/auth/UserMenu";
import { useMapPoints } from "@/hooks/useMapPoints";
import { useAuth } from "@/hooks/useAuth";
import { HelpDialog } from "./HelpDialog";
import { Button } from "@/components/ui/button";
import { Filter, HelpCircle, Plus, User } from "lucide-react";
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
  mapRef: React.MutableRefObject<LeafletMap | null>;
  onViewChange: (lat: number, lng: number, zoom: number) => void;
}) {
  const map = useMap();
  mapRef.current = map;

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onViewChange(center.lat, center.lng, map.getZoom());
    },
  });

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
    togglePriority,
    resetFilters,
    totalPoints,
    isLoading,
    cityFilter,
    toggleCity,
  } = useMapPoints();

  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: BRAZIL_CENTER.lat,
    lng: BRAZIL_CENTER.lng,
  });
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

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
        {points.map((point) => (
          <PointMarker
            key={point.id}
            point={point}
            onOpenDetails={handleOpenDetails}
          />
        ))}
      </MapContainer>

      {/* Top-left: Auth + Create + Help — desktop only */}
      <div className="hidden md:flex absolute top-4 left-4 z-[1000] items-center gap-2">
        <UserMenu />
        {user && (
          <Button
            size="sm"
            className="shadow-md"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Ponto
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shadow-md bg-background"
          onClick={() => setHelpOpen(true)}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
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
        togglePriority={togglePriority}
        resetFilters={resetFilters}
        filteredCount={points.length}
        totalCount={totalPoints}
        cityFilter={cityFilter}
        onCityToggle={toggleCity}
        onCitySelect={handleCityFilterSelect}
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
      />

      {/* Create point sheet (bottom) */}
      <CreatePointDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onPointCreated={handlePointCreatedFlyTo}
      />

      {/* Point details sheet */}
      <PointDetailsSheet
        point={currentSelectedPoint}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        isOwner={canEdit}
      />

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-[1000] bg-background/95 backdrop-blur-sm border-t pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-0.5 h-auto py-2 px-3 relative"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="h-5 w-5" />
            <span className="text-xs">Filtros</span>
            {hasActiveFilters && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>

          {user ? (
            <Button
              size="sm"
              className="flex flex-col items-center gap-0.5 h-auto py-2 px-4"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Novo Ponto</span>
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex flex-col items-center gap-0.5 h-auto py-2 px-4"
              onClick={() => router.push("/login")}
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Novo Ponto</span>
            </Button>
          )}

          {user ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-0.5 h-auto py-2 px-3"
              onClick={() => router.push("/login")}
            >
              <User className="h-5 w-5" />
              <span className="text-xs truncate max-w-[4rem]">
                {user.user_metadata?.full_name ||
                  user.email?.split("@")[0] ||
                  "Perfil"}
              </span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-0.5 h-auto py-2 px-3"
              onClick={() => router.push("/login")}
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Entrar</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-0.5 h-auto py-2 px-3"
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle className="h-5 w-5" />
            <span className="text-xs">Ajuda</span>
          </Button>
        </div>
      </div>

      {/* Help dialog */}
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />

      {/* Footer links — visíveis para crawlers e Google OAuth verification */}
      <div className="hidden md:flex absolute bottom-2 left-1/2 -translate-x-1/2 z-[999] items-center gap-3 text-[11px] text-muted-foreground/70">
        <span>Ajuda Minha Cidade — Mapa colaborativo de apoio humanitário</span>
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
