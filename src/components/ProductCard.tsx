import { useState } from "react";
import { Star, ShoppingBag, Eye, Check, Sparkles } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/lib/cartContext";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  onOpenDetails,
}: {
  product: Product;
  onOpenDetails: (p: Product) => void;
}) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className={cn(
        "group rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer select-none relative",
        product.isBundle
          ? "bg-gradient-to-b from-[#252A1C] to-[#1C1F15] border-[#AA8B63]/40 hover:border-[#AA8B63] shadow-xl hover:shadow-[0_12px_36px_rgba(170,139,99,0.15)]"
          : "bg-[#1C1E16] border-[#FAF0E2]/10 hover:border-[#AA8B63]/40 shadow-lg hover:shadow-2xl"
      )}
    >
      {/* Top Badge */}
      {product.badge && (
        <div className="absolute top-3.5 left-3.5 z-20">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[9.5px] font-mono font-bold uppercase tracking-wider shadow-md flex items-center gap-1",
              product.isBundle
                ? "bg-[#AA8B63] text-[#161811]"
                : "bg-[#272B1E] border border-[#AA8B63]/40 text-[#FAF0E2]"
            )}
          >
            <Sparkles className="h-2.5 w-2.5" />
            <span>{product.badge}</span>
          </span>
        </div>
      )}

      {/* Image Showcase Container */}
      <div className="relative w-full aspect-[4/3.8] bg-[#14160F] p-4 flex items-center justify-center overflow-hidden border-b border-[#FAF0E2]/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1C1E16]/40 pointer-events-none" />
        <img
          src={product.image}
          alt={product.name}
          className="h-full max-h-[200px] w-auto max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
        />

        {/* Quick view hover icon */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="h-8 w-8 rounded-full bg-[#25281D]/90 border border-[#FAF0E2]/20 flex items-center justify-center text-[#FAF0E2] shadow-lg hover:bg-[#AA8B63] hover:text-[#161811] transition-colors">
            <Eye className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-[#AA8B63] text-xs mb-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(product.rating)
                      ? "fill-current"
                      : "opacity-40"
                  )}
                />
              ))}
            </div>
            <span className="font-mono text-[10.5px] text-[#A4AA93] ml-1">
              ({product.reviewsCount})
            </span>
          </div>

          <h3 className="font-display font-bold text-base sm:text-lg text-[#FAF0E2] group-hover:text-[#AA8B63] transition-colors leading-snug">
            {product.name}
          </h3>

          <p className="text-xs text-[#A4AA93] mt-1 line-clamp-2">
            {product.subtitle}
          </p>

          {/* If bundle: show inclusions */}
          {product.bundleItems && (
            <div className="mt-3 pt-3 border-t border-[#FAF0E2]/5 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-[#AA8B63] block">
                Incluye en este pack:
              </span>
              {product.bundleItems.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#E2D7C5]">
                  <Check className="h-3 w-3 text-[#AA8B63] shrink-0" />
                  <span className="line-clamp-1">{item}</span>
                </div>
              ))}
              {product.bundleItems.length > 3 && (
                <span className="text-[10px] text-[#AA8B63] font-mono">
                  + {product.bundleItems.length - 3} productos más
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Add to Cart Button */}
        <div className="mt-5 pt-4 border-t border-[#FAF0E2]/10 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-xl text-[#FAF0E2]">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs font-mono text-[#A4AA93] line-through opacity-70">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            {product.volume && (
              <span className="text-[10px] font-mono text-[#A4AA93]">
                {product.volume}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={cn(
              "px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-md",
              justAdded
                ? "bg-green-600 text-white"
                : "bg-[#AA8B63] text-[#161811] hover:bg-[#C4A67E]"
            )}
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Agregado</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Añadir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
