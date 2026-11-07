import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Order, CartItem } from '../types/cafe';
import {
  X,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Star,
  Heart,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Zap,
  Check,
  Layers,
} from 'lucide-react';

interface OrdersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
  onShowToast?: (msg: string) => void;
}

const RATING_TAG_OPTIONS = [
  '☕ Super Sarap ang Kape',
  '⚡ Mabilis Dumating / Ready Agad',
  '💖 Mabait ang Barista',
  '❄️ Sakto ang Lamig at Yelo',
  '🍫 Sakto ang Tamis',
  '👌 Maayos at Safe ang Packaging',
  '🥐 Masarap ang Food & Pastries',
];

export const OrdersHistoryModal: React.FC<OrdersHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
  onShowToast,
}) => {
  const {
    orders,
    reorder,
    rateOrder,
    toggleUsualDrink,
    isUsual,
    addToCart,
    usualCombos,
    saveOrderAsCombo,
    removeUsualCombo,
    orderCombo,
    isOrderSavedAsCombo,
  } = useCart();

  // State for tracking which order has active rating form open
  const [ratingOrderIds, setRatingOrderIds] = useState<{ [orderId: string]: boolean }>({});
  const [selectedStars, setSelectedStars] = useState<{ [orderId: string]: number }>({});
  const [feedbackTexts, setFeedbackTexts] = useState<{ [orderId: string]: string }>({});
  const [selectedTags, setSelectedTags] = useState<{ [orderId: string]: string[] }>({});
  const [hoveredStar, setHoveredStar] = useState<{ [orderId: string]: number }>({});

  const [toastBanner, setToastBanner] = useState<string | null>(null);

  const showLocalToast = (msg: string) => {
    setToastBanner(msg);
    if (onShowToast) onShowToast(msg);
    setTimeout(() => {
      setToastBanner((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  if (!isOpen) return null;

  const handleStartRating = (order: Order) => {
    setRatingOrderIds((prev) => ({ ...prev, [order.id]: true }));
    setSelectedStars((prev) => ({
      ...prev,
      [order.id]: order.rating?.rating || 5,
    }));
    setFeedbackTexts((prev) => ({
      ...prev,
      [order.id]: order.rating?.feedback || '',
    }));
    setSelectedTags((prev) => ({
      ...prev,
      [order.id]: order.rating?.tags || ['☕ Super Sarap ang Kape'],
    }));
  };

  const handleToggleTag = (orderId: string, tag: string) => {
    setSelectedTags((prev) => {
      const current = prev[orderId] || [];
      if (current.includes(tag)) {
        return { ...prev, [orderId]: current.filter((t) => t !== tag) };
      } else {
        return { ...prev, [orderId]: [...current, tag] };
      }
    });
  };

  const handleSubmitRating = (orderId: string) => {
    const stars = selectedStars[orderId] || 5;
    const feedback = feedbackTexts[orderId] || '';
    const tags = selectedTags[orderId] || [];

    rateOrder(orderId, stars, feedback, tags);
    setRatingOrderIds((prev) => ({ ...prev, [orderId]: false }));
    showLocalToast(`⭐ Salamat sa iyong ${stars}-Star Rating & Feedback!`);
  };

  const handleSaveItemAsUsual = (item: CartItem) => {
    const result = toggleUsualDrink(item.menuItem, item.customization);
    if (result.added) {
      showLocalToast(`❤️ Saved ${item.menuItem.name} to your Usual Drinks!`);
    } else {
      showLocalToast(`Removed ${item.menuItem.name} from your Usual Drinks.`);
    }
  };

  const handleQuickAddSingleItem = (item: CartItem) => {
    addToCart(item.menuItem, item.customization, 1);
    showLocalToast(`☕ Added ${item.menuItem.name} to your cart!`);
  };

  const handleToggleSaveCombo = (order: Order) => {
    const isSaved = isOrderSavedAsCombo(order.id);
    if (isSaved) {
      removeUsualCombo(order.id);
      showLocalToast('Removed combo from your Usual Combos.');
    } else {
      const { combo } = saveOrderAsCombo(order);
      showLocalToast(`⚡ Saved "${combo.title}" as 1-Click Usual Combo!`);
    }
  };

  const handle1ClickOrderCombo = (order: Order) => {
    const existing = usualCombos.find((c) => c.orderId === order.id);
    if (existing) {
      orderCombo(existing);
      showLocalToast(`⚡ Added "${existing.title}" combo to cart!`);
    } else {
      order.items.forEach((item) => {
        addToCart(item.menuItem, item.customization, item.quantity);
      });
      showLocalToast(`⚡ Added all ${order.items.length} items to cart in 1 click!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-[#FAF7F2] shadow-2xl border border-[#D8C7B6] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#3D2517] text-[#FAF7F2] p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#8C5332] flex items-center justify-center text-white shrink-0 shadow-inner">
              <ShoppingBag className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-cafe text-xl font-bold">Your White Haven Orders</h2>
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 rounded-full">
                  Ratings & Usuals
                </span>
              </div>
              <p className="text-xs text-[#E8DCCF]/80">
                Rate your orders, share barista feedback, and heart your Usual Drinks!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastBanner && (
          <div className="bg-emerald-100 border-b border-emerald-300 px-4 py-2.5 text-xs text-emerald-900 font-bold flex items-center justify-between shrink-0 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastBanner(null)}
              className="text-emerald-700 hover:text-emerald-900 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Orders list */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-[#7C6656]">
              <Clock className="w-12 h-12 mx-auto opacity-30 mb-3 text-[#8C5332]" />
              <p className="font-serif-cafe text-base font-bold text-[#2C1810]">Wala Pang Orders</p>
              <p className="text-xs mt-1 text-[#6F4E37] max-w-xs mx-auto">
                Subukan ang aming handcrafted coffee at signature slushies para makapagsimula!
              </p>
            </div>
          ) : (
            orders.map((ord) => {
              const isRatingOpen = ratingOrderIds[ord.id];
              const orderStar = selectedStars[ord.id] || ord.rating?.rating || 5;
              const hoverStar = hoveredStar[ord.id] || 0;
              const activeStarDisplay = hoverStar > 0 ? hoverStar : orderStar;

              return (
                <div
                  key={ord.id}
                  className="rounded-3xl border border-[#DECDBE] bg-white p-4 sm:p-5 shadow-xs hover:border-[#8C5332] transition-all duration-200"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0E6DB]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2C1810]">
                          Order {ord.orderNumber}
                        </span>
                        <span className="rounded-full bg-[#F5ECE2] text-[#8C5332] px-2.5 py-0.5 text-[11px] font-bold">
                          {ord.orderType === 'delivery'
                            ? '🛵 Delivery'
                            : ord.orderType === 'pickup'
                            ? '🛍️ Pick-up'
                            : '☕ In-Store'}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#7C6656] block mt-0.5">
                        {ord.createdAt}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize flex items-center gap-1 ${
                          ord.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'ready'
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        )}
                        <span>{ord.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Items preview with Heart / Usual Drink button */}
                  <div className="py-3 space-y-2.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#7C6656]">
                      Ordered Drinks & Food
                    </div>
                    {ord.items.map((item) => {
                      const isFavorited = isUsual(item.menuItem.id);

                      return (
                        <div
                          key={item.cartItemId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DD]"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.menuItem.image}
                              alt={item.menuItem.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  '/assets/menu/spanish_latte.jpg';
                              }}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#D8C7B6]"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-[#2C1810]">
                                  {item.quantity}x {item.menuItem.name}
                                </span>
                                <span className="text-xs font-semibold text-[#8C5332]">
                                  ₱{item.totalPrice}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#7C6656] mt-0.5">
                                {item.customization?.temperature || 'Iced'} •{' '}
                                {item.customization?.size
                                  ? item.customization.size.split(' ')[0]
                                  : '16oz'}
                                {item.customization?.sweetness &&
                                  ` • ${item.customization.sweetness} Sugar`}
                                {item.customization?.milkType &&
                                  item.customization.milkType !== 'Whole Milk' &&
                                  ` • ${item.customization.milkType.split(' ')[0]}`}
                                {item.customization?.addOns &&
                                  item.customization.addOns.length > 0 &&
                                  ` • +${item.customization.addOns.map((a) => a.split(' (')[0]).join(', ')}`}
                              </p>
                            </div>
                          </div>

                          {/* Quick Action buttons for this item */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            {/* Heart / Usual Drink Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleSaveItemAsUsual(item)}
                              title={
                                isFavorited
                                  ? 'Saved in your Usual Drinks'
                                  : 'Heart to save as your Usual Drink'
                              }
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-2xs active:scale-95 ${
                                isFavorited
                                  ? 'bg-rose-50 border border-rose-300 text-rose-600 hover:bg-rose-100'
                                  : 'bg-white border border-[#DECDBE] text-[#6F4E37] hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50/50'
                              }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 transition-colors ${
                                  isFavorited
                                    ? 'fill-rose-500 text-rose-500'
                                    : 'text-[#8C5332]'
                                }`}
                              />
                              <span>{isFavorited ? 'My Usual' : 'Save as Usual'}</span>
                            </button>

                            {/* 1-Click Quick Add this Item to Cart */}
                            <button
                              type="button"
                              onClick={() => handleQuickAddSingleItem(item)}
                              title="Order this drink again"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#3D2517] hover:bg-[#2C1810] text-[#FAF7F2] transition cursor-pointer shadow-2xs active:scale-95"
                            >
                              <Plus className="w-3 h-3 text-amber-300" />
                              <span>Order</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 1-Click Usual Combo Section */}
                  {(() => {
                    const isComboSaved = isOrderSavedAsCombo(ord.id);
                    const comboPrice = ord.items.reduce((sum, i) => sum + i.totalPrice, 0);

                    return (
                      <div
                        className={`mt-2 p-3 rounded-2xl border transition-all ${
                          isComboSaved
                            ? 'bg-amber-50/90 border-amber-300 shadow-2xs'
                            : 'bg-[#F7EFE6]/80 border-[#E8DCCF]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                isComboSaved
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-[#E3D2C1] text-[#8C5332]'
                              }`}
                            >
                              <Zap className="w-4 h-4 fill-amber-200" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-[#2C1810]">
                                  {isComboSaved ? '⚡ Usual Combo Active' : '⚡ 1-Click Usual Combo'}
                                </span>
                                {isComboSaved && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full border border-emerald-300">
                                    Saved on Menu
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#7C6656]">
                                {isComboSaved
                                  ? 'Ready on your menu for 1-click instant ordering!'
                                  : `Save all ${ord.items.length} items from this order into a 1-click combo for next time.`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {/* Toggle Save as Combo */}
                            <button
                              type="button"
                              onClick={() => handleToggleSaveCombo(ord)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs ${
                                isComboSaved
                                  ? 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                                  : 'bg-[#8C5332] text-white hover:bg-[#6F3E22]'
                              }`}
                            >
                              {isComboSaved ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Saved as Combo</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Save as Combo</span>
                                </>
                              )}
                            </button>

                            {/* 1-Click Order Combo */}
                            <button
                              type="button"
                              onClick={() => handle1ClickOrderCombo(ord)}
                              title="Add this entire combo to cart in 1 click"
                              className="px-3 py-1.5 rounded-full bg-[#3D2517] hover:bg-[#2C1810] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs"
                            >
                              <Zap className="w-3 h-3 text-amber-300" />
                              <span>1-Click Order (₱{comboPrice})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Rating & Feedback Card */}
                  <div className="mt-2 pt-3 border-t border-[#F0E6DB]">
                    {ord.rating && !isRatingOpen ? (
                      /* Display Submitted Rating */
                      <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-amber-500">
                              {[1, 2, 3, 4, 5].map((starVal) => (
                                <Star
                                  key={starVal}
                                  className={`w-4 h-4 ${
                                    starVal <= ord.rating!.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-xs text-[#2C1810]">
                              {ord.rating.rating}.0 / 5.0
                            </span>
                            <span className="text-[10px] text-[#7C6656]">
                              • {ord.rating.ratedAt}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleStartRating(ord)}
                            className="text-xs font-bold text-[#8C5332] hover:text-[#5D4037] hover:underline cursor-pointer"
                          >
                            Edit Feedback
                          </button>
                        </div>

                        {ord.rating.feedback && (
                          <p className="text-xs text-[#4A2E1B] italic bg-white/70 p-2.5 rounded-xl border border-amber-100">
                            &ldquo;{ord.rating.feedback}&rdquo;
                          </p>
                        )}

                        {ord.rating.tags && ord.rating.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {ord.rating.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-semibold bg-white text-[#8C5332] border border-amber-200 px-2 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : isRatingOpen ? (
                      /* Interactive Rating & Feedback Form */
                      <div className="rounded-2xl bg-[#F5ECE2] border border-[#DECDBE] p-4 space-y-3.5 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-[#2C1810]">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                            <span>Rate Your White Haven Order</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setRatingOrderIds((prev) => ({ ...prev, [ord.id]: false }))
                            }
                            className="text-xs text-[#7C6656] hover:text-[#2C1810] font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Interactive Star Picker */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((starNum) => (
                              <button
                                key={starNum}
                                type="button"
                                onMouseEnter={() =>
                                  setHoveredStar((prev) => ({
                                    ...prev,
                                    [ord.id]: starNum,
                                  }))
                                }
                                onMouseLeave={() =>
                                  setHoveredStar((prev) => ({
                                    ...prev,
                                    [ord.id]: 0,
                                  }))
                                }
                                onClick={() =>
                                  setSelectedStars((prev) => ({
                                    ...prev,
                                    [ord.id]: starNum,
                                  }))
                                }
                                className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    starNum <= activeStarDisplay
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-[#8C5332]">
                            {activeStarDisplay === 5 && '🌟 Super Sarap / Perfect!'}
                            {activeStarDisplay === 4 && '👍 Very Good / Masarap!'}
                            {activeStarDisplay === 3 && '🙂 Good / Ayos naman'}
                            {activeStarDisplay === 2 && '😐 Fair'}
                            {activeStarDisplay === 1 && '🙁 Needs Improvement'}
                          </span>
                        </div>

                        {/* Feedback Tags */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#5D4037] mb-1.5">
                            Pumili ng Quick Feedback Tags:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {RATING_TAG_OPTIONS.map((tag) => {
                              const isTagSelected = (selectedTags[ord.id] || []).includes(
                                tag
                              );
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => handleToggleTag(ord.id, tag)}
                                  className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border transition cursor-pointer ${
                                    isTagSelected
                                      ? 'bg-[#8C5332] text-white border-[#8C5332] shadow-2xs'
                                      : 'bg-white text-[#5D4037] border-[#DECDBE] hover:bg-[#FAF7F2]'
                                  }`}
                                >
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Feedback Textarea */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#5D4037] mb-1">
                            Mensahe o Review (Optional):
                          </label>
                          <textarea
                            rows={2}
                            value={feedbackTexts[ord.id] || ''}
                            onChange={(e) =>
                              setFeedbackTexts((prev) => ({
                                ...prev,
                                [ord.id]: e.target.value,
                              }))
                            }
                            placeholder="Ikwento ang iyong lasa, lamig ng drink, packaging, o serbisyo ng barista..."
                            className="w-full text-xs p-2.5 rounded-xl border border-[#DECDBE] bg-white text-[#2C1810] placeholder-[#9E8B7A] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSubmitRating(ord.id)}
                            className="px-4 py-2 rounded-full bg-[#8C5332] hover:bg-[#6F3E22] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <ThumbsUp className="w-3.5 h-3.5 text-amber-300" />
                            <span>I-submit ang Rating & Feedback</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* CTA to Rate when not yet rated */
                      <div className="rounded-2xl bg-amber-50/60 border border-dashed border-amber-300/80 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[#2C1810] block">
                              Kamusta ang iyong order?
                            </span>
                            <span className="text-[11px] text-[#7C6656]">
                              I-rate ang lasa ng drinks at mag-iwan ng review para sa barista!
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartRating(ord)}
                          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-300 text-xs font-bold text-[#8C5332] transition cursor-pointer flex items-center gap-1 shadow-2xs self-end sm:self-auto active:scale-95"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>Mag-rate & Feedback</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Order Total & Bottom Reorder Row */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F0E6DB] text-xs">
                    <div>
                      <span className="text-[#7C6656]">Total Paid: </span>
                      <span className="font-bold text-[#8C5332] text-sm">₱{ord.total}</span>
                      <span className="text-[10px] text-gray-400 ml-1">
                        ({ord.paymentMethod})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(ord)}
                        className="rounded-full bg-[#F0E6DB] px-3.5 py-1.5 text-xs font-semibold text-[#5D4037] hover:bg-[#E5D7C7] transition-colors cursor-pointer"
                      >
                        Receipt / Tracker
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          reorder(ord);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 rounded-full bg-[#3D2517] hover:bg-[#2C1810] px-4 py-1.5 text-xs font-bold text-white transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <RefreshCw className="w-3 h-3 text-amber-300" />
                        <span>Re-order All</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Close Bar */}
        <div className="p-4 bg-[#EFE7DD] border-t border-[#DECDBE] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#7C6656] font-medium">
            {orders.length} order{orders.length === 1 ? '' : 's'} recorded
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-[#D8C7B6] bg-white hover:bg-[#FAF7F2] hover:text-[#3D2517] text-xs font-bold text-[#5D4037] transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

