"use client";

import dynamic from "next/dynamic";
import type { Wainwright } from "@/types/wainwright";

const WainwrightMap = dynamic(() => import("@/components/WainwrightMap"), {
  ssr: false,
});

export default function MapWrapper({ fells }: { fells: Wainwright[] }) {
  return <WainwrightMap fells={fells} />;
}