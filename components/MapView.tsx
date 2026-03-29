"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
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
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === "your_mapbox_token_here") {
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [19.7216, 41.4146],
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
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
      const color =
        PICKUP_TYPE_COLORS[pickupPoint.type] ?? "#6b7280";

      // Custom marker element
      const el = document.createElement("div");
      el.className = "cursor-pointer select-none";
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
        transition: transform 0.15s, box-shadow 0.15s;
      `;

      const inner = document.createElement("span");
      inner.style.transform = "rotate(45deg)";
      inner.textContent = String(availableCarCount);
      el.appendChild(inner);

      el.addEventListener("click", () => {
        onSelectPickupPoint(pickupPoint.id);
      });

      const popup = new mapboxgl.Popup({
        offset: 30,
        closeButton: false,
        maxWidth: "220px",
      }).setHTML(`
        <div style="font-family: sans-serif; padding: 4px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${dealerName}</div>
          <div style="font-size: 12px; color: #374151; margin-bottom: 2px;">${pickupPoint.name}</div>
          <div style="font-size: 11px; color: ${color}; font-weight: 600;">${PICKUP_TYPE_LABELS[pickupPoint.type] ?? pickupPoint.type}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${availableCarCount} car${availableCarCount !== 1 ? "s" : ""} available</div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([pickupPoint.lng, pickupPoint.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    }
  }, [results, onSelectPickupPoint]);

  // Highlight selected marker
  useEffect(() => {
    // Pan to selected if found
    if (!selectedId || !mapRef.current) return;
    const result = results.find((r) => r.pickupPoint.id === selectedId);
    if (result) {
      mapRef.current.flyTo({
        center: [result.pickupPoint.lng, result.pickupPoint.lat],
        zoom: 15,
        duration: 600,
      });
    }
  }, [selectedId, results]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const noToken = !token || token === "your_mapbox_token_here";

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200">
      <div ref={mapContainer} className="w-full h-full" />
      {noToken && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 text-center px-6">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="font-semibold text-gray-800 mb-1">Map not available</p>
          <p className="text-sm text-gray-500">
            Set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> in{" "}
            <code className="bg-gray-100 px-1 rounded">.env.local</code> to enable the Mapbox map.
          </p>
          {results.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              {results.length} pickup point{results.length !== 1 ? "s" : ""} available in the list below.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
