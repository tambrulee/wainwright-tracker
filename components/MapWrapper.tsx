"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Wainwright } from "@/types/wainwright";
import { getWalkingRoute, type WalkingRoute } from "@/lib/getWalkingRoute";
import ElevationProfile from "@/components/ElevationProfile";

const WainwrightMap = dynamic(() => import("@/components/WainwrightMap"), {
  ssr: false,
});

type RoutePoint = {
  id: string;
  type: "fell" | "custom";
  lat: number;
  lng: number;
  name: string;
  fellId?: string;
};

type Props = {
  fells: Wainwright[];
  onSelectFell: (fellId: string) => void;
  selectedFell?: Wainwright | null;
  isRouteMode: boolean;
  routePoints: RoutePoint[];
  onAddRoutePoint: (point: Omit<RoutePoint, "id">) => void;
  onRemoveRoutePoint: (pointId: string) => void;
  onRouteSummaryChange?: (summary: {
    distanceKm: number;
    durationHours: number;
  } | null) => void;
};

export default function MapWrapper({
  fells,
  onSelectFell,
  selectedFell,
  isRouteMode,
  routePoints,
  onAddRoutePoint,
  onRemoveRoutePoint,
  onRouteSummaryChange,
}: Props) {
  const [walkingRoute, setWalkingRoute] = useState<WalkingRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    async function buildRoute() {
      if (routePoints.length < 2) {
        setWalkingRoute(null);
        setRouteError(null);
        onRouteSummaryChange?.(null);
        return;
      }

      try {
        setRouteLoading(true);
        setRouteError(null);

        const routeInputs = routePoints.map((point) => ({
          id: point.id,
          name: point.name,
          latitude: point.lat,
          longitude: point.lng,
        })) as Wainwright[];

        const route = await getWalkingRoute(routeInputs);
        setWalkingRoute(route);
        onRouteSummaryChange?.({
          distanceKm: route.distanceKm,
          durationHours: route.durationHours,
        });
      } catch (error) {
        console.error(error);
        setWalkingRoute(null);
        setRouteError("Could not snap route to paths.");
        onRouteSummaryChange?.(null);
      } finally {
        setRouteLoading(false);
      }
    }

    buildRoute();
    
  }, [routePoints]);

  return (
    <div className="relative">
      <WainwrightMap
        fells={fells}
        onSelectFell={onSelectFell}
        selectedFell={selectedFell}
        isRouteMode={isRouteMode}
        routePoints={routePoints}
        walkingRoute={walkingRoute}
        onAddRoutePoint={onAddRoutePoint}
        onRemoveRoutePoint={onRemoveRoutePoint}
      />

      {(routeLoading || routeError || walkingRoute || isRouteMode) && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white px-4 py-3 text-sm font-semibold text-stone-900 shadow-lg">
          {isRouteMode && !routeLoading && !routeError && !walkingRoute && (
            <span>Route mode: click map or fells to add points</span>
          )}

          {routeLoading && "Snapping route to paths..."}

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