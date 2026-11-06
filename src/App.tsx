/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
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
import { MyAccountModal } from './components/MyAccountModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { OrdersHistoryModal } from './components/OrdersHistoryModal';
import { SocialLinksModal } from './components/SocialLinksModal';
import { LoyaltyStampBanner } from './components/LoyaltyStampBanner';
import { FreeDrinkRewardModal } from './components/FreeDrinkRewardModal';

import { MenuItem, Order } from './types/cafe';
import { CAFE_INFO } from './data/menuData';
import { ShoppingBag, ArrowRight, Lock, X, Bell, CheckCircle2, Award, Coffee } from 'lucide-react';

const SOCIALS_STORAGE_KEY = 'white_haven_social_links';

const MainAppContent: React.FC = () => {
  const {
    totalCount,
    total,
    items,
    activeOrderModal,
    setActiveOrderModal,
    orders,
    orderNotification,
    dismissOrderNotification,
  } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { themeConfig } = useTheme();

  // Navigation section
  const [activeSection, setActiveSection] = useState<'home' | 'menu' | 'about'>('home');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [authNoticeMessage, setAuthNoticeMessage] = useState<string>('');
  const [proceedToCheckoutAfterAuth, setProceedToCheckoutAfterAuth] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersHistoryOpen, setIsOrdersHistoryOpen] = useState(false);
  const [isMyAccountOpen, setIsMyAccountOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isFreeDrinkRewardModalOpen, setIsFreeDrinkRewardModalOpen] = useState(false);

  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated || !user) {
      setIsCartOpen(false);
      setAuthNoticeMessage('Please log in or create a registered account to complete your order at White Haven Café.');
      setAuthInitialMode('login');
      setProceedToCheckoutAfterAuth(true);
      setIsAuthOpen(true);
      return;
    }
    setAuthNoticeMessage('');
    setIsCheckoutOpen(true);
  };

  const handleAuthSuccess = () => {
    if (proceedToCheckoutAfterAuth && items.length > 0) {
      setProceedToCheckoutAfterAuth(false);
      setAuthNoticeMessage('');
      setIsCheckoutOpen(true);
    }
  };

  // Social links state with localStorage persistence & automatic migration to canonical URLs
  const [socials, setSocials] = useState(() => {
    try {
      const saved = localStorage.getItem(SOCIALS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If stored links contain old non-working placeholders, upgrade to real official ones
        if (
          parsed.facebook?.includes('facebook.com/whitehavencafe') ||
          parsed.tiktok?.includes('@white_havencafe')
        ) {
          localStorage.setItem(SOCIALS_STORAGE_KEY, JSON.stringify(CAFE_INFO.socials));
          return CAFE_INFO.socials;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return CAFE_INFO.socials;
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
    <div
      className="min-h-screen flex flex-col selection:bg-[#B38760] selection:text-white transition-colors duration-300"
      style={{ backgroundColor: themeConfig.bgHex }}
    >
      {/* Top Banner Notice */}
      <div className="bg-[#3D2517] text-[#FAF7F2] py-2 px-4 text-center text-xs font-medium tracking-wide">
        ☕ <span className="font-bold">White Haven Café:</span> Serving artisanal coffee & refreshers in Novaliches, QC. Use code <span className="bg-[#8C5332] text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">WHITEHAVEN10</span> for 10% off!
      </div>

      {/* Global Notification Toast */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in pointer-events-none">
          <div className="rounded-full bg-[#2C1810] text-[#FAF7F2] px-5 py-2.5 text-xs font-bold shadow-2xl border border-white/20 flex items-center gap-2 pointer-events-auto">
            <span>☕</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Real-time Live Order Progress In-App Notification Banner */}
      {orderNotification && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] bg-[#FAF7F2] border-2 border-[#8C5332] rounded-3xl shadow-2xl p-4 animate-slide-up"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C5332]">
                Order Update • {orderNotification.orderNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={dismissOrderNotification}
              className="text-[#7C6656] hover:text-[#2C1810] p-1 -mr-1 -mt-1 cursor-pointer transition-colors"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-1 flex items-start gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#3D2517] text-white shrink-0 mt-0.5">
              {orderNotification.status === 'completed' ? (
                <Award className="w-5 h-5 text-amber-300" />
              ) : orderNotification.status === 'ready' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Coffee className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-serif-cafe text-sm font-bold text-[#2C1810]">
                {orderNotification.title}
              </h4>
              <p className="text-xs text-[#5D4037] mt-0.5 leading-snug">
                {orderNotification.message}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#DECDBE]">
            <span className="text-[10px] text-[#7C6656] font-medium">
              {orderNotification.timestamp}
            </span>
            <button
              type="button"
              onClick={() => {
                const target = orders.find(o => o.orderNumber === orderNotification.orderNumber);
                if (target) {
                  setActiveOrderModal(target);
                }
                dismissOrderNotification();
              }}
              className="inline-flex items-center gap-1 rounded-full bg-[#3D2517] hover:bg-[#2C1810] text-[#FAF7F2] px-3 py-1 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span>View Tracker</span>
              <ArrowRight className="w-3 h-3 text-amber-300" />
            </button>
          </div>
        </aside>
      )}

      {/* Main Navbar */}
      <Navbar
        onOpenAuth={() => {
          setAuthInitialMode('login');
          setIsAuthOpen(true);
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersHistoryOpen(true)}
        onOpenMyAccount={() => setIsMyAccountOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onShowToast={showToast}
      />

      <main className="flex-1">
        {/* Hero Section matching screenshot */}
        <HomeHero
          onExploreMenu={() => handleNavigate('menu')}
          onOpenDelivery={() => {
            handleNavigate('menu');
          }}
          onOpenPickUp={() => {
            handleNavigate('menu');
          }}
          onOpenInStore={() => {
            handleNavigate('menu');
          }}
          onOpenSocialModal={() => setIsSocialModalOpen(true)}
          socials={socials}
        />

        {/* Loyalty Stamp Club Banner */}
        <LoyaltyStampBanner
          onOpenAuth={() => {
            setAuthInitialMode('login');
            setIsAuthOpen(true);
          }}
          onOpenClaimReward={() => setIsFreeDrinkRewardModalOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Menu Section with the exact 4 signature drinks + full menu */}
        <MenuSection onSelectItem={(item) => setSelectedMenuItem(item)} />

        {/* About Us & Novaliches Location Section matching screenshot */}
        <AboutUsSection
          onOpenSocialModal={() => setIsSocialModalOpen(true)}
          socials={socials}
        />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenSocialModal={() => setIsSocialModalOpen(true)}
        socials={socials}
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
              onClick={handleProceedToCheckout}
              className="flex items-center gap-2 rounded-full bg-[#8C5332] hover:bg-[#A0633F] px-4 py-2 text-xs font-bold text-white shadow transition-all active:scale-95 cursor-pointer"
            >
              {!isAuthenticated ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Log In to Order</span>
                </>
              ) : (
                <>
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
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
        onProceedToCheckout={handleProceedToCheckout}
        onOpenFreeDrinkPicker={() => setIsFreeDrinkRewardModalOpen(true)}
      />

      {/* Checkout Modal (Pick-up vs In-Store + Cash, Card, GCash, Maya) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onRequireAuth={() => {
          setAuthNoticeMessage('Please log in or create a registered account to complete your order at White Haven Café.');
          setAuthInitialMode('login');
          setProceedToCheckoutAfterAuth(true);
          setIsAuthOpen(true);
        }}
        onOpenFreeDrinkPicker={() => setIsFreeDrinkRewardModalOpen(true)}
      />

      {/* Auth Modal (Login, Signup, Socials, 3-Step OTP Forgot Password) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setProceedToCheckoutAfterAuth(false);
          setAuthNoticeMessage('');
        }}
        initialMode={authInitialMode}
        noticeMessage={authNoticeMessage}
        onSuccess={handleAuthSuccess}
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

      {/* My Account Modal (Photo, Stamps, Themes, Saved Address, Security) */}
      <MyAccountModal
        isOpen={isMyAccountOpen}
        onClose={() => setIsMyAccountOpen(false)}
        onShowToast={showToast}
        onOpenOrdersHistory={() => setIsOrdersHistoryOpen(true)}
        onOpenFreeDrinkClaim={() => setIsFreeDrinkRewardModalOpen(true)}
      />

      {/* 8-Stamps Free Drink Reward Claim Modal */}
      <FreeDrinkRewardModal
        isOpen={isFreeDrinkRewardModalOpen}
        onClose={() => setIsFreeDrinkRewardModalOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
