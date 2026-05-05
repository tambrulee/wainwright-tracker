"use client";

import type { RoutePoint, RouteSummary } from "@/types/route";

type Props = {
  isRouteMode: boolean;
  routePoints: RoutePoint[];
  routeSummary: RouteSummary | null;
  routeDifficulty: string | null;
  onToggleRouteMode: () => void;
  onUndoRoutePoint: () => void;
  onClearRoute: () => void;
  onOpenSaveModal: () => void;
  onRemoveRoutePoint: (pointId: string) => void;
};

export default function RouteBuilderView({
  isRouteMode,
  routePoints,
  routeSummary,
  routeDifficulty,
  onToggleRouteMode,
  onUndoRoutePoint,
  onClearRoute,
  onOpenSaveModal,
  onRemoveRoutePoint,
}: Props) {
  return (
    <section className="rounded-[2rem] bg-[#063f32] p-8 text-white shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-200">
            Route builder
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black">
              {routePoints.length} route points
            </h2>

            {routeDifficulty && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-black text-white ring-1 ring-white/20">
                {routeDifficulty}
              </span>
            )}
          </div>

          <p className="mt-2 max-w-2xl text-sm text-emerald-100">
            {isRouteMode
              ? "Route mode is on. Click the map or fells to add points."
              : "Click Create route, then choose your start point, waypoints, and fells on the map."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onToggleRouteMode}
            className="rounded-xl bg-white px-4 py-2 text-sm font-black !text-emerald-950 hover:bg-emerald-50"
          >
            {isRouteMode ? "Finish route" : "Create route"}
          </button>

          <button
            onClick={onUndoRoutePoint}
            disabled={routePoints.length === 0}
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Undo
          </button>

          <button
            onClick={onClearRoute}
            disabled={routePoints.length === 0}
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>

          <button
            onClick={onOpenSaveModal}
            disabled={routePoints.length < 2}
            className="rounded-xl bg-white px-4 py-2 text-sm font-black !text-emerald-950 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save route
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          ["Estimated time", routeSummary ? `${routeSummary.durationHours.toFixed(1)} hrs` : "—"],
          ["Distance", routeSummary ? `${routeSummary.distanceKm.toFixed(1)} km` : "—"],
          ["Ascent", routeSummary ? `${routeSummary.ascentM}m` : "—"],
          ["Descent", routeSummary ? `${routeSummary.descentM}m` : "—"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
            <p className="text-xs text-emerald-100">{label}</p>
            <p className="text-lg font-black">{value}</p>
          </div>
        ))}
      </div>

      {routePoints.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {routePoints.map((point, index) => (
            <button
              key={point.id}
              onClick={() => onRemoveRoutePoint(point.id)}
              className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-red-500/40"
              title="Click to remove"
            >
              {index + 1}. {point.name} ×
            </button>
          ))}
        </div>
      )}
    </section>
  );
}