"use client";

import { useMemo, useState } from "react";
import type { Wainwright } from "@/types/wainwright";

type StatusFilter = "all" | "planned" | "unplanned" | "completed";
type SortOption = "planned-date" | "height-high" | "height-low" | "a-z" | "rank";
type ViewMode = "cards" | "timeline";

type PlannerFell = Wainwright & {
  completed?: boolean;
  planned?: boolean;
  priority?: boolean;
  plannedDate?: string | null;
};

type Props = {
  fells: PlannerFell[];
  onTogglePlanned?: (fellId: string) => void;
  onToggleCompleted?: (fellId: string) => void;
  onUpdatePlannedDate?: (fellId: string, date: string) => void;
};

export default function FellPlanner({
  fells,
  onTogglePlanned,
  onToggleCompleted,
  onUpdatePlannedDate,
}: Props) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("rank");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [draftDates, setDraftDates] = useState<Record<string, string>>({});

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

  const groupedByDate = useMemo(() => {
    return filteredFells.reduce<Record<string, PlannerFell[]>>((groups, fell) => {
      const key = fell.plannedDate || "Unscheduled";
      if (!groups[key]) groups[key] = [];
      groups[key].push(fell);
      return groups;
    }, {});
  }, [filteredFells]);

  const [draftDateParts, setDraftDateParts] = useState<
    Record<string, { day: string; month: string; year: string }>
  >({});

  const saveDraftDate = (fellId: string, value: string) => {
    onUpdatePlannedDate?.(fellId, value);

    setDraftDates((prev) => {
      const copy = { ...prev };
      delete copy[fellId];
      return copy;
    });
  };

const renderDateInput = (fell: PlannerFell) => {
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

  const clearDraftParts = () => {
    setDraftDateParts((prev) => {
      const copy = { ...prev };
      delete copy[fell.id];
      return copy;
    });
  };

  return (
    <div className="mt-4">
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
        Planned date
      </label>

      <div className="grid grid-cols-3 gap-2">
        <select
          value={parts.day}
          onChange={(e) => updatePart("day", e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) =>
            String(i + 1).padStart(2, "0")
          ).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={parts.month}
          onChange={(e) => updatePart("month", e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Month</option>
          {Array.from({ length: 12 }, (_, i) =>
            String(i + 1).padStart(2, "0")
          ).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={parts.year}
          onChange={(e) => updatePart("year", e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Year</option>
          {[2026, 2027, 2028, 2029, 2030].map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={!hasChanged || !currentValue}
          onClick={() => {
            saveDraftDate(fell.id, currentValue);
            clearDraftParts();
          }}
          className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
        >
          Save date
        </button>

        {(savedDate || currentValue) && (
          <button
            type="button"
            onClick={() => {
              saveDraftDate(fell.id, "");
              clearDraftParts();
            }}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

  const renderFellCard = (fell: PlannerFell, compact = false) => (
    <article className={compact ? "rounded-2xl border border-slate-100 bg-slate-50 p-4" : "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{fell.name}</h2>
          <p className="text-sm text-slate-500">{fell.section}</p>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
          fell.completed ? "bg-emerald-100 text-emerald-700" :
          fell.planned ? "bg-amber-100 text-amber-700" :
          "bg-slate-100 text-slate-600"
        }`}>
          {fell.completed ? "Completed" : fell.planned ? "Planned" : "Unplanned"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Height</p>
          <p>{fell.heightM}m</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Rank</p>
          <p>#{fell.heightRank}</p>
        </div>
      </div>

      {renderDateInput(fell)}

      <div className="mt-5 flex gap-2">
        <button onClick={() => onTogglePlanned?.(fell.id)} className="flex-1 rounded-2xl bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-200">
          {fell.planned ? "Unplan" : "Plan"}
        </button>

        <button onClick={() => onToggleCompleted?.(fell.id)} className="flex-1 rounded-2xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
          {fell.completed ? "Undo" : "Complete"}
        </button>
      </div>
    </article>
  );

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Wainwright Planner</p>
        <h1 className="text-3xl font-bold text-slate-950">Plan your 214</h1>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by fell or area..." className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 xl:max-w-sm" />

        <div className="flex flex-wrap gap-2">
          {(["all", "planned", "unplanned", "completed"] as StatusFilter[]).map((item) => (
            <button key={item} onClick={() => setStatus(item)} className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              status === item ? "bg-emerald-700 !text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}>
              {item}
            </button>
          ))}
        </div>

        <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold">
          <option value="rank">Rank</option>
          <option value="planned-date">Planned date</option>
          <option value="height-high">Height: high to low</option>
          <option value="height-low">Height: low to high</option>
          <option value="a-z">A-Z</option>
        </select>

        <div className="flex gap-2">
          {(["cards", "timeline"] as ViewMode[]).map((mode) => (
            <button key={mode} onClick={() => setViewMode(mode)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              viewMode === mode ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-slate-500">
        Showing {filteredFells.length} of {fells.length} Wainwrights
      </div>

      {viewMode === "timeline" ? (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, dateFells]) => (
            <section key={date} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                {date === "Unscheduled"
                  ? "Unscheduled"
                  : new Date(date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {dateFells.length} Wainwright{dateFells.length === 1 ? "" : "s"}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {dateFells.map((fell) => (
                  <div key={fell.id}>{renderFellCard(fell, true)}</div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredFells.map((fell) => (
            <div key={fell.id}>{renderFellCard(fell)}</div>
          ))}
        </div>
      )}
    </section>
  );
}