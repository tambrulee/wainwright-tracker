"use client";

// This is the main dashboard component for the Wainwright Tracker app. It manages the overall state of the application, including the list of fells, user progress, search and filter settings, selected fell details, and route building functionality. It also handles saving progress and routes to localStorage for persistence across sessions.

// Imports React hooks for state and effect management, as well as type definitions for Wainwright fells and user progress. It also imports child components for displaying progress stats, the map, and the list of fells.
import { useEffect, useMemo, useState } from "react";
import type { Wainwright } from "@/types/wainwright";
import type { FellProgress } from "@/types/progress";
import ProgressStats from "@/components/ProgressStats";
import MapWrapper from "@/components/MapWrapper";
import FellList from "@/components/FellList";

// Defines the shape of the progress state, which is a record mapping fell IDs to their progress details (completed, planned, priority, etc.).
type ProgressState = Record<string, FellProgress>;

// The main dashboard component that takes in a list of Wainwright fells as a prop and manages the state and interactions for the app.
export default function WainwrightDashboard({ fells }: { fells: Wainwright[] }) {
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("All");
  const [selectedFellId, setSelectedFellId] = useState<string | null>(null);
  const [routeFellIds, setRouteFellIds] = useState<string[]>([]);

  // Initialize progress state from localStorage if available, otherwise start with an empty object. This allows the app to remember which fells have been completed, planned, or marked as priority across sessions.
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

  // Generate a list of unique sections from the fells data for the area filter dropdown. This includes an "All" option to show all fells regardless of section.
  const sections = useMemo(
    () => ["All", ...Array.from(new Set(fells.map((fell) => fell.section))).sort()],
    [fells]
  );

  // Filter the list of fells based on the search query and selected section. This allows users to quickly find specific fells or narrow down the list by area.
  const filteredFells = mergedFells.filter((fell) => {
    return (
      fell.name.toLowerCase().includes(search.toLowerCase()) &&
      (section === "All" || fell.section === section)
    );
  });

  // Find the currently selected fell based on the selectedFellId. This is used to display details and actions for the selected fell in the side panel.
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

  // Initialize saved routes from localStorage, allowing users to save and load their planned routes. Each route consists of a name and an array of fell IDs that are part of that route.

  const [savedRoutes, setSavedRoutes] = useState<
  { name: string; fellIds: string[] }[]
  >(() => {
    if (typeof window === "undefined") return [];

    const saved = localStorage.getItem("wainwright-saved-routes");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("wainwright-saved-routes", JSON.stringify(savedRoutes));
  }, [savedRoutes]);

  function saveCurrentRoute() {
    if (routeFellIds.length < 2) return;

    const name = prompt("Name this route:");
    if (!name) return;

    setSavedRoutes((current) => [
      ...current,
      { name, fellIds: routeFellIds },
    ]);
  }

  function loadRoute(fellIds: string[]) {
    setRouteFellIds(fellIds);
  }

  function deleteRoute(index: number) {
    setSavedRoutes((current) => current.filter((_, i) => i !== index));
  }

  // The return statement renders the main dashboard UI, including the hero section, progress stats, search and filter controls, the main app area with the fell list and map, the route builder section, saved routes, and the selected fell details panel. The UI is styled with Tailwind CSS classes for a clean and modern look.

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-emerald-50 to-slate-100 px-4 py-6 text-stone-950">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HERO */}
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-xl shadow-stone-200/70 backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-800">
                214 Wainwright Planner
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight text-stone-950 md:text-5xl">
                Your fell-bagging command centre
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700">
                Track completed fells, build walking routes, save ideas, and plan your way
                through the Lakes without faffing around in ten different apps.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-950 px-5 py-4 text-white shadow-lg">
              <p className="text-xs uppercase tracking-wide text-stone-300">
                Route selected
              </p>
              <p className="text-3xl font-black">{routeFellIds.length}</p>
              <p className="text-sm text-stone-300">fells</p>
            </div>
          </div>
        </section>

        <ProgressStats fells={mergedFells} />

        {/* SEARCH / FILTERS */}
        <section className="rounded-[1.75rem] border border-white/80 bg-white/80 p-4 shadow-lg shadow-stone-200/60 backdrop-blur">
          <div className="grid gap-3 md:grid-cols-[1fr_260px]">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-stone-500">
                Search fells
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Try Haystacks, Catbells, Helvellyn..."
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-950 shadow-inner outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-stone-500">
                Area
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-950 shadow-inner outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                {sections.map((sectionName) => (
                  <option key={sectionName} value={sectionName}>
                    {sectionName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* MAIN APP */}
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-3 shadow-lg shadow-stone-200/60 backdrop-blur">
            <div className="mb-3 flex items-center justify-between px-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                  Fell list
                </p>
                <p className="text-sm font-semibold text-stone-800">
                  {filteredFells.length} showing
                </p>
              </div>
            </div>

            <FellList fells={filteredFells} onSelectFell={setSelectedFellId} />
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/80 p-3 shadow-lg shadow-stone-200/60 backdrop-blur">
            <MapWrapper
              fells={filteredFells}
              onSelectFell={setSelectedFellId}
              selectedFell={selectedFell}
              routeFellIds={routeFellIds}
              onToggleRouteFell={toggleRouteFell}
            />
          </div>
        </section>

        {/* ROUTE BUILDER */}
        {routeFells.length > 0 && (
          <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-950 p-5 text-white shadow-xl shadow-emerald-900/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-200">
                  Route builder
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {routeFells.length} selected fells
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-emerald-100">
                  Add 2+ fells to auto-build a routed walking path. Green = routed path,
                  blue = fallback straight line.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={clearRoute}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
                >
                  Clear
                </button>

                <button
                  onClick={saveCurrentRoute}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-black text-emerald-950 hover:bg-emerald-50"
                >
                  Save route
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {routeFells.map((fell, index) => (
                <button
                  key={fell.id}
                  onClick={() => setSelectedFellId(fell.id)}
                  className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/25"
                >
                  {index + 1}. {fell.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* SAVED ROUTES */}
        {savedRoutes.length > 0 && (
          <section className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-lg shadow-stone-200/60 backdrop-blur">
            <h2 className="mb-4 text-xl font-black text-stone-950">
              Saved routes
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              {savedRoutes.map((route, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-4"
                >
                  <button
                    onClick={() => loadRoute(route.fellIds)}
                    className="text-left font-bold text-stone-950 hover:text-emerald-800"
                  >
                    {route.name}
                    <span className="block text-sm font-medium text-stone-500">
                      {route.fellIds.length} fells
                    </span>
                  </button>

                  <button
                    onClick={() => deleteRoute(index)}
                    className="rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SELECTED FELL PANEL */}
        {selectedFell && (
          <aside className="sticky bottom-4 z-20 rounded-[1.75rem] border border-stone-200 bg-white/95 p-5 shadow-2xl shadow-stone-400/30 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
                  {selectedFell.section}
                </p>

                <h2 className="mt-1 text-3xl font-black tracking-tight text-stone-950">
                  {selectedFell.name}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
                  <span className="rounded-full bg-stone-100 px-3 py-1">
                    {selectedFell.heightM}m / {selectedFell.heightFt}ft
                  </span>

                  <span className="rounded-full bg-stone-100 px-3 py-1">
                    Grid ref: {selectedFell.osGridReference}
                  </span>

                  {selectedFell.completedDate && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
                      Completed {selectedFell.completedDate}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedFellId(null)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-900 hover:bg-stone-100"
              >
                Close
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => toggleCompleted(selectedFell)}
                className="rounded-xl bg-green-700 px-4 py-2 font-bold text-white shadow-md hover:bg-green-800"
              >
                {selectedFell.completed ? "Mark not completed" : "Mark completed"}
              </button>

              <button
                onClick={() =>
                  updateFell(selectedFell.id, { planned: !selectedFell.planned })
                }
                className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 font-bold text-stone-900 hover:bg-stone-100"
              >
                {selectedFell.planned ? "Remove planned" : "Mark planned"}
              </button>

              <button
                onClick={() =>
                  updateFell(selectedFell.id, { priority: !selectedFell.priority })
                }
                className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 font-bold text-stone-900 hover:bg-stone-100"
              >
                {selectedFell.priority ? "Remove priority" : "Mark priority"}
              </button>

              <button
                onClick={() => toggleRouteFell(selectedFell.id)}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 font-bold text-blue-900 hover:bg-blue-100"
              >
                {routeFellIds.includes(selectedFell.id)
                  ? "Remove from route"
                  : "Add to route"}
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}