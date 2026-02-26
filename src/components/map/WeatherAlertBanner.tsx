"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";
import { useINMETAlerts } from "@/hooks/useWeather";
import type { INMETAlert } from "@/types/weather";

const SEVERITY_COLORS: Record<string, string> = {
  Amarelo: "bg-yellow-400/90 text-yellow-950",
  Laranja: "bg-orange-500/90 text-white",
  Vermelho: "bg-red-600/90 text-white",
};

function getAlertColor(alert: INMETAlert): string {
  const cor = alert.aviso_cor || alert.severidade;
  for (const [key, value] of Object.entries(SEVERITY_COLORS)) {
    if (cor.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return "bg-yellow-400/90 text-yellow-950";
}

interface WeatherAlertBannerProps {
  cityName?: string | null;
}

export function WeatherAlertBanner({ cityName }: WeatherAlertBannerProps) {
  const { data: alerts } = useINMETAlerts();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!alerts || alerts.length === 0) return null;

  // Filter alerts by city if a city is active
  const relevantAlerts = cityName
    ? alerts.filter((a) =>
        a.municipios.toLowerCase().includes(cityName.toLowerCase()),
      )
    : alerts;

  const visibleAlerts = relevantAlerts.filter((a) => !dismissed.has(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-lg flex flex-col gap-2">
      {visibleAlerts.slice(0, 3).map((alert) => {
        const isExpanded = expanded === alert.id;
        const colorClass = getAlertColor(alert);

        return (
          <div
            key={alert.id}
            className={`${colorClass} rounded-lg shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <AlertTriangle className="size-4 shrink-0" />
              <button
                type="button"
                className="flex-1 text-left text-sm font-medium truncate cursor-pointer"
                onClick={() =>
                  setExpanded(isExpanded ? null : alert.id)
                }
              >
                {alert.severidade && (
                  <span className="font-bold mr-1">
                    [{alert.severidade}]
                  </span>
                )}
                {alert.descricao}
              </button>
              <button
                type="button"
                className="shrink-0 cursor-pointer"
                onClick={() =>
                  setExpanded(isExpanded ? null : alert.id)
                }
              >
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>
              <button
                type="button"
                className="shrink-0 cursor-pointer"
                onClick={() =>
                  setDismissed((prev) => new Set(prev).add(alert.id))
                }
              >
                <X className="size-4" />
              </button>
            </div>

            {isExpanded && (
              <div className="px-3 pb-3 text-sm space-y-2">
                {alert.riscos.length > 0 && (
                  <div>
                    <p className="font-semibold">Riscos:</p>
                    <ul className="list-disc list-inside">
                      {alert.riscos.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {alert.instrucoes.length > 0 && (
                  <div>
                    <p className="font-semibold">Instrucoes:</p>
                    <ul className="list-disc list-inside">
                      {alert.instrucoes.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {alert.inicio && alert.fim && (
                  <p className="text-xs opacity-80">
                    Vigencia: {alert.inicio} ate {alert.fim}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
