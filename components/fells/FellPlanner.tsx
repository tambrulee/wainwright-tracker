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

export default function FellPlanner({
  fells,
  onToggleCompleted,
  onUpdatePlannedDate,
}: Props) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("planned-date");
  const [hideCompleted, setHideCompleted] = useState(true);

  const [draftDateParts, setDraftDateParts] = useState<
    Record<string, { day: string; month: string; year: string }>
  >({});

  useEffect(() => {
    const saved = localStorage.getItem("planner-view");
    if (!saved) return;

    const parsed = JSON.parse(saved);

    setStatus(parsed.status ?? "all");
    setSearch(parsed.search ?? "");
    setSort(parsed.sort ?? "planned-date");
    setHideCompleted(parsed.hideCompleted ?? true);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "planner-view",
      JSON.stringify({
        status,
        search,
        sort,
        hideCompleted,
      })
    );
  }, [status, search, sort, hideCompleted]);

  const filteredFells = useMemo(() => {
    return fells
      .filter((fell) => {
        const isPlanned = Boolean(fell.plannedDate);

        const matchesSearch =
          fell.name.toLowerCase().includes(search.toLowerCase()) ||
          fell.section?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          status === "all" ||
          (status === "planned" && isPlanned && !fell.completed) ||
          (status === "unplanned" && !isPlanned && !fell.completed) ||
          (status === "completed" && fell.completed);

        const matchesCompletedVisibility =
          status === "completed" || !hideCompleted || !fell.completed;

        return matchesSearch && matchesStatus && matchesCompletedVisibility;
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
  }, [fells, search, status, sort, hideCompleted]);

  const groupedByDate = useMemo(() => {
    return filteredFells.reduce<Record<string, PlannerFell[]>>((groups, fell) => {
      const key = fell.plannedDate || "Unscheduled";
      if (!groups[key]) groups[key] = [];
      groups[key].push(fell);
      return groups;
    }, {});
  }, [filteredFells]);

  const saveDate = (fellId: string, value: string) => {
    onUpdatePlannedDate?.(fellId, value);

    setDraftDateParts((prev) => {
      const copy = { ...prev };
      delete copy[fellId];
      return copy;
    });
  };

  const renderDateControls = (fell: PlannerFell) => {
    const savedDate = fell.plannedDate ?? "";
    const [savedYear = "", savedMonth = "", savedDay = ""] = savedDate.split("-");

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
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={parts.day}
          onChange={(e) => updatePart("day", e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
          className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
        >
          Save
        </button>

        {(savedDate || currentValue) && (
          <button
            type="button"
            onClick={() => saveDate(fell.id, "")}
            className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
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

  const plannedCount = fells.filter(
    (fell) => fell.plannedDate && !fell.completed
  ).length;

  const completedCount = fells.filter((fell) => fell.completed).length;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          Wainwright Planner
        </p>
        <h1 className="text-3xl font-bold text-slate-950">Plan your 214</h1>
        <p className="mt-2 text-slate-600">
          Add a date to plan a fell. Clear the date to move it back to unscheduled.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_0.8fr] xl:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fell or area..."
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-700"
          />

          <div className="flex flex-wrap gap-2">
            {(["all", "planned", "unplanned", "completed"] as StatusFilter[]).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                    status === item
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setHideCompleted((prev) => !prev)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                hideCompleted
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {hideCompleted ? "Completed hidden" : "Completed visible"}
            </button>
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
          >
            <option value="planned-date">Sort by planned date</option>
            <option value="rank">Sort by Wainwright rank</option>
            <option value="height-high">Height: high to low</option>
            <option value="height-low">Height: low to high</option>
            <option value="a-z">A-Z</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
          <span>Showing {filteredFells.length} of {fells.length}</span>
          <span>Planned {plannedCount}</span>
          <span>Completed {completedCount}</span>
        </div>
      </div>

      <div className="space-y-5">
        {Object.entries(groupedByDate).map(([date, dateFells]) => (
          <section
            key={date}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">
                {formatDateHeading(date)}
              </h2>
              <p className="text-sm text-slate-500">
                {dateFells.length} Wainwright{dateFells.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {dateFells.map((fell) => {
                const isPlanned = Boolean(fell.plannedDate);

                return (
                  <div
                    key={fell.id}
                    className="grid gap-4 px-5 py-4 xl:grid-cols-[1.3fr_0.7fr_1.7fr_0.7fr] xl:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-950">{fell.name}</h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
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

                    <div className="text-sm text-slate-600">
                      <span>{fell.heightM}m</span>
                      <span className="mx-2 text-slate-300">·</span>
                      <span>Rank #{fell.heightRank}</span>
                    </div>

                    {renderDateControls(fell)}

                    <button
                      type="button"
                      onClick={() => onToggleCompleted?.(fell.id)}
                      className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
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