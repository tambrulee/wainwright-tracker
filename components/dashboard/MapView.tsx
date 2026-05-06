"use client";

import { useMemo, useState } from "react";
import type { Wainwright } from "@/types/wainwright";
import type { RoutePoint, RouteSummary, SavedRoute } from "@/types/route";
import type { SortOption, StatusFilter } from "@/types/dashboard";
import FellList from "@/components/FellList";
import MapWrapper from "@/components/MapWrapper";

type Props = {
  fells: Wainwright[];
  sections: string[];
  search: string;
  section: string;
  statusFilter: StatusFilter;
  sortBy: SortOption;
  selectedFell?: Wainwright;
  isRouteMode: boolean;
  routePoints: RoutePoint[];
  routePointsCount: number;
  filteredFellsCount: number;
  savedRoutesCount: number;
  routeSummary: RouteSummary | null;
  routeDifficulty: string | null;
  savedRoutes: SavedRoute[];
  onSearchChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onSortByChange: (value: SortOption) => void;
  onResetFilters: () => void;
  onSelectFell: (fellId: string) => void;
  onAddRoutePoint: (point: Omit<RoutePoint, "id">) => void;
  onRemoveRoutePoint: (pointId: string) => void;
  onRouteSummaryChange: (summary: RouteSummary | null) => void;
  onStartNewRouteSession: () => void;
  onFinishRouteSession: () => void;
  onUndoRoutePoint: () => void;
  onClearRoute: () => void;
  onOpenSaveModal: () => void;
  onLoadRoute: (points: RoutePoint[]) => void;
  onDeleteRoute: (index: number) => void;
  onUpdateSavedRouteName: (routeId: string, name: string) => void;
  onUpdateSavedRoutePoints: (routeId: string) => void;
};

type SidePanelMode = "recommended" | "fells";
type ToolPanel = "none" | "route" | "saved";

export default function MapView({
  fells,
  sections,
  search,
  section,
  statusFilter,
  sortBy,
  selectedFell,
  isRouteMode,
  routePoints,
  routePointsCount,
  filteredFellsCount,
  savedRoutesCount,
  routeSummary,
  routeDifficulty,
  savedRoutes,
  onSearchChange,
  onSectionChange,
  onStatusFilterChange,
  onSortByChange,
  onResetFilters,
  onSelectFell,
  onAddRoutePoint,
  onRemoveRoutePoint,
  onRouteSummaryChange,
  onStartNewRouteSession,
  onFinishRouteSession,
  onUndoRoutePoint,
  onClearRoute,
  onOpenSaveModal,
  onLoadRoute,
  onDeleteRoute,
  onUpdateSavedRouteName,
  onUpdateSavedRoutePoints,
}: Props) {
  const [sidePanelMode, setSidePanelMode] =
    useState<SidePanelMode>("recommended");

  const [toolPanel, setToolPanel] = useState<ToolPanel>("none");

  const recommendedFells = useMemo(() => {
    return fells
      .filter((fell) => !fell.completed)
      .sort((a, b) => {
        if (a.planned && !b.planned) return -1;
        if (!a.planned && b.planned) return 1;
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return a.heightM - b.heightM;
      })
      .slice(0, 12);
  }, [fells]);

  const [openRouteMenuId, setOpenRouteMenuId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-stone-300">
                Route points
              </p>
              <p className="text-2xl font-black">{routePointsCount}</p>
              <p className="text-xs text-stone-300">
                {isRouteMode ? "editing" : "selected"}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Showing
              </p>
              <p className="text-2xl font-black">{filteredFellsCount}</p>
              <p className="text-xs text-stone-500">fells</p>
            </div>

            <div className="rounded-2xl bg-emerald-900 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-emerald-200">
                Saved
              </p>
              <p className="text-2xl font-black">{savedRoutesCount}</p>
              <p className="text-xs text-emerald-200">routes</p>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
                  Map filters
                </p>
                <h2 className="text-lg font-black text-stone-950">
                  Find the right fell
                </h2>
              </div>

              <button
                onClick={onResetFilters}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-800 hover:bg-stone-100"
              >
                Reset
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Haystacks, Catbells..."
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

              <select
                value={section}
                onChange={(e) => onSectionChange(e.target.value)}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                {sections.map((sectionName) => (
                  <option key={sectionName} value={sectionName}>
                    {sectionName}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) =>
                  onStatusFilterChange(e.target.value as StatusFilter)
                }
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option>All</option>
                <option>Not completed</option>
                <option>Completed</option>
                <option>Planned</option>
                <option>Priority</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as SortOption)}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="name">Name A-Z</option>
                <option value="height-high">Highest first</option>
                <option value="height-low">Lowest first</option>
                <option value="section">Section</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="max-h-[680px] overflow-y-auto rounded-[2rem] border border-stone-200/70 bg-white p-4 shadow-sm">
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                setToolPanel((current) =>
                  current === "route" ? "none" : "route"
                )
              }
              className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-black hover:bg-emerald-50"
            >
              Route builder
            </button>

            <button
              onClick={() =>
                setToolPanel((current) =>
                  current === "saved" ? "none" : "saved"
                )
              }
              className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-black hover:bg-emerald-50"
            >
              Saved routes
            </button>
          </div>

          {toolPanel === "route" && (
            <div className="mb-4 rounded-3xl bg-emerald-950 p-4 text-white">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                Route builder
              </p>

              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-2xl font-black">
                    {routePoints.length} points
                  </p>
                  {routeDifficulty && (
                    <p className="text-sm text-emerald-100">
                      {routeDifficulty}
                    </p>
                  )}
                </div>

                <button
                  onClick={
                    isRouteMode
                      ? onFinishRouteSession
                      : onStartNewRouteSession
                  }
                  className="rounded-xl bg-white px-3 py-2 text-sm font-black !text-emerald-950"
                >
                  {isRouteMode ? "Finish" : "New route"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-emerald-100">Estimated time</p>
                  <p className="font-black">
                    {routeSummary
                      ? `${routeSummary.durationHours.toFixed(1)} hrs`
                      : "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-emerald-100">Distance</p>
                  <p className="font-black">
                    {routeSummary
                      ? `${routeSummary.distanceKm.toFixed(1)} km`
                      : "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-emerald-100">Ascent</p>
                  <p className="font-black">
                    {routeSummary ? `${routeSummary.ascentM}m` : "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-emerald-100">Descent</p>
                  <p className="font-black">
                    {routeSummary ? `${routeSummary.descentM}m` : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={onUndoRoutePoint}
                  disabled={routePoints.length === 0}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  Undo
                </button>

                <button
                  onClick={onClearRoute}
                  disabled={routePoints.length === 0}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  Clear
                </button>

                <button
                  onClick={onOpenSaveModal}
                  disabled={routePoints.length < 2}
                  className="rounded-xl bg-white px-3 py-2 text-sm font-black !text-emerald-950 disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {toolPanel === "saved" && (
            <div className="mb-4 rounded-3xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
                Saved routes
              </p>

              <div className="mt-3 space-y-2">
                {savedRoutes.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    No saved routes yet.
                  </p>
                ) : (
                  savedRoutes.map((route, index) => (
                    <div
                      key={route.id}
                      className="relative rounded-2xl bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          onClick={() => onLoadRoute(route.points)}
                          className="text-left"
                        >
                          <p className="text-lg font-black text-stone-950">{route.name}</p>
                          <p className="text-sm text-stone-500">{route.points.length} points</p>
                        </button>

                        <button
                          onClick={() =>
                            setOpenRouteMenuId((current) =>
                              current === route.id ? null : route.id
                            )
                          }
                          className="rounded-xl px-3 py-2 text-xl font-black hover:bg-stone-100"
                          aria-label="Route options"
                        >
                          ⋯
                        </button>
                      </div>

                      {openRouteMenuId === route.id && (
                        <div className="absolute right-4 top-12 z-30 w-52 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
                          <button
                            onClick={() => {
                              onLoadRoute(route.points);
                              setOpenRouteMenuId(null);
                            }}
                            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-stone-100"
                          >
                            Load route
                          </button>

                          <button
                            onClick={() => {
                              onLoadRoute(route.points);
                              setToolPanel("route");
                              setOpenRouteMenuId(null);
                            }}
                            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-stone-100"
                          >
                            Edit route
                          </button>

                          <button
                            onClick={() => {
                              const newName = window.prompt("Rename route:", route.name);
                              if (newName?.trim()) {
                                onUpdateSavedRouteName(route.id, newName.trim());
                              }
                              setOpenRouteMenuId(null);
                            }}
                            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-stone-100"
                          >
                            Rename
                          </button>

                          <button
                            onClick={() => {
                              onUpdateSavedRoutePoints(route.id);
                              setOpenRouteMenuId(null);
                            }}
                            disabled={routePoints.length < 2}
                            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-stone-100 disabled:opacity-40"
                          >
                            Save current route over this
                          </button>

                          <button
                            onClick={() => {
                              const confirmed = window.confirm(
                                `Delete "${route.name}"? This cannot be undone.`
                              );

                              if (confirmed) {
                                onDeleteRoute(index);
                              }

                              setOpenRouteMenuId(null);
                            }}
                            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="mb-4 flex rounded-2xl bg-stone-100 p-1">
            <button
              onClick={() => setSidePanelMode("recommended")}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-black ${
                sidePanelMode === "recommended"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-stone-600"
              }`}
            >
              Recommended
            </button>

            <button
              onClick={() => setSidePanelMode("fells")}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-black ${
                sidePanelMode === "fells"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-stone-600"
              }`}
            >
              All fells
            </button>
          </div>

          {sidePanelMode === "recommended" ? (
            <div className="space-y-3 pr-2">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
                Recommended
              </p>

              <div className="space-y-3">
                {recommendedFells.map((fell) => (
                  <button
                    key={fell.id}
                    onClick={() => onSelectFell(fell.id)}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-stone-950">
                          {fell.name}
                        </p>
                        <p className="text-sm text-stone-500">
                          {fell.section}
                        </p>
                        <p className="text-sm font-bold text-stone-700">
                          {fell.heightM}m
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        {fell.planned && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">
                            Planned
                          </span>
                        )}
                        {fell.priority && (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">
                            Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <FellList fells={fells} onSelectFell={onSelectFell} />
            </div>
          )}
        </div>

        <div className="min-h-[680px] overflow-visible rounded-[2rem] border border-stone-200/70 bg-white p-4 shadow-sm">
          <MapWrapper
            key={`map-${section}-${statusFilter}-${sortBy}`}
            fells={fells}
            onSelectFell={onSelectFell}
            selectedFell={selectedFell}
            isRouteMode={isRouteMode}
            routePoints={routePoints}
            onAddRoutePoint={onAddRoutePoint}
            onRemoveRoutePoint={onRemoveRoutePoint}
            onRouteSummaryChange={onRouteSummaryChange}
          />
        </div>
      </section>
    </div>
  );
}