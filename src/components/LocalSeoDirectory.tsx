import { MapPin, ShieldCheck, Sparkles, Navigation, Phone, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { SOUVA_COVERAGE_ZONES, COVERED_ZIP_CODES } from "@/data/coverage";
import { cn } from "@/lib/utils";

interface LocalSeoDirectoryProps {
  onBookClick: () => void;
  onSelectCity?: (slug: string) => void;
  activeSlug?: string;
}

export function LocalSeoDirectory({ onBookClick, onSelectCity, activeSlug }: LocalSeoDirectoryProps) {
  const handleCityClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    if (onSelectCity) {
      onSelectCity(slug);
    } else {
      window.history.pushState({}, "", slug);
      const coverageEl = document.getElementById("coverage");
      if (coverageEl) {
        coverageEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <section
      id="local-seo-directory"
      aria-label="Local Service Areas & Covered ZIP Codes Directory"
      className="py-14 px-4 md:px-8 border-t border-[#FAF0E2]/10 bg-[#12140D] text-xs text-[#A4AA93]"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#FAF0E2]/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#AA8B63] font-bold block mb-1">
              Doorstep Service Radius · California Licensed & Insured
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#FAF0E2] tracking-tight">
              Bay Area Mobile Dog Grooming Service Directory
            </h2>
            <p className="text-xs text-[#E2D7C5]/80 mt-1 max-w-2xl leading-relaxed">
              Serving premier neighborhoods across San Francisco, North Peninsula, Central Peninsula, South Peninsula, and Half Moon Bay with quiet 100% solar autonomous mobile salon vans.
            </p>
          </div>

          <button
            type="button"
            onClick={onBookClick}
            className="self-start md:self-auto px-5 py-2.5 rounded-full bg-[#AA8B63] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#C4A67E] transition-all cursor-pointer shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Check My ZIP Code</span>
          </button>
        </div>

        {/* Quick Local Hub Navigation Pills */}
        <div className="p-4 rounded-2xl bg-[#171A12] border border-[#FAF0E2]/10 space-y-2.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#AA8B63] font-bold block">
            📍 Select City Route For Doorstep Dispatch Details:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "San Francisco", slug: "/san-francisco" },
              { name: "San Mateo", slug: "/san-mateo" },
              { name: "Burlingame & Hillsborough", slug: "/burlingame" },
              { name: "Palo Alto", slug: "/palo-alto" },
              { name: "Redwood City", slug: "/redwood-city" },
              { name: "Daly City", slug: "/daly-city" },
              { name: "South San Francisco", slug: "/south-san-francisco" },
              { name: "Pacifica", slug: "/pacifica" },
              { name: "San Bruno", slug: "/san-bruno" },
              { name: "Millbrae", slug: "/millbrae" },
              { name: "Foster City", slug: "/foster-city" },
              { name: "Belmont", slug: "/belmont" },
              { name: "San Carlos", slug: "/san-carlos" },
              { name: "Menlo Park", slug: "/menlo-park" },
              { name: "Atherton", slug: "/atherton" },
              { name: "Woodside", slug: "/woodside" },
              { name: "Mountain View", slug: "/mountain-view" },
              { name: "Half Moon Bay", slug: "/half-moon-bay" },
            ].map((c) => (
              <a
                key={c.slug}
                href={c.slug}
                onClick={(e) => handleCityClick(e, c.slug)}
                className={cn(
                  "px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5",
                  activeSlug === c.slug
                    ? "bg-[#AA8B63] text-[#161811] border-[#AA8B63] font-bold shadow-md scale-105"
                    : "bg-[#1E2218] border-[#FAF0E2]/15 text-[#FAF0E2] hover:border-[#AA8B63] hover:text-[#AA8B63]"
                )}
              >
                <span>{c.name}</span>
                <ArrowRight className="h-2.5 w-2.5 opacity-60" />
              </a>
            ))}
          </div>
        </div>

        {/* 4 Regions Breakdown with Specific ZIP Codes */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Zone 1: San Francisco Select */}
          <div className="p-4 rounded-2xl bg-[#171A12] border border-[#FAF0E2]/10 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#FAF0E2]/10">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#AA8B63] shrink-0" />
                <h3 className="font-display font-bold text-sm text-[#FAF0E2]">
                  San Francisco (Select)
                </h3>
              </div>
              <a
                href="/san-francisco"
                onClick={(e) => handleCityClick(e, "/san-francisco")}
                className="text-[10px] font-mono text-[#AA8B63] hover:underline"
              >
                Route View →
              </a>
            </div>
            <p className="text-[11px] leading-relaxed text-[#A4AA93]">
              Premier mobile pet grooming in West SF. We park directly at your residence with zero street hookups.
            </p>
            <ul className="space-y-1 text-[11px] text-[#FAF0E2]/90">
              <li>• Sunset & Parkside · <strong>94116, 94122</strong></li>
              <li>• West Portal & Forest Hill · <strong>94127</strong></li>
              <li>• Lake Merced & Lakeside · <strong>94132</strong></li>
              <li>• Ingleside & Outer Mission · <strong>94112</strong></li>
              <li>• Glen Park & Diamond Heights · <strong>94131</strong></li>
            </ul>
          </div>

          {/* Zone 2: North Peninsula */}
          <div className="p-4 rounded-2xl bg-[#171A12] border border-[#FAF0E2]/10 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#FAF0E2]/10">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-[#AA8B63] shrink-0" />
                <h3 className="font-display font-bold text-sm text-[#FAF0E2]">
                  North Peninsula
                </h3>
              </div>
              <a
                href="/daly-city"
                onClick={(e) => handleCityClick(e, "/daly-city")}
                className="text-[10px] font-mono text-[#AA8B63] hover:underline"
              >
                Route View →
              </a>
            </div>
            <p className="text-[11px] leading-relaxed text-[#A4AA93]">
              Cage-free luxury bath and haircut appointments delivered across northern San Mateo county.
            </p>
            <ul className="space-y-1 text-[11px] text-[#FAF0E2]/90">
              <li>• Daly City & Colma · <strong>94014, 94015</strong></li>
              <li>• South San Francisco · <strong>94080</strong></li>
              <li>• San Bruno · <strong>94066</strong></li>
              <li>• Pacifica Coast · <strong>94044</strong></li>
              <li>• Brisbane · <strong>94005</strong></li>
            </ul>
          </div>

          {/* Zone 3: Central Peninsula */}
          <div className="p-4 rounded-2xl bg-[#171A12] border border-[#FAF0E2]/10 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#FAF0E2]/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#AA8B63] shrink-0" />
                <h3 className="font-display font-bold text-sm text-[#FAF0E2]">
                  Central Peninsula
                </h3>
              </div>
              <a
                href="/san-mateo"
                onClick={(e) => handleCityClick(e, "/san-mateo")}
                className="text-[10px] font-mono text-[#AA8B63] hover:underline"
              >
                Route View →
              </a>
            </div>
            <p className="text-[11px] leading-relaxed text-[#A4AA93]">
              Specialist Asian Fusion, breed standard scissoring, and luxury oat spa washes.
            </p>
            <ul className="space-y-1 text-[11px] text-[#FAF0E2]/90">
              <li>• Burlingame & Hillsborough · <strong>94010</strong></li>
              <li>• San Mateo · <strong>94401, 94402, 94403</strong></li>
              <li>• Foster City · <strong>94404</strong></li>
              <li>• Millbrae · <strong>94030</strong></li>
              <li>• Belmont & San Carlos · <strong>94002, 94070</strong></li>
            </ul>
          </div>

          {/* Zone 4: South Peninsula & Coast */}
          <div className="p-4 rounded-2xl bg-[#171A12] border border-[#FAF0E2]/10 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#FAF0E2]/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#AA8B63] shrink-0" />
                <h3 className="font-display font-bold text-sm text-[#FAF0E2]">
                  South Peninsula & Coast
                </h3>
              </div>
              <a
                href="/palo-alto"
                onClick={(e) => handleCityClick(e, "/palo-alto")}
                className="text-[10px] font-mono text-[#AA8B63] hover:underline"
              >
                Route View →
              </a>
            </div>
            <p className="text-[11px] leading-relaxed text-[#A4AA93]">
              Private mobile salon service for estate homes, suburban driveways, and coastside communities.
            </p>
            <ul className="space-y-1 text-[11px] text-[#FAF0E2]/90">
              <li>• Redwood City & Woodside · <strong>94061, 94062, 94063, 94065</strong></li>
              <li>• Atherton & Menlo Park · <strong>94027, 94025</strong></li>
              <li>• Palo Alto & East Palo Alto · <strong>94301, 94303, 94304, 94306</strong></li>
              <li>• Mountain View · <strong>94040, 94041, 94043</strong></li>
              <li>• Half Moon Bay Coastside · <strong>94019</strong></li>
            </ul>
          </div>
        </div>

        {/* All Covered ZIP Codes Exhaustive Pill Strip */}
        <div className="p-4 rounded-2xl bg-[#171A12] border border-[#FAF0E2]/10 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold">
              All Active Covered ZIP Codes ({COVERED_ZIP_CODES.length} Postcodes)
            </span>
            <span className="text-[10.5px] font-mono text-emerald-400">
              ● Same-Day Route Optimization Active
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COVERED_ZIP_CODES.map((zip) => (
              <span
                key={zip}
                className="px-2 py-0.5 rounded-lg bg-[#21261B] border border-[#FAF0E2]/10 text-[10.5px] font-mono text-[#FAF0E2] hover:border-[#AA8B63] hover:text-[#AA8B63] transition-colors"
              >
                ZIP {zip}
              </span>
            ))}
          </div>
        </div>

        {/* Local SEO Keywords Footer Text */}
        <div className="text-[10.5px] leading-relaxed text-[#D5D9C7] space-y-1.5 border-t border-[#FAF0E2]/15 pt-4">
          <p>
            <strong>Popular Searches:</strong> Mobile pet grooming near me, mobile dog grooming San Francisco, mobile dog groomer San Mateo, Burlingame mobile pet spa, cage free dog grooming Peninsula, luxury puppy grooming Palo Alto, cat and dog mobile bath Redwood City, mobile pet grooming 94122, dog wash 94010, mobile pet groomer Mountain View CA, solar mobile grooming van California.
          </p>
          <p>
            Operated by SOUVA CORP. Official domain: <strong className="text-[#FAF0E2]">https://www.souvagrooming.com</strong>. Official partner of Hydra® by Pet Society luxury botanical pet cosmetics. Certified master stylists offering gentle 1-on-1 care, warm water baths, hand blow-drying, sanitary styling, and custom Asian Fusion scissor haircuts.
          </p>
        </div>
      </div>
    </section>
  );
}
