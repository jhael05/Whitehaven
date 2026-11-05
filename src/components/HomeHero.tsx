import React from 'react';
import { CAFE_INFO } from '../data/menuData';
import { CafeLogo } from './CafeLogo';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Store, MapPin, ArrowRight, Clock, Bike } from 'lucide-react';

interface HomeHeroProps {
  onExploreMenu: () => void;
  onOpenPickUp: () => void;
  onOpenInStore: () => void;
  onOpenDelivery?: () => void;
  onOpenSocialModal: () => void;
  socials?: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onExploreMenu,
  onOpenPickUp,
  onOpenInStore,
  onOpenDelivery,
  onOpenSocialModal,
  socials,
}) => {
  const { setOrderType } = useCart();
  const currentSocials = socials || CAFE_INFO.socials;

  const handleDelivery = () => {
    setOrderType('delivery');
    if (onOpenDelivery) {
      onOpenDelivery();
    } else {
      onExploreMenu();
    }
  };

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
      {/* VIP Ambient Warm Backlight Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none animate-pulse-warm" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#8C5332]/20 rounded-full blur-3xl pointer-events-none animate-pulse-warm" style={{ animationDelay: '2.5s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Hero Card Container - matches the aesthetic rounded card in screenshot with VIP depth */}
        <div className="relative rounded-3xl border border-[#D8C7B6] hover:border-[#C29B63]/60 bg-[#E8DCCF]/85 backdrop-blur-md p-6 sm:p-10 lg:p-12 vip-card-shadow transition-all duration-700">
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

              {/* Quick Action Buttons for Ordering: Delivery, Pick-up, and In-Store */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleDelivery}
                  className="flex items-center gap-2 rounded-full bg-[#8C5332] hover:bg-[#6F3E22] text-[#FAF7F2] px-6 py-3.5 text-sm font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer border border-amber-600/40"
                >
                  <Bike className="w-4 h-4 text-amber-300" />
                  <span>Order for Delivery</span>
                </button>

                <button
                  onClick={handlePickUp}
                  className="flex items-center gap-2 rounded-full bg-[#3D2517] hover:bg-[#2C1810] text-[#FAF7F2] px-6 py-3.5 text-sm font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer border border-[#6D432A]/50"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                  <span>Order for Pick-up</span>
                </button>

                <button
                  onClick={handleInStore}
                  className="flex items-center gap-2 rounded-full bg-[#FAF7F2] hover:bg-white text-[#3D2517] border border-[#D0BFB0] hover:border-[#8C5332] px-6 py-3.5 text-sm font-bold shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <Store className="w-4 h-4 text-[#8C5332]" />
                  <span>Dine-In / Table Order</span>
                </button>

                <button
                  onClick={onExploreMenu}
                  className="flex items-center gap-1.5 text-xs font-serif-cafe font-bold text-[#5D4037] hover:text-[#2C1810] px-3 py-2 underline uppercase tracking-wider transition-colors"
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
                      href={currentSocials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(currentSocials.facebook, '_blank', 'noopener,noreferrer');
                      }}
                      title="Follow White Haven Cafe on Facebook"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D2517] text-white hover:bg-[#1877F2] hover:scale-110 transition-all shadow-sm cursor-pointer"
                    >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>

                    {/* Instagram */}
                    <a
                      href={currentSocials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(currentSocials.instagram, '_blank', 'noopener,noreferrer');
                      }}
                      title="Follow White Haven Cafe on Instagram"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D2517] text-white hover:bg-[#E1306C] hover:scale-110 transition-all shadow-sm cursor-pointer"
                    >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>

                    {/* TikTok */}
                    <a
                      href={currentSocials.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(currentSocials.tiktok, '_blank', 'noopener,noreferrer');
                      }}
                      title="Follow White Haven Cafe on TikTok"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D2517] text-white hover:bg-black hover:scale-110 transition-all shadow-sm cursor-pointer"
                    >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.68c-.02 3.19-2.19 6.07-5.34 6.78-3.15.71-6.49-.81-7.78-3.72-1.3-2.91-.18-6.42 2.61-7.79 1.12-.55 2.37-.77 3.61-.63v4.06c-.72-.19-1.5-.16-2.19.11-.99.39-1.63 1.36-1.61 2.42.02 1.25.96 2.31 2.21 2.44 1.53.16 2.95-.91 3.09-2.44.04-.44.03-8.08.03-8.08.01-3.08.01-6.15.01-9.23 0-.15.01-.3.01-.45z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual from uploaded screenshots with rising steam & VIP depth */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FAF7F2] bg-[#FAF7F2] group hover:shadow-[0_25px_60px_-15px_rgba(44,24,16,0.35)] transition-all duration-700">
                {/* Subtle Rising Steam Animation Overlay */}
                <div className="absolute top-4 right-10 pointer-events-none z-20 flex gap-2">
                  <div className="w-2.5 h-16 bg-gradient-to-t from-white/40 to-transparent rounded-full blur-[2px] animate-steam-1" />
                  <div className="w-3 h-20 bg-gradient-to-t from-white/30 to-transparent rounded-full blur-[2px] animate-steam-2" />
                </div>

                <img
                  src="/assets/aistudio/662299249_122121441783158309_7167196707704636690_n_79ade16d.jpg"
                  alt="White Haven Cafe Outdoor Garden Patio Lounge"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-108 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

                {/* Floating Emblem Logo Badge in bottom corner with subtle float */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2.5 animate-float-slow">
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F2] p-0.5 shadow-2xl flex items-center justify-center shrink-0 border-2 border-white/90 overflow-hidden">
                      <img
                        src="/assets/aistudio/592746460_10215438614435820_8793960037591621354_n_b34158cb.jpg"
                        alt="White Haven Café Logo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-widest uppercase text-white drop-shadow">
                        Garden Patio Lounge
                      </div>
                      <div className="text-[11px] text-amber-200 drop-shadow">
                        Cozy Ambience • Novaliches, QC
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1 text-xs font-semibold border border-white/30 whitespace-nowrap shadow-md hover:bg-black/80 transition-colors">
                    Visit Us
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
