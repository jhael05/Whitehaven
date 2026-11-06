import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MENU_ITEMS } from '../data/menuData';
import { MenuItem, Customization, Category } from '../types/cafe';
import confetti from 'canvas-confetti';
import {
  Gift,
  Award,
  X,
  Check,
  CheckCircle2,
  Search,
  Sparkles,
  ArrowRight,
  Coffee,
  Heart,
  ChevronLeft
} from 'lucide-react';

interface FreeDrinkRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const FreeDrinkRewardModal: React.FC<FreeDrinkRewardModalProps> = ({
  isOpen,
  onClose,
  onOpenCart,
}) => {
  const { user } = useAuth();
  const {
    items,
    isFreeDrinkClaimed,
    hasFreeDrinkInCart,
    freeDrinkValue,
    toggleFreeDrinkClaim,
    addFreeRewardDrinkToCart,
  } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Customization state for free drink
  const [temperature, setTemperature] = useState<'Iced' | 'Hot'>('Iced');
  const [size, setSize] = useState<'Regular (16oz)' | 'Grande (22oz) (+₱25)'>('Regular (16oz)');
  const [sweetness, setSweetness] = useState<'0%' | '25%' | '50%' | '75%' | '100%'>('100%');
  const [iceLevel, setIceLevel] = useState<'No Ice' | 'Less Ice' | 'Regular Ice' | 'Extra Ice'>('Regular Ice');
  const [milkType, setMilkType] = useState<'Whole Milk' | 'Oat Milk (+₱30)' | 'Almond Milk (+₱30)' | 'Soy Milk (+₱20)'>('Whole Milk');
  const [addOns, setAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [claimedToast, setClaimedToast] = useState<string | null>(null);

  // Filter only beverage categories
  const beverageCategories: Category[] = [
    'Coffee',
    'Non-Coffee',
    'Blended Frappes',
    'Soda & Slushies',
  ];

  const drinkItems = MENU_ITEMS.filter((item) => beverageCategories.includes(item.category));

  // Trigger celebration confetti when opening modal
  useEffect(() => {
    if (isOpen && (user?.stampsCount || 0) >= 8) {
      try {
        confetti({
          particleCount: 70,
          spread: 75,
          origin: { y: 0.4 },
          colors: ['#D4AF37', '#8C5332', '#00897B', '#FAF7F2'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen, user?.stampsCount]);

  if (!isOpen) return null;

  const filteredDrinks = drinkItems.filter((drink) => {
    const matchesCat =
      selectedCategory === 'All' || drink.category === selectedCategory;
    const matchesSearch =
      drink.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drink.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleStartCustomize = (drink: MenuItem) => {
    setCustomizingItem(drink);
    setTemperature('Iced');
    setSize('Regular (16oz)');
    setSweetness('100%');
    setIceLevel('Regular Ice');
    setMilkType('Whole Milk');
    setAddOns([]);
    setNotes('');
  };

  const handleConfirmFreeDrink = () => {
    if (!customizingItem) return;

    const customization: Customization = {
      temperature,
      size,
      sweetness,
      iceLevel: temperature === 'Hot' ? 'No Ice' : iceLevel,
      milkType,
      addOns,
      notes: notes.trim() || undefined,
    };

    addFreeRewardDrinkToCart(customizingItem, customization);
    setClaimedToast(`🎉 Free ${customizingItem.name} added to your cart for ₱0!`);

    setTimeout(() => {
      setCustomizingItem(null);
      onClose();
      if (onOpenCart) onOpenCart();
    }, 1200);
  };

  const handleApplyDiscountToCart = () => {
    const res = toggleFreeDrinkClaim(user?.stampsCount || 0);
    setClaimedToast(res.message);
    setTimeout(() => {
      onClose();
      if (onOpenCart) onOpenCart();
    }, 1200);
  };

  const hasDrinksAlreadyInCart = items.some(
    (i) =>
      ['Coffee', 'Non-Coffee', 'Blended Frappes', 'Soda & Slushies'].includes(i.menuItem.category) &&
      !i.isComplimentaryReward
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 rounded-3xl bg-[#FAF7F2] shadow-2xl border border-[#D8C7B6] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C1810] via-[#3A2216] to-[#24130B] text-[#FAF7F2] px-6 py-5 flex items-center justify-between border-b border-[#C29B63]/30 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#C29B63]/15 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#C29B63]/25 border border-[#C29B63]/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
              <Gift className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                  8 Stamps Privilège Reward
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">✓ 100% Free</span>
              </div>
              <h2 className="font-serif-cafe text-xl sm:text-2xl font-bold text-white mt-0.5">
                Claim Your Free Handcrafted Drink
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Claimed Toast Banner */}
        {claimedToast && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{claimedToast}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* If user is customizing a selected drink */}
          {customizingItem ? (
            <div className="space-y-5 animate-fade-in">
              <button
                type="button"
                onClick={() => setCustomizingItem(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C5332] hover:text-[#5D4037] transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Drink Choices</span>
              </button>

              {/* Chosen Drink Card Summary */}
              <div className="rounded-2xl bg-[#EFE7DD] p-4 border border-[#DECDBE] flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={customizingItem.image}
                  alt={customizingItem.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/menu/spanish_latte.jpg';
                  }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-sm shrink-0 border border-[#D8C7B6]"
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Complimentary 8-Stamps Reward</span>
                  </div>
                  <h3 className="font-serif-cafe text-xl font-bold text-[#2C1810]">
                    {customizingItem.name}
                  </h3>
                  <p className="text-xs text-[#6F4E37] mt-1 leading-relaxed">
                    {customizingItem.description}
                  </p>
                  <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs text-gray-500 line-through">
                      ₱{customizingItem.price}
                    </span>
                    <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      ₱0 (FREE)
                    </span>
                  </div>
                </div>
              </div>

              {/* Customization Options */}
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-[#DECDBE]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A2E1B] flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-[#8C5332]" />
                  <span>Customize Your Free Beverage (All Included)</span>
                </h4>

                {/* Temperature */}
                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                    Temperature
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['Iced', 'Hot'] as const).map((temp) => (
                      <button
                        key={temp}
                        type="button"
                        onClick={() => setTemperature(temp)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          temperature === temp
                            ? 'bg-[#3D2517] text-white border-[#3D2517] shadow-sm'
                            : 'bg-[#FAF7F2] text-[#5D4037] border-[#DECDBE] hover:bg-white'
                        }`}
                      >
                        {temp === 'Iced' ? '❄️ Iced Beverage' : '☕ Hot Beverage'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cup Size */}
                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                    Cup Size (Complimentary Upgrade Included)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['Regular (16oz)', 'Grande (22oz) (+₱25)'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSize(sz)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          size === sz
                            ? 'bg-[#8C5332] text-white border-[#8C5332] shadow-sm'
                            : 'bg-[#FAF7F2] text-[#5D4037] border-[#DECDBE] hover:bg-white'
                        }`}
                      >
                        {sz.includes('Grande') ? 'Grande 22oz (Included Free!)' : 'Regular 16oz (Standard)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sweetness */}
                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                    Sweetness Level
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['0%', '25%', '50%', '75%', '100%'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSweetness(lvl)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border text-center transition cursor-pointer ${
                          sweetness === lvl
                            ? 'bg-[#3D2517] text-white border-[#3D2517]'
                            : 'bg-[#FAF7F2] text-[#5D4037] border-[#DECDBE] hover:bg-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Milk Option */}
                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                    Milk Choice (Complimentary)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Whole Milk', 'Oat Milk (+₱30)', 'Almond Milk (+₱30)', 'Soy Milk (+₱20)'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMilkType(m)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          milkType === m
                            ? 'bg-[#8C5332] text-white border-[#8C5332]'
                            : 'bg-[#FAF7F2] text-[#5D4037] border-[#DECDBE] hover:bg-white'
                        }`}
                      >
                        {m.split(' (+')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                    Select Complimentary Add-ons
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Espresso Shot (+₱65)',
                      'Coffee Jelly (+₱30)',
                      'Nata (+₱25)',
                      'Whipped Cream (+₱30)',
                      'Creamcheese (+₱30)',
                      'Rock Salt (+₱30)',
                    ].map((addon) => {
                      const isSelected = addOns.includes(addon);
                      return (
                        <button
                          key={addon}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setAddOns((prev) => prev.filter((a) => a !== addon));
                            } else {
                              setAddOns((prev) => [...prev, addon]);
                            }
                          }}
                          className={`py-1.5 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-100 border-amber-400 text-[#8C5332]'
                              : 'bg-[#FAF7F2] border-[#DECDBE] text-[#5D4037] hover:bg-white'
                          }`}
                        >
                          <span>{addon.split(' (+')[0]}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-[#8C5332]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1">
                    Special Barista Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Extra hot, separate lid, light foam..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DECDBE] bg-white text-xs text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#6F4E37]">
                  <span>Total Due: </span>
                  <span className="font-serif-cafe text-base font-black text-emerald-700">
                    ₱0.00 (Free Reward)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmFreeDrink}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer border border-emerald-300/40"
                >
                  <Gift className="w-4 h-4 text-amber-200" />
                  <span>Claim & Add Free Drink to Cart</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            // Drink Catalog Choice List
            <div className="space-y-5">
              {/* Option to discount current cart item if drinks are already in cart */}
              {hasDrinksAlreadyInCart && !isFreeDrinkClaimed && !hasFreeDrinkInCart && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100/90 to-orange-100/80 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#8C5332] text-amber-200 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#2C1810]">
                        You have drink(s) in your cart!
                      </h4>
                      <p className="text-[11px] text-[#6F4E37]">
                        Deduct 100% off your highest drink (save ₱{freeDrinkValue}) right away!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyDiscountToCart}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#8C5332] hover:bg-[#6F3E22] text-amber-100 font-bold text-xs shadow-md transition cursor-pointer shrink-0 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Free Discount (-₱{freeDrinkValue})</span>
                  </button>
                </div>
              )}

              {/* Already claimed banner if active */}
              {isFreeDrinkClaimed && (
                <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {hasFreeDrinkInCart
                        ? 'Your Complimentary Free Drink is in your cart!'
                        : `1 Free Drink discount (-₱${freeDrinkValue}) is active in your cart!`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenCart) onOpenCart();
                    }}
                    className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                  >
                    View Cart
                  </button>
                </div>
              )}

              {/* Search & Category Filter */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-serif-cafe text-base font-bold text-[#2C1810]">
                      Select Any Handcrafted Beverage (₱0 / 100% Free)
                    </h4>
                    <p className="text-xs text-[#7C6656]">
                      Choose from our premium espresso, non-coffee, signature slushies, or frappes:
                    </p>
                  </div>

                  {/* Search bar */}
                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C5332]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search drinks..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#DECDBE] bg-white text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8C5332]"
                    />
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {['All', 'Coffee', 'Non-Coffee', 'Blended Frappes', 'Soda & Slushies'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#3D2517] text-white shadow-xs'
                          : 'bg-white text-[#5D4037] border border-[#DECDBE] hover:bg-[#F5ECE2]'
                      }`}
                    >
                      {cat === 'All' ? '🌟 All Drinks' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Beverages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredDrinks.map((drink) => (
                  <div
                    key={drink.id}
                    className="rounded-2xl border border-[#DECDBE] bg-white p-3 shadow-xs hover:border-[#8C5332] hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#EFE7DD] mb-2.5">
                        <img
                          src={drink.image}
                          alt={drink.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/menu/spanish_latte.jpg';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                          FREE REWARD
                        </span>
                        {drink.isBestSeller && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-[#2C1810] text-[9px] font-bold shadow-xs">
                            ★ Best Seller
                          </span>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-1">
                        <h5 className="font-serif-cafe font-bold text-sm text-[#2C1810] group-hover:text-[#8C5332] transition-colors">
                          {drink.name}
                        </h5>
                      </div>

                      <p className="text-[11px] text-[#7C6656] line-clamp-2 mt-0.5">
                        {drink.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#F0E6DB] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 line-through block leading-none">
                          ₱{drink.price}
                        </span>
                        <span className="text-xs font-black text-emerald-700">
                          ₱0 (8 Stamps)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartCustomize(drink)}
                        className="px-3 py-1.5 rounded-xl bg-[#8C5332] hover:bg-[#6F3E22] active:scale-95 text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Gift className="w-3.5 h-3.5 text-amber-200" />
                        <span>Select Free</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-[#EFE7DD] border-t border-[#DECDBE] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[#5D4037] font-medium">
            <Award className="w-4 h-4 text-[#8C5332]" />
            <span>Digital Loyalty Stamp Reward • 8 / 8 Stamps</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-[#D8C7B6] bg-white hover:bg-[#FAF7F2] text-xs font-bold text-[#5D4037] transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
