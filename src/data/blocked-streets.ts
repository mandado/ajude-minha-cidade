export interface BlockedStreet {
  name: string;
  neighborhood: string;
  city: string;
  description: string;
  lat: number;
  lng: number;
  /** Geometria real da via (segmentos de polyline). Null = só pin. */
  paths: [number, number][][] | null;
}

export const BLOCKED_STREETS: BlockedStreet[] = [];
