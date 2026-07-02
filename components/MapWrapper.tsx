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

type RouteSummary = {
  distanceKm: number;
  durationHours: number;
  ascentM: number;
  descentM: number;
};

type Props = {
  fells: Wainwright[];
  onSelectFell: (fellId: string) => void;
  selectedFell?: Wainwright | null;
  isRouteMode: boolean;
  routePoints: RoutePoint[];
  onAddRoutePoint: (point: Omit<RoutePoint, "id">) => void;
  onRemoveRoutePoint: (pointId: string) => void;
  onRouteSummaryChange?: (summary: RouteSummary | null) => void;
  onToggleCompleted: (fell: Wainwright) => void;
  onTogglePriority: (fell: Wainwright) => void;
  onSetPlannedDate: (fell: Wainwright, plannedDate: string | null) => void;
};

function calculateElevationTotals(
  elevationProfile?: { distanceKm: number; elevationM: number }[]
) {
  let ascentM = 0;
  let descentM = 0;

  if (!elevationProfile || elevationProfile.length < 2) {
    return { ascentM, descentM };
  }

  for (let i = 1; i < elevationProfile.length; i++) {
    const change =
      elevationProfile[i].elevationM - elevationProfile[i - 1].elevationM;

    if (change > 0) ascentM += change;
    if (change < 0) descentM += Math.abs(change);
  }

  return {
    ascentM: Math.round(ascentM),
    descentM: Math.round(descentM),
  };
}

export default function MapWrapper({
  fells,
  onSelectFell,
  selectedFell,
  isRouteMode,
  routePoints,
  onAddRoutePoint,
  onRemoveRoutePoint,
  onRouteSummaryChange,
  onToggleCompleted,
  onTogglePriority,
  onSetPlannedDate,
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
        const elevationTotals = {
          ascentM: route.ascentM ?? calculateElevationTotals(route.elevationProfile).ascentM,
          descentM: route.descentM ?? calculateElevationTotals(route.elevationProfile).descentM,
        };

        setWalkingRoute(route);

        onRouteSummaryChange?.({
          distanceKm: route.distanceKm,
          durationHours: route.durationHours,
          ascentM: elevationTotals.ascentM,
          descentM: elevationTotals.descentM,
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
  }, [routePoints, onRouteSummaryChange]);

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
        onToggleCompleted={onToggleCompleted}
        onTogglePriority={onTogglePriority}
        onSetPlannedDate={onSetPlannedDate}
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
              {walkingRoute.durationHours.toFixed(1)} hrs · ↑{" "}
              {walkingRoute.ascentM ?? calculateElevationTotals(walkingRoute.elevationProfile).ascentM}m
              {walkingRoute.descentM ?? calculateElevationTotals(walkingRoute.elevationProfile).descentM}m
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