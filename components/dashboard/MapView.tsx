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

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 px-4 sm:px-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Stat label="Completed" value={completedFellsCount} dark />
          <Stat label="Planned" value={plannedFellsCount} />
          <Stat label="Showing" value={filteredFellsCount} />
          <Stat label="Routes" value={savedRoutesCount} dark />

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
            onChange={(e) =>
              onStatusFilterChange(e.target.value as StatusFilter)
            }
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

      <section className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            setToolPanel((current) => (current === "route" ? "none" : "route"))
          }
          className={`rounded-2xl border px-4 py-3 text-sm font-black ${
            toolPanel === "route"
              ? "border-emerald-700 bg-emerald-50 text-emerald-900"
              : "border-stone-200 bg-white hover:bg-stone-50"
          }`}
        >
          Route builder
        </button>

        <button
          type="button"
          onClick={() =>
            setToolPanel((current) => (current === "saved" ? "none" : "saved"))
          }
          className={`rounded-2xl border px-4 py-3 text-sm font-black ${
            toolPanel === "saved"
              ? "border-emerald-700 bg-emerald-50 text-emerald-900"
              : "border-stone-200 bg-white hover:bg-stone-50"
          }`}
        >
          Saved routes
        </button>
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

      <section className="h-[calc(100vh-14rem)] min-h-[680px] overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
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