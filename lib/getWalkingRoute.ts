import type { Wainwright } from "@/types/wainwright";

export type WalkingRoute = {
  coordinates: [number, number][];
  elevationProfile: {
    distanceKm: number;
    elevationM: number;
  }[];
  distanceKm: number;
  durationHours: number;
  ascentM?: number;
  descentM?: number;
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
      body: JSON.stringify({
        coordinates,
        elevation: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Route request failed");
  }

  const geojson = await response.json();
  const feature = geojson.features[0];

  let runningDistance = 0;

  const elevationProfile = feature.geometry.coordinates.map(
    ([lng, lat, elevation]: [number, number, number], index: number, arr: [number, number, number][]) => {
      if (index > 0) {
        const [prevLng, prevLat] = arr[index - 1];
        runningDistance += getDistanceKm(prevLat, prevLng, lat, lng);
      }

      return {
        distanceKm: runningDistance,
        elevationM: elevation,
      };
    }
  );

  return {
    coordinates: feature.geometry.coordinates.map(
      ([lng, lat]: [number, number, number]) => [lat, lng]
    ),
    elevationProfile,
    distanceKm: feature.properties.summary.distance / 1000,
    durationHours: feature.properties.summary.duration / 3600,
    ascentM: feature.properties.ascent,
    descentM: feature.properties.descent,
  };
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}