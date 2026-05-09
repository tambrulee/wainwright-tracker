import { wainwrightWeatherRegions } from "@/data/wainwright-weather-regions";

export type AreaWeather = {
  id: string;
  name: string;
  temperatureC: number;
  windMph: number;
  rainChance: number;
  visibility: "Good" | "Moderate" | "Poor";
  summary: string;
  updatedAt: string;
};

export async function getAreaWeather(): Promise<AreaWeather[]> {
  // Temporary mock data while you build the UI.
  // Later this is where the Met Office fetch/normalising logic will go.

  return wainwrightWeatherRegions.map((region, index) => ({
    id: region.id,
    name: region.name,
    temperatureC: 5 + index,
    windMph: 12 + index * 3,
    rainChance: 20 + index * 8,
    visibility: index % 3 === 0 ? "Good" : index % 3 === 1 ? "Moderate" : "Poor",
    summary: index % 2 === 0 ? "Bright spells" : "Cloudy, showers possible",
    updatedAt: new Date().toISOString(),
  }));
}