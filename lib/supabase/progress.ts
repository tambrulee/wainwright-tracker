import type { FellProgress } from "@/types/progress";
import { createClient } from "@/lib/supabase/client";

type ProgressState = Record<string, FellProgress>;

export async function loadProgressFromSupabase(): Promise<ProgressState> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return {};

  const { data, error } = await supabase
    .from("fell_progress")
    .select("fell_id, completed, completed_date, priority, planned, planned_date")
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return {};
  }

  const progress: ProgressState = {};

  data?.forEach((row) => {
    progress[row.fell_id] = {
      completed: row.completed,
      completedDate: row.completed_date,
      priority: row.priority,
      planned: row.planned,
      plannedDate: row.planned_date,
    };
  });

  return progress;
}

export async function saveFellProgressToSupabase(
  fellId: string,
  updates: FellProgress
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("fell_progress").upsert(
    {
      user_id: user.id,
      fell_id: fellId,
      completed: updates.completed ?? false,
      completed_date: updates.completedDate ?? null,
      priority: updates.priority ?? false,
      planned: updates.planned ?? false,
      planned_date: updates.plannedDate || null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,fell_id",
    }
  );

  if (error) {
    console.error(error);
  }
}