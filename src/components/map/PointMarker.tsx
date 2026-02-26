"use client";

import { useState, useEffect } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { PointPopup } from "./PointPopup";
import type { MapPoint } from "@/types/map";
import { POINT_TYPE_COLORS } from "@/types/map";
import type { PointType } from "@/types/database";

// Lucide SVG path strings (24x24 viewBox) embedded into map pins
const POINT_TYPE_ICON_PATHS: Record<PointType, string> = {
  shelter: `<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>`,
  collection: `<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>`,
  distribution: `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>`,
  landslide: `<path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19"/>`,
  burial: `<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>`,
};

function createIcon(type: PointType, color: string) {
  const iconPaths = POINT_TYPE_ICON_PATHS[type];
  // The pin is viewBox 0 0 24 36.
  // White circle at (12,11) r=6 → spans (6,5)→(18,17).
  // translate(6,5) scale(0.5) maps the 24×24 lucide icon into that 12×12 area.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="11" r="6" fill="#fff"/>
      <g transform="translate(6,5) scale(0.5)" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
        ${iconPaths}
      </g>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });
}

interface PointMarkerProps {
  point: MapPoint;
  onOpenDetails?: (point: MapPoint) => void;
}

export function PointMarker({ point, onOpenDetails }: PointMarkerProps) {
  const icon = createIcon(point.type, POINT_TYPE_COLORS[point.type]);
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
