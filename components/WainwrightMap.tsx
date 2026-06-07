"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
  Marker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Wainwright } from "@/types/wainwright";
import type { WalkingRoute } from "@/lib/getWalkingRoute";

type MapFell = Wainwright & {
  completed?: boolean;
  priority?: boolean;
  plannedDate?: string | null;
};

type RoutePoint = {
  id: string;
  type: "fell" | "custom";
  lat: number;
  lng: number;
  name: string;
  fellId?: string;
};

type Props = {
  fells: MapFell[];
  onSelectFell: (fellId: string) => void;
  selectedFell?: MapFell | null;
  isRouteMode: boolean;
  routePoints: RoutePoint[];
  walkingRoute?: WalkingRoute | null;
  onAddRoutePoint: (point: Omit<RoutePoint, "id">) => void;
  onRemoveRoutePoint: (pointId: string) => void;
  onToggleCompleted: (fell: MapFell) => void;
  onTogglePriority: (fell: MapFell) => void;
};

function FlyToFell({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1.2 });
  }, [lat, lng, map]);

  return null;
}

function RouteClickHandler({
  isRouteMode,
  onAddRoutePoint,
}: {
  isRouteMode: boolean;
  onAddRoutePoint: (point: Omit<RoutePoint, "id">) => void;
}) {
  useMapEvents({
    click(e) {
      if (!isRouteMode) return;

      onAddRoutePoint({
        type: "custom",
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        name: "Custom point",
      });
    },
  });

  return null;
}

const RoutePointIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      border-radius: 9999px;
      background: #2563eb;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function WainwrightMap({
  fells,
  onSelectFell,
  selectedFell,
  isRouteMode,
  routePoints,
  walkingRoute,
  onAddRoutePoint,
  onRemoveRoutePoint,
  onToggleCompleted,
  onTogglePriority,
}: Props) {
  const fallbackRoutePositions = routePoints.map(
    (point) => [point.lat, point.lng] as [number, number]
  );

  const displayedRoute = walkingRoute?.coordinates ?? fallbackRoutePositions;


  const legendItems = [
    { label: "Selected", border: "#1c1917", fill: "#1c1917", size: 22 },
    { label: "In route", border: "#2563eb", fill: "#2563eb", size: 18 },
    { label: "Completed", border: "#15803d", fill: "#22c55e", size: 14 },
    { label: "Planned", border: "#2563eb", fill: "#60a5fa", size: 12 },
    { label: "Priority", border: "#f97316", fill: "#fb923c", size: 10 },
    { label: "Not started", border: "#57534e", fill: "#a8a29e", size: 10 },
  ];

  return (

    
    <div className="h-[75vh] w-full overflow-hidden rounded-2xl border border-stone-300">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-stone-500">
          Map legend
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="inline-block rounded-full"
                style={{
                  width: item.size,
                  height: item.size,
                  backgroundColor: item.fill,
                  border: `2px solid ${item.border}`,
                }}
              />
              <span className="text-sm text-stone-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <MapContainer
        center={[54.5, -3.1]}
        zoom={10}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RouteClickHandler
          isRouteMode={isRouteMode}
          onAddRoutePoint={onAddRoutePoint}
        />

        {displayedRoute.length > 1 && (
          <Polyline
            positions={displayedRoute}
            pathOptions={{
              color: walkingRoute ? "#16a34a" : "#2563eb",
              weight: 4,
              opacity: 0.9,
            }}
          />
        )}

        {routePoints.map((point, index) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={RoutePointIcon}
            eventHandlers={{
              click: () => {
                if (isRouteMode) onRemoveRoutePoint(point.id);
              },
            }}
          >
            <Popup>
              <strong>
                {index + 1}. {point.name}
              </strong>
              <br />
              {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
              <br />
              {isRouteMode && <span>Click marker to remove it.</span>}
            </Popup>
          </Marker>
        ))}

        {selectedFell &&
          typeof selectedFell.latitude === "number" &&
          typeof selectedFell.longitude === "number" && (
            <FlyToFell
              lat={selectedFell.latitude}
              lng={selectedFell.longitude}
            />
          )}

        {fells
          .filter(
            (fell) =>
              typeof fell.latitude === "number" &&
              typeof fell.longitude === "number"
          )
          .map((fell) => {
            const isSelected = selectedFell?.id === fell.id;
            const isInRoute = routePoints.some(
              (point) => point.fellId === fell.id
            );
            const isPlanned = Boolean(fell.plannedDate);

            return (
              <CircleMarker
                key={fell.id}
                center={[fell.latitude, fell.longitude]}
                radius={
                  isSelected
                    ? 11
                    : isInRoute
                    ? 9
                    : fell.completed
                    ? 7
                    : isPlanned
                    ? 6
                    : 5
                }
                eventHandlers={{
                  click: () => {
                    if (isRouteMode) {
                      onAddRoutePoint({
                        type: "fell",
                        fellId: fell.id,
                        lat: fell.latitude,
                        lng: fell.longitude,
                        name: fell.name,
                      });
                      return;
                    }

                    onSelectFell(fell.id);
                  },
                }}
                pathOptions={{
                  color: isSelected
                    ? "#1c1917"
                    : isInRoute
                    ? "#2563eb"
                    : fell.completed
                    ? "#15803d"
                    : isPlanned
                    ? "#2563eb"
                    : fell.priority
                    ? "#f97316"
                    : "#57534e",
                  fillColor: isSelected
                    ? "#1c1917"
                    : isInRoute
                    ? "#2563eb"
                    : fell.completed
                    ? "#22c55e"
                    : isPlanned
                    ? "#60a5fa"
                    : fell.priority
                    ? "#fb923c"
                    : "#a8a29e",
                  fillOpacity: 0.9,
                  weight: isSelected ? 4 : isInRoute || isPlanned ? 3 : 2,
                }}
              >
                <Popup>
                  <div className="space-y-2">
                    <strong>{fell.name}</strong>
                    <br />
                    {fell.section}
                    <br />
                    {fell.heightM}m · Rank #{fell.heightRank}

                    {fell.plannedDate && (
                      <p className="text-sm">
                        Planned:{" "}
                        {new Date(fell.plannedDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button onClick={() => onSelectFell(fell.id)}>
                        View
                      </button>

                      <button onClick={() => onTogglePriority(fell)}>
                        {fell.priority ? "Unpriority" : "Priority"}
                      </button>

                      <button onClick={() => onToggleCompleted(fell)}>
                        {fell.completed ? "Undo" : "Complete"}
                      </button>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}