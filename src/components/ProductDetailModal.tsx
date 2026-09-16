import { useState } from "react";
import { X, Star, ShoppingBag, Check, Droplets, Sparkles, Shield, Heart } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/lib/cartContext";
import { cn } from "@/lib/utils";

export function ProductDetailModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#1C1E16] border border-[#FAF0E2]/15 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-[#272B1E] border border-[#FAF0E2]/15 flex items-center justify-center text-[#FAF0E2] hover:bg-[#AA8B63] hover:text-[#161811] transition-colors cursor-pointer shadow-md"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Image Showcase */}
          <div className="md:col-span-5 bg-[#14160F] p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-[#FAF0E2]/10">
            {product.badge && (
              <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-[#AA8B63] text-[#161811] uppercase tracking-wider">
                {product.badge}
              </span>
            )}
            <img
              src={product.image}
              alt={product.name}
              className="max-h-64 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
            />
            {product.volume && (
              <span className="mt-4 text-xs font-mono text-[#A4AA93] border border-[#FAF0E2]/10 px-3 py-1 rounded-full bg-[#1C1E16]">
                {product.volume}
              </span>
            )}
          </div>

          {/* Details Column */}
          <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
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
                  {product.rating} ({product.reviewsCount} opiniones verificadas)
                </span>
              </div>

              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#FAF0E2] leading-tight">
                {product.name}
              </h2>
              <p className="text-xs text-[#AA8B63] mt-1 font-medium">
                {product.subtitle}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2.5 mt-3">
                <span className="font-display font-bold text-2xl text-[#FAF0E2]">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm font-mono text-[#A4AA93] line-through opacity-70">
                    ${product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-[10px] font-mono font-bold text-[#AA8B63] bg-[#AA8B63]/15 px-2 py-0.5 rounded-md">
                    Ahorras ${product.originalPrice - product.price}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#E2D7C5] mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Bundle items list if present */}
              {product.bundleItems && (
                <div className="mt-4 p-3.5 rounded-2xl bg-[#23271B] border border-[#FAF0E2]/10">
                  <span className="text-xs font-mono font-bold text-[#AA8B63] uppercase tracking-wider block mb-2">
                    Contenido del Paquete:
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#FAF0E2]">
                    {product.bundleItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#AA8B63] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Benefits */}
              {product.benefits && (
                <div className="mt-4">
                  <span className="text-xs font-mono font-bold text-[#A4AA93] uppercase tracking-wider block mb-1.5">
                    Beneficios Principales:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {product.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#FAF0E2]">
                        <Sparkles className="h-3 w-3 text-[#AA8B63] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              {product.ingredients && (
                <div className="mt-4 pt-3 border-t border-[#FAF0E2]/10">
                  <span className="text-[11px] font-mono font-bold text-[#A4AA93] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5 text-[#AA8B63]" />
                    <span>Ingredientes Botánicos:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#14160F] text-[#FAF0E2]/90 border border-[#FAF0E2]/10 px-2 py-0.5 rounded-md"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* How to use */}
              {product.howToUse && (
                <div className="mt-4 pt-3 border-t border-[#FAF0E2]/10 text-xs text-[#A4AA93]">
                  <strong className="text-[#FAF0E2] block mb-0.5">Modo de aplicación:</strong>
                  <span>{product.howToUse}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-[#FAF0E2]/15 flex items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center border border-[#FAF0E2]/20 rounded-xl bg-[#14160F] p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-[#FAF0E2] hover:bg-[#25281D] cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono font-bold text-sm text-[#FAF0E2]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-[#FAF0E2] hover:bg-[#25281D] cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add button */}
              <button
                type="button"
                onClick={handleAdd}
                className={cn(
                  "flex-1 py-3 px-6 rounded-xl font-bold font-mono tracking-wide text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg",
                  added
                    ? "bg-green-600 text-white"
                    : "bg-[#AA8B63] text-[#161811] hover:bg-[#C4A67E]"
                )}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Añadir al Carrito · ${(product.price * quantity).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
