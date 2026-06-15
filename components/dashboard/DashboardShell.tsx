"use client";

import type { ReactNode } from "react";
import type { DashboardView } from "@/types/dashboard";
import AuthButton from "@/components/AuthButton";

type Props = {
  activeView: DashboardView;
  onChangeView: (view: DashboardView) => void;
  children: ReactNode;
};

const navItems: { label: string; value: DashboardView }[] = [
  { label: "Overview", value: "overview" },
  { label: "Map", value: "map" },
  { label: "Planner", value: "planner" },
];

export default function DashboardShell({
  activeView,
  onChangeView,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-[#f4f7f2] text-stone-950">
      <header className="sticky top-0 z-[9999] border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onChangeView("overview")}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-sm font-black text-white">
                214
              </div>

              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-black tracking-wide text-stone-950">
                  Wainwright Planner
                </p>
                <p className="truncate text-xs font-semibold text-stone-500">
                  Lake District tracker
                </p>
              </div>
            </button>

            <div className="shrink-0 lg:hidden">
              <AuthButton />
            </div>
          </div>

          <nav className="grid grid-cols-3 gap-2 rounded-2xl bg-stone-100 p-1 lg:flex lg:items-center lg:gap-1 lg:bg-transparent lg:p-0">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onChangeView(item.value)}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition lg:rounded-full lg:px-4 ${
                  activeView === item.value
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-stone-700 hover:bg-stone-200 lg:bg-stone-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden shrink-0 lg:block">
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}