import React, { useState } from 'react';
import { MENU_ITEMS } from '../data/menuData';
import { MenuItem, Category } from '../types/cafe';
import { useCart } from '../context/CartContext';
import {
  Search,
  Heart,
  Plus,
  Coffee,
  SlidersHorizontal,
  Sparkles,
  Layers,
  ShoppingBag,
} from 'lucide-react';

interface MenuSectionProps {
  onSelectItem: (item: MenuItem) => void;
  onOpenOrders?: () => void;
}

const CATEGORIES: Category[] = [
  'All',
  'My Usuals',
  'Coffee',
  'Non-Coffee',
  'Blended Frappes',
  'Soda & Slushies',
  'Rice Meals & Sandwich',
  'Pasta & Snacks',
];

export const MenuSection: React.FC<MenuSectionProps> = ({ onSelectItem, onOpenOrders }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    orders,
    usualDrinks,
    usualCombos,
    isUsual,
    toggleUsualDrink,
    orderUsual,
    orderCombo,
    removeUsualCombo,
  } = useCart();

  const hasPlacedOrders = orders.length > 0;
  const totalUsuals = usualDrinks.length + usualCombos.length;

  // Only display 'My Usuals' tab if the user has placed at least one order
  const displayedCategories = hasPlacedOrders
    ? CATEGORIES
    : CATEGORIES.filter((c) => c !== 'My Usuals');

  const featuredItems = MENU_ITEMS.filter((item) => item.isFeatured);

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'My Usuals'
        ? isUsual(item.id)
        : item.category === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu-section" className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header matching screenshot */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8DCCF] border border-[#DECDBE] px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#8C5332]">
            <Coffee className="w-3.5 h-3.5" />
            <span>White Haven Cafe Menu</span>
          </div>

          <h2 className="font-serif-cafe text-4xl sm:text-5xl font-bold tracking-tight text-[#2C1810]">
            MENU
          </h2>
          <p className="text-sm sm:text-base text-[#6F4E37]">
            Crafted with passion using premium roasted coffee beans, artisanal syrups, and fresh dairy.
          </p>
        </div>

        {/* Search and Category Filters */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {displayedCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const isUsualTab = cat === 'My Usuals';

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isSelected
                      ? isUsualTab
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                        : 'bg-[#3D2517] text-[#FAF7F2] border-[#3D2517] shadow-sm'
                      : isUsualTab
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-[#FAF7F2] text-[#5D4037] border-[#DECDBE] hover:bg-[#EFE7DD]'
                  }`}
                >
                  {isUsualTab && (
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'
                      }`}
                    />
                  )}
                  <span>{cat}</span>
                  {isUsualTab && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-800'
                      }`}
                    >
                      {totalUsuals}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#8C5332]" />
            <input
              type="text"
              placeholder="Search drinks or snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[#DECDBE] bg-[#FAF7F2] pl-10 pr-4 py-2 text-xs text-[#2C1810] placeholder-[#9E8B7A] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
            />
          </div>
        </div>

        {/* Quick Shelf: Conditional on Having Placed at Least 1 Order */}
        {hasPlacedOrders && selectedCategory !== 'My Usuals' && !searchQuery && (
          totalUsuals === 0 ? (
            /* State: Placed orders, but 0 saved usuals yet - English Guidance */
            <div className="mt-8 rounded-3xl bg-gradient-to-r from-amber-50/90 via-[#FAF7F2] to-rose-50/60 p-5 border-2 border-[#D8C7B6] shadow-xs animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#8C5332] text-amber-200 flex items-center justify-center shrink-0 shadow-xs">
                    <Heart className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif-cafe text-base font-bold text-[#2C1810]">
                        Your Usual Drinks & Combos
                      </h3>
                      <span className="text-[10px] font-bold bg-[#EFE7DD] text-[#8C5332] px-2 py-0.5 rounded-full border border-[#D8C7B6]">
                        0 Saved
                      </span>
                    </div>
                    <p className="text-xs text-[#6F4E37] mt-0.5 max-w-xl">
                      You haven&apos;t saved any usual drinks or combos yet. Go to your Order History to heart your favorite drinks or save 1-click combos for lightning-fast reordering!
                    </p>
                  </div>
                </div>

                {onOpenOrders && (
                  <button
                    type="button"
                    onClick={onOpenOrders}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#3D2517] hover:bg-[#2C1810] text-[#FAF7F2] px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                    <span>Open Order History</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* State: Placed orders AND has saved usual drinks or combos */
            <div className="mt-8 rounded-3xl bg-gradient-to-r from-rose-50/90 via-amber-50/80 to-[#FAF7F2] p-5 border-2 border-rose-200/80 shadow-sm animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-serif-cafe text-base font-bold text-[#2C1810] flex items-center gap-1.5">
                      <span>Your Usual Drinks & Combos</span>
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                        1-Click Reorder
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#7C6656]">
                      Your favorite drinks and bundles saved with your custom recipes—reorder in a single click!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {onOpenOrders && (
                    <button
                      type="button"
                      onClick={onOpenOrders}
                      className="text-xs font-semibold text-[#8C5332] hover:text-[#5D4037] underline cursor-pointer"
                    >
                      Orders History
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('My Usuals')}
                    className="text-xs font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All ({totalUsuals})</span>
                  </button>
                </div>
              </div>

              {/* Horizontal Scroll of Usual Combos & Usual Drinks */}
              <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
                {/* 1. Saved Usual Combos */}
                {usualCombos.map((combo) => (
                  <div
                    key={combo.id}
                    className="rounded-2xl bg-white border-2 border-amber-300 p-3 shadow-xs hover:shadow-md transition-all shrink-0 w-72 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 pb-1 border-b border-amber-100">
                        <span className="text-[10px] font-bold bg-[#F5ECE2] text-[#8C5332] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#D8C7B6]">
                          <Layers className="w-3 h-3 text-[#8C5332]" />
                          <span>Combo Pair</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeUsualCombo(combo.id)}
                          title="Remove combo"
                          className="text-gray-400 hover:text-rose-600 p-0.5 cursor-pointer text-xs"
                        >
                          ✕
                        </button>
                      </div>

                      <h4 className="font-serif-cafe text-xs font-bold text-[#2C1810] mt-2 group-hover:text-[#8C5332] line-clamp-1">
                        {combo.title}
                      </h4>

                      <div className="my-2 space-y-1">
                        {combo.items.map((ci, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-[11px] text-[#5D4037] bg-[#FAF7F2] p-1.5 rounded-lg border border-[#F0E6DB]"
                          >
                            <img
                              src={ci.menuItem.image}
                              alt={ci.menuItem.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  '/assets/menu/spanish_latte.jpg';
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

                    {/* 1-Click Order Combo Button */}
                    <button
                      type="button"
                      onClick={() => orderCombo(combo)}
                      className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#8C5332] to-[#A0633F] hover:from-[#724125] hover:to-[#8C5332] text-white py-2 px-3 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>1-Click Order Pair (₱{combo.totalPrice})</span>
                    </button>
                  </div>
                ))}

                {/* 2. Saved Single Usual Drinks */}
                {usualDrinks.map((usual) => (
                  <div
                    key={usual.id}
                    className="rounded-2xl bg-white border border-rose-200/90 p-3 shadow-xs hover:shadow-md transition-all shrink-0 w-64 flex flex-col justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={usual.image}
                        alt={usual.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/assets/menu/spanish_latte.jpg';
                        }}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#D8C7B6]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-serif-cafe text-xs font-bold text-[#2C1810] truncate group-hover:text-rose-700 transition-colors">
                            {usual.name}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUsualDrink({
                                id: usual.menuItemId,
                                name: usual.name,
                                category: usual.category,
                                image: usual.image,
                                price: usual.price,
                                description: '',
                              });
                            }}
                            title="Remove from usuals"
                            className="text-rose-400 hover:text-rose-600 p-0.5 cursor-pointer"
                          >
                            <Heart className="w-3.5 h-3.5 fill-rose-500" />
                          </button>
                        </div>
                        <span className="text-xs font-black text-[#8C5332] block">
                          ₱{usual.price}
                        </span>
                        <p className="text-[10px] text-[#7C6656] truncate mt-0.5">
                          {usual.customization?.temperature || 'Iced'} •{' '}
                          {usual.customization?.size
                            ? usual.customization.size.split(' ')[0]
                            : '16oz'}
                          {usual.customization?.sweetness &&
                            ` • ${usual.customization.sweetness}`}
                        </p>
                      </div>
                    </div>

                    {/* 1-Click Quick Order Button */}
                    <button
                      type="button"
                      onClick={() => orderUsual(usual)}
                      className="mt-2.5 w-full rounded-xl bg-gradient-to-r from-rose-600 to-[#8C5332] hover:from-rose-500 hover:to-[#6F3E22] text-white py-2 px-3 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>1-Click Order (₱{usual.price})</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Featured 4 Menu Items Showcase */}
        {selectedCategory === 'All' && !searchQuery && (
          <div className="mt-10 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-cafe text-xl font-bold text-[#2C1810] flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#8C5332] fill-[#8C5332]" />
                Featured Cafe Signatures
              </h3>
              <span className="text-xs text-[#7C6656] font-medium">
                Tap any drink to customize
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredItems.slice(0, 4).map((item) => {
                const favorited = isUsual(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="rounded-3xl bg-[#D9C5B2] hover:bg-[#CFB9A4] p-5 shadow-md hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-out flex flex-col items-center text-center cursor-pointer border border-[#C7B19C] hover:border-[#C29B63]/60 group relative overflow-hidden"
                  >
                    <div className="relative w-44 h-44 rounded-2xl overflow-hidden bg-white shadow-sm mb-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/menu/spanish_latte.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-2 left-2 rounded-full bg-[#2C1810]/85 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase text-amber-200 border border-amber-300/30">
                        House Special
                      </div>

                      {/* Heart / Usual Drink Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUsualDrink(item);
                        }}
                        title={favorited ? 'Saved in your Usual Drinks' : 'Heart to save as your Usual Drink'}
                        className={`absolute top-2 right-2 rounded-full p-2 backdrop-blur-md transition-all shadow-md active:scale-90 z-10 cursor-pointer ${
                          favorited
                            ? 'bg-rose-500 text-white scale-105'
                            : 'bg-black/40 hover:bg-black/60 text-white hover:text-rose-300'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <h4 className="font-serif-cafe text-lg font-bold text-[#2C1810]">
                        {item.name}
                      </h4>
                      {favorited && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.2 rounded-full border border-rose-200">
                          My Usual
                        </span>
                      )}
                    </div>

                    <span className="mt-1 font-sans text-base font-bold text-[#3D2517]">
                      ₱{item.price}
                    </span>

                    <p className="mt-2 text-xs text-[#4A2E1B] line-clamp-2">
                      {item.description}
                    </p>

                    <button
                      type="button"
                      className="mt-4 w-full rounded-full bg-[#3D2517] hover:bg-[#2C1810] text-[#FAF7F2] py-2 px-4 text-xs font-semibold shadow transition-all duration-300 group-hover:shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Customize & Order</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Menu Grid or My Usuals Grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-cafe text-xl font-bold text-[#2C1810]">
              {selectedCategory === 'My Usuals'
                ? `❤️ Your Usual Drinks & Combos (${totalUsuals})`
                : selectedCategory === 'All' && !searchQuery
                ? 'All Handcrafted Drinks & Bites'
                : `${selectedCategory} (${filteredItems.length})`}
            </h3>
            {selectedCategory === 'My Usuals' && (
              <span className="text-xs text-[#7C6656]">
                Tap any drink or combo for instant 1-click ordering!
              </span>
            )}
          </div>

          {/* If My Usuals tab is selected and user has saved combos, showcase combos first */}
          {selectedCategory === 'My Usuals' && usualCombos.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C5332] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#8C5332]" />
                  <span>Saved Combo Pairs ({usualCombos.length})</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {usualCombos.map((combo) => (
                  <div
                    key={combo.id}
                    className="rounded-3xl bg-white border-2 border-[#D8C7B6] p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#F0E6DB]">
                        <span className="text-[10px] font-bold bg-[#F5ECE2] text-[#8C5332] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#D8C7B6]">
                          <Layers className="w-3 h-3 text-[#8C5332]" />
                          <span>Combo Pair</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeUsualCombo(combo.id)}
                          className="text-xs text-gray-400 hover:text-rose-600 cursor-pointer p-1"
                          title="Remove combo"
                        >
                          ✕ Remove
                        </button>
                      </div>

                      <h4 className="font-serif-cafe text-sm font-bold text-[#2C1810] mt-2.5">
                        {combo.title}
                      </h4>
                      <p className="text-[11px] text-[#7C6656] mt-0.5">
                        Saved on {combo.savedAt}
                      </p>

                      <div className="my-3 space-y-1.5">
                        {combo.items.map((ci, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 bg-[#FAF7F2] p-2 rounded-xl border border-[#F0E6DB]"
                          >
                            <img
                              src={ci.menuItem.image}
                              alt={ci.menuItem.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  '/assets/menu/spanish_latte.jpg';
                              }}
                              className="w-9 h-9 rounded-lg object-cover shrink-0 border border-[#D8C7B6]"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-xs text-[#2C1810] block truncate">
                                {ci.quantity}x {ci.menuItem.name}
                              </span>
                              <span className="text-[10px] text-[#7C6656]">
                                {ci.customization?.temperature || 'Iced'} • {ci.customization?.size?.split(' ')[0] || '16oz'}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[#8C5332]">
                              ₱{ci.totalPrice}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-[#7C6656] block">Combo Total:</span>
                        <span className="text-sm font-black text-[#8C5332]">₱{combo.totalPrice}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => orderCombo(combo)}
                        className="rounded-full bg-[#8C5332] hover:bg-[#6F3E22] text-white px-4 py-2 text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>1-Click Order Pair</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If My Usuals has drinks section title */}
          {selectedCategory === 'My Usuals' && filteredItems.length > 0 && usualCombos.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C5332] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Saved Single Drinks ({filteredItems.length})</span>
              </span>
            </div>
          )}

          {filteredItems.length === 0 && (selectedCategory !== 'My Usuals' || usualCombos.length === 0) ? (
            <div className="text-center py-16 bg-[#FAF7F2] rounded-3xl border border-[#DECDBE]">
              {selectedCategory === 'My Usuals' ? (
                <div className="max-w-md mx-auto space-y-3 px-4">
                  <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                    <Heart className="w-7 h-7 text-rose-500" />
                  </div>
                  <h4 className="font-serif-cafe text-lg font-bold text-[#2C1810]">
                    No Usual Drinks or Combos Saved Yet
                  </h4>
                  <p className="text-xs text-[#7C6656] leading-relaxed">
                    You haven&apos;t saved any usual drinks or combos yet. Tap the ❤️ Heart icon on any drink in our menu or save 1-click combos directly from your Order History!
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {onOpenOrders && (
                      <button
                        type="button"
                        onClick={onOpenOrders}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#3D2517] text-[#FAF7F2] px-4 py-2 text-xs font-bold hover:bg-[#2C1810] transition-colors cursor-pointer shadow-xs active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                        <span>Open Order History</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('All')}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#D8C7B6] text-[#5D4037] px-4 py-2 text-xs font-bold hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <span>Browse Full Menu</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-[#5D4037]">
                    No menu items match &quot;{searchQuery}&quot;
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-3 text-xs text-[#8C5332] font-bold underline cursor-pointer"
                  >
                    Reset Search Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => {
                const favorited = isUsual(item.id);
                const matchingUsual = usualDrinks.find((u) => u.menuItemId === item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="rounded-3xl bg-[#FAF7F2] border border-[#DECDBE] hover:border-[#C29B63]/70 overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer group relative"
                  >
                    <div>
                      <div className="relative h-48 w-full bg-[#EFE7DD] overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/menu/spanish_latte.jpg';
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {item.isBestSeller && (
                            <span className="rounded-full bg-[#2C1810]/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-amber-200 border border-amber-300/40 shadow-md">
                              Best Seller
                            </span>
                          )}
                          {favorited && (
                            <span className="rounded-full bg-rose-600/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md flex items-center gap-1">
                              <Heart className="w-3 h-3 fill-white" />
                              <span>My Usual</span>
                            </span>
                          )}
                        </div>

                        {/* Heart / Usual Drink Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUsualDrink(item);
                          }}
                          title={favorited ? 'Saved in your Usual Drinks' : 'Heart to save as your Usual Drink'}
                          className={`absolute top-3 right-3 rounded-full p-2 backdrop-blur-md transition-all shadow-md active:scale-90 z-10 cursor-pointer ${
                            favorited
                              ? 'bg-rose-500 text-white scale-105 ring-2 ring-rose-300'
                              : 'bg-black/40 hover:bg-black/60 text-white hover:text-rose-300'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${favorited ? 'fill-white' : ''}`} />
                        </button>

                        <span className="absolute bottom-3 right-3 rounded-full bg-black/65 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-md">
                          ₱{item.price}
                        </span>
                      </div>

                      <div className="p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C5332]">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="font-serif-cafe text-lg font-bold text-[#2C1810] leading-snug group-hover:text-[#8C5332] transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#6F4E37] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 space-y-2">
                      {/* If favorited, provide 1-click Quick Add button alongside Customize */}
                      {favorited && matchingUsual && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            orderUsual(matchingUsual);
                          }}
                          className="w-full rounded-full bg-gradient-to-r from-rose-600 to-[#8C5332] hover:from-rose-500 hover:to-[#6F3E22] text-white py-2 px-3 text-xs font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          <span>1-Click Order My Usual (₱{item.price})</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="w-full rounded-full bg-[#EFE7DD] hover:bg-[#3D2517] hover:text-white text-[#3D2517] py-2 px-3 text-xs font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Customize & Order</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
