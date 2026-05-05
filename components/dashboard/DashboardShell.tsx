"use client";

import type { ReactNode } from "react";
import type { DashboardView } from "@/types/dashboard";
import DashboardNav from "./DashboardNav";

type Props = {
  activeView: DashboardView;
  onChangeView: (view: DashboardView) => void;
  children: ReactNode;
};

export default function DashboardShell({
  activeView,
  onChangeView,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-[#f4f7f2] px-6 py-8 text-stone-950">
      <div className="mx-auto max-w-[1500px] space-y-8">
        <DashboardNav activeView={activeView} onChangeView={onChangeView} />
        {children}
      </div>
    </div>
  );
}