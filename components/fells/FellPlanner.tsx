"use client";

import { useMemo, useState } from "react";
import type { Wainwright } from "@/types/wainwright";

type StatusFilter = "all" | "planned" | "unplanned" | "completed";

type PlannerFell = Wainwright & {
  completed?: boolean;
  planned?: boolean;
  priority?: boolean;
  plannedDate?: string;
};


type Props = {
  fells: PlannerFell[];
  onTogglePlanned?: (fellId: string) => void;
  onToggleCompleted?: (fellId: string) => void;
  onUpdatePlannedDate?: (fellId: string, date: string) => void;
};

type SortOption = "planned-date" | "height-high" | "height-low" | "a-z" | "rank";


export default function FellPlanner({
  fells,
  onTogglePlanned,
  onToggleCompleted,
  onUpdatePlannedDate,
}: Props) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("rank");

  const filteredFells = useMemo(() => {
    return fells
      .filter((fell) => {
        const matchesSearch =
          fell.name.toLowerCase().includes(search.toLowerCase()) ||
          fell.section?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          status === "all" ||
          (status === "planned" && fell.planned && !fell.completed) ||
          (status === "unplanned" && !fell.planned && !fell.completed) ||
          (status === "completed" && fell.completed);

        return matchesSearch && matchesStatus;
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
  }, [fells, search, status, sort]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          Wainwright Planner
        </p>
        <h1 className="text-3xl font-bold text-slate-950">
          Plan your 214
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Browse every Wainwright, mark what you’ve completed, and build your future fell days.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by fell or area..."
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 md:max-w-sm"
        />
        
        {/* Status Filter */}

        <div className="flex flex-wrap gap-2">
          {(["all", "planned", "unplanned", "completed"] as StatusFilter[]).map(
            (item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition focus:outline-none focus:ring-0 ${
                  status === item
                    ? "bg-emerald-700 !text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        {/* Sort Dropdown */}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold"
        >
          <option value="rank">Rank</option>
          <option value="planned-date">Planned date</option>
          <option value="height-high">Height: high to low</option>
          <option value="height-low">Height: low to high</option>
          <option value="a-z">A-Z</option>
        </select>
      </div>

      <div className="text-sm text-slate-500">
        Showing {filteredFells.length} of {fells.length} Wainwrights
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredFells.map((fell) => (
          <article
            key={fell.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {fell.name}
                </h2>
                <p className="text-sm text-slate-500">{fell.section}</p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  fell.completed
                    ? "bg-emerald-100 text-emerald-700"
                    : fell.planned
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {fell.completed
                  ? "Completed"
                  : fell.planned
                  ? "Planned"
                  : "Unplanned"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Height
                </p>
                <p>{fell.heightM}m</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Rank
                </p>
                <p>#{fell.heightRank}</p>
              </div>
            </div>

                          <input
                type="date"
                value={fell.plannedDate ?? ""}
                onChange={(e) => onUpdatePlannedDate?.(fell.id, e.target.value)}
                className="mt-5 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-700"
              />

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => onTogglePlanned?.(fell.id)}
                className="flex-1 rounded-2xl bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
              >
                {fell.planned ? "Unplan" : "Plan"}
              </button>

              <button
                onClick={() => onToggleCompleted?.(fell.id)}
                className="flex-1 rounded-2xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                {fell.completed ? "Undo" : "Complete"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}