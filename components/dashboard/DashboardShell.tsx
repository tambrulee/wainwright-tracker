"use client";

import type { ReactNode } from "react";
import type { DashboardView } from "@/types/dashboard";
import AuthButton from "@/components/AuthButton";
import Image from "next/image";

type Props = {
  activeView: DashboardView;
  onChangeView: (view: DashboardView) => void;
  children: ReactNode;
};

const navItems: { label: string; value: DashboardView; icon: string }[] = [
  { label: "Overview", value: "overview", icon: "🏠" },
  { label: "Map", value: "map", icon: "🗺️" },
  { label: "Planner", value: "planner", icon: "📅" },
  { label: "Logbook", value: "logbook", icon: "📖" },
];

export default function DashboardShell({
  activeView,
  onChangeView,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-[#f4f7f2] text-stone-950">
      <header className="sticky top-0 z-[9999] border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-6 px-4 sm:px-6">
          <button
            onClick={() => onChangeView("overview")}
            className="flex min-w-0 items-center gap-3"
          >
            <Image
              src="/summitr_logov2.png"
              alt="Summitr logo"
              width={170}
              height={50}
              className="rounded-xl"
            />
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const isActive = activeView === item.value;

              return (
                <button
                  key={item.value}
                  onClick={() => onChangeView(item.value)}
                  className={`relative py-2 text-sm font-bold transition ${
                    isActive
                      ? "text-emerald-800"
                      : "text-stone-500 hover:text-stone-950"
                  }`}
                >
                  {item.label}

                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-[13px] h-0.5 rounded-full bg-emerald-700" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] px-4 pb-24 pt-5 sm:px-6 sm:py-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-[9999] border-t border-stone-200 bg-white/95 px-2 pb-safe pt-2 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const isActive = activeView === item.value;

            return (
              <button
                key={item.value}
                onClick={() => onChangeView(item.value)}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-bold transition ${
                  isActive
                    ? "text-emerald-800"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}