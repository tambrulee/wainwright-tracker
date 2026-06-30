"use client";

import { useEffect, useMemo, useState } from "react";
import wainwrights from "@/data/wainwrights.json";
import type { Wainwright } from "@/types/wainwright";
import { createClient } from "@/lib/supabase/client";

type FellProgress = {
  id: string;
  user_id: string;
  fell_id: string;
  completed: boolean;
  completed_date: string | null;
};

const allWainwrights = wainwrights as Wainwright[];

const sectionMilestones = [
  "North Western Fells",
  "Western Fells",
  "Southern Fells",
  "Central Fells",
  "Eastern Fells",
  "Far Eastern Fells",
  "Northern Fells",
];

const heightMilestones = [
  { label: "Complete all 300m Wainwrights", min: 300, max: 400 },
  { label: "Complete all 400m Wainwrights", min: 400, max: 500 },
  { label: "Complete all 500m Wainwrights", min: 500, max: 600 },
  { label: "Complete all 600m Wainwrights", min: 600, max: 700 },
  { label: "Complete all 700m Wainwrights", min: 700, max: 800 },
  { label: "Complete all 800m Wainwrights", min: 800, max: 900 },
  { label: "Complete all 900m Wainwrights", min: 900, max: Infinity },
];

const overallMilestones = [1, 25, 50, 75, 100, 150, 200, 214];

const peakBaggerMilestones = [
  {
    label: "Complete the 10 highest Wainwrights",
    fells: [...allWainwrights]
      .sort((a, b) => b.heightM - a.heightM)
      .slice(0, 10),
  },
  {
    label: "Complete every Wainwright over 800m",
    fells: allWainwrights.filter((fell) => fell.heightM >= 800),
  },
  {
    label: "Complete every Wainwright over 700m",
    fells: allWainwrights.filter((fell) => fell.heightM >= 700),
  },
];

export default function Achievements() {
  const supabase = createClient();
  const [progress, setProgress] = useState<FellProgress[]>([]);

  useEffect(() => {
    async function loadProgress() {
      const { data, error } = await supabase
        .from("fell_progress")
        .select("id, user_id, fell_id, completed, completed_date");

      if (error) {
        console.error(error);
        return;
      }

      setProgress(data ?? []);
    }

    void loadProgress();
  }, [supabase]);

  const completedIds = useMemo(() => {
    return new Set(
      progress
        .filter((item) => item.completed)
        .map((item) => item.fell_id)
    );
  }, [progress]);

  const completedCount = completedIds.size;

  function getAchievementStatus(targetFells: Wainwright[]) {
    const completed = targetFells.filter((fell) => completedIds.has(fell.id));
    const total = targetFells.length;
    const done = completed.length === total && total > 0;

    return {
      done,
      completed: completed.length,
      total,
      percentage: total === 0 ? 0 : Math.round((completed.length / total) * 100),
    };
  }

  function getCountAchievementStatus(target: number) {
  const done = completedCount >= target;

  return {
    done,
    completed: Math.min(completedCount, target),
    total: target,
    percentage: Math.min(Math.round((completedCount / target) * 100), 100),
  };
}

  const overall = getAchievementStatus(allWainwrights);

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
          Achievements
        </p>
        <h1 className="text-3xl font-black text-stone-950">
          Wainwright Milestones
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Track big completion goals by height, region, and the full 214.
        </p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">All 214 Wainwrights</h2>
            <p className="text-sm text-stone-500">
              {completedCount} of 214 completed
            </p>
          </div>

          <div className="text-4xl">{overall.done ? "🏆" : "⛰️"}</div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-emerald-700"
            style={{ width: `${overall.percentage}%` }}
          />
        </div>

        <p className="mt-2 text-sm font-semibold text-stone-700">
          {overall.percentage}% complete
        </p>
      </div>

        <div>
        <h2 className="mb-3 text-xl font-black">Height Milestones</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {heightMilestones.map((milestone) => {
            const targetFells = allWainwrights.filter(
                (fell) =>
                fell.heightM >= milestone.min &&
                fell.heightM < milestone.max
            );

            const status = getAchievementStatus(targetFells);

            return (
                <AchievementCard
                key={milestone.label}
                title={milestone.label}
                completed={status.completed}
                total={status.total}
                percentage={status.percentage}
                done={status.done}
                />
            );
            })}
        </div>
        </div>

      <div>
        <h2 className="mb-3 text-xl font-black">Regional Milestones</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sectionMilestones.map((section) => {
            const targetFells = allWainwrights.filter(
              (fell) => fell.section === section
            );
            const status = getAchievementStatus(targetFells);

            return (
              <AchievementCard
                key={section}
                title={`Completed ${section}`}
                completed={status.completed}
                total={status.total}
                percentage={status.percentage}
                done={status.done}
              />
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-black">Overall Milestones</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overallMilestones.map((target) => {
            const status = getCountAchievementStatus(target);

            return (
                <AchievementCard
                key={target}
                title={target === 214 ? "Complete all 214 Wainwrights" : `Complete ${target} Wainwright${target === 1 ? "" : "s"}`}
                completed={status.completed}
                total={status.total}
                percentage={status.percentage}
                done={status.done}
                />
            );
            })}
        </div>
        </div>

        <div>
        <h2 className="mb-3 text-xl font-black">Peak Bagger</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {peakBaggerMilestones.map((milestone) => {
            const status = getAchievementStatus(milestone.fells);

            return (
                <AchievementCard
                key={milestone.label}
                title={milestone.label}
                completed={status.completed}
                total={status.total}
                percentage={status.percentage}
                done={status.done}
                />
            );
            })}
        </div>
        </div>
    </section>
  );
}

function AchievementCard({
  title,
  completed,
  total,
  percentage,
  done,
}: {
  title: string;
  completed: number;
  total: number;
  percentage: number;
  done: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${
        done
          ? "border-emerald-300 bg-emerald-50"
          : "border-stone-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-stone-950">{title}</h3>
          <p className="mt-1 text-sm text-stone-500">
            {completed} of {total} completed
          </p>
        </div>

        <span className="text-2xl">{done ? "🏆" : "🔒"}</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full ${
            done ? "bg-emerald-700" : "bg-stone-400"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-xs font-bold text-stone-500">
        {percentage}% complete
      </p>
    </article>
  );
}