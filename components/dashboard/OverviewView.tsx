"use client";

import type { Wainwright } from "@/types/wainwright";
import ProgressStats from "@/components/ProgressStats";

type Props = {
  fells: Wainwright[];
  filteredFellsCount: number;
  routePointsCount: number;
  savedRoutesCount: number;
  isRouteMode: boolean;
  suggestedFells: Wainwright[];
  onSelectFell: (fellId: string) => void;
};

export default function OverviewView({
  fells,
  filteredFellsCount,
  routePointsCount,
  savedRoutesCount,
  isRouteMode,
  suggestedFells,
  onSelectFell,
}: Props) {
  return (
    <>
      <section className="overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-800">
              214 Wainwright Planner
            </p>

            <h1 className="mt-2 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight text-stone-950 md:text-6xl">
              Your fell-bagging command centre
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">
              Track completed fells, filter what matters, build routes, save
              ideas, and plan your way through the Lakes without faffing around
              in ten different apps.
            </p>
          </div>

          <div className="grid min-w-[420px] grid-cols-3 gap-3">
            <div className="rounded-3xl bg-stone-950 p-5 text-white shadow-sm">
              <p className="text-xs uppercase tracking-wide text-stone-300">
                Route points
              </p>
              <p className="text-3xl font-black">{routePointsCount}</p>
              <p className="text-sm text-stone-300">
                {isRouteMode ? "editing" : "selected"}
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Showing
              </p>
              <p className="text-3xl font-black">{filteredFellsCount}</p>
              <p className="text-sm text-stone-500">fells</p>
            </div>

            <div className="rounded-3xl bg-emerald-900 p-5 text-white shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-200">
                Saved
              </p>
              <p className="text-3xl font-black">{savedRoutesCount}</p>
              <p className="text-sm text-emerald-200">routes</p>
            </div>
          </div>
        </div>
      </section>

      <ProgressStats fells={fells} />

      <section className="rounded-[2rem] border border-stone-200/70 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
          Suggested next
        </p>

        <h2 className="mb-4 text-xl font-black text-stone-950">
          Easy wins / priority fells
        </h2>

        <div className="grid gap-4 md:grid-cols-5">
          {suggestedFells.map((fell) => (
            <button
              key={fell.id}
              onClick={() => onSelectFell(fell.id)}
              className="rounded-3xl border border-stone-200 bg-stone-50 p-5 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <p className="font-black">{fell.name}</p>
              <p className="text-sm text-stone-500">{fell.section}</p>
              <p className="text-sm font-bold text-stone-700">{fell.heightM}m</p>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}