import { NextResponse } from "next/server";

const AREAS = [
  { name: "Central Fells", lat: 54.487, lon: -3.105 },
  { name: "Eastern Fells", lat: 54.515, lon: -3.014 },
  { name: "Far Eastern Fells", lat: 54.514, lon: -2.855 },
  { name: "Northern Fells", lat: 54.667, lon: -3.074 },
  { name: "North Western Fells", lat: 54.59, lon: -3.208 },
  { name: "Southern Fells", lat: 54.455, lon: -3.21 },
  { name: "Western Fells", lat: 54.515, lon: -3.295 },
];

export async function GET() {
  const weather = await Promise.all(
    AREAS.map(async (area) => {
      const url = new URL("https://api.open-meteo.com/v1/forecast");

      url.searchParams.set("latitude", String(area.lat));
      url.searchParams.set("longitude", String(area.lon));
      url.searchParams.set(
        "hourly",
        "temperature_2m,precipitation,precipitation_probability,wind_speed_10m,wind_gusts_10m"
      );
      url.searchParams.set(
        "current",
        "temperature_2m,wind_speed_10m,wind_gusts_10m"
      );
      url.searchParams.set("forecast_days", "1");
      url.searchParams.set("timezone", "Europe/London");

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather fetch failed for ${area.name}`);
      }

      const data = await response.json();

      const temp = Math.round(Math.max(...data.hourly.temperature_2m));
      const rainChance = Math.round(
        Math.max(...data.hourly.precipitation_probability.slice(0, 3))
      );
      const rainfallMm = Number(
        data.hourly.precipitation.reduce(
          (sum: number, amount: number) => sum + amount,
          0
        ).toFixed(1)
      );

      const current = data.current;

      const temperatureC = Math.round(current.temperature_2m);
      const windMph = Math.round(current.wind_speed_10m * 0.621371);
      const gustMph = Math.round(current.wind_gusts_10m * 0.621371);

      const condition =
        gustMph >= 35
          ? "wind"
          : rainfallMm >= 1 || rainChance >= 60
          ? "rain"
          : rainChance >= 35
          ? "cloudy"
          : "bright";

      const warningLevel =
        gustMph >= 45 || rainfallMm >= 8
          ? "high"
          : gustMph >= 35 || rainfallMm >= 4
          ? "medium"
          : gustMph >= 25 || rainfallMm >= 1.5
          ? "low"
          : "none";

      return {
        name: area.name,
        condition,
        temperatureC: temp,
        windMph,
        gustMph,
        rainChance,
        rainfallMm,
        warningLevel,
      };
    })
  );

  return NextResponse.json({ weather });
}