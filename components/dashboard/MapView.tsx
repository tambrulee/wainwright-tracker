"use client";

import type { Wainwright } from "@/types/wainwright";
import type { RoutePoint, RouteSummary } from "@/types/route";
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
  onSearchChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onSortByChange: (value: SortOption) => void;
  onResetFilters: () => void;
  onSelectFell: (fellId: string) => void;
  onAddRoutePoint: (point: Omit<RoutePoint, "id">) => void;
  onRemoveRoutePoint: (pointId: string) => void;
  onRouteSummaryChange: (summary: RouteSummary | null) => void;
  routePointsCount: number;
  filteredFellsCount: number;
  savedRoutesCount: number;
};

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
  onSearchChange,
  onSectionChange,
  onStatusFilterChange,
  onSortByChange,
  onResetFilters,
  onSelectFell,
  onAddRoutePoint,
  onRemoveRoutePoint,
  onRouteSummaryChange,
}: Props) {
  
  return (
    <>
    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-3xl bg-stone-950 p-5 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide text-stone-300">
          Route points
        </p>
        <p className="text-3xl font-black">{routePointsCount}</p>
        <p className="text-sm text-stone-300">
          {isRouteMode ? "editing" : "selected"}
        </p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
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
    </section>

    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
            Quick picks
          </p>
          <h2 className="text-2xl font-black text-stone-950">
            Good options from this view
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-5">
        {fells
          .filter((fell) => !fell.completed)
          .slice(0, 5)
          .map((fell) => (
            <button
              key={fell.id}
              onClick={() => onSelectFell(fell.id)}
              className="rounded-3xl border border-stone-200 bg-stone-50 p-5 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <p className="font-black">{fell.name}</p>
              <p className="text-sm text-stone-500">{fell.section}</p>
              <p className="text-sm font-bold text-stone-700">
                {fell.heightM}m
              </p>
            </button>
          ))}
      </div>
    </section>
    
      <section className="rounded-[2rem] border border-stone-200/70 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
              Filters
            </p>
            <h2 className="text-xl font-black text-stone-950">
              Find the right fell
            </h2>
          </div>

          <button
            onClick={onResetFilters}
            className="w-fit rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-800 hover:bg-stone-100"
          >
            Reset filters
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Haystacks, Catbells..."
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
          />

          <select
            value={section}
            onChange={(e) => onSectionChange(e.target.value)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
          >
            {sections.map((sectionName) => (
              <option key={sectionName} value={sectionName}>
                {sectionName}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
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
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
          >
            <option value="name">Name A-Z</option>
            <option value="height-high">Highest first</option>
            <option value="height-low">Lowest first</option>
            <option value="section">Section</option>
          </select>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="h-[620px] overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white p-4 shadow-sm">
          <FellList fells={fells} onSelectFell={onSelectFell} />
        </div>

        <div className="h-[620px] overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white p-4 shadow-sm">
          <MapWrapper
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
    </>
  );
}