"use client";

import { useState, useEffect } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { PointPopup } from "./PointPopup";
import type { MapPoint } from "@/types/map";
import { POINT_TYPE_COLORS } from "@/types/map";

function createIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#fff"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

interface PointMarkerProps {
  point: MapPoint;
  onOpenDetails?: (point: MapPoint) => void;
}

export function PointMarker({ point, onOpenDetails }: PointMarkerProps) {
  const icon = createIcon(POINT_TYPE_COLORS[point.type]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <Marker
      position={[point.latitude, point.longitude]}
      icon={icon}
      eventHandlers={
        isMobile
          ? { click: () => onOpenDetails?.(point) }
          : undefined
      }
    >
      {!isMobile && (
        <PointPopup point={point} onOpenDetails={onOpenDetails} />
      )}
    </Marker>
  );
}
