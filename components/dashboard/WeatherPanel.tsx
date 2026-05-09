"use client";

import { useEffect, useState } from "react";
import type { AreaWeather } from "@/lib/weather/getAreaWeather";

export default function WeatherPanel() {
  const [weather, setWeather] = useState<AreaWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        const response = await fetch("/api/weather/regions");
        const data = await response.json();
        setWeather(data.weather ?? []);
      } finally {
        setIsLoading(false);
      }
    }

    loadWeather();
  }, []);

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
          Weather
        </p>
        <h2 className="text-2xl font-black text-stone-950">
          Conditions by fell area
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Quick checks for wind, rain and visibility before you pick a route.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm font-bold text-stone-500">Loading weather...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {weather.map((region) => (
            <article
              key={region.id}
              className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-stone-950">
                    {region.name}
                  </h3>
                  <p className="mt-1 text-sm text-stone-600">
                    {region.summary}
                  </p>
                </div>

                <span className="text-2xl font-black text-emerald-900">
                  {region.temperatureC}°C
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-bold text-stone-700">
                <span>Wind {region.windMph}mph</span>
                <span>Rain {region.rainChance}%</span>
                <span>{region.visibility}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}