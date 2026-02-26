import { useQuery } from "@tanstack/react-query";
import { fetchINMETAlerts, fetchWeatherForLocation } from "@/lib/api/weather";

export function useINMETAlerts() {
  return useQuery({
    queryKey: ["inmet-alerts"],
    queryFn: fetchINMETAlerts,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useLocationWeather(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ["weather", lat, lng],
    queryFn: () => fetchWeatherForLocation(lat!, lng!),
    enabled: lat != null && lng != null,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
