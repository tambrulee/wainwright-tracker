"use client";

import type { DashboardView } from "@/types/dashboard";

type Props = {
  activeView: DashboardView;
  onChangeView: (view: DashboardView) => void;
};

const navItems: { label: string; value: DashboardView }[] = [
  { label: "Overview", value: "overview" },
  { label: "Planner", value: "planner" },
  { label: "Map", value: "map" },
  { label: "Route builder", value: "route" },
  { label: "Saved routes", value: "saved" },
];

export default function DashboardNav({ activeView, onChangeView }: Props) {
  return (
    <header className="sticky top-4 z-40 rounded-full border border-stone-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => onChangeView("overview")}
          className="text-sm font-black uppercase tracking-[0.2em] text-emerald-900"
        >
          214 Planner
        </button>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => onChangeView(item.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === item.value
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}