/**
 * SOUVA Mobile Pet Grooming - SEO & GEO Master Configuration
 * Official Domain: https://www.souvagrooming.com
 * All canonical URLs and slugs MUST strictly adhere to this official domain.
 */

export const OFFICIAL_DOMAIN = "https://www.souvagrooming.com";

export interface SeoRouteMeta {
  slug: string;
  title: string;
  description: string;
  canonicalUrl: string;
  targetSection?: string;
  isGeoRoute?: boolean;
  geoCity?: string;
  geoDefaultZip?: string;
  geoZips?: string[];
  geoNeighborhoods?: string;
}

export const SEO_ROUTES: Record<string, SeoRouteMeta> = {
  "/": {
    slug: "/",
    title: "SOUVA · Luxury Solar Mobile Pet Grooming | San Francisco & Peninsula",
    description: "Premier 1-on-1 mobile dog grooming delivered directly to your doorstep in San Francisco and the Peninsula. 100% solar autonomous van, cage-free comfort, and Hydra® botanical spa treatments.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/`,
  },
  "/services": {
    slug: "/services",
    title: "Services & Spa Pricing Menu | SOUVA Mobile Pet Grooming",
    description: "Explore SOUVA's luxury grooming services: Bath & Brush, Bath & Tidy, Essential Full Groom, and Signature Scissor Sculpting with Hydra® professional botanical cosmetics.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/services`,
    targetSection: "services",
  },
  "/coverage": {
    slug: "/coverage",
    title: "Service Areas & 38 Covered ZIP Codes | SOUVA Mobile Grooming",
    description: "Doorstep mobile dog grooming across San Francisco and the Peninsula. Real-time coverage checker for 38 Bay Area ZIP codes with 100% solar autonomous vans.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/coverage`,
    targetSection: "coverage",
  },
  "/portal": {
    slug: "/portal",
    title: "Client Portal & Booking Management | SOUVA Mobile Pet Grooming",
    description: "Access your SOUVA account to view upcoming appointments, reschedule doorstep grooming visits, download itemized invoices, and manage pet profiles.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/portal`,
  },
  "/links": {
    slug: "/links",
    title: "Official Quick Links & Concierge Hub | SOUVA Mobile Pet Grooming",
    description: "Fast access to doorstep grooming reservations, WhatsApp concierge, telephone booking, coverage checker, and client portal.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/links`,
  },
  "/before-after": {
    slug: "/before-after",
    title: "Before & After Grooming Transformations | SOUVA Portfolio",
    description: "See stunning before & after dog grooming transformations: Asian Fusion, teddy bear trims, breed standard scissoring, and coat restoration.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/before-after`,
    targetSection: "before-after",
  },
  "/reviews": {
    slug: "/reviews",
    title: "Verified 5-Star Pet Parent Reviews | SOUVA Mobile Pet Grooming",
    description: "Read real 5-star reviews from dog owners in San Francisco, Burlingame, San Mateo, and Palo Alto who trust SOUVA's solar mobile salon fleet.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/reviews`,
    targetSection: "reviews",
  },
  "/faq": {
    slug: "/faq",
    title: "Client FAQs & Direct Inquiry Desk | SOUVA Mobile Grooming",
    description: "Got questions about our solar vans, cage-free grooming, multi-dog discounts, or Hydra® cosmetics? Find answers or message our concierge directly.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/faq`,
    targetSection: "faq",
  },
  "/about": {
    slug: "/about",
    title: "About SOUVA · 100% Autonomous Solar Van Fleet Philosophy",
    description: "Discover SOUVA's revolutionary approach to pet care: zero generator noise, zero toxic exhaust fumes, 1-on-1 cage-free calm, and certified master stylings.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/about`,
    targetSection: "about",
  },
  "/gallery": {
    slug: "/gallery",
    title: "Solar Mobile Salon Fleet Gallery & Van Engineering | SOUVA",
    description: "Take a virtual tour inside our custom solar mobile grooming suites with Italian stainless hydro-massage tubs, hydraulic tables, and warm blow-drying.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/gallery`,
    targetSection: "gallery",
  },

  // ── LOCAL GEO CITY SLUGS ─────────────────────────────────────────────────────
  "/san-francisco": {
    slug: "/san-francisco",
    title: "Mobile Dog Grooming San Francisco CA | SOUVA® Luxury Solar Salon",
    description: "Premier 1-on-1 mobile dog grooming in West San Francisco (Sunset, Parkside, West Portal, Lake Merced, Glen Park). 100% solar autonomous van directly at your doorstep.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/san-francisco`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "San Francisco",
    geoDefaultZip: "94122",
    geoZips: ["94116", "94122", "94127", "94132", "94112", "94131"],
    geoNeighborhoods: "Sunset, Parkside, West Portal, Forest Hill, Lake Merced, Lakeside, Ingleside, Outer Mission, Glen Park, Diamond Heights",
  },
  "/san-mateo": {
    slug: "/san-mateo",
    title: "Mobile Dog Groomer San Mateo CA | SOUVA® Solar Mobile Pet Spa",
    description: "San Mateo's luxury mobile dog grooming van. Stress-free 1-on-1 grooming, Hydra® cosmetics, warm hydro-massage bath & master scissor haircuts at your home.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/san-mateo`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "San Mateo",
    geoDefaultZip: "94401",
    geoZips: ["94401", "94402", "94403"],
    geoNeighborhoods: "Downtown San Mateo, Baywood, Hillsdale, Aragon, Shoreview, Hayward Park",
  },
  "/burlingame": {
    slug: "/burlingame",
    title: "Mobile Pet Grooming Burlingame & Hillsborough CA | SOUVA®",
    description: "Doorstep luxury mobile dog grooming in Burlingame and Hillsborough. Whisper-quiet solar fleet, Asian Fusion styling, and 100% cage-free sanctuary.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/burlingame`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Burlingame & Hillsborough",
    geoDefaultZip: "94010",
    geoZips: ["94010"],
    geoNeighborhoods: "Burlingame Avenue, Broadway, Easton Addition, Ray Park, Hillsborough Estates",
  },
  "/palo-alto": {
    slug: "/palo-alto",
    title: "Mobile Dog Grooming Palo Alto & Stanford CA | SOUVA® Mobile Spa",
    description: "High-end mobile dog grooming in Palo Alto and Stanford. Autonomous solar van, master scissor cuts, oat spa treatments and cage-free comfort at your home.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/palo-alto`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Palo Alto",
    geoDefaultZip: "94301",
    geoZips: ["94301", "94303", "94304", "94306"],
    geoNeighborhoods: "University Ave, Midtown, Old Palo Alto, Crescent Park, Barron Park, College Terrace",
  },
  "/redwood-city": {
    slug: "/redwood-city",
    title: "Mobile Dog Groomer Redwood City & Woodside CA | SOUVA®",
    description: "Doorstep mobile pet grooming in Redwood City, Woodside, and Emerald Hills. Whisper-quiet solar lithium salon van with zero generator fumes or noise.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/redwood-city`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Redwood City",
    geoDefaultZip: "94061",
    geoZips: ["94061", "94062", "94063", "94065"],
    geoNeighborhoods: "Edgewood Park, Farm Hill, Redwood Shores, Emerald Hills, Mount Carmel",
  },
  "/daly-city": {
    slug: "/daly-city",
    title: "Mobile Dog Grooming Daly City & Colma CA | SOUVA® Fleet",
    description: "Premier cage-free mobile dog grooming across Daly City and Colma. Whisper-quiet solar van, warm hydromassage, and master breed scissoring at your door.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/daly-city`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Daly City & Colma",
    geoDefaultZip: "94015",
    geoZips: ["94014", "94015"],
    geoNeighborhoods: "Westlake, Serramonte, St. Francis, Gellert, Broadmoor, Colma",
  },
  "/south-san-francisco": {
    slug: "/south-san-francisco",
    title: "Mobile Dog Groomer South San Francisco CA | SOUVA®",
    description: "Mobile pet grooming in South San Francisco (Grand Ave, Westborough, Orange Park). 1-on-1 cage-free solar van delivered to your residence.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/south-san-francisco`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "South San Francisco",
    geoDefaultZip: "94080",
    geoZips: ["94080"],
    geoNeighborhoods: "Grand Avenue, Westborough, Sunshine Gardens, Avalon, Buri Buri, Sign Hill",
  },
  "/san-bruno": {
    slug: "/san-bruno",
    title: "Mobile Pet Grooming San Bruno CA | SOUVA® Solar Van",
    description: "Sanctuary-grade doorstep dog grooming in San Bruno. Quiet solar mobile salon, Hydra® oat shampoo baths, sanitary cuts and gentle care.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/san-bruno`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "San Bruno",
    geoDefaultZip: "94066",
    geoZips: ["94066"],
    geoNeighborhoods: "Rollingwood, Crestmoor, Mills Park, Huntington Park, Belle Air Park",
  },
  "/pacifica": {
    slug: "/pacifica",
    title: "Mobile Dog Groomer Pacifica CA · Coastal Route | SOUVA®",
    description: "Coastal mobile pet grooming in Pacifica (Linda Mar, Sharp Park, Vallemar). No salty sand stress - warm spa bath and blow dry at your driveway.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/pacifica`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Pacifica",
    geoDefaultZip: "94044",
    geoZips: ["94044"],
    geoNeighborhoods: "Linda Mar, Sharp Park, Rockaway Beach, Vallemar, Fairmont, Pedro Point",
  },
  "/millbrae": {
    slug: "/millbrae",
    title: "Mobile Pet Grooming Millbrae CA | SOUVA® Luxury Grooming",
    description: "Bespoke mobile dog grooming in Millbrae. Quiet autonomous solar van, cage-free personalized styling, and gentle breed trimming at your residence.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/millbrae`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Millbrae",
    geoDefaultZip: "94030",
    geoZips: ["94030"],
    geoNeighborhoods: "Meadows, Green Hills, Highlands, Millbrae Highlands, Lomita Park",
  },
  "/foster-city": {
    slug: "/foster-city",
    title: "Mobile Dog Grooming Foster City CA | SOUVA® Mobile Salon",
    description: "Waterfront doorstep dog grooming in Foster City. Whisper-quiet solar mobile van, Hydra® luxury shampoo, and gentle scissor styling.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/foster-city`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Foster City",
    geoDefaultZip: "94404",
    geoZips: ["94404"],
    geoNeighborhoods: "Metro Center, Vintage Park, Baybreeze, Harborview, Whalers Island",
  },
  "/belmont": {
    slug: "/belmont",
    title: "Mobile Dog Groomer Belmont CA | SOUVA® Pet Spa Fleet",
    description: "Private doorstep mobile grooming in Belmont. 100% solar power, cage-free luxury, warm hydro-baths, and Asian fusion styling.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/belmont`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Belmont",
    geoDefaultZip: "94002",
    geoZips: ["94002"],
    geoNeighborhoods: "Belmont Hills, Sterling Downs, Homeview, Hallmark, Plateau-Skymont",
  },
  "/san-carlos": {
    slug: "/san-carlos",
    title: "Mobile Dog Grooming San Carlos CA · City of Good Living | SOUVA®",
    description: "San Carlos luxury mobile pet grooming. 1-on-1 master scissor styling and botanical spa baths in an autonomous solar mobile salon at your doorstep.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/san-carlos`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "San Carlos",
    geoDefaultZip: "94070",
    geoZips: ["94070"],
    geoNeighborhoods: "White Oaks, Howard Park, Clearfield, Alder Manor, Beverly Terrace",
  },
  "/menlo-park": {
    slug: "/menlo-park",
    title: "Mobile Pet Grooming Menlo Park & Atherton CA | SOUVA®",
    description: "Elevated mobile dog grooming in Menlo Park and Atherton. Whisper-quiet solar salon van, gentle 1-on-1 care, and certified master stylings.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/menlo-park`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Menlo Park",
    geoDefaultZip: "94025",
    geoZips: ["94025", "94027"],
    geoNeighborhoods: "Allied Arts, Downtown Menlo Park, Sharon Heights, Vintage Oaks, Linfield Oaks",
  },
  "/atherton": {
    slug: "/atherton",
    title: "Mobile Dog Grooming Atherton CA · Private Estate Service | SOUVA®",
    description: "Private estate mobile pet grooming in Atherton. Discreet, whisper-quiet autonomous solar van with zero generator noise or emissions.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/atherton`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Atherton",
    geoDefaultZip: "94027",
    geoZips: ["94027"],
    geoNeighborhoods: "Lindenwood, West Atherton, Fair Oaks, Holbrook-Palmer",
  },
  "/woodside": {
    slug: "/woodside",
    title: "Mobile Dog Groomer Woodside CA | SOUVA® Solar Salon",
    description: "Doorstep luxury mobile pet grooming in Woodside. Gentle cage-free care, warm spa baths, and breed styling in our quiet solar mobile suite.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/woodside`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Woodside",
    geoDefaultZip: "94062",
    geoZips: ["94062"],
    geoNeighborhoods: "Central Woodside, Kings Mountain, Skywood, Woodside Hills",
  },
  "/mountain-view": {
    slug: "/mountain-view",
    title: "Mobile Dog Grooming Mountain View CA | SOUVA® Luxury Fleet",
    description: "Convenient doorstep mobile dog grooming in Mountain View. 100% solar autonomous van, cage-free 1-on-1 care, and Hydra® salon cosmetics.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/mountain-view`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Mountain View",
    geoDefaultZip: "94041",
    geoZips: ["94040", "94041", "94043"],
    geoNeighborhoods: "Castro Street, Old Mountain View, Cuesta Park, Monta Loma, Waverly Park",
  },
  "/half-moon-bay": {
    slug: "/half-moon-bay",
    title: "Mobile Dog Grooming Half Moon Bay CA · Coastside Route | SOUVA®",
    description: "Doorstep mobile dog grooming in Half Moon Bay and Coastside. Warm water hydro-massage, Hydra® coat repair, and gentle scissoring at your home.",
    canonicalUrl: `${OFFICIAL_DOMAIN}/half-moon-bay`,
    targetSection: "coverage",
    isGeoRoute: true,
    geoCity: "Half Moon Bay",
    geoDefaultZip: "94019",
    geoZips: ["94019"],
    geoNeighborhoods: "Main Street, Ocean Colony, Miramar, Frenchman's Creek, El Granada, Half Moon Bay State Beach",
  },
};

/**
 * Normalizes pathname to a known SEO route or returns default
 */
export function getSeoRouteMeta(rawPath: string): SeoRouteMeta {
  const cleanPath = (rawPath || "").toLowerCase().replace(/\/$/, "") || "/";
  if (SEO_ROUTES[cleanPath]) {
    return SEO_ROUTES[cleanPath];
  }
  // Fallback to root meta
  return SEO_ROUTES["/"];
}

/**
 * Dynamically updates document metadata, canonical tags, and OpenGraph/Twitter attributes
 * enforcing the official professional domain: https://www.souvagrooming.com
 */
export function applySeoMetadata(path: string): SeoRouteMeta {
  const meta = getSeoRouteMeta(path);

  if (typeof document === "undefined") {
    return meta;
  }

  // 1. Title
  document.title = meta.title;

  // 2. Meta description
  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) descEl.setAttribute("content", meta.description);

  const titleEl = document.querySelector('meta[name="title"]');
  if (titleEl) titleEl.setAttribute("content", meta.title);

  // 3. Canonical Link (MUST strictly use https://www.souvagrooming.com)
  let canonicalEl = document.getElementById("souva-canonical") as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.querySelector('link[rel="canonical"]');
  }
  if (canonicalEl) {
    canonicalEl.setAttribute("href", meta.canonicalUrl);
  }

  // 4. OpenGraph tags
  const ogUrl = document.getElementById("souva-og-url");
  if (ogUrl) ogUrl.setAttribute("content", meta.canonicalUrl);

  const ogTitle = document.getElementById("souva-og-title");
  if (ogTitle) ogTitle.setAttribute("content", meta.title);

  const ogDesc = document.getElementById("souva-og-desc");
  if (ogDesc) ogDesc.setAttribute("content", meta.description);

  // 5. Twitter tags
  const twUrl = document.getElementById("souva-tw-url");
  if (twUrl) twUrl.setAttribute("content", meta.canonicalUrl);

  const twTitle = document.getElementById("souva-tw-title");
  if (twTitle) twTitle.setAttribute("content", meta.title);

  const twDesc = document.getElementById("souva-tw-desc");
  if (twDesc) twDesc.setAttribute("content", meta.description);

  return meta;
}
