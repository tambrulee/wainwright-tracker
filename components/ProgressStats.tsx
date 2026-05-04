import type { Wainwright } from "@/types/wainwright";

export default function ProgressStats({ fells }: { fells: Wainwright[] }) {
  const completed = fells.filter((fell) => fell.completed).length;
  const planned = fells.filter((fell) => fell.planned).length;
  const priority = fells.filter((fell) => fell.priority).length;
  const percentage = Math.round((completed / fells.length) * 100);

  const stats = [
    { label: "Completed", value: `${completed} / ${fells.length}` },
    { label: "Progress", value: `${percentage}%` },
    { label: "Planned", value: planned },
    { label: "Priority", value: priority },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-medium text-stone-700">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold text-stone-950">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}