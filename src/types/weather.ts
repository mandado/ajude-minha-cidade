export interface INMETAlert {
  id: string;
  descricao: string;
  severidade: string;
  aviso_cor: string;
  inicio: string;
  fim: string;
  municipios: string;
  riscos: string[];
  instrucoes: string[];
}

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  precipitation: number;
  rain: number;
  weatherCode: number;
  windSpeed: number;
}

export interface WeatherDaily {
  date: string;
  precipitationSum: number;
  precipitationProbability: number;
  weatherCode: number;
}

export interface WeatherData {
  current: WeatherCurrent;
  daily: WeatherDaily[];
}

export interface WeatherCodeInfo {
  label: string;
  icon: string;
}

export const WEATHER_CODE_MAP: Record<number, WeatherCodeInfo> = {
  0: { label: "Ceu limpo", icon: "\u2600\uFE0F" },
  1: { label: "Parcialmente nublado", icon: "\u26C5" },
  2: { label: "Parcialmente nublado", icon: "\u26C5" },
  3: { label: "Nublado", icon: "\u2601\uFE0F" },
  45: { label: "Nevoa", icon: "\uD83C\uDF2B\uFE0F" },
  48: { label: "Nevoa", icon: "\uD83C\uDF2B\uFE0F" },
  51: { label: "Garoa leve", icon: "\uD83C\uDF26\uFE0F" },
  53: { label: "Garoa", icon: "\uD83C\uDF26\uFE0F" },
  55: { label: "Garoa intensa", icon: "\uD83C\uDF26\uFE0F" },
  61: { label: "Chuva leve", icon: "\uD83C\uDF27\uFE0F" },
  63: { label: "Chuva", icon: "\uD83C\uDF27\uFE0F" },
  65: { label: "Chuva forte", icon: "\uD83C\uDF27\uFE0F" },
  66: { label: "Chuva congelante", icon: "\uD83C\uDF27\uFE0F" },
  67: { label: "Chuva congelante forte", icon: "\uD83C\uDF27\uFE0F" },
  71: { label: "Neve leve", icon: "\u2744\uFE0F" },
  73: { label: "Neve", icon: "\u2744\uFE0F" },
  75: { label: "Neve forte", icon: "\u2744\uFE0F" },
  77: { label: "Granizo", icon: "\u2744\uFE0F" },
  80: { label: "Pancadas de chuva", icon: "\uD83C\uDF27\uFE0F" },
  81: { label: "Pancadas de chuva", icon: "\uD83C\uDF27\uFE0F" },
  82: { label: "Pancadas fortes", icon: "\uD83C\uDF27\uFE0F" },
  85: { label: "Neve leve", icon: "\u2744\uFE0F" },
  86: { label: "Neve forte", icon: "\u2744\uFE0F" },
  95: { label: "Tempestade", icon: "\u26C8\uFE0F" },
  96: { label: "Tempestade com granizo", icon: "\u26C8\uFE0F" },
  99: { label: "Tempestade forte", icon: "\u26C8\uFE0F" },
};

export function getWeatherInfo(code: number): WeatherCodeInfo {
  return WEATHER_CODE_MAP[code] ?? { label: "Indefinido", icon: "\u2601\uFE0F" };
}
