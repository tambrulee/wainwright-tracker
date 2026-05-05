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