import { wainwrightWeatherRegions } from "@/data/wainwright-weather-regions";

export type AreaWeather = {
  id: string;
  name: string;
  condition: "sunny" | "bright" | "cloudy" | "rain" | "wind" | "fog";
  temperatureC: number;
  windMph: number;
  rainChance: number;
  visibility: "Good" | "Moderate" | "Poor";
  summary: string;
  updatedAt: string;
};

function getConditionFromWeatherCode(code?: number): AreaWeather["condition"] {
  if (code === undefined) return "cloudy";

  if ([0, 1].includes(code)) return "sunny";
  if ([2, 3].includes(code)) return "bright";
  if ([5, 6, 7, 8].includes(code)) return "fog";
  if ([9, 10, 11].includes(code)) return "cloudy";
  if ([12, 13, 14, 15].includes(code)) return "rain";
  if ([18, 19, 20, 21].includes(code)) return "rain";

  return "cloudy";
}

function getSummary(condition: AreaWeather["condition"]) {
  const labels = {
    sunny: "Sunny",
    bright: "Bright spells",
    cloudy: "Cloudy",
    rain: "Rain likely",
    wind: "Windy",
    fog: "Poor visibility",
  };

  return labels[condition];
}

function metresPerSecondToMph(value?: number) {
  if (typeof value !== "number") return 0;
  return Math.round(value * 2.237);
}

function getVisibility(value?: number): AreaWeather["visibility"] {
  if (typeof value !== "number") return "Moderate";
  if (value >= 20000) return "Good";
  if (value >= 5000) return "Moderate";
  return "Poor";
}

async function fetchMetOfficeRegionWeather(region: {
  id: string;
  name: string;
  lat: number;
  lon: number;
}): Promise<AreaWeather> {
  const apiKey = process.env.MET_OFFICE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing MET_OFFICE_API_KEY");
  }

  const url = new URL(
    "https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly"
  );

  url.searchParams.set("latitude", String(region.lat));
  url.searchParams.set("longitude", String(region.lon));

  const response = await fetch(url, {
    headers: {
      apikey: apiKey,
    },
    next: {
      revalidate: 60 * 30,
    },
  });

  if (!response.ok) {
    throw new Error(`Met Office request failed: ${response.status}`);
  }

  const data = await response.json();

  const firstFeature = data.features?.[0];
  const firstTimeStep = firstFeature?.properties?.timeSeries?.[0];

  const temperatureC = Math.round(firstTimeStep?.screenTemperature ?? 0);
  const windMph = metresPerSecondToMph(firstTimeStep?.windSpeed10m);
  const rainChance = Math.round(firstTimeStep?.probOfPrecipitation ?? 0);
  const weatherCode = firstTimeStep?.significantWeatherCode;
  const condition = getConditionFromWeatherCode(weatherCode);

  return {
    id: region.id,
    name: region.name,
    condition: windMph >= 30 ? "wind" : condition,
    temperatureC,
    windMph,
    rainChance,
    visibility: getVisibility(firstTimeStep?.visibility),
    summary: windMph >= 30 ? "Windy" : getSummary(condition),
    updatedAt: new Date().toISOString(),
  };
}

export async function getAreaWeather(): Promise<AreaWeather[]> {
  return Promise.all(wainwrightWeatherRegions.map(fetchMetOfficeRegionWeather));
}