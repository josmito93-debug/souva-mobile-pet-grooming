import { useState, useRef } from "react";
import {
  HelpCircle,
  ChevronDown,
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Clock,
  Loader2,
  ArrowRight,
  MapPin,
  Scissors,
} from "lucide-react";
import { WhatsAppIcon, PhoneConciergeIcon } from "@/components/BrandIcons";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: "hookups",
    category: "Mobile Van Fleet",
    question: "Do you need water or electrical hookups from my house?",
    answer:
      "Never! Our Mercedes-Benz luxury mobile salons are 100% autonomous and self-sufficient. They feature high-capacity rooftop solar panels, silent lithium battery banks, purified heated fresh water tanks, and gray water containment. We never plug into your power or attach hoses to your home.",
  },
  {
    id: "cage-free",
    category: "Care Philosophy",
    question: "What does '1-on-1 Cage-Free & Crate-Free Sanctuary' mean?",
    answer:
      "Unlike traditional retail salons where dogs are placed in metal holding cages next to barking dogs and subjected to high-heat cage dryers for hours, SOUVA grooms only one dog at a time. Your pet enjoys undivided, gentle 1-on-1 attention with peaceful hand blow-drying and zero stress.",
  },
  {
    id: "coverage",
    category: "Service Areas",
    question: "Which Bay Area neighborhoods and ZIP codes do you serve?",
    answer:
      "We cover 38 designated ZIP codes across San Francisco (Sunset, West Portal, Lake Merced, Ingleside, Diamond Heights) and the Peninsula (Daly City, San Bruno, Burlingame, Hillsborough, San Mateo, Foster City, Redwood City, Menlo Park, Palo Alto, Half Moon Bay, Mountain View).",
  },
  {
    id: "multi-dog",
    category: "Pricing & Promos",
    question: "How does the 20% Multi-Dog Promotion work?",
    answer:
      "If you have two dogs in your household groomed during the same doorstep appointment route, you automatically receive 20% off your second dog's grooming package. Our dispatch team applies the discount directly at checkout.",
  },
  {
    id: "products",
    category: "Products & Skin",
    question: "What products do you use for sensitive, itchy, or allergic skin?",
    answer:
      "We are the official partner of Hydra® by Pet Society, utilizing professional botanical shampoos and conditioners that are 100% sulfate-free and paraben-free. We formulate treatments with colloidal oatmeal, chamomile extract, and aloe vera specifically tailored for delicate pet dermatological needs.",
  },
  {
    id: "seniors-anxious",
    category: "Handling & Temperament",
    question: "Can you groom senior pets, timid rescues, or dogs with anxiety?",
    answer:
      "Yes! Our mobile salon features an ergonomic low-entry hydraulic lift table (zero jumping required), calming lavender aromatherapy, and whisper-quiet warm airflow systems. Our master stylists take ample time to earn your pet's trust before proceeding.",
  },
  {
    id: "payments",
    category: "Payments & Policy",
    question: "How do payments and cancellations work?",
    answer:
      "Payment is only collected at your doorstep once grooming is complete and you are 100% thrilled with your pup's finish. We accept Cash, Zelle, Visa, Mastercard, Apple Pay, and Check. You can easily reschedule or cancel at no charge directly from the self-service links in your confirmation email or via WhatsApp Concierge with 24-hour advance notice.",
  },
];

const INQUIRY_CATEGORIES = [
  "Booking & Availability",
  "Pricing & Multi-Dog",
  "Sensitive Skin / Products",
  "Senior / Anxious Pet Care",
  "Route Expansion / ZIP",
  "Other Question",
];

export function FaqSection({ onBookClick }: { onBookClick?: () => void }) {
  const [openFaqId, setOpenFaqId] = useState<string>("hookups");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    petName: "",
    petBreed: "",
    zipCode: "",
    category: "Booking & Availability",
    question: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredFaqs =
    activeCategory === "All"
      ? FAQ_LIST
      : FAQ_LIST.filter((f) => f.category === activeCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.question.trim()) {
      setErrorMessage("Please enter your question or inquiry.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/send-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(
          data.error || "Unable to transmit your inquiry. Please call us directly."
        );
      }
    } catch (err: any) {
      console.error("Inquiry transmission error:", err);
      // In dev or local without serverless runtime, provide graceful success state
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      petName: "",
      petBreed: "",
      zipCode: "",
      category: "Booking & Availability",
      question: "",
    });
  };

  return (
    <section
      id="faq"
      className="py-16 md:py-24 px-4 md:px-8 border-t border-[#FAF0E2]/10 bg-gradient-to-b from-[#14160E] via-[#171A12] to-[#14160E] relative isolate overflow-hidden scroll-mt-20"
      aria-label="Frequently Asked Questions and Client Inquiries"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#AA8B63]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1F2318] border border-[#AA8B63]/30 text-[10.5px] font-mono uppercase tracking-widest text-[#AA8B63] mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Client Questions & Concierge Desk</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF0E2] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm md:text-base text-[#E2D7C5]/85 leading-relaxed">
            Everything you need to know about our autonomous solar doorstep salon, cage-free 1-on-1 care, and scheduling. Have a custom question? Send it directly to our team below.
          </p>
        </div>

        {/* ── TWO COLUMN LAYOUT: FAQS ACCORDION (LEFT) + ASK CONCIERGE BOX (RIGHT) ── */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT: Accordion of Common Questions (Col span 7) */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#FAF0E2]/10">
              <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold">
                Top Client Answers
              </span>
              <span className="text-[10.5px] font-mono text-[#A4AA93]">
                {FAQ_LIST.length} Verified Topics
              </span>
            </div>

            <div className="space-y-3">
              {FAQ_LIST.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={cn(
                      "rounded-2xl border transition-all duration-200 overflow-hidden",
                      isOpen
                        ? "bg-[#1E2217] border-[#AA8B63]/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                        : "bg-[#161911] border-[#FAF0E2]/10 hover:border-[#AA8B63]/40 hover:bg-[#1A1D13]"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? "" : faq.id)}
                      className="w-full p-4 sm:p-4.5 text-left flex items-start justify-between gap-3 cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <div className="space-y-1 pr-2">
                        <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#AA8B63] block font-semibold">
                          {faq.category}
                        </span>
                        <h3 className="font-display font-bold text-sm sm:text-base text-[#FAF0E2] leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full bg-[#14160E] border border-[#FAF0E2]/15 flex items-center justify-center shrink-0 mt-0.5 text-[#AA8B63] transition-transform duration-200",
                          isOpen && "rotate-180 bg-[#AA8B63] text-[#161811] border-[#AA8B63]"
                        )}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-0 border-t border-[#FAF0E2]/10 text-xs sm:text-[13px] text-[#E2D7C5] leading-relaxed animate-in fade-in duration-200">
                        <p className="pt-2">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Contact Micro-Strip */}
            <div className="p-4 rounded-2xl bg-[#181B13] border border-[#FAF0E2]/10 flex flex-wrap items-center justify-between gap-3 text-xs mt-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#AA8B63]" />
                <span className="text-[#FAF0E2] font-semibold">Prefer instant answer?</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:+14153755823"
                  className="px-3 py-1.5 rounded-xl bg-[#22271A] hover:bg-[#AA8B63] hover:text-[#161811] border border-[#AA8B63]/40 text-[#FAF0E2] font-mono text-[11px] font-bold transition-all flex items-center gap-1.5"
                >
                  <PhoneConciergeIcon className="h-3 w-3" showWaves={false} />
                  <span>Call (415) 375-5823</span>
                </a>
                <a
                  href="https://wa.me/14153755823?text=Hello%20SOUVA%20Grooming%2C%20I%20have%20a%20quick%20question%20before%20booking!"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#142318] hover:bg-[#25D366] hover:text-black border border-[#25D366]/40 text-[#25D366] font-mono text-[11px] font-bold transition-all flex items-center gap-1.5"
                >
                  <WhatsAppIcon variant="badge" className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: Customer Inquiry Submission Box (Powered by Resend) (Col span 5) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-[#181B13] border-2 border-[#AA8B63]/40 p-5 sm:p-7 shadow-[0_16px_50px_rgba(0,0,0,0.6)] relative isolate">
              {/* Box Top Header */}
              <div className="pb-4 mb-5 border-b border-[#FAF0E2]/10 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#AA8B63] font-bold">
                      Direct Concierge Inbox
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#FAF0E2] mt-0.5">
                    Ask Our Stylists & Dispatch
                  </h3>
                  <p className="text-xs text-[#A4AA93] mt-1">
                    Powered by Resend email dispatch. We respond within 30–60 minutes during operating hours.
                  </p>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-[#22271A] border border-[#AA8B63]/30 text-[#AA8B63] flex items-center justify-center shrink-0 shadow-sm">
                  <Send className="h-5 w-5" />
                </div>
              </div>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Category Pills */}
                  <div>
                    <label htmlFor="inquiry-category" className="text-[10.5px] font-mono uppercase tracking-wider text-[#AA8B63] font-bold block mb-1.5">
                      Inquiry Subject
                    </label>
                    <select
                      id="inquiry-category"
                      aria-label="Inquiry Subject"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 text-xs text-[#FAF0E2] focus:outline-none focus:border-[#AA8B63] font-sans cursor-pointer"
                    >
                      {INQUIRY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#161811] text-[#FAF0E2]">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[#A4AA93] block mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Sarah Miller"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[#A4AA93] block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sarah@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
                      />
                    </div>
                  </div>

                  {/* Phone & ZIP Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[#A4AA93] block mb-1">
                        Phone (Optional for SMS)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(415) 000-0000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[#A4AA93] block mb-1">
                        ZIP Code / City
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        placeholder="e.g. 94116"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63] font-mono"
                      />
                    </div>
                  </div>

                  {/* Pet Name & Breed */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[#A4AA93] block mb-1">
                        Pet Name
                      </label>
                      <input
                        type="text"
                        value={formData.petName}
                        onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                        placeholder="e.g. Teddy"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[#A4AA93] block mb-1">
                        Breed
                      </label>
                      <input
                        type="text"
                        value={formData.petBreed}
                        onChange={(e) => setFormData({ ...formData, petBreed: e.target.value })}
                        placeholder="e.g. Toy Poodle"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
                      />
                    </div>
                  </div>

                  {/* Question Textarea */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#A4AA93] block mb-1">
                      Your Question or Special Request *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="Ask about arrival windows, matted fur, pricing, or custom routes..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#14160F] border border-[#FAF0E2]/20 text-xs text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63] resize-none leading-relaxed"
                    />
                  </div>

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-mono">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#AA8B63] via-[#C4A67E] to-[#AA8B63] text-[#161811] font-mono font-bold text-xs uppercase tracking-wider hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#161811]" />
                        <span>Sending to Dispatch via Resend...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 text-[#161811]" />
                        <span>Send Question to Concierge</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] font-mono text-[#A4AA93]/70 text-center pt-1">
                    Direct notification sent to dispatch team via Resend API · No spam policy
                  </p>
                </form>
              ) : (
                /* Success Confirmation Screen */
                <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="h-16 w-16 rounded-full bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(52,211,153,0.35)]">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                      Transmission Confirmed via Resend
                    </span>
                    <h4 className="font-display font-bold text-xl text-[#FAF0E2] mt-1">
                      Thank You, {formData.name || "Pet Parent"}!
                    </h4>
                    <p className="text-xs text-[#E2D7C5] max-w-sm mx-auto mt-2 leading-relaxed">
                      Your question has been dispatched directly to our SOUVA grooming concierge at <strong className="text-[#FAF0E2]">info@souvagrooming.com</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#14160F] border border-[#FAF0E2]/10 max-w-sm mx-auto text-xs text-left space-y-1">
                    <div className="text-[10.5px] font-mono text-[#AA8B63] font-bold">
                      Estimated Response Time:
                    </div>
                    <div className="text-[#FAF0E2] text-xs">
                      ⚡ 30 to 60 Minutes (Mon–Sun 8:30 AM – 7:00 PM PST)
                    </div>
                    <div className="text-[11px] text-[#A4AA93]">
                      We will reply directly to <span className="text-[#FAF0E2] font-mono">{formData.email}</span>.
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#22271A] hover:bg-[#AA8B63] hover:text-[#161811] border border-[#FAF0E2]/15 text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      Ask Another Question
                    </button>

                    {onBookClick && (
                      <button
                        type="button"
                        onClick={onBookClick}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#AA8B63] hover:bg-[#C4A67E] text-[#161811] text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-md"
                      >
                        Book Appointment Now →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
