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
  phone: string;
  address: string;
  lat: number;
  lng: number;
  petName: string;
  breed: string;
  size: "toy" | "small" | "medium" | "large" | "giant";
  temperament: string;
  petPhoto: string | null;
  packageId: string;
  packageName: string;
  addons: string[];
  coatCondition: string;
  preferredTime: string;
  etaMinutes: number;
  vanId: string;
  vanName: string;
  status: RequestStatus;
  createdAt: string;
  notes?: string;
}

const STORAGE_KEY = "souva_dispatch_requests_v1";

export const INITIAL_REQUESTS: DispatchRequest[] = [
  {
    id: "SOU-8401",
    customerName: "Valeria Gómez",
    phone: "+1 (850) 960-0034",
    address: "11601 Domain Dr, Austin, TX 78758",
    lat: 30.4025,
    lng: -97.7248,
    petName: "Maya",
    breed: "Golden Retriever",
    size: "large",
    temperament: "Tranquilo & Dócil",
    petPhoto: "/assets/souva-hero-dog.png",
    packageId: "luxury-spa-vip",
    packageName: "Luxury VIP Spa Experience",
    addons: ["Blueberry Facial", "Cepillado Dental"],
    coatCondition: "Manto suave y sin nudos",
    preferredTime: "Hoy 10:30 AM",
    etaMinutes: 18,
    vanId: "VAN-01",
    vanName: "Van 01 (Estilista Ana Gómez)",
    status: "en_route",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    notes: "Tiene toalla favorita. Muy cariñosa con el agua tibia.",
  },
  {
    id: "SOU-8402",
    customerName: "Carlos Delgado",
    phone: "+1 (512) 840-9921",
    address: "14307 Honey Gem Dr, Pflugerville, TX 78660",
    lat: 30.4548,
    lng: -97.6223,
    petName: "Toby",
    breed: "French Bulldog",
    size: "small",
    temperament: "Juguetón / Enérgico",
    petPhoto: null,
    packageId: "full-grooming",
    packageName: "Full Grooming",
    addons: ["Bálsamo Almohadillas Extra"],
    coatCondition: "Manto suave y sin nudos",
    preferredTime: "Hoy 12:00 PM",
    etaMinutes: 35,
    vanId: "VAN-02",
    vanName: "Van 02 (Estilista Marcos R.)",
    status: "assigned",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    notes: "Cuidado con los pliegues de la carita, usar champú hipoalergénico.",
  },
  {
    id: "SOU-8403",
    customerName: "Mariana Silva",
    phone: "+1 (512) 349-1120",
    address: "2200 S Congress Ave, Austin, TX 78704",
    lat: 30.2432,
    lng: -97.7523,
    petName: "Luna & Rocky",
    breed: "Poodle / Caniche",
    size: "toy",
    temperament: "Tímido o Nervioso",
    petPhoto: null,
    packageId: "bath-brush",
    packageName: "Bath & Brush",
    addons: ["Tratamiento Deslanado"],
    coatCondition: "Nudos moderados / manto denso",
    preferredTime: "Hoy 2:30 PM",
    etaMinutes: 60,
    vanId: "VAN-01",
    vanName: "Van 01 (Estilista Ana Gómez)",
    status: "pending",
    createdAt: new Date(Date.now() - 80 * 60000).toISOString(),
    notes: "Corte de uñas con torno silencioso para no asustarla.",
  },
  {
    id: "SOU-8400",
    customerName: "Roberto Herrera",
    phone: "+1 (512) 991-4500",
    address: "300 W 6th St, Downtown Austin, TX 78701",
    lat: 30.2691,
    lng: -97.7454,
    petName: "Zeus",
    breed: "Labrador Retriever",
    size: "large",
    temperament: "Senior / Cuidados Suaves",
    petPhoto: null,
    packageId: "full-grooming",
    packageName: "Full Grooming",
    addons: ["Blueberry Facial"],
    coatCondition: "Manto suave y sin nudos",
    preferredTime: "Hoy 08:30 AM",
    etaMinutes: 0,
    vanId: "VAN-02",
    vanName: "Van 02 (Estilista Marcos R.)",
    status: "completed",
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    notes: "Cliente habitual. Excelente propina.",
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
