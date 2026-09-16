export interface ServicePackage {
  id: string;
  name: string;
  tagline: string;
  priceRange: string;
  duration: string;
  popular?: boolean;
  features: string[];
}

export const SOUVA_PACKAGES: ServicePackage[] = [
  {
    id: "full-grooming",
    name: "Full Grooming",
    tagline: "El tratamiento insignia completo de estética y bienestar",
    priceRange: "$55 - $85",
    duration: "60 - 90 min",
    popular: true,
    features: [
      "Baño tibio con champú orgánico revitalizante de avena",
      "Corte estilizado a tijera o máquina según raza",
      "Secado a mano sin jaulas (turbina silenciosa)",
      "Corte & limado de uñas suave",
      "Limpieza de oídos y despeje de ojos",
      "Bálsamo reparador de patitas y colonia SOUVA",
    ],
  },
  {
    id: "bath-brush",
    name: "Bath & Brush",
    tagline: "Limpieza profunda, brillo sedoso y caricias",
    priceRange: "$35 - $60",
    duration: "45 - 60 min",
    features: [
      "Baño hidroterapéutico con champú hidratante",
      "Enjuague suavizante desenredante",
      "Secado suave con toallas de microfibra y aire tibio",
      "Cepillado profundo con cepillo de madera noble",
      "Vaciado de glándulas (a solicitud)",
      "Colonia aromática y pañuelo exclusivo",
    ],
  },
  {
    id: "nail-paw-spa",
    name: "Nail Trims & Paw Spa",
    tagline: "Cuidado delicado para sus patitas y paso firme",
    priceRange: "$20 - $35",
    duration: "25 - 35 min",
    features: [
      "Corte preciso y limado circular de uñas",
      "Despeje y recorte de pelo entre almohadillas",
      "Limpieza antiséptica suave",
      "Masaje con bálsamo reparador hidratante",
    ],
  },
  {
    id: "luxury-spa-vip",
    name: "Luxury VIP Spa Experience",
    tagline: "El súmmum del mimo y relajación aromática en tu puerta",
    priceRange: "$75 - $115",
    duration: "75 - 105 min",
    features: [
      "Todo lo incluido en Full Grooming de lujo",
      "Mascarilla facial de arándanos (Blueberry Facial)",
      "Cepillado y profilaxis dental enzimática",
      "Hidromasaje relajante con ozono / aceites botánicos",
      "Tratamiento ultra-deslanado anti-caída",
      "Fotografía digital de regalo con su look renovado",
    ],
  },
];

export const SPA_ADDONS = [
  { id: "blueberry-facial", label: "Blueberry Facial", price: "+$10", desc: "Limpieza facial que desmancha lagrimales" },
  { id: "teeth-brushing", label: "Cepillado Dental", price: "+$12", desc: "Gel enzimático y aliento fresco" },
  { id: "deshedding", label: "Tratamiento Deslanado", price: "+$18", desc: "Elimina hasta el 90% del pelo muerto" },
  { id: "flea-tick", label: "Baño Antipulgas Natural", price: "+$15", desc: "Extracto de neem y lavanda orgánico" },
  { id: "paw-wax", label: "Bálsamo Almohadillas Extra", price: "+$8", desc: "Cera protectora contra asfalto caliente" },
];
