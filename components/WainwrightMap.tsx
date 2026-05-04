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
import type { Wainwright } from "@/types/wainwright";
import type { WalkingRoute } from "@/lib/getWalkingRoute";

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
  walkingRoute?: WalkingRoute | null;
  onAddRoutePoint: (point: Omit<RoutePoint, "id">) => void;
  onRemoveRoutePoint: (pointId: string) => void;
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

export default function WainwrightMap({
  fells,
  onSelectFell,
  selectedFell,
  isRouteMode,
  routePoints,
  walkingRoute,
  onAddRoutePoint,
  onRemoveRoutePoint,
}: Props) {
  const fallbackRoutePositions = routePoints.map(
    (point) => [point.lat, point.lng] as [number, number]
  );

  const displayedRoute = walkingRoute?.coordinates ?? fallbackRoutePositions;

  return (
    <div className="h-[75vh] w-full overflow-hidden rounded-2xl border border-stone-300">
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

            return (
              <CircleMarker
                key={fell.id}
                center={[fell.latitude, fell.longitude]}
                radius={isSelected ? 11 : isInRoute ? 9 : fell.completed ? 7 : 5}
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
                        : fell.priority
                          ? "#f97316"
                          : "#57534e",
                  fillColor: isSelected
                    ? "#1c1917"
                    : isInRoute
                      ? "#2563eb"
                      : fell.completed
                        ? "#22c55e"
                        : fell.priority
                          ? "#fb923c"
                          : "#a8a29e",
                  fillOpacity: 0.9,
                  weight: isSelected ? 4 : 2,
                }}
              >
                <Popup>
                  <strong>{fell.name}</strong>
                  <br />
                  {fell.heightM}m / {fell.heightFt}ft
                  <br />
                  {fell.section}
                  <br />
                  Completed: {fell.completed ? "Yes" : "No"}
                  <br />
                  {isRouteMode ? (
                    <span className="text-sm font-semibold">
                      Click marker to add to route
                    </span>
                  ) : (
                    <span className="text-sm">Click marker to view details</span>
                  )}
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}