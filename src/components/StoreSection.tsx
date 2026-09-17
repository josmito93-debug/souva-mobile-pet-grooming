import { useState } from "react";
import { Sparkles, ShoppingBag, Gift, Package } from "lucide-react";
import { SOUVA_PRODUCTS, Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useCart } from "@/lib/cartContext";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | "bundles" | "bath" | "care" | "fragrance" | "accessories";

export function StoreSection() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { totalItems, setIsOpen } = useCart();

  const categories: { id: CategoryFilter; label: string; icon: string }[] = [
    { id: "all", label: "All Items", icon: "✨" },
    { id: "bundles", label: "Curated Bundles", icon: "🎁" },
    { id: "bath", label: "Bath & Shampoos", icon: "🫧" },
    { id: "care", label: "Paw & Skin Care", icon: "🐾" },
    { id: "fragrance", label: "Botanical Colognes", icon: "🌸" },
    { id: "accessories", label: "Accessories", icon: "⭐" },
  ];

  const filteredProducts =
    activeCategory === "all"
      ? SOUVA_PRODUCTS
      : SOUVA_PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <section id="store" className="py-16 md:py-24 px-4 md:px-8 border-t border-[#FAF0E2]/10 bg-[#171912] relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#AA8B63]/30 bg-[#25281D] px-3.5 py-1 text-[11px] font-mono font-bold tracking-wider text-[#AA8B63] uppercase mb-3">
              <Sparkles className="h-3 w-3" />
              <span>SOUVA BOUTIQUE COLLECTION</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF0E2]">
              Botanical Grooming Line & Home Spa Kits
            </h2>

            <p className="mt-3 text-sm md:text-base text-[#A4AA93] max-w-xl leading-relaxed">
              Experience the same pure organic formulas utilized inside our solar-powered mobile vans.
              Cruelty-free, vegan, pH-balanced, and infused with therapeutic botanicals.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="self-start md:self-auto px-5 py-3 rounded-2xl bg-[#23271B] border border-[#FAF0E2]/15 hover:border-[#AA8B63] flex items-center gap-3 text-xs font-mono font-bold text-[#FAF0E2] transition-colors cursor-pointer shadow-lg"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4 text-[#AA8B63]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#AA8B63] text-[#161811] text-[9px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span>View Bag ({totalItems})</span>
          </button>
        </div>

        {/* Highlight Feature Banner for Bundles */}
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#2A3021] via-[#242A1D] to-[#1C1F15] border border-[#AA8B63]/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#AA8B63] uppercase tracking-wider mb-2">
              <Gift className="h-4 w-4" />
              <span>EXCLUSIVE CURATED SAVINGS</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF0E2]">
              Home Spa Kits with up to $20 in Savings
            </h3>
            <p className="text-xs sm:text-sm text-[#E2D7C5] mt-2 leading-relaxed">
              Complete wellness systems featuring our organic oat shampoo, silk detangler,
              paw healing butter, and eco-hardwood pin brush — plus a complimentary luxury canvas bag.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              type="button"
              onClick={() => setActiveCategory("bundles")}
              className="px-6 py-3.5 rounded-2xl bg-[#AA8B63] text-[#161811] font-display font-bold text-xs tracking-wider uppercase hover:bg-[#C4A67E] transition-all cursor-pointer shadow-xl flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              <span>Explore Curated Bundles</span>
            </button>
          </div>
        </div>

        {/* Category Filters Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all duration-300 cursor-pointer select-none flex items-center gap-2 border",
                  isActive
                    ? "bg-[#AA8B63] border-[#AA8B63] text-[#161811] shadow-[0_0_15px_rgba(170,139,99,0.35)] scale-102"
                    : "bg-[#1E2117] border-[#FAF0E2]/10 text-[#A4AA93] hover:text-[#FAF0E2] hover:border-[#AA8B63]/40"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
