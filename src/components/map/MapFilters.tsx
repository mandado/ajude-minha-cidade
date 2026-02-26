"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { MapFilters as MapFiltersType } from "@/types/map";
import {
  POINT_TYPE_LABELS,
  POINT_TYPE_COLORS,
  PRIORITY_LABELS,
} from "@/types/map";
import type { PointType, PriorityLevel } from "@/types/database";
import { getCities } from "@/lib/actions/points";

interface MapFiltersProps {
  filters: MapFiltersType;
  toggleType: (type: PointType) => void;
  togglePriority: (priority: PriorityLevel) => void;
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

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

export function FilterContent({
  filters,
  toggleType,
  togglePriority,
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
            ([type, label]) => (
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
                }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: POINT_TYPE_COLORS[type] }}
                />
                {label}
              </button>
            ),
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Prioridade</h4>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(PRIORITY_LABELS) as [PriorityLevel, string][]).map(
            ([priority, label]) => (
              <button
                key={priority}
                onClick={() => togglePriority(priority)}
                className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors"
                style={{
                  backgroundColor: filters.priorities.includes(priority)
                    ? `${PRIORITY_COLORS[priority]}20`
                    : "transparent",
                  borderColor: filters.priorities.includes(priority)
                    ? PRIORITY_COLORS[priority]
                    : "var(--border)",
                }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[priority] }}
                />
                {label}
              </button>
            ),
          )}
        </div>
      </div>

      {cityCounts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Cidade</h4>
          <ScrollArea className="h-48">
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
          </ScrollArea>
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
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            {/* Drag handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            </div>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">
              <FilterContent {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar */}
      <div className="hidden md:block absolute top-4 right-4 z-[1000] w-[280px] bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg p-4">
        <h3 className="font-semibold mb-4">Filtros</h3>
        <FilterContent {...props} />
      </div>
    </>
  );
}
