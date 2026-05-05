"use client";

import { useMemo, useState } from "react";
import type { Wainwright } from "@/types/wainwright";
import ProgressStats from "@/components/ProgressStats";

type Props = {
  fells: Wainwright[];
  onSelectFell: (fellId: string) => void;
};

export default function OverviewView({ fells, onSelectFell }: Props) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const completedCount = fells.filter((fell) => fell.completed).length;
  const plannedCount = fells.filter((fell) => fell.planned).length;
  const priorityCount = fells.filter((fell) => fell.priority).length;
  const remainingCount = fells.length - completedCount;

  const sectionStats = useMemo(() => {
    const grouped = new Map<
      string,
      {
        section: string;
        total: number;
        completed: number;
        planned: number;
        priority: number;
      }
    >();

    fells.forEach((fell) => {
      const current =
        grouped.get(fell.section) ?? {
          section: fell.section,
          total: 0,
          completed: 0,
          planned: 0,
          priority: 0,
        };

      current.total += 1;
      if (fell.completed) current.completed += 1;
      if (fell.planned) current.planned += 1;
      if (fell.priority) current.priority += 1;

      grouped.set(fell.section, current);
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.section.localeCompare(b.section)
    );
  }, [fells]);

  const activeSection = selectedSection ?? sectionStats[0]?.section;

  const sectionSuggestions = useMemo(() => {
    return fells
      .filter((fell) => fell.section === activeSection && !fell.completed)
      .sort((a, b) => {
        if (a.planned && !b.planned) return -1;
        if (!a.planned && b.planned) return 1;
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return a.heightM - b.heightM;
      })
      .slice(0, 6);
  }, [fells, activeSection]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
          Overview
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-950 md:text-5xl">
          Your Wainwright progress
        </h1>

        <p className="mt-3 max-w-3xl text-stone-600">
          See what you’ve completed, where your gaps are, and which areas are
          worth focusing on next.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-stone-950 p-5 text-white">
            <p className="text-xs uppercase tracking-wide text-stone-300">
              Completed
            </p>
            <p className="mt-2 text-3xl font-black">
              {completedCount} / {fells.length}
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Remaining
            </p>
            <p className="mt-2 text-3xl font-black">{remainingCount}</p>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Planned
            </p>
            <p className="mt-2 text-3xl font-black">{plannedCount}</p>
          </div>

          <div className="rounded-3xl bg-emerald-900 p-5 text-white">
            <p className="text-xs uppercase tracking-wide text-emerald-200">
              Priority
            </p>
            <p className="mt-2 text-3xl font-black">{priorityCount}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
              Regions
            </p>
            <h2 className="text-2xl font-black text-stone-950">
              Progress by area
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {sectionStats.map((stat) => {
              const percentage = Math.round((stat.completed / stat.total) * 100);
              const isActive = activeSection === stat.section;

              return (
                <button
                  key={stat.section}
                  onClick={() => setSelectedSection(stat.section)}
                  className={`rounded-3xl border p-5 text-left transition ${
                    isActive
                      ? "border-emerald-700 bg-emerald-50"
                      : "border-stone-200 bg-stone-50 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-stone-950">
                        {stat.section}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        {stat.completed} of {stat.total} completed
                      </p>
                    </div>

                    <p className="text-xl font-black text-emerald-900">
                      {percentage}%
                    </p>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-emerald-800"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="mt-3 flex gap-2 text-xs font-bold text-stone-600">
                    <span>{stat.planned} planned</span>
                    <span>·</span>
                    <span>{stat.priority} priority</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
            Next in area
          </p>

          <h2 className="mt-1 text-2xl font-black text-stone-950">
            {activeSection}
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            Prioritising planned fells, priority fells, then easier lower fells.
          </p>

          <div className="mt-5 space-y-3">
            {sectionSuggestions.length === 0 ? (
              <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                You’ve completed everything in this area.
              </p>
            ) : (
              sectionSuggestions.map((fell) => (
                <button
                  key={fell.id}
                  onClick={() => onSelectFell(fell.id)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-stone-950">{fell.name}</p>
                      <p className="text-sm text-stone-500">{fell.heightM}m</p>
                    </div>

                    <div className="flex gap-1">
                      {fell.planned && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">
                          Planned
                        </span>
                      )}
                      {fell.priority && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">
                          Priority
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}