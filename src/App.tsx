/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { MenuSection } from './components/MenuSection';
import { AboutUsSection } from './components/AboutUsSection';
import { Footer } from './components/Footer';
import { DrinkCustomizerModal } from './components/DrinkCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { OrdersHistoryModal } from './components/OrdersHistoryModal';
import { SocialLinksModal } from './components/SocialLinksModal';
import { LoyaltyStampBanner } from './components/LoyaltyStampBanner';
import { MenuItem, Order } from './types/cafe';
import { CAFE_INFO } from './data/menuData';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const SOCIALS_STORAGE_KEY = 'white_haven_social_links';

const MainAppContent: React.FC = () => {
  const { totalCount, total, activeOrderModal, setActiveOrderModal } = useCart();

  // Navigation section
  const [activeSection, setActiveSection] = useState<'home' | 'menu' | 'about'>('home');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersHistoryOpen, setIsOrdersHistoryOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Social links state with localStorage persistence
  const [socials, setSocials] = useState(() => {
    try {
      const saved = localStorage.getItem(SOCIALS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      facebook: CAFE_INFO.socials.facebook,
      instagram: CAFE_INFO.socials.instagram,
      tiktok: CAFE_INFO.socials.tiktok,
    };
  });

  const handleUpdateSocials = (updated: { facebook: string; instagram: string; tiktok: string }) => {
    setSocials(updated);
    localStorage.setItem(SOCIALS_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'home') {
      setActiveSection('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'menu') {
      setActiveSection('menu');
      const el = document.getElementById('menu-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'about') {
      setActiveSection('about');
      const el = document.getElementById('about-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE4D8] selection:bg-[#B38760] selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-[#3D2517] text-[#FAF7F2] py-2 px-4 text-center text-xs font-medium tracking-wide">
        ☕ <span className="font-bold">White Haven Café:</span> Serving artisanal coffee & refreshers in Novaliches, QC. Use code <span className="bg-[#8C5332] text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">WHITEHAVEN10</span> for 10% off!
      </div>

      {/* Global Notification Toast */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="rounded-full bg-[#2C1810] text-[#FAF7F2] px-5 py-2.5 text-xs font-bold shadow-2xl border border-white/20 flex items-center gap-2">
            <span>☕</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        onOpenAuth={() => {
          setAuthInitialMode('login');
          setIsAuthOpen(true);
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersHistoryOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onShowToast={showToast}
      />

      <main className="flex-1">
        {/* Hero Section matching screenshot */}
        <HomeHero
          onExploreMenu={() => handleNavigate('menu')}
          onOpenPickUp={() => {
            handleNavigate('menu');
          }}
          onOpenInStore={() => {
            handleNavigate('menu');
          }}
          onOpenSocialModal={() => setIsSocialModalOpen(true)}
        />

        {/* Loyalty Stamp Club Banner */}
        <LoyaltyStampBanner
          onOpenAuth={() => {
            setAuthInitialMode('login');
            setIsAuthOpen(true);
          }}
        />

        {/* Menu Section with the exact 4 signature drinks + full menu */}
        <MenuSection onSelectItem={(item) => setSelectedMenuItem(item)} />

        {/* About Us & Novaliches Location Section matching screenshot */}
        <AboutUsSection onOpenSocialModal={() => setIsSocialModalOpen(true)} />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenSocialModal={() => setIsSocialModalOpen(true)}
      />

      {/* Floating Bottom Cart Bar (appears when items are in cart and cart drawer is closed) */}
      {totalCount > 0 && !isCartOpen && !isCheckoutOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4 animate-fade-in-up">
          <div className="rounded-full bg-[#2C1810]/95 backdrop-blur-md p-2.5 pr-4 shadow-2xl border border-white/10 flex items-center justify-between text-white">
            <div className="flex items-center gap-3 pl-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-[#2C1810] font-black text-sm">
                {totalCount}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">Your Order</div>
                <div className="text-xs text-amber-200 font-bold">Total: ₱{total}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[#8C5332] hover:bg-[#A0633F] px-4 py-2 text-xs font-bold text-white shadow transition-all active:scale-95"
            >
              <span>Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Drink Customization Modal */}
      <DrinkCustomizerModal
        item={selectedMenuItem}
        isOpen={!!selectedMenuItem}
        onClose={() => setSelectedMenuItem(null)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal (Pick-up vs In-Store + Cash, Card, GCash, Maya) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Auth Modal (Login, Signup, Socials, 3-Step OTP Forgot Password) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
      />

      {/* Live Order Tracker Modal */}
      <OrderTrackerModal
        order={activeOrderModal}
        isOpen={!!activeOrderModal}
        onClose={() => setActiveOrderModal(null)}
        onOrderAgain={() => {
          setActiveOrderModal(null);
          handleNavigate('menu');
        }}
      />

      {/* Orders History Modal */}
      <OrdersHistoryModal
        isOpen={isOrdersHistoryOpen}
        onClose={() => setIsOrdersHistoryOpen(false)}
        onSelectOrder={(ord) => {
          setIsOrdersHistoryOpen(false);
          setActiveOrderModal(ord);
        }}
      />

      {/* Social Links Modal (Direct visit or paste custom links) */}
      <SocialLinksModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        socials={socials}
        onUpdateSocials={handleUpdateSocials}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}
