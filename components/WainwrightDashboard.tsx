"use client";

import { useEffect, useMemo, useState } from "react";
import type { Wainwright } from "@/types/wainwright";
import type { FellProgress } from "@/types/progress";
import ProgressStats from "@/components/ProgressStats";
import MapWrapper from "@/components/MapWrapper";
import FellList from "@/components/FellList";

type ProgressState = Record<string, FellProgress>;

export default function WainwrightDashboard({ fells }: { fells: Wainwright[] }) {
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("All");
  const [selectedFellId, setSelectedFellId] = useState<string | null>(null);
  const [routeFellIds, setRouteFellIds] = useState<string[]>([]);

  const [progress, setProgress] = useState<ProgressState>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem("wainwright-progress");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("wainwright-progress", JSON.stringify(progress));
  }, [progress]);

  const mergedFells = useMemo(
    () => fells.map((fell) => ({ ...fell, ...progress[fell.id] })),
    [fells, progress]
  );

  const sections = useMemo(
    () => ["All", ...Array.from(new Set(fells.map((fell) => fell.section))).sort()],
    [fells]
  );

  const filteredFells = mergedFells.filter((fell) => {
    return (
      fell.name.toLowerCase().includes(search.toLowerCase()) &&
      (section === "All" || fell.section === section)
    );
  });

  const selectedFell = mergedFells.find((fell) => fell.id === selectedFellId);

  const routeFells = routeFellIds
    .map((id) => mergedFells.find((fell) => fell.id === id))
    .filter(Boolean) as Wainwright[];

  function updateFell(fellId: string, updates: FellProgress) {
    setProgress((current) => ({
      ...current,
      [fellId]: { ...current[fellId], ...updates },
    }));
  }

  function toggleCompleted(fell: Wainwright) {
    const isNowCompleted = !fell.completed;

    updateFell(fell.id, {
      completed: isNowCompleted,
      completedDate: isNowCompleted ? new Date().toISOString().slice(0, 10) : null,
    });
  }

  function toggleRouteFell(fellId: string) {
    setRouteFellIds((current) =>
      current.includes(fellId)
        ? current.filter((id) => id !== fellId)
        : [...current, fellId]
    );
  }

  function clearRoute() {
    setRouteFellIds([]);
  }

  return (
    <div className="space-y-6">
      <ProgressStats fells={mergedFells} />

      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search fells..."
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400"
        />

        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          {sections.map((sectionName) => (
            <option key={sectionName} value={sectionName}>
              {sectionName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <FellList fells={filteredFells} onSelectFell={setSelectedFellId} />

        <MapWrapper
          fells={filteredFells}
          onSelectFell={setSelectedFellId}
          selectedFell={selectedFell}
          routeFellIds={routeFellIds}
          onToggleRouteFell={toggleRouteFell}
        />
      </div>

      {routeFells.length > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-stone-700">
                Route builder
              </p>

              <h2 className="text-2xl font-bold text-stone-950">
                Selected fells
              </h2>
            </div>

            <button
              onClick={clearRoute}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-100"
            >
              Clear route
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {routeFells.map((fell, index) => (
              <button
                key={fell.id}
                onClick={() => setSelectedFellId(fell.id)}
                className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-100"
              >
                {index + 1}. {fell.name}
              </button>
            ))}
          </div>

          <p className="mt-4 text-sm font-medium text-stone-700">
            Add 2+ fells to auto-build a routed walking path. Green = routed path,
            blue = fallback straight line.
          </p>
        </section>
      )}

      {selectedFell && (
        <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-stone-700">
                {selectedFell.section}
              </p>

              <h2 className="text-2xl font-bold text-stone-950">
                {selectedFell.name}
              </h2>

              <p className="mt-1 font-medium text-stone-800">
                {selectedFell.heightM}m / {selectedFell.heightFt}ft
              </p>

              <p className="text-sm text-stone-700">
                Grid ref: {selectedFell.osGridReference}
              </p>
            </div>

            <button
              onClick={() => setSelectedFellId(null)}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-100"
            >
              Close
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => toggleCompleted(selectedFell)}
              className="rounded-xl bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
            >
              {selectedFell.completed ? "Mark not completed" : "Mark completed"}
            </button>

            <button
              onClick={() =>
                updateFell(selectedFell.id, { planned: !selectedFell.planned })
              }
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 font-medium text-stone-900 hover:bg-stone-100"
            >
              {selectedFell.planned ? "Remove planned" : "Mark planned"}
            </button>

            <button
              onClick={() =>
                updateFell(selectedFell.id, { priority: !selectedFell.priority })
              }
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 font-medium text-stone-900 hover:bg-stone-100"
            >
              {selectedFell.priority ? "Remove priority" : "Mark priority"}
            </button>

            <button
              onClick={() => toggleRouteFell(selectedFell.id)}
              className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 font-medium text-blue-900 hover:bg-blue-100"
            >
              {routeFellIds.includes(selectedFell.id)
                ? "Remove from route"
                : "Add to route"}
            </button>
          </div>

          {selectedFell.completedDate && (
            <p className="mt-4 text-sm font-medium text-stone-700">
              Completed on {selectedFell.completedDate}
            </p>
          )}
        </aside>
      )}
    </div>
  );
}