export interface CoverageAreaItem {
  zone: string;
  cityArea: string;
  zipCodes: string[];
}

export const SOUVA_COVERAGE_ZONES: CoverageAreaItem[] = [
  // San Francisco – Select
  { zone: "San Francisco – Select", cityArea: "Sunset / Parkside", zipCodes: ["94116"] },
  { zone: "San Francisco – Select", cityArea: "Sunset", zipCodes: ["94122"] },
  { zone: "San Francisco – Select", cityArea: "West Portal / Forest Hill", zipCodes: ["94127"] },
  { zone: "San Francisco – Select", cityArea: "Lakeside / Lake Merced", zipCodes: ["94132"] },
  { zone: "San Francisco – Select", cityArea: "Ingleside / Outer Mission", zipCodes: ["94112"] },
  { zone: "San Francisco – Select", cityArea: "Glen Park / Diamond Heights", zipCodes: ["94131"] },

  // North Peninsula
  { zone: "North Peninsula", cityArea: "Daly City", zipCodes: ["94014", "94015"] },
  { zone: "North Peninsula", cityArea: "Colma", zipCodes: ["94014"] },
  { zone: "North Peninsula", cityArea: "Brisbane", zipCodes: ["94005"] },
  { zone: "North Peninsula", cityArea: "South San Francisco", zipCodes: ["94080"] },
  { zone: "North Peninsula", cityArea: "San Bruno", zipCodes: ["94066"] },
  { zone: "North Peninsula", cityArea: "Pacifica", zipCodes: ["94044"] },

  // Central Peninsula
  { zone: "Central Peninsula", cityArea: "Millbrae", zipCodes: ["94030"] },
  { zone: "Central Peninsula", cityArea: "Burlingame", zipCodes: ["94010"] },
  { zone: "Central Peninsula", cityArea: "Hillsborough", zipCodes: ["94010"] },
  { zone: "Central Peninsula", cityArea: "San Mateo", zipCodes: ["94401", "94402", "94403"] },
  { zone: "Central Peninsula", cityArea: "Foster City", zipCodes: ["94404"] },
  { zone: "Central Peninsula", cityArea: "Belmont", zipCodes: ["94002"] },
  { zone: "Central Peninsula", cityArea: "San Carlos", zipCodes: ["94070"] },

  // South Peninsula
  { zone: "South Peninsula", cityArea: "Redwood City", zipCodes: ["94061", "94062", "94063", "94065"] },
  { zone: "South Peninsula", cityArea: "Woodside", zipCodes: ["94062"] },
  { zone: "South Peninsula", cityArea: "Atherton", zipCodes: ["94027"] },
  { zone: "South Peninsula", cityArea: "Menlo Park", zipCodes: ["94025"] },
  { zone: "South Peninsula", cityArea: "East Palo Alto", zipCodes: ["94303"] },
  { zone: "South Peninsula", cityArea: "Palo Alto", zipCodes: ["94301", "94303", "94304", "94306"] },
  { zone: "South Peninsula", cityArea: "Mountain View", zipCodes: ["94040", "94041", "94043"] },

  // Coastside
  { zone: "Coastside Peninsula", cityArea: "Half Moon Bay", zipCodes: ["94019"] },
];

// All distinct covered 5-digit ZIP codes
export const COVERED_ZIP_CODES: string[] = Array.from(
  new Set(SOUVA_COVERAGE_ZONES.flatMap((z) => z.zipCodes))
);

export interface CoverageResult {
  covered: boolean;
  zone?: string;
  cityArea?: string;
  zipCode?: string;
}

export function checkCoverage(zip: string): CoverageResult {
  const clean = (zip || "").trim().slice(0, 5);
  if (!clean || clean.length < 5) {
    return { covered: false };
  }

  for (const item of SOUVA_COVERAGE_ZONES) {
    if (item.zipCodes.includes(clean)) {
      return {
        covered: true,
        zone: item.zone,
        cityArea: item.cityArea,
        zipCode: clean,
      };
    }
  }

  return { covered: false, zipCode: clean };
}

// Popular doorstep cities & preset addresses for instant autocomplete
export const SUGGESTED_AREAS = [
  { city: "San Francisco", area: "Sunset / Parkside", zip: "94116" },
  { city: "San Francisco", area: "Sunset", zip: "94122" },
  { city: "San Francisco", area: "West Portal", zip: "94127" },
  { city: "Daly City", area: "North Peninsula", zip: "94015" },
  { city: "South San Francisco", area: "Grand Ave area", zip: "94080" },
  { city: "Pacifica", area: "Coastal area", zip: "94044" },
  { city: "Burlingame", area: "Downtown / El Camino", zip: "94010" },
  { city: "San Mateo", area: "Central Peninsula", zip: "94401" },
  { city: "Foster City", area: "Metro Center", zip: "94404" },
  { city: "San Carlos", area: "City of Good Living", zip: "94070" },
  { city: "Redwood City", area: "Downtown / Hills", zip: "94061" },
  { city: "Menlo Park", area: "Santa Cruz Ave area", zip: "94025" },
  { city: "Palo Alto", area: "University Ave / Midtown", zip: "94301" },
  { city: "Mountain View", area: "Castro St area", zip: "94041" },
  { city: "Half Moon Bay", area: "Main St / Coastside", zip: "94019" },
];
