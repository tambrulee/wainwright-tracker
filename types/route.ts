// types/route.ts

export type RoutePoint = {
  id: string;
  type: "fell" | "custom";
  lat: number;
  lng: number;
  name: string;
  fellId?: string;
};

export type SavedRoute = {
  id: string;
  name: string;
  points: RoutePoint[];
};

export type RouteSummary = {
  distanceKm: number;
  durationHours: number;
  ascentM: number;
  descentM: number;
};