"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useLocationWeather } from "@/hooks/useWeather";
import { getWeatherInfo } from "@/types/weather";

interface WeatherWidgetProps {
  lat: number | null;
  lng: number | null;
  zoom: number;
}

export function WeatherWidget({ lat, lng, zoom }: WeatherWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: weather, isError } = useLocationWeather(
    zoom > 8 ? lat : null,
    zoom > 8 ? lng : null,
  );

  if (zoom <= 8 || !lat || !lng) return null;

  if (isError) {
    return (
      <div className="absolute bottom-20 md:bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg border shadow-md px-3 py-2 text-xs text-muted-foreground">
        Sem dados de clima
      </div>
    );
  }

  if (!weather) return null;

  const current = weather.current;
  const info = getWeatherInfo(current.weatherCode);

  return (
    <div className="absolute bottom-20 md:bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg border shadow-md">
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 cursor-pointer w-full"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-lg">{info.icon}</span>
        <div className="text-left">
          <p className="text-sm font-medium">
            {current.temperature.toFixed(0)}°C
          </p>
          <p className="text-xs text-muted-foreground">{info.label}</p>
        </div>
        {current.precipitation > 0 && (
          <span className="text-xs text-blue-600 font-medium ml-1">
            {current.precipitation.toFixed(1)} mm
          </span>
        )}
        {expanded ? (
          <ChevronDown className="size-3.5 ml-auto text-muted-foreground" />
        ) : (
          <ChevronUp className="size-3.5 ml-auto text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t px-3 py-2 space-y-1">
          <p className="text-xs text-muted-foreground mb-1.5">
            Previsao 3 dias
          </p>
          {weather.daily.map((day) => {
            const dayInfo = getWeatherInfo(day.weatherCode);
            const dateLabel = new Date(day.date + "T12:00:00").toLocaleDateString(
              "pt-BR",
              { weekday: "short", day: "numeric" },
            );
            return (
              <div
                key={day.date}
                className="flex items-center gap-2 text-xs"
              >
                <span className="w-16 text-muted-foreground capitalize">
                  {dateLabel}
                </span>
                <span>{dayInfo.icon}</span>
                <span className="flex-1">{dayInfo.label}</span>
                <span className="text-blue-600">
                  {day.precipitationSum.toFixed(0)} mm
                </span>
                <span className="text-muted-foreground">
                  {day.precipitationProbability}%
                </span>
              </div>
            );
          })}
          <div className="flex gap-3 text-xs text-muted-foreground pt-1 border-t">
            <span>Vento: {current.windSpeed.toFixed(0)} km/h</span>
            <span>Umid: {current.humidity}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
