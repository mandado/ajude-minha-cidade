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
import { House, Package, Truck, MountainSnow, TriangleAlert } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">Tipo de ponto</h4>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(POINT_TYPE_LABELS) as [PointType, string][]).map(
            ([type, label]) => {
              const TypeIcon = TYPE_ICON_MAP[type];
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors"
                  style={{
                    backgroundColor: filters.types.includes(type)
                      ? `${POINT_TYPE_COLORS[type]}20`
                      : "transparent",
                    borderColor: filters.types.includes(type)
                      ? POINT_TYPE_COLORS[type]
                      : "var(--border)",
                    color: filters.types.includes(type)
                      ? POINT_TYPE_COLORS[type]
                      : "inherit",
                  }}
                >
                  <TypeIcon className="size-3.5 shrink-0" />
                  {label}
                </button>
              );
            },
          )}
        </div>
      </div>

      {cityCounts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Cidade</h4>
          <div className="h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-2 pr-3">
              {cityCounts.map((item) => {
                const isActive = cityFilter.includes(item.city);
                return (
                  <button
                    key={`${item.city}|${item.state}`}
                    onClick={() => handleCityClick(item)}
                    className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
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

      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-sm text-muted-foreground">
          {filteredCount} de {totalCount} pontos
        </span>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Limpar filtros
        </Button>
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
      <div className="hidden md:block absolute top-4 right-4 z-[1000] w-[280px] bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg p-4">
        <h3 className="font-semibold mb-4">Filtros</h3>
        <FilterContent {...props} />
      </div>
    </>
  );
}
