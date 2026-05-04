import wainwrights from "@/data/wainwrights.json";
import type { Wainwright } from "@/types/wainwright";
import WainwrightDashboard from "@/components/WainwrightDashboard";

export default function Home() {
  const fells = wainwrights as Wainwright[];

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
        </header>

        <WainwrightDashboard fells={fells} />
      </div>
    </main>
  );
}