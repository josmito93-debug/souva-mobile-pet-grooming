import { useState } from "react";
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/lib/cartContext";

export function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    freeShippingThreshold,
    freeShippingProgress,
    amountForFreeShipping,
  } = useCart();

  const [shippingAddress, setShippingAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  if (!isOpen) return null;

  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 5.99;
  const total = subtotal + shippingCost;

  const handleWhatsAppCheckout = () => {
    const waNumber = "18509600034";
    const itemsList = items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.product.name} ($${(i.product.price * i.quantity).toFixed(2)})`
      )
      .join("\n");

    const message = `🛍️ *NEW SOUVA BOUTIQUE ORDER* 🛍️

${customerName ? `👤 Client: ${customerName}\n📞 Phone: ${customerPhone}\n📍 Address: ${shippingAddress}\n` : ""}
📦 *ITEMS:*
${itemsList}

💰 *TOTAL:* $${total.toFixed(2)} ${shippingCost === 0 ? "(Free Doorstep Delivery)" : `(Delivery $${shippingCost})`}

Please confirm order fulfillment and payment link. Thank you! ✨🐾`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const handleConfirmDirectOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !shippingAddress) return;
    setOrderCompleted(true);
    setTimeout(() => {
      clearCart();
      setOrderCompleted(false);
      setShowCheckoutForm(false);
      setIsOpen(false);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#181A12] border-l border-[#FAF0E2]/15 h-full flex flex-col justify-between shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#FAF0E2]/10 flex items-center justify-between bg-[#1C1F15]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#AA8B63]/20 border border-[#AA8B63]/40 flex items-center justify-center text-[#FAF0E2]">
              <ShoppingBag className="h-5 w-5 text-[#AA8B63]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-[#FAF0E2]">
                Your Boutique Bag
              </h2>
              <span className="text-[11px] text-[#A4AA93] font-mono">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full bg-[#25281D] border border-[#FAF0E2]/15 flex items-center justify-center text-[#FAF0E2] hover:bg-[#AA8B63] hover:text-[#161811] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="p-4 bg-[#212519] border-b border-[#FAF0E2]/10">
          <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
            <span className="flex items-center gap-1.5 text-[#FAF0E2]">
              <Truck className="h-3.5 w-3.5 text-[#AA8B63]" />
              {amountForFreeShipping === 0 ? (
                <span className="text-[#FAF0E2] font-bold">Complimentary Doorstep Shipping Unlocked!</span>
              ) : (
                <span>
                  Add <strong className="text-[#AA8B63]">${amountForFreeShipping.toFixed(2)}</strong> more for free shipping
                </span>
              )}
            </span>
            <span className="font-bold text-[#AA8B63]">
              {Math.round(freeShippingProgress)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#13150F] overflow-hidden border border-[#FAF0E2]/10">
            <div
              className="h-full bg-gradient-to-r from-[#AA8B63] to-[#C4A67E] transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#A4AA93]">
              <div className="h-16 w-16 rounded-full bg-[#23271B] border border-[#FAF0E2]/10 flex items-center justify-center text-[#AA8B63] mb-3">
                <ShoppingBag className="h-8 w-8 opacity-60" />
              </div>
              <p className="font-display font-bold text-base text-[#FAF0E2]">
                Your bag is empty
              </p>
              <p className="text-xs text-[#A4AA93] mt-1 max-w-xs">
                Explore our curated botanical cosmetic line and home spa kits for your companion.
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-5 px-5 py-2.5 rounded-xl bg-[#AA8B63] text-[#161811] text-xs font-bold font-mono tracking-wide hover:bg-[#C4A67E] cursor-pointer"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="p-3.5 rounded-2xl bg-[#1F2318] border border-[#FAF0E2]/10 flex gap-3.5 items-center justify-between"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-16 w-16 object-contain rounded-xl bg-[#14160F] p-1.5 border border-[#FAF0E2]/5 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-xs text-[#FAF0E2] truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-[#AA8B63]">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-[#A4AA93] line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-[#FAF0E2]/20 rounded-lg bg-[#14160F] p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="h-6 w-6 rounded flex items-center justify-center text-[#FAF0E2] hover:bg-[#25281D] cursor-pointer text-xs"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-[#FAF0E2]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="h-6 w-6 rounded flex items-center justify-center text-[#FAF0E2] hover:bg-[#25281D] cursor-pointer text-xs"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="text-[#A4AA93] hover:text-red-400 transition-colors p-1 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-sm text-[#FAF0E2]">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout Area */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#FAF0E2]/15 bg-[#1C1F15] space-y-3">
            {showCheckoutForm ? (
              <form onSubmit={handleConfirmDirectOrder} className="space-y-2.5 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#AA8B63] uppercase">
                    Delivery Address Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    className="text-[10px] text-[#A4AA93] underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 text-xs bg-[#14160F] border border-[#FAF0E2]/15 rounded-xl text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
                />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone Number / WhatsApp"
                  className="w-full px-3 py-2 text-xs bg-[#14160F] border border-[#FAF0E2]/15 rounded-xl text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
                />
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Doorstep Street Address (Bay Area / East Bay)"
                  className="w-full px-3 py-2 text-xs bg-[#14160F] border border-[#FAF0E2]/15 rounded-xl text-[#FAF0E2] placeholder:text-[#FAF0E2]/30 focus:outline-none focus:border-[#AA8B63]"
                />
                <button
                  type="submit"
                  disabled={orderCompleted}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-xs tracking-wider uppercase cursor-pointer hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  {orderCompleted ? (
                    <span>✓ Order Placed Successfully!</span>
                  ) : (
                    <span>Confirm Order · ${total.toFixed(2)}</span>
                  )}
                </button>
              </form>
            ) : (
              <>
                <div className="space-y-1.5 text-xs text-[#A4AA93] font-mono">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#FAF0E2] font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bay Area Doorstep Delivery</span>
                    <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#FAF0E2]/10 text-sm font-bold text-[#FAF0E2]">
                    <span className="font-display">Total</span>
                    <span className="text-base text-[#AA8B63]">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3.5 rounded-xl bg-[#25D366] text-[#071F10] font-bold text-xs font-mono tracking-wide uppercase cursor-pointer hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="h-4 w-4 fill-current" />
                  <span>Order Directly via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCheckoutForm(true)}
                  className="w-full py-3 rounded-xl bg-[#AA8B63] text-[#161811] font-bold text-xs font-mono tracking-wide uppercase cursor-pointer hover:bg-[#C4A67E] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Direct Online Checkout</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <div className="text-[10px] text-[#A4AA93] text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#AA8B63]" />
                  <span>100% Secure Checkout with SOUVA Satisfaction Guarantee</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
