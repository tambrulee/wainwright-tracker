export type AreaWeather = {
  name: string;
  condition: "sunny" | "bright" | "cloudy" | "rain" | "wind" | "fog";
  temperatureC: number;
  windMph: number;
  gustMph: number;
  rainChance: number;
  rainfallMm: number;
  warningLevel: "none" | "low" | "medium" | "high";
  summary: string;
};