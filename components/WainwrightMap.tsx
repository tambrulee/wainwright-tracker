"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Wainwright } from "@/types/wainwright";

type Props = {
  fells: Wainwright[];
  onSelectFell: (fellId: string) => void;
  selectedFell?: Wainwright | null;
  routeFellIds: string[];
  onToggleRouteFell: (fellId: string) => void;
};

function FlyToFell({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1.2 });
  }, [lat, lng, map]);

  return null;
}

export default function WainwrightMap({
  fells,
  onSelectFell,
  selectedFell,
  routeFellIds,
  onToggleRouteFell,
}: Props) {
  return (
    <div className="h-[75vh] w-full overflow-hidden rounded-2xl border border-stone-300">
      <MapContainer
        center={[54.5, -3.1]}
        zoom={10}
        scrollWheelZoom
        className="h-full w-full"
      >
        {selectedFell &&
          typeof selectedFell.latitude === "number" &&
          typeof selectedFell.longitude === "number" && (
            <FlyToFell lat={selectedFell.latitude} lng={selectedFell.longitude} />
          )}

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {fells
          .filter(
            (fell) =>
              typeof fell.latitude === "number" &&
              typeof fell.longitude === "number"
          )
          .map((fell) => {
            const isSelected = selectedFell?.id === fell.id;
            const isInRoute = routeFellIds.includes(fell.id);

            return (
              <CircleMarker
                key={fell.id}
                center={[fell.latitude, fell.longitude]}
                radius={isSelected ? 11 : isInRoute ? 9 : fell.completed ? 7 : 5}
                eventHandlers={{
                  click: () => onSelectFell(fell.id),
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
                  <button
                    onClick={() => onToggleRouteFell(fell.id)}
                    className="mt-2 rounded bg-stone-900 px-2 py-1 text-white"
                  >
                    {isInRoute ? "Remove from route" : "Add to route"}
                  </button>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}