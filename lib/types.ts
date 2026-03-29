export type PickupPointType = "SELF_PICKUP" | "KEY_DELIVERY" | "MEET_GREET";

export interface PickupPointData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  instructions: string | null;
  fee: number | null;
  dealerId: string;
}

export interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  imageUrl: string | null;
}

export interface SearchResult {
  pickupPoint: PickupPointData;
  dealerName: string;
  availableCarCount: number;
  cars: CarData[];
}

export interface SearchResponse {
  results: SearchResult[];
  requestStart: string;
  requestEnd: string;
}
