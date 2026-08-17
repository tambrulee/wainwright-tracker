"use client";

import { useEffect, useMemo, useState } from "react";
import type { Wainwright } from "@/types/wainwright";

type StatusFilter = "all" | "planned" | "unplanned" | "completed";
type SortOption = "planned-date" | "height-high" | "height-low" | "a-z" | "rank";

type PlannerFell = Wainwright & {
  completed?: boolean;
  priority?: boolean;
  plannedDate?: string | null;
};

type Props = {
  fells: PlannerFell[];
  onToggleCompleted?: (fellId: string) => void;
  onUpdatePlannedDate?: (fellId: string, date: string) => void;
};

type PlannerFilters = {
  status: StatusFilter;
  search: string;
  sort: SortOption;
  hideCompleted: boolean;
  area: string;
};

const defaultFilters: PlannerFilters = {
  status: "all",
  search: "",
  sort: "planned-date",
  hideCompleted: true,
  area: "all",
};

export default function FellPlanner({
  fells,
  onToggleCompleted,
  onUpdatePlannedDate,
}: Props) {
  const [filters, setFilters] = useState<PlannerFilters>(() => {
    if (typeof window === "undefined") return defaultFilters;

    try {
      const saved = localStorage.getItem("planner-view");
      if (!saved) return defaultFilters;

      return {
        ...defaultFilters,
        ...JSON.parse(saved),
      };
    } catch {
      return defaultFilters;
    }
  });

  const { status, search, sort, hideCompleted, area } = filters;

  const updateFilter = <K extends keyof PlannerFilters>(
    key: K,
    value: PlannerFilters[K]
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  useEffect(() => {
    localStorage.setItem("planner-view", JSON.stringify(filters));
  }, [filters]);

  const areas = useMemo(() => {
    return Array.from(
      new Set(fells.map((fell) => fell.section).filter(Boolean))
    ).sort();
  }, [fells]);

  const filteredFells = useMemo(() => {
    return fells
      .filter((fell) => {
        const isPlanned = Boolean(fell.plannedDate);

        const matchesSearch = fell.name
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesArea = area === "all" || fell.section === area;

        const matchesStatus =
          status === "all" ||
          (status === "planned" && isPlanned && !fell.completed) ||
          (status === "unplanned" && !isPlanned && !fell.completed) ||
          (status === "completed" && fell.completed);

        const matchesCompletedVisibility =
          status === "completed" || !hideCompleted || !fell.completed;

        return (
          matchesSearch &&
          matchesArea &&
          matchesStatus &&
          matchesCompletedVisibility
        );
      })
      .sort((a, b) => {
        if (sort === "planned-date") {
          if (!a.plannedDate && !b.plannedDate) return 0;
          if (!a.plannedDate) return 1;
          if (!b.plannedDate) return -1;
          return a.plannedDate.localeCompare(b.plannedDate);
        }

        if (sort === "height-high") return b.heightM - a.heightM;
        if (sort === "height-low") return a.heightM - b.heightM;
        if (sort === "a-z") return a.name.localeCompare(b.name);

        return a.heightRank - b.heightRank;
      });
  }, [fells, search, area, status, sort, hideCompleted]);

  const groupedByDate = useMemo(() => {
    return filteredFells.reduce<Record<string, PlannerFell[]>>((groups, fell) => {
      const key = fell.plannedDate || "Unscheduled";
      if (!groups[key]) groups[key] = [];
      groups[key].push(fell);
      return groups;
    }, {});
  }, [filteredFells]);

  const plannedCount = fells.filter(
    (fell) => fell.plannedDate && !fell.completed
  ).length;

  const completedCount = fells.filter((fell) => fell.completed).length;

  const plannedCalendarDays = useMemo(() => {
    return fells
      .filter((fell) => fell.plannedDate && !fell.completed)
      .reduce<Record<string, PlannerFell[]>>((days, fell) => {
        const key = fell.plannedDate as string;
        if (!days[key]) days[key] = [];
        days[key].push(fell);
        return days;
      }, {});
  }, [fells]);

  const plannedDates = Object.keys(plannedCalendarDays).sort();

  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  const nextPlannedDate = plannedDates.find((date) => date >= todayKey);

  const saveDate = (fellId: string, value: string) => {
    onUpdatePlannedDate?.(fellId, value);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const renderDateControls = (fell: PlannerFell) => {
    const savedDate = fell.plannedDate ?? "";

    return (
      <div className="flex min-w-0 items-center gap-2">
        <input
          type="date"
          value={savedDate}
          aria-label={`Planned date for ${fell.name}`}
          onChange={(event) => saveDate(fell.id, event.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />

        {savedDate && (
          <button
            type="button"
            onClick={() => saveDate(fell.id, "")}
            aria-label={`Clear planned date for ${fell.name}`}
            className="shrink-0 rounded-lg px-2 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            Clear
          </button>
        )}
      </div>
    );
  };

  const formatDateHeading = (date: string) => {
    if (date === "Unscheduled") return "Unscheduled";

    return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (date: string) => {
    return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const jumpToDate = (date: string) => {
    document
      .getElementById(`planner-day-${date}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-800">
          Wainwright Planner
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Plan your 214
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          Add planned dates, filter by area, and keep your upcoming fells tidy.
        </p>
      </div>
    {/* Filter Controls */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <input
            value={search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search fell..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:bg-white"
          />

          <select
            value={area}
            onChange={(e) => updateFilter("area", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-700 focus:bg-white"
          >
            <option value="all">All areas</option>
            {areas.map((areaName) => (
              <option key={areaName} value={areaName}>
                {areaName}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) =>
              updateFilter("status", e.target.value as StatusFilter)
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-700 focus:bg-white"
          >
            <option value="all">All fells</option>
            <option value="planned">Planned</option>
            <option value="unplanned">Unplanned</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sort}
            onChange={(e) => updateFilter("sort", e.target.value as SortOption)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-700 focus:bg-white"
          >
            <option value="planned-date">Planned date</option>
            <option value="rank">Wainwright rank</option>
            <option value="height-high">Highest first</option>
            <option value="height-low">Lowest first</option>
            <option value="a-z">A-Z</option>
          </select>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) =>
                updateFilter("hideCompleted", e.target.checked)
              }
              className="h-4 w-4 accent-emerald-700"
            />
            Hide completed fells
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Reset filters
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold sm:flex sm:flex-wrap sm:text-sm">
          <span className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
            Showing {filteredFells.length}
          </span>
          <span className="rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
            Planned {plannedCount}
          </span>
          <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
            Completed {completedCount}
          </span>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 px-4 pb-4 pt-5 sm:px-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-800">
              Your hiking diary
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Hiking days at a glance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {plannedCount} fell{plannedCount === 1 ? "" : "s"} across {plannedDates.length} hiking day{plannedDates.length === 1 ? "" : "s"}
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
            {nextPlannedDate ? `${formatShortDate(nextPlannedDate)} next` : "No upcoming plans"}
          </span>
        </div>

        {plannedDates.length === 0 ? (
          <p className="mx-4 mb-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:mx-5">
            Nothing planned yet.
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
            {plannedDates.map((date) => {
              const dayFells = plannedCalendarDays[date];
              const isNext = date === nextPlannedDate;
              const isPast = date < todayKey;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => jumpToDate(date)}
                  className={`group flex min-w-[245px] items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    isNext
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/60"
                  }`}
                >
                  <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${
                    isNext ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700 group-hover:bg-emerald-100"
                  }`}>
                    <span className="text-[10px] font-black uppercase leading-none">
                      {new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { month: "short" })}
                    </span>
                    <span className="mt-1 text-lg font-black leading-none">
                      {new Date(`${date}T12:00:00`).getDate()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-black text-slate-950">
                        {new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long" })}
                      </p>
                      <span className="shrink-0 text-xs font-bold text-slate-500">
                        {isPast ? "Overdue" : `${dayFells.length} fell${dayFells.length === 1 ? "" : "s"}`}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-600">
                      {dayFells.map((fell) => fell.name).join(" · ")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Planned Dates */}

      <div className="space-y-5">
        {Object.entries(groupedByDate).map(([date, dateFells]) => (
          <section
            key={date}
            id={`planner-day-${date}`}
            className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-4 sm:px-5">
              <h2 className="text-lg font-black text-slate-950">
                {formatDateHeading(date)}
              </h2>
              <p className="text-sm text-slate-500">
                {dateFells.length} Wainwright
                {dateFells.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {dateFells.map((fell) => {
                const isPlanned = Boolean(fell.plannedDate);

                return (
                  <div
                    key={fell.id}
                    className="grid gap-3 px-4 py-3 sm:px-5 lg:grid-cols-[minmax(190px,1.3fr)_minmax(130px,0.8fr)_minmax(190px,1fr)_auto_auto] lg:items-center"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate font-black text-slate-950">
                        {fell.name}
                      </h3>
                      <p className="truncate text-xs text-slate-500">
                        {fell.section}
                      </p>
                    </div>

                    <div className="text-sm font-semibold text-slate-600 lg:whitespace-nowrap">
                      <span>{fell.heightM}m</span>
                      <span className="mx-2 text-slate-300">·</span>
                      <span>Rank #{fell.heightRank}</span>
                    </div>

                    {renderDateControls(fell)}

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                        fell.completed
                          ? "bg-emerald-100 text-emerald-700"
                          : isPlanned
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {fell.completed
                        ? "Completed"
                        : isPlanned
                        ? "Planned"
                        : "Unplanned"}
                    </span>

                    <button
                      type="button"
                      onClick={() => onToggleCompleted?.(fell.id)}
                      className={`w-full whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition lg:w-auto ${
                        fell.completed
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-emerald-700 text-white hover:bg-emerald-800"
                      }`}
                    >
                      {fell.completed ? "Undo complete" : "Complete"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
