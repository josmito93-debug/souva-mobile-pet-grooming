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
    name: "Full Grooming Spa",
    tagline: "Our signature head-to-tail styling, bath & wellness treatment",
    priceRange: "$95 - $165",
    duration: "60 - 90 min",
    popular: true,
    features: [
      "Warm hydro-massage bath with organic oat & eucalyptus shampoo",
      "Breed-specific haircut or bespoke scissor styling",
      "Gentle hand-blow dry (100% cage-free quiet turbine)",
      "Precision nail clipping & rounded filing",
      "Ear cleansing & delicate facial sanitary trim",
      "Nourishing paw butter massage & SOUVA botanical mist",
    ],
  },
  {
    id: "bath-brush",
    name: "Bath & Fluff Brush",
    tagline: "Deep therapeutic cleanse, deshedding & silky softness",
    priceRange: "$65 - $110",
    duration: "45 - 60 min",
    features: [
      "Deep cleansing bath with organic conditioning rinse",
      "Warm microfiber towel pre-dry & gentle warm airflow",
      "Exhaustive deshedding with natural hardwood bristle brush",
      "Sanitary eye & ear hygiene wipe",
      "Gland expression (upon request)",
      "Signature fresh botanical mist & luxury bandanna",
    ],
  },
  {
    id: "nail-paw-spa",
    name: "Paw Spa & Nail Contour",
    tagline: "Delicate pad restoration and quiet precision filing",
    priceRange: "$40 - $55",
    duration: "25 - 35 min",
    features: [
      "Smooth nail trim & circular quiet dremel rounding",
      "Interdigital hair clearing between pads",
      "Gentle antibacterial pad cleanse",
      "Hot beeswax & organic shea butter pad restoration massage",
    ],
  },
  {
    id: "luxury-spa-vip",
    name: "Elevated VIP Spa Experience",
    tagline: "The ultimate luxury indulgence delivered right to your doorstep",
    priceRange: "$140 - $210",
    duration: "75 - 105 min",
    features: [
      "Everything in our signature Full Grooming Spa",
      "Antioxidant Blueberry Facial stain-remover & head massage",
      "Enzymatic dental teeth brushing & fresh breath treatment",
      "Relaxing ozone-infused warm hydro-massage therapy",
      "Intensive anti-shedding deep coat conditioning mask",
      "Complimentary digital portrait post-grooming session",
    ],
  },
];

export const SPA_ADDONS = [
  { id: "blueberry-facial", label: "Blueberry Facial", price: "+$15", desc: "Gentle tear-stain cleansing and facial massage" },
  { id: "teeth-brushing", label: "Enzymatic Teeth Brushing", price: "+$18", desc: "Plaque reduction & fresh breath gel" },
  { id: "deshedding", label: "Deep Deshedding Treatment", price: "+$25", desc: "Removes up to 90% of loose undercoat hair" },
  { id: "flea-tick", label: "Organic Flea & Tick Wash", price: "+$20", desc: "Natural neem leaf and lavender oil defense" },
  { id: "paw-wax", label: "Hot Wax Paw Pad Defense", price: "+$12", desc: "Protective sealant against city pavement & hot sidewalks" },
];
