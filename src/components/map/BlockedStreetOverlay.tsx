"use client";

import { Fragment, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Marker, Polyline, Popup, Tooltip } from "react-leaflet";
import { divIcon } from "leaflet";
import { BLOCKED_STREETS } from "@/data/blocked-streets";
import { useBlockedStreets, useDeleteBlockedStreet } from "@/hooks/useBlockedStreets";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User } from "@supabase/supabase-js";

function StreetPopup({
  id,
  name,
  neighborhood,
  city,
  description,
  user,
  onRequestDelete,
}: {
  id?: string;
  name: string;
  neighborhood: string;
  city: string;
  description: string;
  user: User | null;
  onRequestDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="text-sm space-y-1 min-w-[180px]">
      <p className="font-semibold text-red-600">🚧 Rua Interditada</p>
      <p className="font-medium">{name}</p>
      {neighborhood && (
        <p className="text-muted-foreground text-xs">
          {neighborhood} · {city}
        </p>
      )}
      {description && <p className="text-xs">{description}</p>}
      <p className="text-[10px] text-muted-foreground pt-1">
        Fonte: Defesa Civil
      </p>

      {!!id && !!user && (
        <div className="pt-2 border-t">
          <button
            className="text-xs text-red-600 hover:text-red-700 hover:underline"
            onClick={() => onRequestDelete(id, name)}
          >
            Remover rua fechada
          </button>
        </div>
      )}
    </div>
  );
}

interface BlockedStreetOverlayProps {
  show?: boolean;
}

export function BlockedStreetOverlay({ show = true }: BlockedStreetOverlayProps) {
  const banIcon = useMemo(
    () =>
      divIcon({
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
      }),
    [],
  );

  const { user } = useAuth();
  const deleteMutation = useDeleteBlockedStreet();
  const { data: dbStreets = [] } = useBlockedStreets();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const allStreets = useMemo(() => {
    const fromDb = dbStreets.map((s) => ({
      id: s.id,
      createdBy: s.created_by,
      name: s.name,
      neighborhood: s.neighborhood,
      city: s.city,
      description: s.description,
      lat: s.lat,
      lng: s.lng,
      paths: s.paths,
    }));
    return [
      ...BLOCKED_STREETS.map((s) => ({ ...s, id: undefined, createdBy: undefined })),
      ...fromDb,
    ];
  }, [dbStreets]);

  if (!show || allStreets.length === 0) return null;

  return (
    <>
      {allStreets.map((s, i) =>
        s.paths && s.paths.length > 0 ? (
          <Fragment key={i}>
            {s.paths.map((segment: [number, number][], j: number) => (
              <Fragment key={j}>
                <Polyline
                  positions={segment}
                  pathOptions={{
                    color: "#7f1d1d",
                    weight: 11,
                    opacity: 0.5,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                <Polyline
                  positions={segment}
                  pathOptions={{
                    color: "#ef4444",
                    weight: 7,
                    opacity: 0.95,
                    dashArray: "14, 8",
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                >
                  <Tooltip sticky>{s.name}</Tooltip>
                  <Popup>
                    <StreetPopup
                      id={s.id}
                      name={s.name}
                      neighborhood={s.neighborhood}
                      city={s.city}
                      description={s.description}
                      user={user}
                      onRequestDelete={(id, name) => setDeleteTarget({ id, name })}
                    />
                  </Popup>
                </Polyline>
              </Fragment>
            ))}
          </Fragment>
        ) : (
          <Marker key={i} position={[s.lat, s.lng]} icon={banIcon}>
            <Popup>
              <StreetPopup
                id={s.id}
                name={s.name}
                neighborhood={s.neighborhood}
                city={s.city}
                description={s.description}
                user={user}
                onRequestDelete={(id, name) => setDeleteTarget({ id, name })}
              />
            </Popup>
          </Marker>
        ),
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center size-10 rounded-full bg-red-100 shrink-0">
                <Trash2 className="size-5 text-red-600" />
              </span>
              <AlertDialogTitle className="text-left">
                Remover rua fechada do mapa?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              A rua{" "}
              {deleteTarget && (
                <span className="font-medium text-foreground">
                  "{deleteTarget.name}"
                </span>
              )}{" "}
              será removida do mapa para todos os usuários. Essa ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }
              }}
            >
              {deleteMutation.isPending ? "Removendo..." : "Sim, remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
