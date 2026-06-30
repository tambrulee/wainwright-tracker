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

  const [draftDateParts, setDraftDateParts] = useState<
    Record<string, { day: string; month: string; year: string }>
  >({});

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

  const saveDate = (fellId: string, value: string) => {
    onUpdatePlannedDate?.(fellId, value);

    setDraftDateParts((prev) => {
      const copy = { ...prev };
      delete copy[fellId];
      return copy;
    });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const renderDateControls = (fell: PlannerFell) => {
    const savedDate = fell.plannedDate ?? "";
    const [savedYear = "", savedMonth = "", savedDay = ""] =
      savedDate.split("-");

    const parts = draftDateParts[fell.id] ?? {
      day: savedDay,
      month: savedMonth,
      year: savedYear,
    };

    const currentValue =
      parts.year && parts.month && parts.day
        ? `${parts.year}-${parts.month}-${parts.day}`
        : "";

    const hasChanged = currentValue !== savedDate;

    const updatePart = (part: "day" | "month" | "year", value: string) => {
      setDraftDateParts((prev) => ({
        ...prev,
        [fell.id]: {
          ...parts,
          [part]: value,
        },
      }));
    };

    return (
      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <select
          value={parts.day}
          onChange={(e) => updatePart("day", e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) =>
            String(i + 1).padStart(2, "0")
          ).map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        <select
          value={parts.month}
          onChange={(e) => updatePart("month", e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Month</option>
          {Array.from({ length: 12 }, (_, i) =>
            String(i + 1).padStart(2, "0")
          ).map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <select
          value={parts.year}
          onChange={(e) => updatePart("year", e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Year</option>
          {[2026, 2027, 2028, 2029, 2030].map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={!hasChanged || !currentValue}
          onClick={() => saveDate(fell.id, currentValue)}
          className="col-span-3 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400 sm:col-span-1"
        >
          Save
        </button>

        {(savedDate || currentValue) && (
          <button
            type="button"
            onClick={() => saveDate(fell.id, "")}
            className="col-span-3 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 sm:col-span-1"
          >
            Clear
          </button>
        )}
      </div>
    );
  };

  const formatDateHeading = (date: string) => {
    if (date === "Unscheduled") return "Unscheduled";

    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
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

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-800">
              Planned calendar
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Hiking days at a glance
            </h2>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
            {plannedDates.length} days
          </span>
        </div>

        {plannedDates.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Nothing planned yet.
          </p>
        ) : (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {plannedDates.map((date) => {
              const dayFells = plannedCalendarDays[date];

              return (
                <button
                  key={date}
                  type="button"
                  className="min-w-[180px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <p className="text-sm font-black text-slate-950">
                    {formatShortDate(date)}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {dayFells.length} fell{dayFells.length === 1 ? "" : "s"}
                  </p>

                  <div className="mt-3 space-y-1">
                    {dayFells.slice(0, 3).map((fell) => (
                      <p key={fell.id} className="truncate text-sm text-slate-700">
                        {fell.name}
                      </p>
                    ))}

                    {dayFells.length > 3 && (
                      <p className="text-xs font-bold text-slate-500">
                        +{dayFells.length - 3} more
                      </p>
                    )}
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
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
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
                    className="grid gap-4 px-4 py-4 sm:px-5 xl:grid-cols-[1.3fr_0.7fr_1.7fr_0.7fr] xl:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-950">
                          {fell.name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
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
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {fell.section}
                      </p>
                    </div>

                    <div className="text-sm font-semibold text-slate-600">
                      <span>{fell.heightM}m</span>
                      <span className="mx-2 text-slate-300">·</span>
                      <span>Rank #{fell.heightRank}</span>
                    </div>

                    {renderDateControls(fell)}

                    <button
                      type="button"
                      onClick={() => onToggleCompleted?.(fell.id)}
                      className="w-full rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 xl:w-auto"
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