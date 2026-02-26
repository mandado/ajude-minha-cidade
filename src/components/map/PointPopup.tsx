"use client";

import { Popup } from "react-leaflet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Package, ChevronRight } from "lucide-react";
import type { MapPoint } from "@/types/map";
import { POINT_TYPE_LABELS, PRIORITY_LABELS, POINT_TYPE_COLORS } from "@/types/map";
import type { PointType, PriorityLevel } from "@/types/database";

const PRIORITY_CLASSES: Record<PriorityLevel, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

const TYPE_ICONS: Record<PointType, string> = {
  shelter: "🏠",
  collection: "📦",
  distribution: "🤝",
};

interface PointPopupProps {
  point: MapPoint;
  onOpenDetails?: (point: MapPoint) => void;
}

export function PointPopup({ point, onOpenDetails }: PointPopupProps) {
  const fulfilledCount = point.needs.filter((n) => n.is_fulfilled).length;
  const pendingCount = point.needs.length - fulfilledCount;

  return (
    <Popup>
      <div className="min-w-[240px] max-w-[280px] space-y-2.5 p-1">
        {/* Header: type icon + name + badges */}
        <div className="flex items-start gap-2">
          <span
            className="flex items-center justify-center size-8 rounded-lg text-base shrink-0"
            style={{ backgroundColor: `${POINT_TYPE_COLORS[point.type]}15` }}
          >
            {TYPE_ICONS[point.type]}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold leading-tight truncate">
              {point.name}
            </h3>
            <div className="flex gap-1 mt-1">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 font-medium"
                style={{
                  color: POINT_TYPE_COLORS[point.type],
                  borderColor: POINT_TYPE_COLORS[point.type],
                }}
              >
                {POINT_TYPE_LABELS[point.type]}
              </Badge>
              <Badge
                className={`text-[10px] px-1.5 py-0 h-4 border font-medium ${PRIORITY_CLASSES[point.priority]}`}
              >
                {PRIORITY_LABELS[point.priority]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick info rows */}
        <div className="space-y-1">
          {point.address && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                {point.address}
                {point.neighborhood && `, ${point.neighborhood}`}
                {point.city && ` — ${point.city}`}
                {point.state && `/${point.state}`}
              </span>
            </div>
          )}
          {point.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="size-3 shrink-0" />
              <span>{point.phone}</span>
            </div>
          )}
          {point.operating_hours && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3 shrink-0" />
              <span>{point.operating_hours}</span>
            </div>
          )}
        </div>

        {/* Needs list */}
        {point.needs.length > 0 && (
          <div className="rounded-md bg-muted/60 px-2.5 py-2 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Package className="size-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium">
                Necessidades
                {pendingCount > 0 && (
                  <span className="text-orange-600 font-normal ml-1">
                    ({pendingCount} pendente{pendingCount > 1 ? "s" : ""})
                  </span>
                )}
                {fulfilledCount > 0 && pendingCount === 0 && (
                  <span className="text-green-600 font-normal ml-1">
                    (todas atendidas)
                  </span>
                )}
              </span>
            </div>
            <ul className="space-y-0.5 pl-5">
              {point.needs.slice(0, 5).map((need) => (
                <li
                  key={need.id}
                  className={`text-xs flex items-center gap-1.5 ${need.is_fulfilled ? "text-muted-foreground line-through" : ""}`}
                >
                  <span
                    className={`size-1.5 rounded-full shrink-0 ${need.is_fulfilled ? "bg-green-500" : "bg-orange-500"}`}
                  />
                  <span className="truncate">
                    {need.description}
                    {need.quantity && need.unit
                      ? ` (${need.quantity} ${need.unit})`
                      : ""}
                  </span>
                </li>
              ))}
              {point.needs.length > 5 && (
                <li className="text-xs text-muted-foreground">
                  +{point.needs.length - 5} mais...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Description preview */}
        {point.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 italic">
            {point.description}
          </p>
        )}

        {/* CTA */}
        {onOpenDetails && (
          <Button
            variant="default"
            size="sm"
            className="w-full text-xs h-7"
            onClick={() => onOpenDetails(point)}
          >
            Ver detalhes
            <ChevronRight className="size-3.5 ml-1" />
          </Button>
        )}
      </div>
    </Popup>
  );
}
