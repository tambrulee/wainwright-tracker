import type { Wainwright } from "@/types/wainwright";

export type WalkingRoute = {
  coordinates: [number, number][];
  distanceKm: number;
  durationHours: number;
};

export async function getWalkingRoute(fells: Wainwright[]): Promise<WalkingRoute> {
  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;

  if (!apiKey) throw new Error("Missing OpenRouteService API key");

  const coordinates = fells.map((fell) => [fell.longitude, fell.latitude]);

  const response = await fetch(
    "https://api.openrouteservice.org/v2/directions/foot-hiking/geojson",
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coordinates }),
    }
  );

  if (!response.ok) {
    throw new Error("Route request failed");
  }

  const geojson = await response.json();
  const feature = geojson.features[0];

  return {
    coordinates: feature.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    ),
    distanceKm: feature.properties.summary.distance / 1000,
    durationHours: feature.properties.summary.duration / 3600,
  };
}