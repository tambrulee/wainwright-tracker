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
  onToggleCompleted: (fell: Wainwright) => void;
  onTogglePriority: (fell: Wainwright) => void;
  completedFellsCount: number;
  plannedFellsCount: number;
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
  onToggleCompleted,
  onTogglePriority,
  completedFellsCount,
}: Props) {
  const [sidePanelMode, setSidePanelMode] =
    useState<SidePanelMode>("recommended");
  const [toolPanel, setToolPanel] = useState<ToolPanel>("none");
  const [openRouteMenuId, setOpenRouteMenuId] = useState<string | null>(null);

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

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6">

      {/* Filter & Stats Section */}
      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-emerald-900 px-4 py-3 text-white">
            <p className="text-xs text-emerald-200">Completed</p>
            <p className="text-2xl font-black">{completedFellsCount}</p>
          </div>

          <div className="rounded-2xl bg-stone-50 px-4 py-3">
            <p className="text-xs text-stone-500">Showing</p>
            <p className="text-2xl font-black">{filteredFellsCount}</p>
          </div>

          <div className="rounded-2xl bg-emerald-900 px-4 py-3 text-white">
            <p className="text-xs text-emerald-200">Routes</p>
            <p className="text-2xl font-black">{savedRoutesCount}</p>
          </div>

          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search fell..."
            className="min-w-[220px] flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white"
          />

          <select
            value={section}
            onChange={(e) => onSectionChange(e.target.value)}
            className="min-w-[180px] rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm"
          >
            <option value="All">All regions</option>
            {sections
              .filter((sectionName) => sectionName !== "All")
              .map((sectionName) => (
                <option key={sectionName} value={sectionName}>
                  {sectionName}
                </option>
              ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
            className="min-w-[180px] rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm"
          >
            <option value="All">All statuses</option>
            <option value="Not completed">Not completed</option>
            <option value="Completed">Completed</option>
            <option value="Planned">Planned</option>
            <option value="Priority">Priority</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortOption)}
            className="min-w-[160px] rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm"
          >
            <option value="name">Name A–Z</option>
            <option value="height-high">Highest first</option>
            <option value="height-low">Lowest first</option>
            <option value="section">Region</option>
          </select>

          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-2xl border border-stone-200 px-4 py-3 text-sm font-black hover:bg-stone-50"
          >
            Reset
          </button>
        </div>
      </section>


      {/* Map & Side Panel Section */}
      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">

        <div className="h-[520px] overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm md:h-[680px]">
          <MapWrapper
            fells={fells}
            onSelectFell={onSelectFell}
            selectedFell={selectedFell}
            isRouteMode={isRouteMode}
            routePoints={routePoints}
            onAddRoutePoint={onAddRoutePoint}
            onRemoveRoutePoint={onRemoveRoutePoint}
            onRouteSummaryChange={onRouteSummaryChange}
            onToggleCompleted={onToggleCompleted}
            onTogglePriority={onTogglePriority}
          />
        </div>

        <aside className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setToolPanel((current) =>
                  current === "route" ? "none" : "route"
                )
              }
              className={`rounded-2xl border px-3 py-2 text-sm font-black transition ${
                toolPanel === "route"
                  ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                  : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-emerald-50"
              }`}
            >
              Route builder
            </button>

            <button
              type="button"
              onClick={() =>
                setToolPanel((current) =>
                  current === "saved" ? "none" : "saved"
                )
              }
              className={`rounded-2xl border px-3 py-2 text-sm font-black transition ${
                toolPanel === "saved"
                  ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                  : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-emerald-50"
              }`}
            >
              Saved routes
            </button>
          </div>

          {toolPanel === "route" && (
            <div className="rounded-3xl bg-emerald-950 p-4 text-white">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                Route builder
              </p>

              <div className="mt-2 grid gap-3 sm:flex sm:items-center sm:justify-between">
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
                  type="button"
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

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={onUndoRoutePoint}
                  disabled={routePoints.length === 0}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  Undo
                </button>

                <button
                  type="button"
                  onClick={onClearRoute}
                  disabled={routePoints.length === 0}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  Clear
                </button>

                <button
                  type="button"
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
                    <div key={route.id} className="rounded-2xl bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onLoadRoute(route.points)}
                          className="min-w-0 text-left"
                        >
                          <p className="truncate text-lg font-black text-stone-950">
                            {route.name}
                          </p>
                          <p className="text-sm text-stone-500">
                            {route.points.length} points
                          </p>
                        </button>

                        <button
                          type="button"
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
                        <div className="mt-3 w-full rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
                          <button
                            type="button"
                            onClick={() => {
                              onLoadRoute(route.points);
                              setOpenRouteMenuId(null);
                            }}
                            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-stone-100"
                          >
                            Load route
                          </button>

                          <button
                            type="button"
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
                            type="button"
                            onClick={() => {
                              const newName = window.prompt(
                                "Rename route:",
                                route.name
                              );

                              if (newName?.trim()) {
                                onUpdateSavedRouteName(
                                  route.id,
                                  newName.trim()
                                );
                              }

                              setOpenRouteMenuId(null);
                            }}
                            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-stone-100"
                          >
                            Rename
                          </button>

                          <button
                            type="button"
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
                            type="button"
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
              type="button"
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
              type="button"
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
                Recommended
              </p>

              {recommendedFells.map((fell) => (
                <button
                  key={fell.id}
                  type="button"
                  onClick={() => onSelectFell(fell.id)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-stone-950">{fell.name}</p>
                      <p className="text-sm text-stone-500">{fell.section}</p>
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
          ) : (
            <FellList fells={fells} onSelectFell={onSelectFell} />
          )}
        </aside>

      </section>
    </div>
  );
}