"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Wainwright } from "@/types/wainwright";
import wainwrights from "@/data/wainwrights.json";

const allWainwrights = wainwrights as Wainwright[];

type FellProgress = {
  id: string;
  user_id: string;
  fell_id: string;
  completed: boolean;
  completed_date: string | null;
  priority: boolean;
  notes: string | null;
  planned: boolean;
  planned_date: string | null;
};

type Visit = {
  id: string;
  user_id: string;
  fell_id: string;
  completed_date: string;
  notes: string | null;
};

function getFell(fellId: string) {
  return allWainwrights.find((w) => w.id === fellId);
}

function getFellNumber(fellId: string) {
  return getFell(fellId)?.heightRank ?? null;
}

function getFellHeight(fellId: string) {
  return getFell(fellId)?.heightM ?? null;
}

export default function WainwrightLogbook() {
  const supabase = createClient();

  const [progress, setProgress] = useState<FellProgress[]>([]);
  const fells = allWainwrights;
  const [visits, setVisits] = useState<Visit[]>([]);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "not-completed"
  >("all");
  const [sortBy, setSortBy] = useState<
    "number" | "name" | "height" | "firstCompleted" | "timesDone"
  >("number");

  useEffect(() => {
    async function loadLogbook() {
        const { data: progressData, error: progressError } = await supabase
        .from("fell_progress")
        .select("*")
        .order("fell_id");

        const { data: visitData, error: visitError } = await supabase
        .from("wainwright_visits")
        .select("*")
        .order("completed_date", { ascending: true });

        if (progressError) console.error(progressError);
        if (visitError) console.error(visitError);

        setProgress(progressData ?? []);
        setVisits(visitData ?? []);
    }

    void loadLogbook();
    }, [supabase]);

  const visitsByFell = useMemo(() => {
        return visits.reduce<Record<string, Visit[]>>((acc, visit) => {
        acc[visit.fell_id] ??= [];
        acc[visit.fell_id].push(visit);
        return acc;
        }, {});
    }, [visits]);

    const progressByFell = useMemo(() => {
        return progress.reduce<Record<string, FellProgress>>((acc, item) => {
            acc[item.fell_id] = item;
            return acc;
        }, {});
        }, [progress]);

    async function addVisit(fell: Wainwright) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
        .from("wainwright_visits")
        .insert({
        user_id: user.id,
        fell_id: fell.id,
        completed_date: today,
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        return;
    }

    setVisits((current) => [...current, data]);
    }

  async function saveVisitDate(visitId: string) {
    const { data, error } = await supabase
      .from("wainwright_visits")
      .update({ completed_date: editingDate })
      .eq("id", visitId)
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setVisits((current) =>
      current.map((visit) => (visit.id === visitId ? data : visit))
    );

    setEditingVisitId(null);
    setEditingDate("");
  }

  async function deleteVisit(visitId: string) {
    const { error } = await supabase
      .from("wainwright_visits")
      .delete()
      .eq("id", visitId);

    if (error) {
      console.error(error);
      return;
    }

    setVisits((current) => current.filter((visit) => visit.id !== visitId));
  }

  function getFellName(fellId: string) {
    const fell = wainwrights.find((w) => w.id === fellId);
    return fell?.name ?? fellId;
    }
  
  const filteredFells = useMemo(() => {
    return [...fells]
        .filter((fell) => {
        const fellVisits = visitsByFell[fell.id] ?? [];
        const progressItem = progressByFell[fell.id];
        const completed = fellVisits.length > 0 || progressItem?.completed === true;
        const name = fell.name.toLowerCase();

        if (searchTerm && !name.includes(searchTerm.toLowerCase())) {
            return false;
        }

        if (statusFilter === "completed" && !completed) {
            return false;
        }

        if (statusFilter === "not-completed" && completed) {
            return false;
        }

        return true;
        })
        .sort((a, b) => {
        const aVisits = visitsByFell[a.id] ?? [];
        const bVisits = visitsByFell[b.id] ?? [];

        if (sortBy === "name") {
            return getFellName(a.id).localeCompare(getFellName(b.id));
        }

        if (sortBy === "firstCompleted") {
            const aDate = aVisits[0]?.completed_date ?? "9999-12-31";
            const bDate = bVisits[0]?.completed_date ?? "9999-12-31";
            return aDate.localeCompare(bDate);
        }

        if (sortBy === "timesDone") {
            return bVisits.length - aVisits.length;
        }

        if (sortBy === "number") {
        return (getFellNumber(a.id) ?? 999) - (getFellNumber(b.id) ?? 999);
        }

        if (sortBy === "height") {
        return (getFellHeight(b.id) ?? 0) - (getFellHeight(a.id) ?? 0);
        }

        if (sortBy === "number") {
        return (getFellNumber(a.id) ?? 999) - (getFellNumber(b.id) ?? 999);
        }

        if (sortBy === "height") {
        return (getFellHeight(b.id) ?? 0) - (getFellHeight(a.id) ?? 0);
        }

        return 0;
        });
    }, [fells, visitsByFell, searchTerm, statusFilter, sortBy, progressByFell]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wainwright Logbook</h1>
        <p className="text-sm text-stone-600">
          Completion history, repeat ascents, and editable dates.
        </p>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <input
            type="search"
            placeholder="Search Wainwrights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm md:w-72"
        />

        <div className="flex gap-2">
            <select
            value={statusFilter}
            onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "completed" | "not-completed")
            }
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="not-completed">Not completed</option>
            </select>

            <select
            value={sortBy}
            onChange={(e) =>
                setSortBy(e.target.value as "name" | "firstCompleted" | "timesDone")
            }
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
            <option value="name">Sort by name</option>
            <option value="firstCompleted">Sort by first completed</option>
            <option value="timesDone">Sort by times done</option>
            </select>
        </div>
        </div>

      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-stone-100 text-stone-700">
            <tr>
              <th className="px-4 py-3">Wainwright</th>
              <th className="px-4 py-3">Completed?</th>
              <th className="px-4 py-3">First completed</th>
              <th className="px-4 py-3">Times done</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Add</th>
            </tr>
          </thead>

            <tbody>
            {filteredFells.map((fell) => {
                const fellVisits = visitsByFell[fell.id] ?? [];
                const progressItem = progressByFell[fell.id];

                const completed = fellVisits.length > 0 || progressItem?.completed === true;

                const firstCompleted =
                fellVisits[0]?.completed_date ??
                progressItem?.completed_date ??
                "—";

                const timesDone = Math.max(fellVisits.length, completed ? 1 : 0);

                return (
                <tr key={fell.id} className="border-t border-stone-100">
                    <td className="px-4 py-3 text-stone-500">
                    {fell.heightRank}
                    </td>

                    <td className="px-4 py-3 font-medium">
                    {fell.name}
                    </td>

                    <td className="px-4 py-3 text-stone-500">
                    {fell.heightM}m
                    </td>

                    <td className="px-4 py-3">{completed ? "✅ Yes" : "No"}</td>

                    <td className="px-4 py-3">{firstCompleted}</td>

                    <td className="px-4 py-3">{timesDone}</td>

                    <td className="px-4 py-3">
                    <div className="space-y-2">
                        {fellVisits.length === 0 && (
                        <span className="text-stone-400">No dates yet</span>
                        )}

                        {fellVisits.map((visit) => (
                        <div key={visit.id} className="flex items-center gap-2">
                            {editingVisitId === visit.id ? (
                            <>
                                <input
                                type="date"
                                value={editingDate}
                                onChange={(e) => setEditingDate(e.target.value)}
                                className="rounded border border-stone-300 px-2 py-1"
                                />

                                <button
                                onClick={() => saveVisitDate(visit.id)}
                                className="rounded bg-stone-900 px-2 py-1 text-xs text-white"
                                >
                                Save
                                </button>
                            </>
                            ) : (
                            <>
                                <span>{visit.completed_date}</span>

                                <button
                                onClick={() => {
                                    setEditingVisitId(visit.id);
                                    setEditingDate(visit.completed_date);
                                }}
                                className="text-xs text-blue-700 underline"
                                >
                                Edit
                                </button>

                                <button
                                onClick={() => deleteVisit(visit.id)}
                                className="text-xs text-red-700 underline"
                                >
                                Delete
                                </button>
                            </>
                            )}
                        </div>
                        ))}
                    </div>
                    </td>

                    <td className="px-4 py-3">
                    <button
                        onClick={() => addVisit(fell)}
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white"
                    >
                        Add today
                    </button>
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>
      </div>
    </section>
  );
}