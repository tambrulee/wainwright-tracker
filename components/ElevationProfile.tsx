"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WalkingRoute } from "@/lib/getWalkingRoute";

type Props = {
  route: WalkingRoute;
};

export default function ElevationProfile({ route }: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-700">
          Elevation profile
        </p>
        <h2 className="text-2xl font-bold text-stone-950">
          Route climb
        </h2>
        <p className="mt-1 text-sm font-medium text-stone-700">
          {route.distanceKm.toFixed(1)} km · approx{" "}
          {route.durationHours.toFixed(1)} hrs
          {route.ascentM ? ` · ${Math.round(route.ascentM)}m ascent` : ""}
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={route.elevationProfile}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="distanceKm"
              tickFormatter={(value) => `${Number(value).toFixed(1)}km`}
            />
            <YAxis
              tickFormatter={(value) => `${value}m`}
              width={55}
            />
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toFixed(0)}m`,
                name === "elevationM" ? "Elevation" : name,
              ]}
              labelFormatter={(value) =>
                `Distance: ${Number(value).toFixed(2)} km`
              }
            />
            <Area
              type="monotone"
              dataKey="elevationM"
              stroke="#166534"
              fill="#bbf7d0"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}