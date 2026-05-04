import wainwrights from "@/data/wainwrights.json";
import type { Wainwright } from "@/types/wainwright";
import MapWrapper from "@/components/MapWrapper";
import ProgressStats from "@/components/ProgressStats";

export default function Home() {
  const fells = wainwrights as Wainwright[];
  const completedCount = fells.filter((fell) => fell.completed).length;

  return (
    <main className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm uppercase tracking-wide text-stone-500">
            Lake District tracker
          </p>

          <h1 className="text-4xl font-bold text-stone-900">
            Wainwright Tracker
          </h1>

          <p className="mt-2 text-stone-600">
            {completedCount} / {fells.length} completed
          </p>
        </header>

        <ProgressStats fells={fells} />
        <MapWrapper fells={fells} />
      </div>
    </main>
  );
}