"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Wainwright } from "@/types/wainwright";

type Props = {
  fells: Wainwright[];
  onSelectFell: (fellId: string) => void;
};

export default function WainwrightMap({ fells, onSelectFell }: Props) {
  return (
    <div className="h-[75vh] w-full overflow-hidden rounded-2xl border">
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

        {fells
          .filter((fell) => typeof fell.latitude === "number" && typeof fell.longitude === "number")
          .map((fell) => (
          <CircleMarker
            key={fell.id}
            center={[fell.latitude, fell.longitude]}
            radius={fell.completed ? 7 : 5}
            eventHandlers={{
              click: () => onSelectFell(fell.id),
            }}
            pathOptions={{
              color: fell.completed ? "green" : fell.priority ? "orange" : "gray",
              fillColor: fell.completed ? "green" : fell.priority ? "orange" : "gray",
              fillOpacity: 0.8,
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
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}