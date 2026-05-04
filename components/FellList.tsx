import type { Wainwright } from "@/types/wainwright";

type Props = {
  fells: Wainwright[];
  onSelectFell: (fellId: string) => void;
};

export default function FellList({ fells, onSelectFell }: Props) {
  return (
    <div className="max-h-[75vh] overflow-y-auto rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-bold text-stone-950">Fells</h2>

      <div className="space-y-2">
        {fells.map((fell) => (
          <button
            key={fell.id}
            onClick={() => onSelectFell(fell.id)}
            className="w-full rounded-xl border border-stone-300 bg-white p-3 text-left text-stone-900 hover:bg-stone-100"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-stone-950">{fell.name}</span>
              <span className="text-sm font-medium text-stone-700">
                {fell.heightM}m
              </span>
            </div>

            <p className="mt-1 text-sm text-stone-700">{fell.section}</p>

            <div className="mt-2 flex gap-2 text-sm text-stone-800">
              {fell.completed && <span>✅ Done</span>}
              {fell.planned && <span>📍 Planned</span>}
              {fell.priority && <span>⭐ Priority</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}