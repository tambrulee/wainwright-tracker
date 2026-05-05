"use client";

import type { RoutePoint, SavedRoute } from "@/types/route";

type Props = {
  savedRoutes: SavedRoute[];
  onLoadRoute: (points: RoutePoint[]) => void;
  onDeleteRoute: (index: number) => void;
};

export default function SavedRoutesView({
  savedRoutes,
  onLoadRoute,
  onDeleteRoute,
}: Props) {
  return (
    <section className="rounded-[2rem] border border-stone-200/70 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-black text-stone-950">Saved routes</h2>

      {savedRoutes.length === 0 ? (
        <p className="text-stone-600">
          No saved routes yet. Build one in the Route builder.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {savedRoutes.map((route, index) => (
            <div
              key={`${route.name}-${index}`}
              className="flex items-center justify-between rounded-3xl border border-stone-200 bg-stone-50 p-5 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <button
                onClick={() => onLoadRoute(route.points)}
                className="text-left font-bold text-stone-950 hover:text-emerald-800"
              >
                {route.name}
                <span className="block text-sm font-medium text-stone-500">
                  {route.points.length} points
                </span>
              </button>

              <button
                onClick={() => onDeleteRoute(index)}
                className="rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}