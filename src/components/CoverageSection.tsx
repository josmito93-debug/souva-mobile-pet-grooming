import { useState } from "react";
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Search,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { checkCoverage, SOUVA_COVERAGE_ZONES, COVERED_ZIP_CODES } from "@/data/coverage";
import { cn } from "@/lib/utils";

export function CoverageSection({ onBookClick }: { onBookClick: () => void }) {
  const [zipInput, setZipInput] = useState("");
  const [hasChecked, setHasChecked] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  const checkResult = zipInput.length >= 5 ? checkCoverage(zipInput) : null;

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipInput.trim().length >= 5) {
      setHasChecked(true);
    }
  };

  const zonesGrouped = [
    {
      title: "San Francisco – Select",
      badge: "6 ZIP Codes",
      items: [
        { area: "Sunset / Parkside", zips: ["94116"] },
        { area: "Sunset", zips: ["94122"] },
        { area: "West Portal / Forest Hill", zips: ["94127"] },
        { area: "Lakeside / Lake Merced", zips: ["94132"] },
        { area: "Ingleside / Outer Mission", zips: ["94112"] },
        { area: "Glen Park / Diamond Heights", zips: ["94131"] },
      ],
    },
    {
      title: "North Peninsula",
      badge: "6 ZIP Codes",
      items: [
        { area: "Daly City", zips: ["94014", "94015"] },
        { area: "Colma", zips: ["94014"] },
        { area: "Brisbane", zips: ["94005"] },
        { area: "South San Francisco", zips: ["94080"] },
        { area: "San Bruno", zips: ["94066"] },
        { area: "Pacifica", zips: ["94044"] },
      ],
    },
    {
      title: "Central Peninsula",
      badge: "8 ZIP Codes",
      items: [
        { area: "Millbrae", zips: ["94030"] },
        { area: "Burlingame & Hillsborough", zips: ["94010"] },
        { area: "San Mateo", zips: ["94401", "94402", "94403"] },
        { area: "Foster City", zips: ["94404"] },
        { area: "Belmont", zips: ["94002"] },
        { area: "San Carlos", zips: ["94070"] },
      ],
    },
    {
      title: "South Peninsula & Coastside",
      badge: "14 ZIP Codes",
      items: [
        { area: "Redwood City", zips: ["94061", "94062", "94063", "94065"] },
        { area: "Woodside", zips: ["94062"] },
        { area: "Atherton", zips: ["94027"] },
        { area: "Menlo Park", zips: ["94025"] },
        { area: "East Palo Alto", zips: ["94303"] },
        { area: "Palo Alto", zips: ["94301", "94303", "94304", "94306"] },
        { area: "Mountain View", zips: ["94040", "94041", "94043"] },
        { area: "Half Moon Bay (Coastside)", zips: ["94019"] },
      ],
    },
  ];

  return (
    <section id="coverage" className="py-16 md:py-24 px-4 md:px-8 border-t border-[#FAF0E2]/10 bg-[#161811] relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-bold font-mono tracking-widest text-[#AA8B63] uppercase block mb-2">
            {"// SERVICE COVERAGE // SOUVA MOBILE"}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF0E2]">
            San Francisco & Peninsula
          </h2>
          <p className="mt-3 text-[#E2D7C5] text-sm md:text-base leading-relaxed">
            Our autonomous solar mobile spa travels directly to your doorstep across the following selected coverage zones.
          </p>
        </div>

        {/* Live ZIP Code Checker Box */}
        <div className="max-w-xl mx-auto mb-14 p-5 sm:p-6 rounded-3xl bg-[#1D2116] border border-[#FAF0E2]/15 shadow-2xl">
          <div className="text-center mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AA8B63]">
              Instant Coverage Checker
            </span>
            <h3 className="font-display font-bold text-lg text-[#FAF0E2] mt-0.5">
              Do we service your ZIP code?
            </h3>
          </div>

          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AA8B63]" />
              <input
                type="text"
                maxLength={5}
                value={zipInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 5);
                  setZipInput(val);
                  if (val.length === 5) {
                    setHasChecked(true);
                  } else {
                    setHasChecked(false);
                  }
                }}
                placeholder="Enter your 5-digit ZIP (e.g. 94122, 94010)"
                className="w-full pl-10 pr-3 h-11 bg-[#14160F] border border-[#FAF0E2]/15 rounded-xl text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/40 focus:outline-none focus:border-[#AA8B63]"
              />
            </div>
            <button
              type="submit"
              disabled={zipInput.length < 5}
              className="h-11 px-5 rounded-xl bg-[#AA8B63] text-[#161811] text-xs font-mono font-bold tracking-wider uppercase hover:bg-[#C4A67E] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Check Coverage</span>
            </button>
          </form>

          {/* Verification Results */}
          {hasChecked && checkResult && (
            <div className="mt-4 pt-4 border-t border-[#FAF0E2]/10 animate-in fade-in duration-200">
              {checkResult.covered ? (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-300 block">
                      Great news! We service your neighborhood in {checkResult.cityArea} ({checkResult.zone})
                    </span>
                    <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                      Our autonomous solar van arrives directly at your doorstep to pamper your pet.
                    </p>
                    <button
                      type="button"
                      onClick={onBookClick}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-[11px] font-mono font-bold uppercase tracking-wider hover:bg-emerald-400 transition-colors cursor-pointer"
                    >
                      <span>Book Appointment in {checkResult.zipCode}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <span className="text-xs font-bold text-red-300 block">
                      We do not service ZIP code {checkResult.zipCode} yet
                    </span>
                    <p className="text-[11px] text-red-200/80 leading-relaxed">
                      We currently operate in select San Francisco neighborhoods and Peninsula cities (Daly City through Mountain View & Half Moon Bay).
                    </p>

                    {/* Waitlist inline */}
                    {!waitlistJoined ? (
                      <div className="pt-2 flex flex-col sm:flex-row gap-1.5">
                        <input
                          type="email"
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          placeholder="Your email to notify you when we expand"
                          className="flex-1 px-2.5 h-8 bg-[#14160F] border border-red-500/30 rounded-lg text-[11px] text-[#FAF0E2] placeholder:text-red-200/40"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (waitlistEmail.includes("@")) setWaitlistJoined(true);
                          }}
                          className="h-8 px-3 rounded-lg bg-red-500/80 text-white text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-red-500 transition-colors shrink-0 cursor-pointer"
                        >
                          Notify Me
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-emerald-300 pt-1 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>Saved! We'll notify you with priority when our route expands to your area.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4 Zones Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {zonesGrouped.map((zone) => (
            <div
              key={zone.title}
              className="p-5 rounded-3xl bg-[#1B1E15] border border-[#FAF0E2]/10 hover:border-[#AA8B63]/40 transition-colors flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#FAF0E2]/10 mb-3">
                  <h3 className="font-display font-bold text-sm text-[#FAF0E2]">
                    {zone.title}
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-[#AA8B63] bg-[#AA8B63]/15 px-2 py-0.5 rounded-full">
                    {zone.badge}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {zone.items.map((it) => (
                    <div key={it.area} className="flex items-start justify-between gap-2">
                      <span className="text-[#A4AA93] text-[11.5px] leading-tight">
                        {it.area}
                      </span>
                      <span className="font-mono text-[10.5px] font-bold text-[#FAF0E2] shrink-0">
                        {it.zips.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#FAF0E2]/5 text-center">
                <span className="text-[10px] font-mono text-[#AA8B63] flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Doorstep Solar Service</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Multi-Dog Callout */}
        <div className="mt-12 p-6 rounded-3xl bg-[#191D13] border border-[#AA8B63]/30 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-[#AA8B63]" />
              <span className="font-display font-bold text-base text-[#FAF0E2]">
                Have Two Dogs?
              </span>
            </div>
            <p className="text-xs text-[#A4AA93]">
              Book for two dogs during the same appointment visit and enjoy an automatic <strong className="text-[#FAF0E2]">20% discount on the second dog</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={onBookClick}
            className="px-5 py-2.5 rounded-full bg-[#AA8B63] text-[#161811] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#C4A67E] transition-colors cursor-pointer shrink-0 shadow-md"
          >
            Book Now
          </button>
        </div>
      </div>
    </section>
  );
}
