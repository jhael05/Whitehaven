import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { AVAILABLE_VOUCHERS } from '../types/cafe';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShoppingBag,
  Lock,
  Gift,
  Award,
  CheckCircle2,
  Check,
  Sparkles,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
  onOpenFreeDrinkPicker?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
  onOpenFreeDrinkPicker,
}) => {
  const { user, isAuthenticated } = useAuth();
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
    deliveryFee,
    isFreeDrinkClaimed,
    toggleFreeDrinkClaim,
    freeDrinkValue,
    loyaltyDiscount,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [stampNotice, setStampNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPromo = (codeToApply?: string) => {
    const target = (codeToApply || inputCode).trim();
    if (!target) return;
    const res = applyPromoCode(target);
    setPromoMessage({ success: res.success, text: res.message });
    if (res.success) {
      setInputCode(target.toUpperCase());
    }
  };

  const handleClaimReward = () => {
    if (items.length === 0 && onOpenFreeDrinkPicker) {
      onClose();
      onOpenFreeDrinkPicker();
      return;
    }
    const res = toggleFreeDrinkClaim(user?.stampsCount || 0);
    setStampNotice(res.message);
    setTimeout(() => setStampNotice(null), 4000);
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
          <div className="p-3.5 bg-[#F5ECE2] border-b border-[#DECDBE]">
            <div className="grid grid-cols-3 p-1 bg-white/70 rounded-xl border border-[#DECDBE] gap-1">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                  orderType === 'delivery'
                    ? 'bg-[#8C5332] text-white shadow-sm'
                    : 'text-[#5D4037] hover:text-black'
                }`}
              >
                🛵 Delivery
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all text-center ${
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
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                  orderType === 'in_store'
                    ? 'bg-[#3D2517] text-white shadow-sm'
                    : 'text-[#5D4037] hover:text-black'
                }`}
              >
                ☕ Dine-in
              </button>
            </div>
            {orderType === 'delivery' && (
              <p className="mt-1.5 text-[11px] text-[#8C5332] text-center font-medium">
                🛵 Doorstep Delivery • ₱49 flat rate in Novaliches / QC
              </p>
            )}
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

                {/* If user has 8 stamps, show prominent Free Drink Claim CTA in empty cart */}
                {(user?.stampsCount || 0) >= 8 ? (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-400 w-full max-w-xs text-center space-y-2 shadow-sm animate-fade-in">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-900">
                      <Gift className="w-4 h-4 text-[#8C5332]" />
                      <span>8 Stamps Unlocked!</span>
                    </div>
                    <p className="text-[11px] text-[#6F4E37]">
                      You have 8 stamps! Pick any handcrafted drink for ₱0 (100% Free).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenFreeDrinkPicker) onOpenFreeDrinkPicker();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#8C5332] hover:bg-[#6F3E22] active:scale-95 text-amber-100 hover:text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Pick Free Drink Now (₱0)</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onClose}
                    className="mt-5 rounded-full bg-[#3D2517] text-[#FAF7F2] px-6 py-2.5 text-xs font-semibold hover:bg-[#2C1810] transition-colors cursor-pointer"
                  >
                    Browse Menu
                  </button>
                )}
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className={`rounded-2xl border p-3.5 shadow-sm transition-colors ${
                    item.isComplimentaryReward
                      ? 'border-emerald-400 bg-emerald-50/40'
                      : 'border-[#DECDBE] bg-white hover:border-[#8C5332]'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/menu/spanish_latte.jpg';
                        }}
                        className="h-20 w-20 rounded-2xl object-cover shrink-0 border-2 border-[#D8C7B6] shadow-2xs"
                      />
                      {item.isComplimentaryReward && (
                        <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[8px] font-black uppercase tracking-wider shadow-xs">
                          FREE
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="font-serif-cafe font-bold text-sm text-[#2C1810] truncate">
                            {item.menuItem.name}
                          </h4>
                          {item.isComplimentaryReward && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded mt-0.5">
                              <Gift className="w-2.5 h-2.5 text-emerald-600" />
                              <span>8-Stamps Reward</span>
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {item.isComplimentaryReward ? (
                            <div>
                              <span className="text-[10px] text-gray-400 line-through block leading-none">
                                ₱{item.menuItem.price}
                              </span>
                              <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                ₱0 FREE
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-sm text-[#8C5332]">
                              ₱{item.totalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Customization Badges */}
                      <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-[#7C6656]">
                        <span className="rounded bg-[#F0E6DB] px-1.5 py-0.5">
                          {item.customization?.temperature || 'Standard'}
                        </span>
                        <span className="rounded bg-[#F0E6DB] px-1.5 py-0.5">
                          {item.customization?.size ? item.customization.size.split(' ')[0] : '16oz'}
                        </span>
                        <span className="rounded bg-[#F0E6DB] px-1.5 py-0.5">
                          {item.customization?.sweetness || '100%'} Sugar
                        </span>
                        {item.customization?.milkType && item.customization.milkType !== 'Whole Milk' && (
                          <span className="rounded bg-[#F0E6DB] px-1.5 py-0.5">
                            {item.customization.milkType.split(' ')[0]}
                          </span>
                        )}
                        {(item.customization?.addOns || []).map((addon) => (
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
              {/* Promo Code Input & Vouchers */}
              <div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyPromo();
                  }}
                  className="flex gap-2"
                >
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
                    className="rounded-xl bg-[#5D4037] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3D2517] transition-colors cursor-pointer"
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
                      onClick={() => {
                        removePromoCode();
                        setInputCode('');
                      }}
                      className="text-emerald-900 font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Available Voucher Chips */}
                <div className="mt-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7C6656] mb-1">
                    Available New Customer Voucher (Tap to apply):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_VOUCHERS.map(v => (
                      <button
                        key={v.code}
                        type="button"
                        onClick={() => handleApplyPromo(v.code)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
                          promoCode === v.code
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                            : 'bg-white border-[#D8C7B6] text-[#8C5332] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {v.code} ({v.discountDisplay})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loyalty Stamp Reward in Order Review */}
              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-3 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D2517]">
                    <Gift className="w-3.5 h-3.5 text-[#8C5332]" />
                    <span>Loyalty Stamps ({user?.stampsCount || 0}/8)</span>
                  </div>
                </div>

                {(user?.stampsCount || 0) >= 8 ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#7C6656]">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        8/8 Stamps Reached!
                      </span>
                      <span className="text-emerald-700 font-bold">1 Free Drink (₱{freeDrinkValue})</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClaimReward}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isFreeDrinkClaimed
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-[#8C5332] hover:bg-[#6F3E22] text-amber-100 animate-pulse'
                      }`}
                    >
                      {isFreeDrinkClaimed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>✓ Free Drink Claimed (-₱{freeDrinkValue}) • Tap to Remove</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-3.5 h-3.5 text-amber-300" />
                          <span>🎁 Claim 1 Free Drink (8 Stamps)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenFreeDrinkPicker) onOpenFreeDrinkPicker();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-[#8C5332] bg-white hover:bg-amber-50 border border-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isFreeDrinkClaimed ? '✨ Swap / Choose Different Free Drink (₱0)' : '✨ Pick Free Beverage from Menu (₱0)'}</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-[#7C6656]">
                    Collect {8 - (user?.stampsCount || 0)} more stamp{8 - (user?.stampsCount || 0) > 1 ? 's' : ''} to claim 1 Free Drink!
                  </p>
                )}

                {stampNotice && (
                  <p className="text-[10px] text-[#8C5332] font-semibold bg-white/70 p-1 rounded border border-amber-200">
                    {stampNotice}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#7C6656]">
                  <span>Subtotal</span>
                  <span>₱{subtotal}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between text-[#8C5332] font-semibold">
                    <span>🛵 Delivery Fee</span>
                    <span>₱{deliveryFee}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Voucher ({promoCode})</span>
                    <span>-₱{discount}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-[#8C5332] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <span>🎁 8 Stamps Free Drink</span>
                    <span>-₱{loyaltyDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#2C1810] pt-2 border-t border-[#DECDBE]">
                  <span>Total</span>
                  <span className="text-[#8C5332] text-lg font-serif-cafe">₱{total}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {!isAuthenticated && (
                  <div className="rounded-xl bg-amber-50 border border-amber-300/80 p-2.5 text-center text-xs text-[#6F4E37] flex items-center justify-center gap-1.5 shadow-xs">
                    <Lock className="w-3.5 h-3.5 text-[#8C5332] shrink-0" />
                    <span><strong>Account Required:</strong> Please log in or sign up to place your order</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="w-full rounded-full bg-[#3D2517] hover:bg-[#2C1810] active:scale-[0.99] py-3.5 px-6 text-sm font-semibold text-[#FAF7F2] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {!isAuthenticated ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>Log In / Sign Up to Order</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-[#7C6656] hover:text-red-700 transition-colors py-1 cursor-pointer"
                  >
                    Clear Order
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-bold text-[#5D4037] hover:text-[#2C1810] transition-colors py-1 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close Cart</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
