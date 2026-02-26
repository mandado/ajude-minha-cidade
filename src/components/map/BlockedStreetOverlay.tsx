"use client";

import { Fragment } from "react";
import { Marker, Polyline, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import { BLOCKED_STREETS } from "@/data/blocked-streets";

const BAN_ICON = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="11" r="6" fill="#fff"/>
      <g transform="translate(6,5) scale(0.5)" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" fill="none">
        <circle cx="12" cy="12" r="10"/>
        <path d="m4.9 4.9 14.2 14.2"/>
      </g>
    </svg>`,
  className: "",
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -42],
});

function StreetPopup({ name, neighborhood, city, description }: {
  name: string;
  neighborhood: string;
  city: string;
  description: string;
}) {
  return (
    <div className="text-sm space-y-1 min-w-[180px]">
      <p className="font-semibold text-red-600">🚧 Rua Interditada</p>
      <p className="font-medium">{name}</p>
      {neighborhood && (
        <p className="text-muted-foreground text-xs">{neighborhood} · {city}</p>
      )}
      {description && <p className="text-xs">{description}</p>}
      <p className="text-[10px] text-muted-foreground pt-1">Fonte: Defesa Civil</p>
    </div>
  );
}

export function BlockedStreetOverlay() {
  if (BLOCKED_STREETS.length === 0) return null;

  return (
    <>
      {BLOCKED_STREETS.map((s, i) =>
        s.paths && s.paths.length > 0 ? (
          // ── Rua com geometria OSM: renderiza a via em vermelho ──
          <Fragment key={i}>
            {s.paths.map((segment: [number, number][], j: number) => (
              <Polyline
                key={j}
                positions={segment}
                pathOptions={{ color: "#ef4444", weight: 5, opacity: 0.85 }}
              >
                <Tooltip sticky>{s.name}</Tooltip>
                <Popup>
                  <StreetPopup
                    name={s.name}
                    neighborhood={s.neighborhood}
                    city={s.city}
                    description={s.description}
                  />
                </Popup>
              </Polyline>
            ))}
          </Fragment>
        ) : (
          // ── Fallback: pin vermelho quando não há geometria OSM ──
          <Marker key={i} position={[s.lat, s.lng]} icon={BAN_ICON}>
            <Popup>
              <StreetPopup
                name={s.name}
                neighborhood={s.neighborhood}
                city={s.city}
                description={s.description}
              />
            </Popup>
          </Marker>
        ),
      )}
    </>
  );
}
