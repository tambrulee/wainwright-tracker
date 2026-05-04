"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { Wainwright } from "@/types/wainwright";
import { getWalkingRoute, type WalkingRoute } from "@/lib/getWalkingRoute";
import ElevationProfile from "@/components/ElevationProfile";

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
  const [walkingRoute, setWalkingRoute] = useState<WalkingRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const routeFells = useMemo(
    () =>
      routeFellIds
        .map((id) => fells.find((fell) => fell.id === id))
        .filter(Boolean) as Wainwright[],
    [fells, routeFellIds]
  );

  useEffect(() => {
    async function buildRoute() {
      if (routeFells.length < 2) {
        setWalkingRoute(null);
        setRouteError(null);
        return;
      }

      try {
        setRouteLoading(true);
        setRouteError(null);

        const route = await getWalkingRoute(routeFells);
        setWalkingRoute(route);
      } catch (error) {
        console.error(error);
        setWalkingRoute(null);
        setRouteError("Could not build routed path.");
      } finally {
        setRouteLoading(false);
      }
    }

    buildRoute();
  }, [routeFells]);

  return (
    <div className="relative">
      <WainwrightMap
        fells={fells}
        onSelectFell={onSelectFell}
        selectedFell={selectedFell}
        routeFellIds={routeFellIds}
        onToggleRouteFell={onToggleRouteFell}
        walkingRoute={walkingRoute}
      />


      {(routeLoading || routeError || walkingRoute) && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white px-4 py-3 text-sm font-semibold text-stone-900 shadow-lg">
          {routeLoading && "Building walking route..."}
          {routeError && <span className="text-red-700">{routeError}</span>}
          {walkingRoute && !routeLoading && !routeError && (
            <span>
              Route: {walkingRoute.distanceKm.toFixed(1)} km · approx{" "}
              {walkingRoute.durationHours.toFixed(1)} hrs
            </span>
          )}
        </div>
      )}
      {walkingRoute && (
        <div className="mt-6">
          <ElevationProfile route={walkingRoute} />
        </div>
      )}
    </div>
  );
}