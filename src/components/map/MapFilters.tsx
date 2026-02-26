"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { House, Package, Truck, MountainSnow, TriangleAlert, Construction } from "lucide-react";
import type { MapFilters as MapFiltersType } from "@/types/map";
import {
  POINT_TYPE_LABELS,
  POINT_TYPE_COLORS,
} from "@/types/map";
import type { PointType } from "@/types/database";
import { getCities } from "@/lib/actions/points";

const TYPE_ICON_MAP: Record<PointType, React.ComponentType<{ className?: string }>> = {
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
}: MapFiltersProps) {
  const { data: cityCounts = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: () => getCities(),
    staleTime: 60_000,
  });

  const handleCityClick = (item: { city: string; lat: number; lng: number }) => {
    const isRemoving = cityFilter.includes(item.city);
    onCityToggle(item.city);

    if (!isRemoving) {
      // Adding a city — zoom to it
      onCitySelect?.(item.city, item.lat, item.lng);
    } else {
      // Removing a city — zoom to the last remaining one
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
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tipo de ponto</h4>
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
                    <TypeIcon
                      className="size-4 shrink-0"
                      style={{ color: active ? color : undefined }}
                    />
                    {label}
                  </span>
                  <span
                    className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors"
                    style={{ backgroundColor: active ? color : "var(--muted)" }}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${active ? "translate-x-4" : "translate-x-0"}`} />
                  </span>
                </button>
              );
            },
          )}
        </div>
      </div>

      {cityCounts.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cidade</h4>
          <div className="h-36 overflow-y-auto">
            <div className="flex flex-wrap gap-1.5 pr-1">
              {cityCounts.map((item) => {
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
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 border-t space-y-2">
        <button
          onClick={onToggleBlockedStreets}
          className="w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          <span className="flex items-center gap-2">
            <Construction className={`size-4 shrink-0 ${showBlockedStreets ? "text-red-500" : "text-muted-foreground"}`} />
            Ruas fechadas
          </span>
          <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${showBlockedStreets ? "bg-red-500" : "bg-muted"}`}>
            <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${showBlockedStreets ? "translate-x-4" : "translate-x-0"}`} />
          </span>
        </button>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {filteredCount} de {totalCount} pontos
          </span>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Limpar filtros
          </Button>
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
  return (
    <>
      {/* Mobile: Controlled sheet (triggered from bottom bar) */}
      <div className="md:hidden">
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent>
            <div className="overflow-y-auto flex-1">
              <DrawerHeader>
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Ajude Minha Cidade"
                    width={300}
                    height={130}
                    className="h-24 w-auto"
                  />
                  <DrawerTitle>Filtros</DrawerTitle>
                </div>
              </DrawerHeader>
              <div className="px-4 pb-8">
                <FilterContent {...props} />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop: Sidebar */}
      <div className="hidden md:block absolute top-4 right-4 z-[1000] w-[272px] bg-background/95 backdrop-blur-sm rounded-xl border shadow-lg p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Filtros</h3>
        <FilterContent {...props} />
      </div>
    </>
  );
}
