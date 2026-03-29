"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { SearchResult } from "@/lib/types";

const PICKUP_TYPE_COLORS: Record<string, string> = {
  SELF_PICKUP: "#2563eb",
  KEY_DELIVERY: "#16a34a",
  MEET_GREET: "#d97706",
};

const PICKUP_TYPE_LABELS: Record<string, string> = {
  SELF_PICKUP: "Self Pickup",
  KEY_DELIVERY: "Key Delivery",
  MEET_GREET: "Meet & Greet",
};

interface MapViewProps {
  results: SearchResult[];
  selectedId: string | null;
  onSelectPickupPoint: (id: string) => void;
}

export default function MapView({
  results,
  selectedId,
  onSelectPickupPoint,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialise the Leaflet map (runs once on mount)
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      center: [41.4146, 19.7216], // [lat, lng] – Tirana, Albania
      zoom: 14,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers whenever results change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const result of results) {
      const { pickupPoint, dealerName, availableCarCount } = result;
      const color = PICKUP_TYPE_COLORS[pickupPoint.type] ?? "#6b7280";
      const typeLabel = PICKUP_TYPE_LABELS[pickupPoint.type] ?? pickupPoint.type;

      // Custom teardrop-shaped marker icon
      const el = document.createElement("div");
      el.style.cssText = `
        background: ${color};
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        border: 2px solid white;
        cursor: pointer;
      `;
      const inner = document.createElement("span");
      inner.style.transform = "rotate(45deg)";
      inner.textContent = String(availableCarCount);
      el.appendChild(inner);

      const icon = L.divIcon({
        html: el.outerHTML,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [36, 36], // anchor at bottom-right (the tip of the teardrop)
      });

      const marker = L.marker([pickupPoint.lat, pickupPoint.lng], { icon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; min-width: 160px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${dealerName}</div>
          <div style="font-size: 12px; color: #374151; margin-bottom: 2px;">${pickupPoint.name}</div>
          <div style="font-size: 11px; color: ${color}; font-weight: 600;">${typeLabel}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${availableCarCount} car${availableCarCount !== 1 ? "s" : ""} available</div>
        </div>
      `);

      marker.on("click", () => {
        onSelectPickupPoint(pickupPoint.id);
      });

      markersRef.current.push(marker);
    }
  }, [results, onSelectPickupPoint]);

  // Pan to selected pickup point
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const result = results.find((r) => r.pickupPoint.id === selectedId);
    if (result) {
      mapRef.current.flyTo(
        [result.pickupPoint.lat, result.pickupPoint.lng],
        15,
        { duration: 0.6 },
      );
    }
  }, [selectedId, results]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
