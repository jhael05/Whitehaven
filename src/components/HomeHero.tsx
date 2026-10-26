import React from 'react';
import { CAFE_INFO } from '../data/menuData';
import { CafeLogo } from './CafeLogo';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Store, MapPin, ArrowRight, Clock } from 'lucide-react';

interface HomeHeroProps {
  onExploreMenu: () => void;
  onOpenPickUp: () => void;
  onOpenInStore: () => void;
  onOpenSocialModal: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onExploreMenu,
  onOpenPickUp,
  onOpenInStore,
  onOpenSocialModal,
}) => {
  const { setOrderType } = useCart();

  const handlePickUp = () => {
    setOrderType('pickup');
    onOpenPickUp();
  };

  const handleInStore = () => {
    setOrderType('in_store');
    onOpenInStore();
  };

  return (
    <section className="relative overflow-hidden py-8 md:py-14">
      {/* Background Coffee Bean Accent SVGs */}
      <div className="absolute top-10 left-6 opacity-10 pointer-events-none">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor" className="text-[#5D4037]">
          <ellipse cx="50" cy="50" rx="35" ry="45" transform="rotate(-30 50 50)" />
          <path d="M50 15 C55 35 45 65 50 85" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
      </div>
      <div className="absolute bottom-6 right-8 opacity-10 pointer-events-none">
        <svg width="160" height="160" viewBox="0 0 100 100" fill="currentColor" className="text-[#5D4037]">
          <ellipse cx="50" cy="50" rx="35" ry="45" transform="rotate(25 50 50)" />
          <path d="M50 15 C45 35 55 65 50 85" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Hero Card Container - matches the aesthetic rounded card in screenshot */}
        <div className="rounded-3xl border border-[#D8C7B6] bg-[#E8DCCF]/80 backdrop-blur-md p-6 sm:p-10 lg:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Text matching screenshots */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FAF7F2] border border-[#DECDBE] px-3.5 py-1 text-xs font-semibold text-[#8C5332] shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Now Open in Novaliches, Quezon City</span>
                <span className="text-[#A8988B]">•</span>
                <span className="text-[11px] font-normal text-[#5D4037]">8:00 AM - 12:00 MN</span>
              </div>

              {/* Exact Header Typography from screenshots */}
              <h1 className="font-serif-cafe text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2C1810] leading-[1.12]">
                Welcome to <br />
                <span className="text-[#3E2723]">White Haven Cafe</span>
              </h1>

              {/* Exact Text from uploaded screenshot */}
              <p className="text-base sm:text-lg text-[#4A2E1B] leading-relaxed max-w-xl font-normal">
                Your cozy neighborhood cafe serving up expertly brewed specialty coffee, refreshing drinks and warm atmosphere. Whether you&apos;re grabbing a quick cup on the go or settling in for a relaxing afternoon, we&apos;re always ready to serve you.
              </p>

              {/* Quick Action Buttons for Ordering: Pick-up vs In-Store */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handlePickUp}
                  className="flex items-center gap-2 rounded-full bg-[#3D2517] hover:bg-[#2C1810] text-[#FAF7F2] px-6 py-3.5 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                  <span>Order for Pick-up</span>
                </button>

                <button
                  onClick={handleInStore}
                  className="flex items-center gap-2 rounded-full bg-[#FAF7F2] hover:bg-white text-[#3D2517] border border-[#D0BFB0] px-6 py-3.5 text-sm font-bold shadow-sm hover:shadow-md transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  <Store className="w-4 h-4 text-[#8C5332]" />
                  <span>Dine-In / Table Order</span>
                </button>

                <button
                  onClick={onExploreMenu}
                  className="flex items-center gap-1.5 text-xs font-serif-cafe font-bold text-[#5D4037] hover:text-[#2C1810] px-3 py-2 underline uppercase tracking-wider"
                >
                  <span>View Full Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Social handles matching screenshot @white_havencafe with clickable icons! */}
              <div className="pt-4 border-t border-[#DECDBE] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm text-[#4A2E1B]">
                    {CAFE_INFO.handle}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Facebook */}
                    <a
                      href={CAFE_INFO.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Follow White Haven Cafe on Facebook"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D2517] text-white hover:bg-[#1877F2] transition-colors shadow-sm"
                    >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>

                    {/* Instagram */}
                    <a
                      href={CAFE_INFO.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Follow White Haven Cafe on Instagram"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D2517] text-white hover:bg-[#E1306C] transition-colors shadow-sm"
                    >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>

                    {/* TikTok */}
                    <a
                      href={CAFE_INFO.socials.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Follow White Haven Cafe on TikTok"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D2517] text-white hover:bg-black transition-colors shadow-sm"
                    >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.68c-.02 3.19-2.19 6.07-5.34 6.78-3.15.71-6.49-.81-7.78-3.72-1.3-2.91-.18-6.42 2.61-7.79 1.12-.55 2.37-.77 3.61-.63v4.06c-.72-.19-1.5-.16-2.19.11-.99.39-1.63 1.36-1.61 2.42.02 1.25.96 2.31 2.21 2.44 1.53.16 2.95-.91 3.09-2.44.04-.44.03-8.08.03-8.08.01-3.08.01-6.15.01-9.23 0-.15.01-.3.01-.45z" />
                      </svg>
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenSocialModal}
                  className="text-xs font-semibold text-[#8C5332] hover:text-[#5D4037] underline"
                >
                  Manage Social Links
                </button>
              </div>
            </div>

            {/* Right Column: Hero Visual from uploaded screenshots */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FAF7F2] bg-[#FAF7F2] group">
                <img
                  src="/assets/aistudio/1792769292505_ed774f02.jpg"
                  alt="White Haven Cafe Latte Art on Rustic Wood"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating Emblem Logo Badge in bottom corner */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F2] p-1 shadow-md flex items-center justify-center">
                      <CafeLogo size="sm" variant="stacked" />
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-widest uppercase">
                        Freshly Brewed
                      </div>
                      <div className="text-[11px] text-amber-200">
                        Matcha • Mocha • Spanish Latte
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-semibold border border-white/20">
                    From ₱130
                  </span>
                </div>
              </div>

              {/* Quick Feature Pills */}
              <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-md">
                <div className="rounded-xl bg-[#FAF7F2] border border-[#DECDBE] p-2.5 text-center shadow-sm">
                  <span className="block text-base">☕</span>
                  <span className="text-[11px] font-bold text-[#3D2517]">100% Arabica</span>
                </div>
                <div className="rounded-xl bg-[#FAF7F2] border border-[#DECDBE] p-2.5 text-center shadow-sm">
                  <span className="block text-base">🌿</span>
                  <span className="text-[11px] font-bold text-[#3D2517]">Garden Patio</span>
                </div>
                <div className="rounded-xl bg-[#FAF7F2] border border-[#DECDBE] p-2.5 text-center shadow-sm">
                  <span className="block text-base">⚡</span>
                  <span className="text-[11px] font-bold text-[#3D2517]">Free Fiber Wi-Fi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
