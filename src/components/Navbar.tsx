import React, { useState, useRef, useEffect } from 'react';
import { CafeLogo } from './CafeLogo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Clock, User as UserIcon, LogOut, Award, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenCart,
  onOpenOrders,
  activeSection,
  onNavigate,
  onShowToast,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalCount, orders, setActiveOrderModal } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    if (onShowToast) {
      onShowToast('You have been logged out.');
    }
  };

  // Find latest active order if any (received or preparing or ready)
  const latestActiveOrder = orders.find(
    o => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-[#EFE7DD]/95 backdrop-blur-md border-b border-[#D8C7B6] shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo matching the screenshots */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center text-left focus:outline-none group cursor-pointer"
          >
            <CafeLogo size="md" variant="horizontal" />
          </button>

          {/* Navigation Links matching screenshot: ABOUT US | MENU | LOG IN */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className={`text-xs font-serif-cafe uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                activeSection === 'home'
                  ? 'text-[#2C1810] font-bold border-b-2 border-[#8C5332] pb-1'
                  : 'text-[#5D4037] hover:text-[#2C1810]'
              }`}
            >
              HOME
            </button>

            <button
              onClick={() => onNavigate('about')}
              className={`text-xs font-serif-cafe uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                activeSection === 'about'
                  ? 'text-[#2C1810] font-bold border-b-2 border-[#8C5332] pb-1'
                  : 'text-[#5D4037] hover:text-[#2C1810]'
              }`}
            >
              ABOUT US
            </button>

            <button
              onClick={() => onNavigate('menu')}
              className={`text-xs font-serif-cafe uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                activeSection === 'menu'
                  ? 'text-[#2C1810] font-bold border-b-2 border-[#8C5332] pb-1'
                  : 'text-[#5D4037] hover:text-[#2C1810]'
              }`}
            >
              MENU
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Order Tracker Banner Button if brewing */}
            {latestActiveOrder && (
              <button
                onClick={() => setActiveOrderModal(latestActiveOrder)}
                className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-900 animate-pulse hover:bg-amber-200 transition-colors cursor-pointer"
                title="View live order progress"
              >
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>{latestActiveOrder.orderNumber} ({latestActiveOrder.status})</span>
              </button>
            )}

            {/* Orders History Button */}
            {orders.length > 0 && (
              <button
                onClick={onOpenOrders}
                className="flex items-center gap-1.5 rounded-full border border-[#D8C7B6] bg-[#FAF7F2] px-3 py-2 text-xs font-semibold text-[#5D4037] hover:bg-white transition-colors cursor-pointer"
                title="View order history"
              >
                <Clock className="w-4 h-4 text-[#8C5332]" />
                <span className="hidden sm:inline">Orders</span>
              </button>
            )}

            {/* Cart Button with Count Badge */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 rounded-full bg-[#3D2517] hover:bg-[#2C1810] text-[#FAF7F2] px-4 py-2 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Order</span>
              {totalCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[#2C1810] text-[11px] font-black shadow">
                  {totalCount}
                </span>
              )}
            </button>

            {/* User Profile / Log In / Log Out Section */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-[#D8C7B6] bg-[#FAF7F2] p-1.5 pr-3 hover:bg-white transition-colors shadow-sm cursor-pointer"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#8C5332]"
                  />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-[#2C1810] max-w-[110px] truncate leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-[#8C5332] font-semibold flex items-center gap-0.5">
                      <Award className="w-2.5 h-2.5" /> {user.stampsCount}/8 stamps
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5D4037] ml-0.5" />
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#FAF7F2] border border-[#DECDBE] p-2 shadow-2xl z-50 animate-fade-in">
                    <div className="px-3 py-2.5 border-b border-[#DECDBE]">
                      <p className="text-xs font-bold text-[#2C1810] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#7C6656] truncate">{user.emailOrContact}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[#8C5332] bg-[#F5ECE2] p-1.5 rounded-lg">
                        <span>Loyalty Stamps:</span>
                        <span>{user.stampsCount} / 8</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenOrders();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-[#4A2E1B] hover:bg-[#F0E6DB] rounded-lg mt-1 cursor-pointer"
                    >
                      My Orders & Receipts
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-1.5 cursor-pointer mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="rounded-full border border-[#5D4037] bg-transparent hover:bg-[#5D4037] hover:text-white px-5 py-2 text-xs font-serif-cafe font-bold tracking-widest uppercase text-[#5D4037] transition-all cursor-pointer shadow-sm"
              >
                LOG IN
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
