import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    total,
    promoCode,
    applyPromoCode,
    removePromoCode,
    orderType,
    setOrderType,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyPromoCode(inputCode);
    setPromoMessage({ success: res.success, text: res.message });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col border-l border-[#DECDBE]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#DECDBE] bg-[#EFE7DD]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3D2517] text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif-cafe text-lg font-bold text-[#2C1810]">
                  Your Coffee Order
                </h2>
                <span className="text-xs text-[#7C6656]">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in cart
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#5D4037] hover:bg-[#DECDBE] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dining Type Switcher Bar */}
          <div className="p-4 bg-[#F5ECE2] border-b border-[#DECDBE]">
            <div className="grid grid-cols-2 p-1 bg-white/70 rounded-xl border border-[#DECDBE]">
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  orderType === 'pickup'
                    ? 'bg-[#3D2517] text-white shadow-sm'
                    : 'text-[#5D4037] hover:text-black'
                }`}
              >
                🛍️ Pick-up
              </button>
              <button
                type="button"
                onClick={() => setOrderType('in_store')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  orderType === 'in_store'
                    ? 'bg-[#3D2517] text-white shadow-sm'
                    : 'text-[#5D4037] hover:text-black'
                }`}
              >
                ☕ In-Store / Dine-in
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#EFE7DD] flex items-center justify-center text-[#8C5332] mb-3">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif-cafe text-lg font-bold text-[#3D2517]">
                  Your cart is empty
                </h3>
                <p className="text-xs text-[#7C6656] max-w-xs mt-1">
                  Discover our freshly brewed specialty coffees, Matcha Latte, Dark Mocha, and pastries!
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 rounded-full bg-[#3D2517] text-[#FAF7F2] px-6 py-2.5 text-xs font-semibold hover:bg-[#2C1810] transition-colors"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="rounded-2xl border border-[#DECDBE] bg-white p-3.5 shadow-sm hover:border-[#8C5332] transition-colors"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="h-16 w-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif-cafe font-bold text-sm text-[#2C1810] truncate">
                          {item.menuItem.name}
                        </h4>
                        <span className="font-bold text-sm text-[#8C5332]">
                          ₱{item.totalPrice}
                        </span>
                      </div>

                      {/* Customization Badges */}
                      <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-[#7C6656]">
                        <span className="rounded bg-[#F0E6DB] px-1.5 py-0.5">
                          {item.customization.temperature}
                        </span>
                        <span className="rounded bg-[#F0E6DB] px-1.5 py-0.5">
                          {item.customization.size.split(' ')[0]}
                        </span>
                        <span className="rounded bg-[#F0E6DB] px-1.5 py-0.5">
                          {item.customization.sweetness} Sugar
                        </span>
                        {item.customization.milkType !== 'Whole Milk' && (
                          <span className="rounded bg-[#F0E6DB] px-1.5 py-0.5">
                            {item.customization.milkType.split(' ')[0]}
                          </span>
                        )}
                        {item.customization.addOns.map((addon) => (
                          <span
                            key={addon}
                            className="rounded bg-[#FAF0E6] text-[#8C5332] px-1.5 py-0.5 font-medium"
                          >
                            +{addon.split(' (+')[0]}
                          </span>
                        ))}
                      </div>

                      {item.customization.notes && (
                        <p className="mt-1 text-[10px] italic text-[#8C5332]">
                          &ldquo;{item.customization.notes}&rdquo;
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center rounded-lg bg-[#F5ECE2] border border-[#DECDBE] p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="h-6 w-6 rounded flex items-center justify-center text-[#5D4037] hover:bg-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#2C1810]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="h-6 w-6 rounded flex items-center justify-center text-[#5D4037] hover:bg-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-xs text-red-600 hover:text-red-800 p-1 flex items-center gap-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Promo Code & Bottom Checkout Action */}
          {items.length > 0 && (
            <div className="border-t border-[#DECDBE] bg-[#EFE7DD] p-5 space-y-4">
              {/* Promo Code Input */}
              <div>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-[#8C5332]" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. WHITEHAVEN10)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full rounded-xl border border-[#D8C7B6] bg-white pl-9 pr-3 py-2 text-xs uppercase font-medium text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#5D4037] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3D2517] transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {promoMessage && (
                  <p
                    className={`mt-1 text-xs font-medium ${
                      promoMessage.success ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}

                {promoCode && (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-100/80 px-2.5 py-1 text-xs text-emerald-800">
                    <span>Applied code: <strong>{promoCode}</strong></span>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-emerald-900 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#7C6656]">
                  <span>Subtotal</span>
                  <span>₱{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-₱{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#2C1810] pt-2 border-t border-[#DECDBE]">
                  <span>Total</span>
                  <span className="text-[#8C5332] text-lg font-serif-cafe">₱{total}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="w-full rounded-full bg-[#3D2517] hover:bg-[#2C1810] active:scale-[0.99] py-3.5 px-6 text-sm font-semibold text-[#FAF7F2] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full text-center text-xs text-[#7C6656] hover:text-red-700 transition-colors py-1"
                >
                  Clear Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
