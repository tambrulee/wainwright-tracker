import type { Wainwright } from "@/types/wainwright";

type Props = {
  fells: Wainwright[];
  onSelectFell: (fellId: string) => void;
};

export default function FellList({ fells, onSelectFell }: Props) {
  return (
    <div className="max-h-[75vh] overflow-y-auto rounded-[1.75rem] border border-white/80 bg-white/80 p-4 shadow-lg shadow-stone-200/60 backdrop-blur">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
            Fells
          </p>
          <h2 className="text-xl font-black text-stone-950">
            {fells.length} showing
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {fells.map((fell) => (
          <button
            key={fell.id}
            onClick={() => onSelectFell(fell.id)}
            className={[
              "w-full rounded-2xl border p-4 text-left transition",
              "hover:-translate-y-0.5 hover:shadow-md",
              fell.completed
                ? "border-green-200 bg-green-50/80"
                : "border-stone-200 bg-white",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-stone-950">{fell.name}</h3>
                <p className="mt-1 text-sm font-medium text-stone-600">
                  {fell.section}
                </p>
              </div>

              <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-bold text-stone-800">
                {fell.heightM}m
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              {fell.completed && (
                <span className="rounded-full bg-green-700 px-3 py-1 text-white">
                  Done
                </span>
              )}

              {fell.planned && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-900">
                  Planned
                </span>
              )}

              {fell.priority && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
                  Priority
                </span>
              )}

              {!fell.completed && !fell.planned && !fell.priority && (
                <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-600">
                  Not started
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}