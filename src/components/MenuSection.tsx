import React, { useState } from 'react';
import { MENU_ITEMS } from '../data/menuData';
import { MenuItem, Category } from '../types/cafe';
import { Search, Heart, Plus, Coffee, SlidersHorizontal } from 'lucide-react';

interface MenuSectionProps {
  onSelectItem: (item: MenuItem) => void;
}

const CATEGORIES: Category[] = [
  'All',
  'Signature Drinks',
  'Espresso & Coffee',
  'Non-Coffee & Milk',
  'Matcha & Tea',
  'Pastries & Snacks',
];

export const MenuSection: React.FC<MenuSectionProps> = ({ onSelectItem }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
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
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#3D2517] text-[#FAF7F2] border-[#3D2517] shadow-sm'
                    : 'bg-[#FAF7F2] text-[#5D4037] border-[#DECDBE] hover:bg-[#EFE7DD]'
                }`}
              >
                {cat}
              </button>
            ))}
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

        {/* Featured 4 Menu Items Showcase (Matching screenshot 858006246_2150021175868796_155987875129091131_n_43f3af50.png) */}
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
              {MENU_ITEMS.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="rounded-3xl bg-[#D9C5B2] hover:bg-[#CFB9A4] p-5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center cursor-pointer border border-[#C7B19C] group"
                >
                  <div className="relative w-44 h-44 rounded-2xl overflow-hidden bg-white shadow-sm mb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h4 className="font-serif-cafe text-lg font-bold text-[#2C1810]">
                    {item.name}
                  </h4>
                  <span className="mt-1 font-sans text-base font-bold text-[#3D2517]">
                    ₱{item.price}
                  </span>

                  <p className="mt-2 text-xs text-[#4A2E1B] line-clamp-2">
                    {item.description}
                  </p>

                  <button
                    type="button"
                    className="mt-4 w-full rounded-full bg-[#3D2517] hover:bg-[#2C1810] text-[#FAF7F2] py-2 px-4 text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Customize & Order</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Menu Grid */}
        <div className="mt-8">
          {selectedCategory === 'All' && !searchQuery && (
            <h3 className="font-serif-cafe text-xl font-bold text-[#2C1810] mb-4">
              All Handcrafted Drinks & Bites
            </h3>
          )}

          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF7F2] rounded-3xl border border-[#DECDBE]">
              <p className="text-sm font-semibold text-[#5D4037]">
                No menu items match &quot;{searchQuery}&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-3 text-xs text-[#8C5332] font-bold underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="rounded-3xl bg-[#FAF7F2] border border-[#DECDBE] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#8C5332] transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="relative h-48 w-full bg-[#EFE7DD] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.isBestSeller && (
                        <span className="absolute top-3 left-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                          Best Seller
                        </span>
                      )}
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white">
                        ₱{item.price}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C5332]">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="font-serif-cafe text-lg font-bold text-[#2C1810] leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#6F4E37] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      className="w-full rounded-full bg-[#EFE7DD] hover:bg-[#3D2517] hover:text-white text-[#3D2517] py-2 px-3 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Customize & Order</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
