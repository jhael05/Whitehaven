import React from 'react';
import { CafeLogo } from './CafeLogo';
import { CAFE_INFO } from '../data/menuData';
import { MapPin, Clock, Phone, Heart, Share2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenSocialModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSocialModal }) => {
  return (
    <footer className="bg-[#2C1810] text-[#FAF7F2] pt-14 pb-8 border-t border-[#4A2E1B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#4A2E1B]">
          {/* Brand Info */}
          <div className="space-y-4">
            <CafeLogo size="md" variant="horizontal" light />
            <p className="text-xs text-[#DECDBE] leading-relaxed">
              Your cozy neighborhood cafe in Novaliches, Quezon City. Expertly brewed specialty coffee, refreshing drinks, and warm welcoming atmosphere.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-[#DECDBE] font-medium">{CAFE_INFO.handle}</span>
              <button
                type="button"
                onClick={onOpenSocialModal}
                className="text-[11px] text-amber-300 underline font-semibold ml-2"
              >
                Social Links
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif-cafe text-sm font-bold tracking-wider uppercase text-amber-200">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#DECDBE]">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-white transition-colors"
                >
                  Explore Drinks & Bites
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  About Us & Location
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('menu-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Order for Pick-up
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('menu-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  In-Store Table Ordering
                </button>
              </li>
            </ul>
          </div>

          {/* Cafe Hours & Contact */}
          <div className="space-y-3">
            <h4 className="font-serif-cafe text-sm font-bold tracking-wider uppercase text-amber-200">
              Store Hours & Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-[#DECDBE]">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Daily Hours:</span>
                  <span>{CAFE_INFO.hours}</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Location:</span>
                  <span>{CAFE_INFO.address}</span>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{CAFE_INFO.phone}</span>
              </li>
            </ul>
          </div>

          {/* Payment Methods & Socials */}
          <div className="space-y-3">
            <h4 className="font-serif-cafe text-sm font-bold tracking-wider uppercase text-amber-200">
              Accepted Payments
            </h4>
            <div className="flex flex-wrap gap-2 text-[11px] text-[#2C1810]">
              <span className="rounded-lg bg-[#FAF7F2] px-2.5 py-1 font-bold">💵 Cash</span>
              <span className="rounded-lg bg-[#007DFE] text-white px-2.5 py-1 font-bold">GCash</span>
              <span className="rounded-lg bg-[#00897B] text-white px-2.5 py-1 font-bold">Maya</span>
              <span className="rounded-lg bg-[#FAF7F2] px-2.5 py-1 font-bold">💳 Card</span>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[#DECDBE] block mb-2">
                Follow Us Online:
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href={CAFE_INFO.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-[#1877F2] text-white transition-colors"
                  title="Facebook"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href={CAFE_INFO.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-[#E1306C] text-white transition-colors"
                  title="Instagram"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href={CAFE_INFO.socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-black text-white transition-colors"
                  title="TikTok"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.68c-.02 3.19-2.19 6.07-5.34 6.78-3.15.71-6.49-.81-7.78-3.72-1.3-2.91-.18-6.42 2.61-7.79 1.12-.55 2.37-.77 3.61-.63v4.06c-.72-.19-1.5-.16-2.19.11-.99.39-1.63 1.36-1.61 2.42.02 1.25.96 2.31 2.21 2.44 1.53.16 2.95-.91 3.09-2.44.04-.44.03-8.08.03-8.08.01-3.08.01-6.15.01-9.23 0-.15.01-.3.01-.45z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#DECDBE]/70 gap-2">
          <p>© {new Date().getFullYear()} White Haven Café. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Freshly brewed with love in Novaliches, QC</span>
            <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
