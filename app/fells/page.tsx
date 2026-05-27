import fells from "@/data/wainwrights.json";
import FellPlanner from "@/components/fells/FellPlanner";

export default function FellsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <FellPlanner fells={fells} />
    </main>
  );
}