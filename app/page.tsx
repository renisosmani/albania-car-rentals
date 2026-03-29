"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { SearchResult, SearchResponse } from "@/lib/types";

// Dynamically import map to avoid SSR issues with mapbox-gl
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const PICKUP_TYPE_LABELS: Record<string, string> = {
  SELF_PICKUP: "Self Pickup",
  KEY_DELIVERY: "Key Delivery",
  MEET_GREET: "Meet & Greet",
};

const PICKUP_TYPE_BADGE_CLASS: Record<string, string> = {
  SELF_PICKUP: "bg-blue-100 text-blue-800",
  KEY_DELIVERY: "bg-green-100 text-green-800",
  MEET_GREET: "bg-amber-100 text-amber-800",
};

const CATEGORY_LABELS: Record<string, string> = {
  ECONOMY: "Economy",
  COMPACT: "Compact",
  SUV: "SUV",
  LUXURY: "Luxury",
};

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

export default function HomePage() {
  const [pickupDate, setPickupDate] = useState(todayStr(1));
  const [returnDate, setReturnDate] = useState(todayStr(5));
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSelectedId(null);

    try {
      const res = await fetch(
        `/api/search?pickupDate=${pickupDate}&returnDate=${returnDate}`
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Search failed");
        setResults(null);
        return;
      }
      const data: SearchResponse = await res.json();
      setResults(data.results);
    } catch {
      setError("Failed to fetch results. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPickupPoint = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const selectedResult = results?.find((r) => r.pickupPoint.id === selectedId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Car Rentals at{" "}
          <span className="text-blue-700">Tirana Airport (TIA)</span>
        </h1>
        <p className="text-gray-500 text-sm">
          Search availability across verified dealers · Pick your dates · Find your car
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6 flex flex-wrap gap-4 items-end"
      >
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Pickup Date
          </label>
          <input
            type="date"
            value={pickupDate}
            min={todayStr()}
            onChange={(e) => setPickupDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Return Date
          </label>
          <input
            type="date"
            value={returnDate}
            min={pickupDate || todayStr()}
            onChange={(e) => setReturnDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            📍 TIA – Tirana International Airport
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {results !== null && (
        <div className="flex flex-col lg:flex-row gap-5">
          {/* LEFT: Results list */}
          <div className="flex flex-col gap-3 lg:w-[380px] xl:w-[420px] flex-shrink-0">
            <div className="text-sm text-gray-500 font-medium">
              {results.length === 0
                ? "No pickup points with available cars for these dates."
                : `${results.length} pickup point${results.length !== 1 ? "s" : ""} with available cars`}
            </div>

            {results.map((result) => {
              const pp = result.pickupPoint;
              const isSelected = selectedId === pp.id;
              return (
                <div
                  key={pp.id}
                  onClick={() => handleSelectPickupPoint(pp.id)}
                  className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 shadow-md ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {result.dealerName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{pp.name}</div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        PICKUP_TYPE_BADGE_CLASS[pp.type] ??
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {PICKUP_TYPE_LABELS[pp.type] ?? pp.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-blue-700 font-bold text-base">
                      {result.availableCarCount} car
                      {result.availableCarCount !== 1 ? "s" : ""} available
                    </span>
                    {pp.fee != null && pp.fee > 0 ? (
                      <span className="text-xs text-gray-500">
                        +€{pp.fee} pickup fee
                      </span>
                    ) : (
                      <span className="text-xs text-green-600 font-medium">
                        Free pickup
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                Self Pickup
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
                Key Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                Meet &amp; Greet
              </span>
            </div>
          </div>

          {/* RIGHT: Map */}
          <div className="flex-1 min-h-[420px] lg:min-h-0 relative">
            <div className="h-[420px] lg:h-[520px]">
              <MapView
                results={results}
                selectedId={selectedId}
                onSelectPickupPoint={handleSelectPickupPoint}
              />
            </div>
          </div>
        </div>
      )}

      {/* Side panel for selected pickup point details */}
      {selectedResult && (
        <div className="mt-5 bg-white border border-blue-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedResult.pickupPoint.name}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedResult.dealerName} ·{" "}
                <span className="font-medium">
                  {PICKUP_TYPE_LABELS[selectedResult.pickupPoint.type] ??
                    selectedResult.pickupPoint.type}
                </span>
              </p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
            >
              ×
            </button>
          </div>

          {selectedResult.pickupPoint.instructions && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4 text-sm text-gray-700">
              <span className="font-semibold text-blue-700">
                Pickup instructions:{" "}
              </span>
              {selectedResult.pickupPoint.instructions}
            </div>
          )}

          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Available cars ({selectedResult.cars.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedResult.cars.map((car) => (
              <div
                key={car.id}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
              >
                {car.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={car.imageUrl}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-36 object-cover"
                  />
                )}
                <div className="p-3">
                  <div className="font-semibold text-sm text-gray-900">
                    {car.make} {car.model}{" "}
                    <span className="font-normal text-gray-400">
                      ({car.year})
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {CATEGORY_LABELS[car.category] ?? car.category}
                    </span>
                    <span className="text-sm font-bold text-blue-700">
                      €{car.pricePerDay}/day
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Initial state */}
      {results === null && !loading && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-medium text-gray-500">
            Select your dates and search to see available cars
          </p>
          <p className="text-sm mt-1">
            We&apos;ll show you all pickup points at Tirana Airport (TIA) with
            real-time availability
          </p>
        </div>
      )}
    </div>
  );
}
