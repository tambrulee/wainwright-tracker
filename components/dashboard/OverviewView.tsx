"use client";

import { useEffect, useMemo, useState } from "react";
import type { Wainwright } from "@/types/wainwright";
import type { AreaWeather } from "@/lib/weather/types";

type OverviewFell = Wainwright & {
  completed?: boolean;
  priority?: boolean;
  plannedDate?: string | null;
};

type Props = {
  fells: OverviewFell[];
  onSelectFell: (fellId: string) => void;
};


function getWeatherSymbol(condition: AreaWeather["condition"]) {
  switch (condition) {
    case "sunny":
      return "☀️";
    case "bright":
      return "🌤️";
    case "cloudy":
      return "☁️";
    case "rain":
      return "🌧️";
    case "wind":
      return "💨";
    case "fog":
      return "🌫️";
    default:
      return "⛰️";
  }
}

export default function OverviewView({ fells, onSelectFell }: Props) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const completedCount = fells.filter((fell) => fell.completed).length;
  const plannedCount = fells.filter(
    (fell) => fell.plannedDate && !fell.completed
  ).length;
  const priorityCount = fells.filter((fell) => fell.priority).length;
  const remainingCount = fells.length - completedCount;

  const sectionStats = useMemo(() => {
    const grouped = new Map<
      string,
      {
        section: string;
        total: number;
        completed: number;
        planned: number;
        priority: number;
      }
    >();

    fells.forEach((fell) => {
      const current =
        grouped.get(fell.section) ?? {
          section: fell.section,
          total: 0,
          completed: 0,
          planned: 0,
          priority: 0,
        };

      current.total += 1;
      if (fell.completed) current.completed += 1;
      if (fell.plannedDate && !fell.completed) current.planned += 1;
      if (fell.priority) current.priority += 1;

      grouped.set(fell.section, current);
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.section.localeCompare(b.section)
    );
  }, [fells]);

  const activeSection = selectedSection ?? sectionStats[0]?.section;

  const sectionSuggestions = useMemo(() => {
    return fells
      .filter((fell) => fell.section === activeSection && !fell.completed)
      .sort((a, b) => {
        if (a.plannedDate && !b.plannedDate) return -1;
        if (!a.plannedDate && b.plannedDate) return 1;
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return a.heightM - b.heightM;
      })
      .slice(0, 6);
  }, [fells, activeSection]);

  const [regionWeather, setRegionWeather] = useState<Record<string, AreaWeather>>(
  {}
  );

  const progressPercentage = fells.length ? Math.round((completedCount / fells.length) * 100) : 0;

  useEffect(() => {
    async function loadWeather() {
      try {
        const response = await fetch("/api/weather/regions");

        if (!response.ok) {
          throw new Error("Weather request failed");
        }

        const data = await response.json();

        const weatherByName = Object.fromEntries(
          data.weather.map((item: AreaWeather) => [item.name, item])
        );

        setRegionWeather(weatherByName);
      } catch (error) {
        console.error("Could not load regional weather", error);
      }
    }

    loadWeather();
  }, []);

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800 sm:text-xs">
              Overview
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
              Your Wainwright progress
            </h1>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-black leading-none text-emerald-900 sm:text-3xl">
              {progressPercentage}%
            </p>
            <p className="mt-1 text-[11px] font-medium text-stone-500">
              {remainingCount} left
            </p>
          </div>
        </div>

        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-label="Wainwright completion"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={fells.length}
        >
          <div
            className="h-full rounded-full bg-emerald-800 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <div className="rounded-xl bg-stone-950 px-3 py-3 text-white sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-300">Completed</p>
            <p className="mt-1 text-xl font-black leading-tight sm:text-2xl">{completedCount} <span className="text-sm font-semibold text-stone-400">/ {fells.length}</span></p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">Remaining</p>
            <p className="mt-1 text-xl font-black leading-tight text-stone-950 sm:text-2xl">{remainingCount}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">Planned</p>
            <p className="mt-1 text-xl font-black leading-tight text-stone-950 sm:text-2xl">{plannedCount}</p>
          </div>
          <div className="rounded-xl bg-emerald-900 px-3 py-3 text-white sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">Priority</p>
            <p className="mt-1 text-xl font-black leading-tight sm:text-2xl">{priorityCount}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">Regions</p>
            <h2 className="text-xl font-black text-stone-950">Progress by area</h2>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {sectionStats.map((stat) => {
              const percentage = Math.round((stat.completed / stat.total) * 100);
              const isActive = activeSection === stat.section;
              const weather = regionWeather[stat.section];

              return (
                <button
                  key={stat.section}
                  type="button"
                  onClick={() => setSelectedSection(stat.section)}
                  aria-pressed={isActive}
                  className={`rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                    isActive
                      ? "border-emerald-700 bg-emerald-50"
                      : "border-stone-200 bg-stone-50 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-stone-950">{stat.section}</p>
                      <p className="mt-0.5 text-xs text-stone-500">{stat.completed} / {stat.total} completed</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {weather && <span className="text-lg" aria-label={weather.condition}>{getWeatherSymbol(weather.condition)}</span>}
                      <span className="text-lg font-black text-emerald-900">{percentage}%</span>
                    </div>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200"
                       role="progressbar" aria-label={`${stat.section} completion`}
                       aria-valuenow={stat.completed} aria-valuemin={0} aria-valuemax={stat.total}>
                    <div className="h-full rounded-full bg-emerald-800" style={{ width: `${percentage}%` }} />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-stone-600">
                    <span>{stat.planned} planned</span>
                    <span aria-hidden="true">·</span>
                    <span>{stat.priority} priority</span>
                  </div>

                  {weather && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-stone-200/80 pt-2 text-[11px] font-medium text-stone-600">
                      <span>{weather.temperatureC}°C</span>
                      <span>{weather.gustMph}mph gusts</span>
                      <span>{weather.rainChance}% rain</span>
                      <span>{weather.rainfallMm}mm rainfall</span>
                      {weather.warningLevel !== "none" && (
                        <span className="font-bold text-amber-800">{weather.warningLevel} risk</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
            Next in area
          </p>

          <h2 className="mt-1 text-2xl font-black text-stone-950">
            {activeSection}
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            Prioritising planned fells, priority fells, then easier lower fells.
          </p>

          
          <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200">
            {sectionSuggestions.length === 0 ? (
              <p className="p-4 text-sm text-stone-500">
                You&apos;ve completed everything in this area.
              </p>
            ) : (
              sectionSuggestions.map((fell, index) => (
                <button
                  key={fell.id}
                  type="button"
                  onClick={() => onSelectFell(fell.id)}
                  className={`group flex w-full items-center justify-between
                    gap-3 px-4 py-3 text-left transition
                    hover:bg-emerald-50
                    ${index !== 0 ? "border-t border-stone-200" : ""}
                  `}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-stone-950">
                      {fell.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {fell.heightM}m
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {fell.plannedDate && (
                      <span className="rounded-full bg-blue-100 px-2 py-1
                        text-[10px] font-bold text-blue-800">
                        Planned
                      </span>
                    )}

                    {fell.priority && (
                      <span className="rounded-full bg-amber-100 px-2 py-1
                        text-[10px] font-bold text-amber-900">
                        Priority
                      </span>
                    )}

                    <span className="text-stone-300 transition
                      group-hover:translate-x-0.5 group-hover:text-emerald-700">
                      →
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

        </aside>
      </section>
    </div>
  );
}