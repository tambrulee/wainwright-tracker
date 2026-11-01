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
  const upcomingDates = plannedDates.filter((date) => date >= todayKey);
  const overdueDates = plannedDates.filter((date) => date < todayKey);
  const [showOverdue, setShowOverdue] = useState(false);

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
    <section className="space-y-4 sm:space-y-5">
      {/* Lightweight toolbar, no redundant page heading */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(180px,1.4fr)_repeat(3,minmax(0,1fr))]">
          <input
            aria-label="Search fells"
            value={search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search fells..."
            className="col-span-2 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:bg-white lg:col-span-1"
          />
          <select
            aria-label="Filter by area"
            value={area}
            onChange={(e) => updateFilter("area", e.target.value)}
            className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-700 focus:bg-white"
          >
            <option value="all">All areas</option>
            {areas.map((areaName) => (
              <option key={areaName} value={areaName}>{areaName}</option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => updateFilter("status", e.target.value as StatusFilter)}
            className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-700 focus:bg-white"
          >
            <option value="all">All fells</option>
            <option value="planned">Planned</option>
            <option value="unplanned">Unplanned</option>
            <option value="completed">Completed</option>
          </select>
          <select
            aria-label="Sort fells"
            value={sort}
            onChange={(e) => updateFilter("sort", e.target.value as SortOption)}
            className="col-span-2 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-700 focus:bg-white lg:col-span-1"
          >
            <option value="planned-date">Planned date</option>
            <option value="rank">Wainwright rank</option>
            <option value="height-high">Highest first</option>
            <option value="height-low">Lowest first</option>
            <option value="a-z">A-Z</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700 sm:text-sm">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => updateFilter("hideCompleted", e.target.checked)}
              className="h-4 w-4 accent-emerald-700"
            />
            Hide completed
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500" aria-live="polite">
              {filteredFells.length} showing
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-emerald-800 underline-offset-4 hover:underline focus-visible:underline sm:text-sm"
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-950 sm:text-2xl">Your hiking diary</h1>
            <p className="text-sm text-slate-500">{plannedCount} fells across {plannedDates.length} hiking days</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {nextPlannedDate ? `Next hike · ${formatShortDate(nextPlannedDate)}` : "No upcoming hikes"}
          </span>
        </div>
        {upcomingDates.length === 0 ? (
          <p className="mx-4 mb-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:mx-5">
            No upcoming hikes planned.
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {upcomingDates.map((date) => {
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

      {overdueDates.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <button type="button" aria-expanded={showOverdue}
            onClick={() => setShowOverdue((value) => !value)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700">
            <span>Overdue hikes <span className="ml-2 text-slate-500">{overdueDates.length} date{overdueDates.length === 1 ? "" : "s"}</span></span>
            <span aria-hidden="true">{showOverdue ? "−" : "+"}</span>
          </button>
          {showOverdue && (
            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {overdueDates.map((date) => (
                <button key={date} type="button" onClick={() => jumpToDate(date)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50">
                  <span><strong>{formatShortDate(date)}</strong> · {plannedCalendarDays[date].map((fell) => fell.name).join(" · ")}</span>
                  <span className="shrink-0 text-emerald-700">View →</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

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
