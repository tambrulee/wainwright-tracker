"use client";

import { useState } from "react";
import type { Wainwright } from "@/types/wainwright";
import type { RoutePoint, RouteSummary, SavedRoute } from "@/types/route";
import type { SortOption, StatusFilter } from "@/types/dashboard";
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
  onSetPlannedDate: (fell: Wainwright, plannedDate: string | null) => void;
  completedFellsCount: number;
  plannedFellsCount: number;
};

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
  onToggleCompleted,
  onTogglePriority,
  onSetPlannedDate,
  completedFellsCount,
  plannedFellsCount,
}: Props) {
  const [toolPanel, setToolPanel] = useState<ToolPanel>("none");
  const [openRouteMenuId, setOpenRouteMenuId] = useState<string | null>(null);


  const fieldClass = "w-full min-w-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm !text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
  const toolbarButton = "rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold !text-stone-900 transition hover:border-emerald-300 hover:bg-emerald-50";

  return (
    <div className="mx-auto max-w-[1500px] space-y-3 px-2 sm:px-4 lg:px-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-3 text-stone-900 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-stone-200 pb-3 text-sm">
          <span className="font-bold text-emerald-900">{completedFellsCount} <span className="font-normal text-stone-500">completed</span></span>
          <span className="font-bold text-emerald-900">{plannedFellsCount} <span className="font-normal text-stone-500">planned</span></span>
          <span className="font-bold text-emerald-900">{filteredFellsCount} <span className="font-normal text-stone-500">showing</span></span>
          <span className="font-bold text-emerald-900">{savedRoutesCount} <span className="font-normal text-stone-500">routes</span></span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="min-w-0 flex-[1_1_180px] sm:flex-[1_1_300px]">
            <span className="sr-only">Search fells</span>
            <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search fells…" className={fieldClass} />
          </label>
          <button type="button" onClick={() => setToolPanel((v) => v === "route" ? "none" : "route")} aria-pressed={toolPanel === "route"} className={`${toolbarButton} ${toolPanel === "route" ? "border-emerald-600 bg-emerald-50" : ""}`}>Route builder</button>
          <button type="button" onClick={() => setToolPanel((v) => v === "saved" ? "none" : "saved")} aria-pressed={toolPanel === "saved"} className={`${toolbarButton} ${toolPanel === "saved" ? "border-emerald-600 bg-emerald-50" : ""}`}>Saved routes</button>
        </div>

        <div id="map-filters" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
            <label className="block text-xs font-semibold text-stone-600">Region
              <select value={section} onChange={(e) => onSectionChange(e.target.value)} className={`mt-1 ${fieldClass}`}>
                <option value="All">All regions</option>
                {sections.filter((name) => name !== "All").map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-stone-600">Status
              <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)} className={`mt-1 ${fieldClass}`}>
                <option value="All">All statuses</option><option value="Not completed">Not completed</option><option value="Completed">Completed</option><option value="Planned">Planned</option><option value="Priority">Priority</option>
              </select>
            </label>
            <label className="block text-xs font-semibold text-stone-600">Sort by
              <select value={sortBy} onChange={(e) => onSortByChange(e.target.value as SortOption)} className={`mt-1 ${fieldClass}`}>
                <option value="name">Name A–Z</option><option value="height-high">Highest first</option><option value="height-low">Lowest first</option><option value="section">Region</option><option value="planned-date">Planned date</option>
              </select>
            </label>
            <button type="button" onClick={onResetFilters} className={toolbarButton}>Reset filters</button>
        </div>
      </section>

      {toolPanel === "route" && (
        <section className="rounded-3xl bg-emerald-950 p-4 text-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                Route builder
              </p>
              <p className="text-2xl font-black">{routePoints.length} points</p>
              {routeDifficulty && (
                <p className="text-sm text-emerald-100">{routeDifficulty}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={isRouteMode ? onFinishRouteSession : onStartNewRouteSession}
                className="rounded-xl bg-white px-3 py-2 text-sm font-black !text-emerald-950"
              >
                {isRouteMode ? "Finish" : "New route"}
              </button>

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

          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <RouteMetric
              label="Estimated time"
              value={routeSummary ? `${routeSummary.durationHours.toFixed(1)} hrs` : "—"}
            />
            <RouteMetric
              label="Distance"
              value={routeSummary ? `${routeSummary.distanceKm.toFixed(1)} km` : "—"}
            />
            <RouteMetric
              label="Ascent"
              value={routeSummary ? `${routeSummary.ascentM}m` : "—"}
            />
            <RouteMetric
              label="Descent"
              value={routeSummary ? `${routeSummary.descentM}m` : "—"}
            />
          </div>
        </section>
      )}

      {toolPanel === "saved" && (
        <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
            Saved routes
          </p>

          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {savedRoutes.length === 0 ? (
              <p className="text-sm text-stone-600">No saved routes yet.</p>
            ) : (
              savedRoutes.map((route, index) => (
                <div key={route.id} className="rounded-2xl bg-stone-50 p-4">
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
                    >
                      ⋯
                    </button>
                  </div>

                  {openRouteMenuId === route.id && (
                    <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
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
                          const confirmed = window.confirm(
                            `Delete "${route.name}"? This cannot be undone.`
                          );

                          if (confirmed) onDeleteRoute(index);
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
        </section>
      )}

      <section className="h-[65dvh] min-h-[420px] min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm sm:h-[75dvh] sm:min-h-[550px] lg:h-[calc(100vh-12rem)]">
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
          onSetPlannedDate={onSetPlannedDate}
        />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: number;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 ${
        dark ? "bg-emerald-900 text-white" : "bg-stone-50"
      }`}
    >
      <p className={dark ? "text-xs text-emerald-200" : "text-xs text-stone-500"}>
        {label}
      </p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function RouteMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-sm text-emerald-100">{label}</p>
      <p className="font-black">{value}</p>
    </div>
  );
}