"use client";

import type { Wainwright } from "@/types/wainwright";

type Props = {
  fell: Wainwright;
  onClose: () => void;
  onToggleCompleted: () => void;
  onTogglePlanned: () => void;
  onTogglePriority: () => void;
  onAddToRoute: () => void;
};

function formatMinutes(minutes: number) {
  if (!minutes) return "—";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}m`;
}

export default function SelectedFellDrawer({
  fell,
  onClose,
  onToggleCompleted,
  onTogglePlanned,
  onTogglePriority,
  onAddToRoute,
}: Props) {
  return (
    <aside className="sticky bottom-4 z-20 rounded-[1.75rem] border border-stone-200 bg-white/95 p-5 shadow-2xl shadow-stone-400/30 backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
            {fell.section}
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-stone-950">
            {fell.name}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
            <span className="rounded-full bg-stone-100 px-3 py-1">
              {fell.heightM}m / {fell.heightFt}ft
            </span>

            <span className="rounded-full bg-stone-100 px-3 py-1">
              Grid ref: {fell.osGridReference}
            </span>

            {fell.estimatedMinutes && (
              <span className="rounded-full bg-stone-100 px-3 py-1">
                Est. {formatMinutes(fell.estimatedMinutes)}
              </span>
            )}

            {fell.distanceKm && (
              <span className="rounded-full bg-stone-100 px-3 py-1">
                {fell.distanceKm.toFixed(1)} km
              </span>
            )}

            {fell.completedDate && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
                Completed {fell.completedDate}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-900 hover:bg-stone-100"
        >
          Close
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={onToggleCompleted}
          className="rounded-xl bg-green-700 px-4 py-2 font-bold text-white shadow-md hover:bg-green-800"
        >
          {fell.completed ? "Mark not completed" : "Mark completed"}
        </button>

        <button
          onClick={onTogglePlanned}
          className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 font-bold text-stone-900 hover:bg-stone-100"
        >
          {fell.planned ? "Remove planned" : "Mark planned"}
        </button>

        <button
          onClick={onTogglePriority}
          className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 font-bold text-stone-900 hover:bg-stone-100"
        >
          {fell.priority ? "Remove priority" : "Mark priority"}
        </button>

        <button
          onClick={onAddToRoute}
          disabled={
            typeof fell.latitude !== "number" ||
            typeof fell.longitude !== "number"
          }
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 font-bold text-blue-900 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add to route
        </button>
      </div>
    </aside>
  );
}