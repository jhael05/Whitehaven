import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Order, CartItem, UsualComboItem, UsualCombo } from '../types/cafe';
import {
  X,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Star,
  Heart,
  Sparkles,
  Plus,
  Check,
  Layers,
  Coffee,
  Trash2,
  CheckCheck,
} from 'lucide-react';

interface OrdersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
  onShowToast?: (msg: string) => void;
}

const RATING_TAG_OPTIONS = [
  '☕ Exceptional Coffee Taste',
  '⚡ Fresh & Speedy Preparation',
  '💖 Attentive & Friendly Baristas',
  '❄️ Perfect Temperature & Chill',
  '🍫 Balanced & Smooth Sweetness',
  '👌 Pristine & Safe Packaging',
  '🥐 Warm & Fresh Pastries',
];

interface SelectedPairItem {
  cartItemId: string;
  orderId: string;
  item: CartItem;
}

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
    createCustomCombo,
    removeUsualCombo,
    orderCombo,
  } = useCart();

  // Multi-item combo pair builder state
  const [selectedPairItems, setSelectedPairItems] = useState<SelectedPairItem[]>([]);
  const [customComboTitle, setCustomComboTitle] = useState<string>('');

  // Rating and review states
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
    }, 3200);
  };

  if (!isOpen) return null;

  // Toggle individual item for pairing
  const handleTogglePairItem = (orderId: string, item: CartItem) => {
    setSelectedPairItems((prev) => {
      const exists = prev.some((p) => p.cartItemId === item.cartItemId && p.orderId === orderId);
      let updated: SelectedPairItem[];
      if (exists) {
        updated = prev.filter((p) => !(p.cartItemId === item.cartItemId && p.orderId === orderId));
        showLocalToast(`Removed ${item.menuItem.name} from combo pair selection.`);
      } else {
        updated = [...prev, { cartItemId: item.cartItemId, orderId, item }];
        showLocalToast(`Added ${item.menuItem.name} to your combo pair.`);
      }

      // Auto-suggest combo title if custom title hasn't been hand-edited
      if (updated.length > 0) {
        const suggested = updated.map((p) => p.item.menuItem.name).join(' + ');
        setCustomComboTitle((prevTitle) => (prevTitle ? prevTitle : `${suggested} Pair`));
      } else {
        setCustomComboTitle('');
      }

      return updated;
    });
  };

  // Select all items in an order for quick pairing
  const handleSelectEntireOrderForPair = (order: Order) => {
    setSelectedPairItems((prev) => {
      const newItems: SelectedPairItem[] = order.items.map((i) => ({
        cartItemId: i.cartItemId,
        orderId: order.id,
        item: i,
      }));
      // Merge unique items
      const merged = [...prev];
      newItems.forEach((ni) => {
        if (!merged.some((m) => m.cartItemId === ni.cartItemId && m.orderId === ni.orderId)) {
          merged.push(ni);
        }
      });

      const suggested = merged.map((p) => p.item.menuItem.name).join(' + ');
      setCustomComboTitle((prevTitle) => (prevTitle ? prevTitle : `${suggested} Pair`));
      showLocalToast(`Added all items from Order ${order.orderNumber} to pair selection!`);
      return merged;
    });
  };

  // Save the selected items as a new Custom Combo Pair
  const handleSaveComboPair = () => {
    if (selectedPairItems.length === 0) {
      showLocalToast('Please select at least 1 or 2 items to save a combo pair.');
      return;
    }

    const itemsToSave: UsualComboItem[] = selectedPairItems.map((p) => ({
      menuItem: p.item.menuItem,
      customization: p.item.customization,
      quantity: p.item.quantity,
      totalPrice: p.item.totalPrice,
    }));

    const defaultTitle = itemsToSave.map((i) => i.menuItem.name).join(' + ');
    const title = customComboTitle.trim() || `${defaultTitle} Pair`;

    const newCombo = createCustomCombo(title, itemsToSave, selectedPairItems[0]?.orderId);

    showLocalToast(`✨ Saved custom combo pair: "${newCombo.title}"!`);
    setSelectedPairItems([]);
    setCustomComboTitle('');
  };

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
      [order.id]: order.rating?.tags || ['☕ Exceptional Coffee Taste'],
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
    showLocalToast(`⭐ Thank you for your ${stars}-Star Rating & Feedback!`);
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

  const selectedPairTotal = selectedPairItems.reduce(
    (sum, p) => sum + p.item.totalPrice,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 rounded-3xl bg-[#FAF7F2] shadow-2xl border border-[#D8C7B6] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#3D2517] text-[#FAF7F2] p-5 sm:p-6 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="h-11 w-11 rounded-2xl bg-[#8C5332] border border-[#C29B63]/40 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Coffee className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-cafe text-xl sm:text-2xl font-bold tracking-tight">
                  Order History & Combo Pairings
                </h2>
                <span className="text-[10px] font-bold bg-[#C29B63]/25 text-amber-200 border border-[#C29B63]/40 px-2.5 py-0.5 rounded-full">
                  Boutique Craft
                </span>
              </div>
              <p className="text-xs text-[#E8DCCF]/85 mt-0.5">
                Pick individual items to pair into custom 1-click combos, heart your usuals, and share reviews.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast Alert */}
        {toastBanner && (
          <div className="bg-emerald-100 border-b border-emerald-300 px-4 py-2.5 text-xs text-emerald-900 font-bold flex items-center justify-between shrink-0 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastBanner(null)}
              className="text-emerald-700 hover:text-emerald-900 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">

          {/* Section: Saved Custom Combo Pairs (if user has created any) */}
          {usualCombos.length > 0 && (
            <div className="rounded-3xl bg-gradient-to-r from-amber-50/90 via-[#FAF7F2] to-amber-50/70 border-2 border-[#D8C7B6] p-4 sm:p-5 shadow-xs space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#8C5332] text-white flex items-center justify-center shadow-xs">
                    <Layers className="w-3.5 h-3.5 text-amber-200" />
                  </div>
                  <div>
                    <h3 className="font-serif-cafe text-sm font-bold text-[#2C1810]">
                      Your Saved Combo Pairs ({usualCombos.length})
                    </h3>
                    <p className="text-[11px] text-[#7C6656]">
                      Ready on your menu for 1-click instant ordering!
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#EFE7DD] text-[#8C5332] px-2.5 py-0.5 rounded-full border border-[#D8C7B6]">
                  1-Click Ready
                </span>
              </div>

              {/* Horizontal / Grid of Saved Combos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {usualCombos.map((combo) => (
                  <div
                    key={combo.id}
                    className="rounded-2xl bg-white border border-[#D8C7B6] p-3 shadow-xs hover:border-[#8C5332] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#F0E6DB]">
                        <span className="text-[10px] font-bold text-[#8C5332] bg-[#F7EFE6] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#8C5332]" />
                          <span>{combo.items.length} Items Paired</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            removeUsualCombo(combo.id);
                            showLocalToast(`Removed "${combo.title}" combo pair.`);
                          }}
                          className="text-gray-400 hover:text-rose-600 text-xs p-1 cursor-pointer transition-colors"
                          title="Delete combo pair"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <h4 className="font-serif-cafe text-xs font-bold text-[#2C1810] mt-2 group-hover:text-[#8C5332] line-clamp-1">
                        {combo.title}
                      </h4>

                      <div className="my-2 space-y-1">
                        {combo.items.map((ci, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 rounded-lg border border-[#F0E6DB] text-[11px]"
                          >
                            <img
                              src={ci.menuItem.image}
                              alt={ci.menuItem.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/menu/spanish_latte.jpg';
                              }}
                              className="w-7 h-7 rounded-md object-cover shrink-0 border border-[#D8C7B6]"
                            />
                            <div className="min-w-0 flex-1 truncate">
                              <span className="font-bold text-[#2C1810]">
                                {ci.quantity}x {ci.menuItem.name}
                              </span>
                              <span className="text-[10px] text-[#7C6656] block truncate">
                                {ci.customization?.temperature || 'Iced'} • {ci.customization?.size?.split(' ')[0] || '16oz'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-[#8C5332]">
                              ₱{ci.totalPrice}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F0E6DB] flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-[#8C5332]">
                        ₱{combo.totalPrice}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          orderCombo(combo);
                          showLocalToast(`✨ Added "${combo.title}" combo pair to cart!`);
                        }}
                        className="px-3 py-1.5 rounded-full bg-[#8C5332] hover:bg-[#6F3E22] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-200" />
                        <span>1-Click Order Pair</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders list */}
          {orders.length === 0 ? (
            <div className="py-16 text-center text-[#7C6656] bg-white rounded-3xl border border-[#DECDBE] p-8">
              <Clock className="w-12 h-12 mx-auto opacity-30 mb-3 text-[#8C5332]" />
              <p className="font-serif-cafe text-lg font-bold text-[#2C1810]">
                No Orders Placed Yet
              </p>
              <p className="text-xs mt-1 text-[#6F4E37] max-w-sm mx-auto leading-relaxed">
                Explore our handcrafted espresso roasts, signature iced refreshers, and artisan pastries to begin your White Haven experience!
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#3D2517] hover:bg-[#2C1810] text-[#FAF7F2] px-5 py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-200" />
                <span>Browse Cafe Menu</span>
              </button>
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

                  {/* Items list with Individual Pairing Selector */}
                  <div className="py-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C6656]">
                        Ordered Items • Select to Pair
                      </span>
                      {ord.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleSelectEntireOrderForPair(ord)}
                          className="text-[11px] font-bold text-[#8C5332] hover:text-[#5D4037] flex items-center gap-1 cursor-pointer"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Pair All {ord.items.length} Items</span>
                        </button>
                      )}
                    </div>

                    {ord.items.map((item) => {
                      const isFavorited = isUsual(item.menuItem.id);
                      const isItemPaired = selectedPairItems.some(
                        (p) => p.cartItemId === item.cartItemId && p.orderId === ord.id
                      );

                      return (
                        <div
                          key={item.cartItemId}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl transition-all border ${
                            isItemPaired
                              ? 'bg-amber-50/80 border-[#C29B63] ring-1 ring-[#C29B63]/50'
                              : 'bg-[#FAF7F2] border-[#EFE7DD] hover:border-[#D8C7B6]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.menuItem.image}
                              alt={item.menuItem.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  '/assets/menu/spanish_latte.jpg';
                              }}
                              className="w-13 h-13 rounded-xl object-cover shrink-0 border border-[#D8C7B6]"
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

                          {/* Quick Actions for this item */}
                          <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                            {/* Pair in Combo Toggle */}
                            <button
                              type="button"
                              onClick={() => handleTogglePairItem(ord.id, item)}
                              title={
                                isItemPaired
                                  ? 'Selected for combo pairing (click to unselect)'
                                  : 'Click to select and pair with another drink or snack'
                              }
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-2xs active:scale-95 ${
                                isItemPaired
                                  ? 'bg-[#8C5332] text-white border border-[#8C5332] shadow-xs'
                                  : 'bg-white border border-[#DECDBE] text-[#6F4E37] hover:border-[#8C5332] hover:text-[#8C5332]'
                              }`}
                            >
                              {isItemPaired ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-amber-200" />
                                  <span>Selected to Pair</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5 text-[#8C5332]" />
                                  <span>Select to Pair</span>
                                </>
                              )}
                            </button>

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
                                  : 'bg-white border border-[#DECDBE] text-[#6F4E37] hover:border-rose-400 hover:text-rose-600'
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

                            {/* 1-Click Order Single Item */}
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
                            Edit Review
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
                            {activeStarDisplay === 5 && '🌟 Exceptional Quality & Craft!'}
                            {activeStarDisplay === 4 && '👍 Delicious & Well Crafted!'}
                            {activeStarDisplay === 3 && '🙂 Good & Satisfying'}
                            {activeStarDisplay === 2 && '😐 Fair'}
                            {activeStarDisplay === 1 && '🙁 Needs Improvement'}
                          </span>
                        </div>

                        {/* Feedback Tags */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#5D4037] mb-1.5">
                            Select Quick Experience Highlights:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {RATING_TAG_OPTIONS.map((tag) => {
                              const isTagSelected = (selectedTags[ord.id] || []).includes(tag);
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
                            Your Barista Notes & Review (Optional):
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
                            placeholder="Share your thoughts on roast depth, chill, packaging, or barista hospitality..."
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
                            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                            <span>Submit Rating & Review</span>
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
                              How was your White Haven experience?
                            </span>
                            <span className="text-[11px] text-[#7C6656]">
                              Rate your drinks and leave notes for the coffee bar team!
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartRating(ord)}
                          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-300 text-xs font-bold text-[#8C5332] transition cursor-pointer flex items-center gap-1 shadow-2xs self-end sm:self-auto active:scale-95"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>Rate & Leave Review</span>
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

        {/* Docked Aesthetic Combo Pair Builder Tray (Visible when 1 or more items are selected) */}
        {selectedPairItems.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-[#2C1810] via-[#3D2517] to-[#2C1810] text-[#FAF7F2] border-t-2 border-[#C29B63] shrink-0 animate-slide-up shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#8C5332] text-amber-200 flex items-center justify-center shrink-0 border border-[#C29B63]/40">
                  <Layers className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif-cafe font-bold text-sm text-[#FAF7F2]">
                      Custom Combo Pair Builder
                    </span>
                    <span className="text-[10px] font-bold bg-[#8C5332] text-amber-200 px-2 py-0.2 rounded-full">
                      {selectedPairItems.length} {selectedPairItems.length === 1 ? 'item' : 'items'} chosen
                    </span>
                  </div>
                  <p className="text-[11px] text-[#DECDBE]">
                    Bundle items together into an instant 1-click reorder pair on your menu!
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPairItems([]);
                    setCustomComboTitle('');
                  }}
                  className="px-3 py-1.5 text-xs text-[#DECDBE] hover:text-white transition cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSaveComboPair}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#8C5332] to-[#C29B63] hover:from-[#724125] hover:to-[#B3874F] text-white text-xs font-bold transition shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-100" />
                  <span>Save Combo Pair (₱{selectedPairTotal})</span>
                </button>
              </div>
            </div>

            {/* Selected items pills preview & title editor */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                {selectedPairItems.map((p, idx) => (
                  <div
                    key={`${p.orderId}-${p.cartItemId}-${idx}`}
                    className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap"
                  >
                    <img
                      src={p.item.menuItem.image}
                      alt={p.item.menuItem.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/menu/spanish_latte.jpg';
                      }}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>{p.item.menuItem.name}</span>
                    <button
                      type="button"
                      onClick={() => handleTogglePairItem(p.orderId, p.item)}
                      className="hover:text-rose-300 ml-0.5 cursor-pointer text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Combo title input */}
              <div className="shrink-0 w-full sm:w-64">
                <input
                  type="text"
                  value={customComboTitle}
                  onChange={(e) => setCustomComboTitle(e.target.value)}
                  placeholder="Pair title (e.g. Morning Brew & Pastry)"
                  className="w-full text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-amber-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Close Bar */}
        <div className="p-4 bg-[#EFE7DD] border-t border-[#DECDBE] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#7C6656] font-medium">
            {orders.length} order{orders.length === 1 ? '' : 's'} recorded • {usualCombos.length} saved combo {usualCombos.length === 1 ? 'pair' : 'pairs'}
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
