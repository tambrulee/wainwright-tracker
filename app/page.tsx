import wainwrights from "@/data/wainwrights.json";
import type { Wainwright } from "@/types/wainwright";
import WainwrightDashboard from "@/components/WainwrightDashboard";

export default function Home() {
  const fells = wainwrights as unknown as Wainwright[];

  return (
    <main className="min-h-screen bg-[#f4f7f2]">
      <WainwrightDashboard fells={fells} />
    </main>
  );
}