"use client";

import type { ReactNode } from "react";
import type { DashboardView } from "@/types/dashboard";
import AuthButton from "@/components/AuthButton";
import DashboardNav from "@/components/dashboard/DashboardNav";

type Props = {
  activeView: DashboardView;
  onChangeView: (view: DashboardView) => void;
  children: ReactNode;
};

const navItems: { label: string; value: DashboardView }[] = [
  { label: "Overview", value: "overview" },
  { label: "Planner", value: "planner" },
  { label: "Map", value: "map" },
];

export default function DashboardShell({
  activeView,
  onChangeView,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-[#f4f7f2] text-stone-950">
      <header className="sticky top-0 z-[9999] border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">
          <button
            onClick={() => onChangeView("overview")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-900 text-sm font-black text-white">
              214
            </div>

            <div className="text-left">
              <p className="text-sm font-black tracking-wide text-stone-950">
                Wainwright Planner
              </p>
              <p className="text-xs font-semibold text-stone-500">
                Lake District tracker
              </p>
            </div>
          </button>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onChangeView(item.value)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  activeView === item.value
                    ? "bg-emerald-900 text-white"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <AuthButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] px-6 py-8">
        {children}
      </main>
    </div>
  );
}