import type { INMETAlert, WeatherData } from "@/types/weather";

export async function fetchINMETAlerts(): Promise<INMETAlert[]> {
  const res = await fetch(
    "https://apiprevmet3.inmet.gov.br/avisos/ativos",
  );

  if (!res.ok) {
    throw new Error(`INMET API error: ${res.status}`);
  }

  const json = await res.json();

  // The INMET API returns { status, data } where data is the array of alerts
  const alerts: unknown[] = json?.data ?? json ?? [];

  if (!Array.isArray(alerts)) return [];

  return alerts.map((item: unknown) => {
    const a = item as Record<string, unknown>;
    return {
    id: String(a.id ?? a.idAviso ?? ""),
    descricao: String(a.descricao ?? ""),
    severidade: String(a.severidade ?? ""),
    aviso_cor: String(a.aviso_cor ?? a.cor ?? ""),
    inicio: String(a.inicio ?? a.dtInicio ?? ""),
    fim: String(a.fim ?? a.dtFim ?? ""),
    municipios: String(a.municipios ?? ""),
    riscos: Array.isArray(a.riscos)
      ? a.riscos.map(String)
      : typeof a.riscos === "string"
        ? a.riscos.split(";").map((s: string) => s.trim()).filter(Boolean)
        : [],
    instrucoes: Array.isArray(a.instrucoes)
      ? a.instrucoes.map(String)
      : typeof a.instrucoes === "string"
        ? a.instrucoes.split(";").map((s: string) => s.trim()).filter(Boolean)
        : [],
  };
  });
}

export async function fetchWeatherForLocation(
  lat: number,
  lng: number,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current:
      "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m",
    daily:
      "precipitation_sum,precipitation_probability_max,weather_code",
    timezone: "America/Sao_Paulo",
    forecast_days: "3",
  });

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
  );

  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status}`);
  }

  const json = await res.json();

  const current = json.current;
  const daily = json.daily;

  return {
    current: {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      rain: current.rain,
      weatherCode: current.weather_code,
      windSpeed: current.wind_speed_10m,
    },
    daily: (daily.time as string[]).map((date: string, i: number) => ({
      date,
      precipitationSum: daily.precipitation_sum[i],
      precipitationProbability: daily.precipitation_probability_max[i],
      weatherCode: daily.weather_code[i],
    })),
  };
}
