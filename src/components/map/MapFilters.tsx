"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { House, Package, Truck, MountainSnow, TriangleAlert, Construction, Search, MapPin, Loader2 } from "lucide-react";
import type { MapFilters as MapFiltersType } from "@/types/map";
import { POINT_TYPE_LABELS, POINT_TYPE_COLORS } from "@/types/map";
import type { PointType } from "@/types/database";
import { getCities } from "@/lib/actions/points";
import { useBlockedStreets } from "@/hooks/useBlockedStreets";
import { BLOCKED_STREETS } from "@/data/blocked-streets";

const TYPE_ICON_MAP: Record<
  PointType,
  React.ComponentType<{ className?: string }>
> = {
  shelter: House,
  collection: Package,
  distribution: Truck,
  landslide: MountainSnow,
  burial: TriangleAlert,
};

interface MapFiltersProps {
  filters: MapFiltersType;
  toggleType: (type: PointType) => void;
  resetFilters: () => void;
  filteredCount: number;
  totalCount: number;
  cityFilter: string[];
  onCityToggle: (city: string) => void;
  onCitySelect?: (city: string, lat: number, lng: number) => void;
  showBlockedStreets: boolean;
  onToggleBlockedStreets: () => void;
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
}

interface MapFiltersControlledProps extends MapFiltersProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FilterContent({
  filters,
  toggleType,
  resetFilters,
  filteredCount,
  totalCount,
  cityFilter,
  onCityToggle,
  onCitySelect,
  showBlockedStreets,
  onToggleBlockedStreets,
  nameFilter,
  onNameFilterChange,
}: MapFiltersProps) {
  const [citySearch, setCitySearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(citySearch), 400);
    return () => clearTimeout(t);
  }, [citySearch]);

  const { data: cityCounts = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: () => getCities(),
    staleTime: 60_000,
  });

  const { data: dbBlockedStreets = [] } = useBlockedStreets();
  const blockedStreetsCount = BLOCKED_STREETS.length + dbBlockedStreets.length;

  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredCities = citySearch.trim()
    ? cityCounts.filter((c) => normalize(c.city).includes(normalize(citySearch)))
    : cityCounts;

  const { data: geocodeResults = [], isFetching: isGeoLoading } = useQuery({
    queryKey: ["geocode", "city", debouncedSearch],
    queryFn: async () => {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(debouncedSearch)}&type=city`);
      return res.json() as Promise<{ id: string; display_name: string; lat: number; lng: number; city: string; state: string }[]>;
    },
    enabled: debouncedSearch.trim().length >= 3,
    staleTime: 60_000,
  });

  const geocodedOnly = geocodeResults.filter(
    (g) => !cityCounts.some((c) => normalize(c.city) === normalize(g.city || g.display_name))
  );

  const handleCityClick = (item: {
    city: string;
    lat: number;
    lng: number;
  }) => {
    const isRemoving = cityFilter.includes(item.city);
    onCityToggle(item.city);

    if (!isRemoving) {
      onCitySelect?.(item.city, item.lat, item.lng);
    } else {
      const remaining = cityFilter.filter((c) => c !== item.city);
      if (remaining.length > 0) {
        const lastCity = remaining[remaining.length - 1];
        const lastCityData = cityCounts.find((c) => c.city === lastCity);
        if (lastCityData) {
          onCitySelect?.(lastCityData.city, lastCityData.lat, lastCityData.lng);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Buscar por nome
        </h4>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={nameFilter}
            onChange={(e) => onNameFilterChange(e.target.value)}
            placeholder="Nome do ponto..."
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Tipo de ponto
        </h4>
        <div className="flex flex-col gap-1">
          {(Object.entries(POINT_TYPE_LABELS) as [PointType, string][]).map(
            ([type, label]) => {
              const TypeIcon = TYPE_ICON_MAP[type];
              const active = filters.types.includes(type);
              const color = POINT_TYPE_COLORS[type];
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <span style={active ? { color } : undefined}>
                      <TypeIcon className="size-4 shrink-0" />
                    </span>
                    {label}
                  </span>
                  <span
                    className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors"
                    style={{ backgroundColor: active ? color : "var(--muted)" }}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${active ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </span>
                </button>
              );
            },
          )}
          <button
            onClick={onToggleBlockedStreets}
            className="flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <Construction
                className={`size-4 shrink-0 ${showBlockedStreets ? "text-red-500" : "text-muted-foreground"}`}
              />
              Ruas fechadas
              <Badge variant="outline" className="h-5 px-1.5 text-xs">
                {blockedStreetsCount}
              </Badge>
            </span>
            <span
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${showBlockedStreets ? "bg-red-500" : "bg-muted"}`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${showBlockedStreets ? "translate-x-4" : "translate-x-0"}`}
              />
            </span>
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Cidade
        </h4>
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Buscar cidade..."
            className="pl-8 h-8 text-sm"
          />
          {isGeoLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="h-36 overflow-y-auto">
          <div className="flex flex-wrap gap-1.5 pr-1">
            {!isGeoLoading && citySearch.trim().length > 0 && filteredCities.length === 0 && geocodedOnly.length === 0 && (
              <p className="text-xs text-muted-foreground py-1">Nenhuma cidade encontrada.</p>
            )}
            {filteredCities.map((item) => {
              const isActive = cityFilter.includes(item.city);
              return (
                <button
                  key={`${item.city}|${item.state}`}
                  onClick={() => handleCityClick(item)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-accent"
                  }`}
                >
                  {item.city}
                  {item.state && `/${item.state}`}
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className="h-5 px-1.5 text-xs"
                  >
                    {item.count}
                  </Badge>
                </button>
              );
            })}
            {geocodedOnly.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  onCitySelect?.(g.city || g.display_name, g.lat, g.lng);
                  setCitySearch("");
                }}
                className="flex items-center gap-1.5 rounded-lg border border-dashed px-2.5 py-1.5 text-sm transition-colors hover:bg-accent text-muted-foreground"
              >
                <MapPin className="size-3 shrink-0" />
                {g.city || g.display_name}
                {g.state && `/${g.state}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t">
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground">
            {filteredCount} de {totalCount} pontos
          </span>
        </div>
      </div>
    </div>
  );
}

export function MapFilters({
  open,
  onOpenChange,
  ...props
}: MapFiltersControlledProps) {
  const totalTypes = Object.keys(POINT_TYPE_LABELS).length;
  const hasActiveFilters =
    props.filters.types.length < totalTypes ||
    props.cityFilter.length > 0 ||
    props.showBlockedStreets;

  return (
    <>
      {/* Mobile: Controlled sheet (triggered from bottom bar) */}
      <div className="md:hidden">
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="flex flex-col max-h-[85vh]">
            <div className="overflow-y-auto flex-1 min-h-0">
              <DrawerHeader>
                <div className="flex flex-col items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Ajude Minha Cidade"
                    width={200}
                    height={90}
                  />
                  <DrawerTitle>Filtros</DrawerTitle>
                </div>
              </DrawerHeader>
              <div className="px-4 pb-4">
                <FilterContent {...props} />
              </div>
            </div>
            <div className="px-4 pb-6 pt-3 border-t bg-background shrink-0 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={props.resetFilters} disabled={!hasActiveFilters}>
                Limpar
              </Button>
              <Button className="flex-1" onClick={() => onOpenChange?.(false)}>
                Aplicar filtros
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop: Sidebar */}
      <div className="hidden md:flex flex-col absolute top-4 right-4 z-[1000] w-[272px] max-h-[calc(100vh-2rem)] bg-background/95 backdrop-blur-sm rounded-xl border shadow-lg">
        <div className="px-4 pt-4 pb-2 shrink-0">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Filtros
          </h3>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0 px-4 pb-2">
          <FilterContent {...props} />
        </div>
        <div className="px-4 pb-4 pt-3 border-t bg-background/95 rounded-b-xl shrink-0 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={props.resetFilters}>
            Limpar
          </Button>
          <Button className="flex-1" onClick={() => {}}>
            Aplicar filtros
          </Button>
        </div>
      </div>
    </>
  );
}
