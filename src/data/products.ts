export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: "bundles" | "bath" | "care" | "fragrance" | "accessories";
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  volume?: string;
  description: string;
  ingredients?: string[];
  benefits: string[];
  howToUse: string;
  inStock: boolean;
  isBundle?: boolean;
  bundleItems?: string[];
}

export const SOUVA_PRODUCTS: Product[] = [
  // ─── BUNDLES ───
  {
    id: "bundle-ritual-vip",
    name: "VIP Elevated Home Spa Ritual",
    subtitle: "The definitive luxury home grooming & wellness collection",
    category: "bundles",
    price: 78,
    originalPrice: 98,
    image: "/assets/souva-products.png",
    badge: "BEST SELLER · SAVE $20",
    rating: 5.0,
    reviewsCount: 52,
    isBundle: true,
    bundleItems: [
      "Revitalizing Colloidal Oat Shampoo (8.4 fl oz)",
      "Detangling & Silky Conditioner (8.4 fl oz)",
      "Signature Refreshing Mist (3.4 fl oz)",
      "Paw & Snout Restorative Butter (2 oz)",
      "Premium Eco-Hardwood Pin Brush",
      "Complimentary SOUVA Luxury Canvas Bag",
    ],
    description:
      "The complete SOUVA spa experience brought into your home. Specially formulated to turn bath time into a restorative ritual of aromatherapy, softness, and skin comfort.",
    benefits: [
      "Save 20% compared to purchasing individually",
      "Leaves coat glossy, effortlessly brushable, and static-free",
      "Protects delicate paw pads from rough city sidewalks",
      "Long-lasting calming scent of eucalyptus & fresh botanicals",
    ],
    howToUse:
      "Massage shampoo into damp coat until a rich lather forms. Rinse with warm water, follow with conditioner, and let sit for 2 minutes. Brush through with the hardwood brush while drying. Finish with a dab of paw butter on pads and a gentle spritz of mist on the back.",
    inStock: true,
  },
  {
    id: "bundle-esencial-bano",
    name: "Essential Cleanse & Glow Trio",
    subtitle: "Gentle bathing, detangling, and shine maintenance",
    category: "bundles",
    price: 48,
    originalPrice: 58,
    image: "/assets/souva-products.png",
    badge: "POPULAR TRIO",
    rating: 4.9,
    reviewsCount: 39,
    isBundle: true,
    bundleItems: [
      "Revitalizing Oat Shampoo (250ml)",
      "Silky Detangling Rinse (250ml)",
      "Lightweight Detangling Leave-in Spray (150ml)",
    ],
    description:
      "The essential three-step foundation for dogs with medium to long coats. Gently removes grime while protecting natural cutaneous lipids.",
    benefits: [
      "100% biodegradable, vegan, and pH-balanced formula",
      "Cuts drying and brushing time in half",
      "Gentle enough for puppies and sensitive coats",
    ],
    howToUse:
      "Bathe with shampoo and rinse. Mist the detangling spray before combing through dense fur or knots.",
    inStock: true,
  },
  {
    id: "bundle-patitas-piel",
    name: "Paw & Skin Deep Healing Kit",
    subtitle: "Intensive relief for dry paw pads and sensitive coats",
    category: "bundles",
    price: 45,
    originalPrice: 56,
    image: "/assets/prod-balsamo.png",
    badge: "VET APPROVED",
    rating: 4.95,
    reviewsCount: 31,
    isBundle: true,
    bundleItems: [
      "Paw & Snout Healing Butter (Gold Tin 60g)",
      "Professional 2-in-1 Hydrating Shampoo (250ml)",
      "Handcrafted Hardwood Grooming Brush",
    ],
    description:
      "Deep moisture therapy for cracked paw pads, calluses, and dry itchy skin caused by pavement, weather shifts, or allergies.",
    benefits: [
      "Instantly soothes pads irritated by hot asphalt or coastal salt",
      "100% natural, lick-safe, and non-toxic formula",
      "Ergonomic brush stimulates hair follicle micro-circulation",
    ],
    howToUse:
      "Massage balm into clean paws and nose daily before walks or at bedtime. Use shampoo for regular therapeutic baths.",
    inStock: true,
  },
  {
    id: "bundle-paseo-fresco",
    name: "Daily Walk Freshness Duo",
    subtitle: "Keep your pet pristine between professional grooming visits",
    category: "bundles",
    price: 34,
    originalPrice: 42,
    image: "/assets/prod-colonia.png",
    badge: "AFTER-PARK FAVORITE",
    rating: 4.85,
    reviewsCount: 24,
    isBundle: true,
    bundleItems: [
      "Botanical Cologne Mist (100ml)",
      "Leave-In Detangler Spray (150ml)",
      "Artisanal Oat & Eucalyptus Soap Bar (100g)",
    ],
    description:
      "Ideal for quick touch-ups after park romps, neutralizing outdoor odors without harsh chemicals or alcohols.",
    benefits: [
      "Natural odor neutralizer with zero drying alcohol",
      "Safe for frequent use on light, dark, and curly coats",
    ],
    howToUse:
      "Spray mist from 8 inches away over the back and shoulders. Brush through to evenly distribute.",
    inStock: true,
  },

  // ─── BATH INDIVIDUALS ───
  {
    id: "prod-champu-revitalizante",
    name: "Revitalizing Colloidal Oat Shampoo",
    subtitle: "Crisp eucalyptus notes & soothing organic oats",
    category: "bath",
    price: 20,
    image: "/assets/prod-champu.png",
    badge: "BESTSELLER",
    rating: 4.9,
    reviewsCount: 68,
    volume: "250 ml / 8.4 fl oz",
    description:
      "An ultra-gentle, hypoallergenic wash formulated to dissolve grit without stripping natural protective oils. Colloidal oats calm dry skin while eucalyptus delivers an aromatherapeutic spa experience.",
    ingredients: [
      "Ozonated purified mountain water",
      "Organic colloidal oatmeal",
      "Pure eucalyptus globulus leaf oil",
      "Sweet chamomile extract",
      "Provitamin B5 (Panthenol)",
      "Coconut-derived gentle cleansers",
    ],
    benefits: [
      "Strict pH 7.0 balanced specifically for canine skin",
      "Tearless, dye-free, sulfate-free, and biodegradable",
      "Relieves seasonal itchiness and dry dander",
    ],
    howToUse:
      "Wet coat thoroughly with warm water. Apply from neck to tail, massaging into a rich, aromatic lather. Leave on for 3 minutes before rinsing thoroughly.",
    inStock: true,
  },
  {
    id: "prod-enjuaje-suavizante",
    name: "Silky Detangling Conditioner",
    subtitle: "Cold-pressed coconut & raw African shea butter",
    category: "bath",
    price: 20,
    image: "/assets/prod-enjuaje.png",
    rating: 4.85,
    reviewsCount: 44,
    volume: "250 ml / 8.4 fl oz",
    description:
      "Smooths the hair cuticle, infusing strands with deep moisture to leave coats silky, manageable, and dust-repellent.",
    ingredients: [
      "Virgin cold-pressed coconut oil",
      "Raw unrefined shea butter",
      "Hydrolyzed silk protein",
      "Natural Vitamin E (Tocopherol)",
    ],
    benefits: [
      "Effortlessly releases tangles and mats",
      "Leaves a brilliant mirror gloss on all coat colors",
      "Long-lasting anti-static shield",
    ],
    howToUse:
      "Apply after shampooing. Work through lengths, leave for 2 minutes, then rinse gently.",
    inStock: true,
  },
  {
    id: "prod-jabon-artesanal",
    name: "Handmade Oat & Eucalyptus Soap Bar",
    subtitle: "Cold-saponified solid bar for quick paw washes",
    category: "bath",
    price: 14,
    image: "/assets/prod-jabon.png",
    rating: 4.8,
    reviewsCount: 33,
    volume: "120 g / 4.2 oz",
    description:
      "Handcrafted with saponified organic plant oils and micro-ground oats that gently exfoliate city mud and dirt from paws after neighborhood strolls.",
    ingredients: [
      "Extra virgin olive oil",
      "Organic coconut oil",
      "Finely ground rolled oats",
      "Pure eucalyptus essential oil",
    ],
    benefits: [
      "Zero-waste packaging in recycled luxury parchment",
      "Ideal for quick sink paw washing after rainy park walks",
      "Lasts for 40+ washes",
    ],
    howToUse:
      "Rub directly onto wet paws or belly, lather gently, and rinse clean.",
    inStock: true,
  },
  {
    id: "prod-champu-profesional",
    name: "Professional 2-in-1 Salon Wash",
    subtitle: "Amber bottle with pump dispenser · Concentrated salon formula",
    category: "bath",
    price: 24,
    image: "/assets/prod-amber-shampoo.png",
    badge: "MOBILE SALON FORMULA",
    rating: 5.0,
    reviewsCount: 22,
    volume: "250 ml",
    description:
      "The exact high-performance formula used inside our solar-powered mobile grooming vans. Combines deep cleansing with premium conditioning polymers.",
    ingredients: [
      "Calendula blossom extract",
      "Organic jojoba seed oil",
      "Vegetable biotin",
      "Pure aloe barbadensis leaf juice",
    ],
    benefits: [
      "Reduces blow-dry time by up to 30%",
      "Formulated specifically for dense double coats and doodles",
    ],
    howToUse:
      "Dispense 1-2 pumps, lather from base of neck down, and rinse thoroughly.",
    inStock: true,
  },

  // ─── CARE & ACCESSORIES ───
  {
    id: "prod-balsamo-patas",
    name: "Restorative Paw & Snout Butter",
    subtitle: "Formulated with love · Pure beeswax & wild shea",
    category: "care",
    price: 18,
    image: "/assets/prod-balsamo.png",
    badge: "100% LICK-SAFE",
    rating: 5.0,
    reviewsCount: 82,
    volume: "60 g / 2 oz",
    description:
      "Forms a breathable, intensely nourishing protective barrier that heals dry pads, rough elbow calluses, and windburned noses.",
    ingredients: [
      "Sustainable pure beeswax",
      "Unrefined shea butter",
      "Virgin organic coconut oil",
      "Sweet almond oil",
      "Healing calendula oil",
    ],
    benefits: [
      "Protects against scorching sidewalks and winter dampness",
      "100% lick-safe and non-greasy",
      "Absorbs fast without leaving greasy marks on hardwood floors",
    ],
    howToUse:
      "Warm a small amount between fingertips and massage gently into pads and nose.",
    inStock: true,
  },
  {
    id: "prod-spray-desenredante",
    name: "Silky Leave-In Detangling Mist",
    subtitle: "Weightless conditioning mist without residue",
    category: "care",
    price: 17,
    image: "/assets/prod-spray.png",
    rating: 4.85,
    reviewsCount: 41,
    volume: "150 ml / 5 fl oz",
    description:
      "Effortlessly untangles stubborn knots without tugging or discomfort. Infused with vegetable keratin and botanical silk.",
    ingredients: [
      "Deionized mountain water",
      "Water-soluble argan oil",
      "Hydrolyzed wheat protein",
      "Green tea leaf essence",
    ],
    benefits: [
      "Prevents painful matting and radical shave-downs",
      "Makes daily brushing enjoyable and stress-free",
    ],
    howToUse:
      "Spray directly onto tangled areas from 6 inches away. Wait 60 seconds and brush through gently.",
    inStock: true,
  },
  {
    id: "prod-cepillo-madera",
    name: "Premium Eco-Hardwood Pin Brush",
    subtitle: "Polished beechwood with rounded safety pins",
    category: "care",
    price: 22,
    image: "/assets/prod-cepillo.png",
    rating: 4.95,
    reviewsCount: 56,
    description:
      "Crafted from sustainably sourced solid beechwood with an ergonomic handle. Rounded metal pins glide through coats without scratching delicate skin.",
    benefits: [
      "Ergonomic contoured grip prevents wrist strain",
      "Lifts dead undercoat hair without breaking healthy strands",
      "Lifetime artisan durability",
    ],
    howToUse: "Brush in the direction of hair growth with long, steady strokes.",
    inStock: true,
  },
  {
    id: "prod-colonia-refrescante",
    name: "Signature Botanical Dog Cologne",
    subtitle: "Subtle elegance in a frosted glass bottle with gold atomizer",
    category: "fragrance",
    price: 22,
    image: "/assets/prod-colonia.png",
    badge: "ALCOHOL-FREE",
    rating: 4.9,
    reviewsCount: 64,
    volume: "100 ml / 3.4 fl oz",
    description:
      "Crafted by natural perfumers to respect a dog's delicate sense of smell. Clean notes of crisp linen, sweet eucalyptus, and gentle white petals.",
    ingredients: [
      "Demineralized aqueous base (zero alcohol or ethanol)",
      "Botanical aroma extracts",
      "Vegetable glycerin hydrator",
    ],
    benefits: [
      "Won't trigger sneezing or olfactory irritation",
      "Leaves a clean, welcoming scent lasting up to 7 days",
    ],
    howToUse:
      "Spritz 2-3 times over back and flanks from 10 inches away, avoiding eyes and nose.",
    inStock: true,
  },
  {
    id: "prod-collar-placa",
    name: "SOUVA Leather Collar & Bronze Tag",
    subtitle: "Sage vegan leather with embossed brass medallion",
    category: "accessories",
    price: 32,
    image: "/assets/prod-collar.png",
    rating: 5.0,
    reviewsCount: 28,
    description:
      "Handcrafted vegan leather collar with soft cream edge piping and laser-engraved SOUVA insignia medallion.",
    benefits: [
      "Ultralight rustproof zinc hardware",
      "Water-resistant and gentle on sensitive neck fur",
    ],
    howToUse: "Adjustable 5-hole buckle fitting neck sizes from 10 to 20 inches.",
    inStock: true,
  },
  {
    id: "prod-tazon-ceramico",
    name: "Artisan Ceramic Pet Bowl",
    subtitle: "Heavyweight matte forest ceramic",
    category: "accessories",
    price: 28,
    image: "/assets/prod-tazon.png",
    rating: 4.9,
    reviewsCount: 19,
    description:
      "Heavyweight, non-skid, high-density glazed ceramic. Prevents chin acne caused by plastic bowls while matching modern luxury interiors.",
    benefits: [
      "Dishwasher and microwave safe",
      "Non-porous glaze resists odors and bacteria",
    ],
    howToUse: "Ideal for fresh water or raw/dry meals.",
    inStock: true,
  },
  {
    id: "prod-peluche-souva",
    name: "SOUVA Jacquard Plush Pillow Toy",
    subtitle: "Woven check pattern with embroidered silhouette",
    category: "accessories",
    price: 18,
    image: "/assets/prod-peluche.png",
    rating: 4.85,
    reviewsCount: 16,
    description:
      "Therapeutic anti-anxiety plush cuddle toy with a muted low-frequency squeaker.",
    benefits: [
      "Reinforced double-stitch seams",
      "Machine washable on gentle cycle",
    ],
    howToUse: "The perfect companion for nap time or post-grooming calm.",
    inStock: true,
  },
  {
    id: "prod-hueso-gourmet",
    name: "Gourmet Dental Chew Bone",
    subtitle: "100% all-natural dehydrated chew for tartar defense",
    category: "accessories",
    price: 9,
    image: "/assets/prod-hueso.png",
    rating: 5.0,
    reviewsCount: 38,
    description:
      "All-natural chew bone free of chemical preservatives or bleaching agents. Mechanically scrapes plaque during chewing.",
    benefits: [
      "Single-ingredient & easily digestible",
      "Keeps pets happily engaged for 45+ minutes",
    ],
    howToUse: "Give as a special post-spa reward.",
    inStock: true,
  },
];
