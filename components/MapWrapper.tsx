"use client";

import dynamic from "next/dynamic";
import type { Wainwright } from "@/types/wainwright";

const WainwrightMap = dynamic(() => import("@/components/WainwrightMap"), {
  ssr: false,
});

type Props = {
  fells: Wainwright[];
  onSelectFell: (fellId: string) => void;
  selectedFell?: Wainwright | null;
  routeFellIds: string[];
  onToggleRouteFell: (fellId: string) => void;
};

export default function MapWrapper({
  fells,
  onSelectFell,
  selectedFell,
  routeFellIds,
  onToggleRouteFell,
}: Props) {
  return (
    <WainwrightMap
      fells={fells}
      onSelectFell={onSelectFell}
      selectedFell={selectedFell}
      routeFellIds={routeFellIds}
      onToggleRouteFell={onToggleRouteFell}
    />
  );
}