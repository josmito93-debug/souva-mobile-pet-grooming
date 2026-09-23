import { useEffect } from "react";
import { X, Shield, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { SOUVA_TERMS } from "@/data/terms";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] bg-[#161811] border border-[#FAF0E2]/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#FAF0E2]/10 bg-[#1C2016] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-[#AA8B63]/20 border border-[#AA8B63]/40 flex items-center justify-center text-[#AA8B63] shrink-0 mt-0.5">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#AA8B63] font-bold block">
                Official Corporate Policy · SOUVA CORP
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#FAF0E2] tracking-tight">
                Terms & Conditions of Service
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#A4AA93]">
                <span>Effective Date: {SOUVA_TERMS.effectiveDate}</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                  <Shield className="h-3 w-3" />
                  <span>California Corporation</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-[#252A1C] border border-[#FAF0E2]/10 text-[#FAF0E2] hover:text-[#AA8B63] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-xs text-[#E2D7C5]/90 leading-relaxed scrollbar-thin scrollbar-thumb-[#AA8B63]/30">
          {/* Corporate Notice */}
          <div className="p-4 rounded-2xl bg-[#1D2116] border border-[#AA8B63]/30 space-y-2">
            <p className="font-semibold text-[#FAF0E2]">
              {SOUVA_TERMS.company}
            </p>
            <p className="text-[11.5px] text-[#A4AA93]">
              {SOUVA_TERMS.intro}
            </p>
          </div>

          {/* Quick Table of Contents Grid */}
          <div className="p-4 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block mb-2.5">
              Articles Directory (16 Sections)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              {SOUVA_TERMS.sections.map((sec) => (
                <a
                  key={sec.number}
                  href={`#terms-sec-${sec.number}`}
                  className="text-[#FAF0E2]/80 hover:text-[#AA8B63] transition-colors truncate flex items-center gap-1.5 py-0.5"
                >
                  <span className="text-[#AA8B63] font-mono text-[10px] w-5 shrink-0">{sec.number}.</span>
                  <span className="truncate">{sec.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* 16 Detailed Sections */}
          <div className="space-y-6 pt-2">
            {SOUVA_TERMS.sections.map((sec) => (
              <div
                key={sec.number}
                id={`terms-sec-${sec.number}`}
                className="p-4 sm:p-5 rounded-2xl bg-[#1A1D14] border border-[#FAF0E2]/10 space-y-2.5 scroll-mt-4"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-[#FAF0E2]/10">
                  <span className="h-6 w-6 rounded-lg bg-[#AA8B63]/20 border border-[#AA8B63]/40 text-[#AA8B63] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {sec.number}
                  </span>
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#FAF0E2]">
                    {sec.title}
                  </h3>
                </div>

                <div className="space-y-2 text-[12px] sm:text-[12.5px] text-[#E2D7C5]/90">
                  {sec.paragraphs.map((p, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="space-y-1.5 pt-1 pl-2">
                      {sec.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-[11.5px] text-[#FAF0E2]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#AA8B63] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="p-4 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/10 text-[11px] text-[#A4AA93] italic leading-relaxed">
            {SOUVA_TERMS.footerNote}
          </div>
        </div>

        {/* Modal Footer Action */}
        <div className="p-4 sm:p-5 border-t border-[#FAF0E2]/10 bg-[#1C2016] flex items-center justify-between gap-4">
          <span className="text-[11px] font-mono text-[#A4AA93]">
            SOUVA CORP · All Rights Reserved
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#AA8B63] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#C4A67E] transition-colors cursor-pointer shadow-md"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
}
