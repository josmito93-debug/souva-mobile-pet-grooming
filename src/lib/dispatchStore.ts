import { PetSize } from "@/data/services";

export type RequestStatus =
  | "pending"
  | "assigned"
  | "en_route"
  | "arrived"
  | "in_service"
  | "completed"
  | "cancelled";

export interface DispatchRequest {
  id: string;
  customerName: string;
  email?: string;
  phone: string;
  address: string;
  zipCode?: string;
  dogCount?: number;
  lat: number;
  lng: number;
  petName: string;
  breed: string;
  size: PetSize;
  gender?: string;
  petAge?: string;
  vaccinated?: string;
  medicalConditions?: string;
  temperament?: string;
  petPhoto: string | null;
  packageId: string;
  packageName: string;
  addons: string[];
  coatCondition?: string;
  groomerNotes?: string;
  parkingNotes?: string;
  signature?: string | null;
  estimatedTotal?: number;
  preferredTime: string;
  scheduledDate?: string;
  scheduledTime?: string;
  etaMinutes: number;
  vanId: string;
  vanName: string;
  status: RequestStatus;
  createdAt: string;
  notes?: string;
}

const STORAGE_KEY = "souva_dispatch_requests_v2";

export const INITIAL_REQUESTS: DispatchRequest[] = [
  {
    id: "SOU-8401",
    customerName: "Jessica Miller",
    phone: "+1 (850) 960-0034",
    address: "2450 Pacific Ave, Pacific Heights, San Francisco, CA 94115",
    lat: 37.7925,
    lng: -122.4382,
    petName: "Maya",
    breed: "Golden Retriever",
    size: "large",
    temperament: "Calm & Gentle",
    petPhoto: "/assets/souva-hero-dog.png",
    packageId: "luxury-spa-vip",
    packageName: "Elevated VIP Spa Experience",
    addons: ["Blueberry Facial", "Enzymatic Teeth Brushing"],
    coatCondition: "Smooth & Tangle-Free",
    preferredTime: "Today 10:30 AM",
    etaMinutes: 18,
    vanId: "VAN-01",
    vanName: "Van 01 (SF Peninsula & City Fleet)",
    status: "en_route",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    notes: "Very affectionate with warm hydro-massage bath.",
  },
  {
    id: "SOU-8402",
    customerName: "David Sterling",
    phone: "+1 (415) 820-9142",
    address: "5824 College Ave, Rockridge, Oakland, CA 94618",
    lat: 37.8421,
    lng: -122.2513,
    petName: "Toby",
    breed: "French Bulldog",
    size: "small",
    temperament: "Playful / Energetic",
    petPhoto: null,
    packageId: "full-grooming",
    packageName: "Full Grooming Spa",
    addons: ["Hot Wax Paw Pad Defense"],
    coatCondition: "Smooth & Tangle-Free",
    preferredTime: "Today 12:00 PM",
    etaMinutes: 35,
    vanId: "VAN-02",
    vanName: "Van 02 (East Bay Fleet)",
    status: "assigned",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    notes: "Special attention to facial wrinkles, use hypoallergenic shampoo.",
  },
  {
    id: "SOU-8403",
    customerName: "Claire Vance",
    phone: "+1 (510) 640-3391",
    address: "1401 S Main St, Walnut Creek, CA 94596",
    lat: 37.9101,
    lng: -122.0652,
    petName: "Luna & Rocky",
    breed: "Poodle (Toy)",
    size: "small",
    temperament: "Shy or Anxious",
    petPhoto: null,
    packageId: "bath-brush",
    packageName: "Bath & Fluff Brush",
    addons: ["Deep Deshedding Treatment"],
    coatCondition: "Moderate Tangles / Dense Coat",
    preferredTime: "Today 2:30 PM",
    etaMinutes: 60,
    vanId: "VAN-02",
    vanName: "Van 02 (East Bay Fleet)",
    status: "pending",
    createdAt: new Date(Date.now() - 80 * 60000).toISOString(),
    notes: "Quiet dremel filing requested.",
  },
  {
    id: "SOU-8400",
    customerName: "Marcus Chang",
    phone: "+1 (925) 780-4510",
    address: "6000 Bollinger Canyon Rd, San Ramon, CA 94583",
    lat: 37.7799,
    lng: -121.9780,
    petName: "Zeus",
    breed: "Labrador Retriever",
    size: "large",
    temperament: "Senior / Gentle Touch",
    petPhoto: null,
    packageId: "full-grooming",
    packageName: "Full Grooming Spa",
    addons: ["Blueberry Facial"],
    coatCondition: "Smooth & Tangle-Free",
    preferredTime: "Today 08:30 AM",
    etaMinutes: 0,
    vanId: "VAN-02",
    vanName: "Van 02 (East Bay Fleet)",
    status: "completed",
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    notes: "Regular client. Loved the blueberry facial.",
  },
];

export function getStoredRequests(): DispatchRequest[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    return JSON.parse(saved);
  } catch {
    return INITIAL_REQUESTS;
  }
}

export function saveStoredRequests(reqs: DispatchRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
    window.dispatchEvent(new CustomEvent("souva_dispatch_updated", { detail: reqs }));
  } catch (e) {
    console.error("Failed to save dispatch requests", e);
  }
}

export function addDispatchRequest(req: Omit<DispatchRequest, "id" | "createdAt">): DispatchRequest {
  const current = getStoredRequests();
  const idNumber = Math.floor(1000 + Math.random() * 9000);
  const newRequest: DispatchRequest = {
    ...req,
    id: `SOU-${idNumber}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newRequest, ...current];
  saveStoredRequests(updated);
  return newRequest;
}

export function updateRequestETA(id: string, newEta: number): void {
  const current = getStoredRequests();
  const updated = current.map((r) => (r.id === id ? { ...r, etaMinutes: Math.max(0, newEta) } : r));
  saveStoredRequests(updated);
}

export function updateRequestStatus(id: string, newStatus: RequestStatus): void {
  const current = getStoredRequests();
  const updated = current.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
  saveStoredRequests(updated);
}

export function deleteDispatchRequest(id: string): void {
  const current = getStoredRequests();
  const updated = current.filter((r) => r.id !== id);
  saveStoredRequests(updated);
}
