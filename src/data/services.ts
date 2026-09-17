export type PetSize = "small" | "medium" | "large" | "xlarge";

export interface ServicePackage {
  id: string;
  name: string;
  tagline: string;
  popular?: boolean;
  prices: Record<PetSize, number>;
  duration: string;
  includes: string[];
}

export const SIZE_GUIDE: { id: PetSize; label: string; weight: string; breedExamples: string }[] = [
  { id: "small", label: "Small", weight: "Up to 15 lb", breedExamples: "Pomeranian, Yorkie, Chihuahua, Toy Poodle" },
  { id: "medium", label: "Medium", weight: "16–35 lb", breedExamples: "French Bulldog, Pug, Cocker, Corgi, Beagle" },
  { id: "large", label: "Large", weight: "36–50 lb", breedExamples: "Standard Schnauzer, Border Collie, Aussie" },
  { id: "xlarge", label: "X-Large", weight: "Over 50 lb", breedExamples: "Golden Retriever, Labradoodle, Shepherd, Bernese" },
];

export const SOUVA_PACKAGES: ServicePackage[] = [
  {
    id: "bath-refresh",
    name: "Bath & Refresh",
    tagline: "A refreshing maintenance service designed to keep your pet clean, comfortable and beautifully cared for between grooming appointments.",
    prices: {
      small: 65,
      medium: 85,
      large: 100,
      xlarge: 130,
    },
    duration: "45 - 60 min",
    includes: [
      "Bath",
      "Blow-dry",
      "Ear cleaning",
      "Nail trim",
      "Finishing fragrance",
      "Souva bandana",
      "Complimentary treat",
    ],
  },
  {
    id: "bath-tidy",
    name: "Bath & Tidy",
    tagline: "The perfect refresh between full grooming appointments. This service cleans and tidies the essential areas while preserving your pet’s overall coat length.",
    prices: {
      small: 80,
      medium: 100,
      large: 115,
      xlarge: 145,
    },
    duration: "60 - 75 min",
    includes: [
      "Bath",
      "Blow-dry",
      "Ear cleaning",
      "Nail trim",
      "Paw pad trim",
      "Sanitary trim",
      "Face trim",
      "Finishing fragrance",
      "Souva bandana",
      "Complimentary treat",
    ],
  },
  {
    id: "essential-full-groom",
    name: "Essential Full Groom",
    tagline: "A complete, low-maintenance haircut designed for comfort, practicality and easier upkeep at home. Ideal for shorter styles and shave-downs.",
    prices: {
      small: 110,
      medium: 130,
      large: 150,
      xlarge: 170,
    },
    duration: "75 - 90 min",
    includes: [
      "Bath",
      "Blow-dry",
      "Ear cleaning",
      "Nail trim",
      "Full short haircut or shave-down",
      "Finishing fragrance",
      "Souva bandana",
      "Complimentary treat",
    ],
  },
  {
    id: "signature-grooming",
    name: "Signature Grooming",
    tagline: "Our elevated grooming experience for longer styles, customized finishes and more detailed coat work. Designed for pets requiring specialized styling, breed-inspired grooming, balanced proportions, defined angulation or Asian Fusion techniques.",
    popular: true,
    prices: {
      small: 125,
      medium: 150,
      large: 170,
      xlarge: 190,
    },
    duration: "90 - 115 min",
    includes: [
      "Bath",
      "Blow-dry",
      "Ear cleaning",
      "Nail trim",
      "Customized signature haircut",
      "Detailed scissoring and finishing",
      "Finishing fragrance",
      "Souva bandana",
      "Complimentary treat",
    ],
  },
];

export const SPA_UPGRADES = [
  {
    id: "nail-grinding",
    name: "Nail Grinding Upgrade",
    price: "$15",
    desc: "Smooths and rounds the nails after trimming for a softer, more comfortable finish.",
  },
  {
    id: "teeth-brushing-refresh",
    name: "Teeth Brushing & Breath Refresh",
    price: "$15",
    desc: "A gentle brushing service that helps freshen your pet’s breath and improve their at-home oral-care routine.",
  },
  {
    id: "paw-nose-balm",
    name: "Paw & Nose Balm",
    price: "$12",
    desc: "A moisturizing balm applied to dry paw pads and the nose for a soft, conditioned finish.",
  },
  {
    id: "deep-conditioning",
    name: "Deep Conditioning Treatment",
    price: "$20",
    desc: "Adds moisture, softness and shine to dry, dull or difficult-to-manage coats.",
  },
  {
    id: "sensitive-skin",
    name: "Sensitive Skin Treatment",
    price: "$15",
    desc: "A calming hypoallergenic wash and soothing botanical rinse designed for reactive or allergy-prone skin.",
  },
  {
    id: "deshedding-treatment",
    name: "De-Shedding Treatment",
    price: "Starting at $25",
    desc: "A multi-step coat treatment designed to loosen and remove excess undercoat and help reduce shedding at home. Pricing varies according to your pet’s size, coat density and the time required.",
  },
];

export const ADDITIONAL_SERVICE_FEES = [
  {
    id: "dematting",
    title: "De-Matting",
    fee: "$25 per additional 15 min",
    desc: "Applied when mat removal requires additional brushing or careful coat work. For your pet’s comfort and safety, severe matting may require a shorter haircut instead.",
  },
  {
    id: "excessive-coat",
    title: "Excessive Coat & Additional Brushing",
    fee: "Starting at $25",
    desc: "May apply to exceptionally dense, impacted or overgrown coats requiring additional brushing, drying or preparation.",
  },
  {
    id: "special-handling",
    title: "Special Handling",
    fee: "$25",
    desc: "May apply when a pet requires additional time and support because of anxiety, mobility limitations, sensitivity or challenging behavior.",
  },
];

export const PRICING_INFORMATION = {
  title: "PRICING INFORMATION",
  body: "All listed prices are starting rates. Final pricing is determined by your pet’s breed, size, coat type and condition, desired style, temperament, and the time required to complete the service. Additional charges may apply for matting, excessive shedding, special handling or services requiring additional time. Complimentary treats and finishing fragrance are provided with the pet parent’s approval.",
  notice: "We will communicate any anticipated additional charges whenever possible before proceeding.",
};

// Aliases for compatibility
export const SPA_ADDONS = SPA_UPGRADES.map((u) => ({
  id: u.id,
  label: u.name,
  price: u.price,
  desc: u.desc,
}));
