import React, { useState } from 'react';
import { CAFE_INFO } from '../data/menuData';
import { MapPin, Clock, Share2, Copy, Check, ExternalLink, Wifi, Heart } from 'lucide-react';

interface AboutUsSectionProps {
  onOpenSocialModal: () => void;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({ onOpenSocialModal }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(CAFE_INFO.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGoogleMaps = () => {
    const encoded = encodeURIComponent(CAFE_INFO.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  };

  return (
    <section id="about-section" className="py-12 md:py-20 bg-[#ECE4D8]/60 border-t border-[#D8C7B6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main card matching screenshot 863738688_2008525776498378_6810362535445627716_n_9bc0980e.png */}
        <div className="rounded-3xl border border-[#D8C7B6] bg-[#FAF7F2] p-6 sm:p-10 lg:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Cafe Ambiance Photo from Uploaded Screenshot */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#E8DCCF] group">
                <img
                  src="/assets/aistudio/863738688_2008525776498378_6810362535445627716_n_9bc0980e.png"
                  alt="White Haven Cafe Outdoor Garden Deck Novaliches"
                  className="w-full h-[380px] sm:h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs flex items-center justify-between">
                  <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 font-semibold">
                    🌿 Cozy Garden Deck & Cafe Lounge
                  </span>
                  <span className="font-semibold text-amber-200">Novaliches, QC</span>
                </div>
              </div>
            </div>

            {/* Right Column: Exact Info from the screenshot */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-serif-cafe font-bold tracking-[0.2em] uppercase text-[#8C5332]">
                  VISIT US
                </span>
                <h2 className="font-serif-cafe text-4xl sm:text-5xl font-bold tracking-tight text-[#2C1810] mt-1">
                  ABOUT US
                </h2>
              </div>

              {/* Exact Location from screenshot */}
              <div className="space-y-1.5">
                <h3 className="font-serif-cafe text-lg font-bold text-[#2C1810] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#8C5332]" />
                  Location:
                </h3>
                <p className="text-sm sm:text-base text-[#4A2E1B] leading-relaxed pl-7 font-normal">
                  {CAFE_INFO.address}
                </p>
                <div className="pl-7 pt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openGoogleMaps}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#3D2517] text-[#FAF7F2] px-3.5 py-1.5 text-xs font-semibold hover:bg-[#2C1810] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Google Maps</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#EFE7DD] text-[#5D4037] px-3.5 py-1.5 text-xs font-semibold hover:bg-[#E5D7C7] transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Address'}</span>
                  </button>
                </div>
              </div>

              {/* Exact Time from screenshot */}
              <div className="space-y-1.5">
                <h3 className="font-serif-cafe text-lg font-bold text-[#2C1810] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#8C5332]" />
                  Time:
                </h3>
                <p className="text-sm sm:text-base text-[#4A2E1B] pl-7">
                  8:00 AM - 12:00 MN (Daily)
                </p>
              </div>

              {/* Exact Socials from screenshot */}
              <div className="space-y-2">
                <h3 className="font-serif-cafe text-lg font-bold text-[#2C1810] flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#8C5332]" />
                  Socials:
                </h3>
                <div className="pl-7">
                  <p className="text-sm font-semibold text-[#4A2E1B] mb-2">
                    {CAFE_INFO.handle}
                  </p>

                  <div className="flex items-center gap-3">
                    {/* Facebook Icon */}
                    <a
                      href={CAFE_INFO.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Visit Facebook"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3D2517] text-white hover:bg-[#1877F2] transition-colors shadow-sm"
                    >
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>

                    {/* Instagram Icon */}
                    <a
                      href={CAFE_INFO.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Visit Instagram"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3D2517] text-white hover:bg-[#E1306C] transition-colors shadow-sm"
                    >
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>

                    {/* TikTok Icon */}
                    <a
                      href={CAFE_INFO.socials.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Visit TikTok"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3D2517] text-white hover:bg-black transition-colors shadow-sm"
                    >
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.68c-.02 3.19-2.19 6.07-5.34 6.78-3.15.71-6.49-.81-7.78-3.72-1.3-2.91-.18-6.42 2.61-7.79 1.12-.55 2.37-.77 3.61-.63v4.06c-.72-.19-1.5-.16-2.19.11-.99.39-1.63 1.36-1.61 2.42.02 1.25.96 2.31 2.21 2.44 1.53.16 2.95-.91 3.09-2.44.04-.44.03-8.08.03-8.08.01-3.08.01-6.15.01-9.23 0-.15.01-.3.01-.45z" />
                      </svg>
                    </a>

                    <button
                      type="button"
                      onClick={onOpenSocialModal}
                      className="ml-2 text-xs font-semibold text-[#8C5332] hover:underline"
                    >
                      Update Links
                    </button>
                  </div>
                </div>
              </div>

              {/* Amenities Grid */}
              <div className="pt-4 border-t border-[#DECDBE]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5D4037] mb-2">
                  Cafe Amenities
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#4A2E1B]">
                  {CAFE_INFO.amenities.map(amenity => (
                    <div key={amenity} className="flex items-center gap-1.5">
                      <span className="text-amber-700">✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
