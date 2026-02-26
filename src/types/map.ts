import type { Point, Need, PointType } from "./database";

export interface MapPoint extends Point {
  needs: Need[];
  confirmations_count: number;
  reports_count: number;
}

export interface MapFilters {
  types: PointType[];
}

export const POINT_TYPE_LABELS: Record<PointType, string> = {
  shelter: "Abrigo",
  collection: "Ponto de Coleta",
  distribution: "Distribuição",
  landslide: "Deslizamento",
  burial: "Soterramento",
};

export const POINT_TYPE_COLORS: Record<PointType, string> = {
  shelter: "#3b82f6",       // blue
  collection: "#22c55e",    // green
  distribution: "#f97316",  // orange
  landslide: "#b45309",     // amber-brown (terra)
  burial: "#dc2626",        // red (perigo)
};
