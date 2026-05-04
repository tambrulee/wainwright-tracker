import type { Wainwright } from "@/types/wainwright";

export default function ProgressStats({ fells }: { fells: Wainwright[] }) {
  const completed = fells.filter((fell) => fell.completed).length;
  const planned = fells.filter((fell) => fell.planned).length;
  const priority = fells.filter((fell) => fell.priority).length;
  const percentage = Math.round((completed / fells.length) * 100);

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-stone-500">Completed</p>
        <p className="text-2xl font-bold">{completed} / {fells.length}</p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-stone-500">Progress</p>
        <p className="text-2xl font-bold">{percentage}%</p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-stone-500">Planned</p>
        <p className="text-2xl font-bold">{planned}</p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-stone-500">Priority</p>
        <p className="text-2xl font-bold">{priority}</p>
      </div>
    </div>
  );
}