import React, { useState } from 'react';
import { X, ExternalLink, Check, Share2, Save } from 'lucide-react';

interface SocialLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
  onUpdateSocials: (updated: { facebook: string; instagram: string; tiktok: string }) => void;
}

export const SocialLinksModal: React.FC<SocialLinksModalProps> = ({
  isOpen,
  onClose,
  socials,
  onUpdateSocials,
}) => {
  const [fb, setFb] = useState(socials.facebook);
  const [ig, setIg] = useState(socials.instagram);
  const [tt, setTt] = useState(socials.tiktok);
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSocials({
      facebook: fb.trim(),
      instagram: ig.trim(),
      tiktok: tt.trim(),
    });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md my-8 rounded-3xl bg-[#FAF7F2] shadow-2xl border border-[#D8C7B6] overflow-hidden p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-[#5D4037] hover:bg-[#DECDBE] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3D2517] text-white">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-cafe text-xl font-bold text-[#2C1810]">
              White Haven Social Hub
            </h2>
            <p className="text-xs text-[#7C6656]">
              Direct links or customize your social URLs anytime
            </p>
          </div>
        </div>

        {savedToast && (
          <div className="my-3 flex items-center gap-2 rounded-xl bg-emerald-100 border border-emerald-300 p-2.5 text-xs text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Social links updated successfully!</span>
          </div>
        )}

        {/* Quick Launch Buttons */}
        <div className="my-4 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5D4037]">
            Visit Official Profiles
          </span>

          <a
            href={fb}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 p-3 text-xs font-bold text-[#1877F2] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1877F2] text-white">
                f
              </span>
              <span>Facebook (@white_havencafe)</span>
            </div>
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href={ig}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl bg-[#E1306C]/10 hover:bg-[#E1306C]/20 border border-[#E1306C]/30 p-3 text-xs font-bold text-[#E1306C] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] text-white text-[10px]">
                IG
              </span>
              <span>Instagram (@white_havencafe)</span>
            </div>
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href={tt}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl bg-black/5 hover:bg-black/10 border border-black/20 p-3 text-xs font-bold text-black transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white text-[10px]">
                TT
              </span>
              <span>TikTok (@white_havencafe)</span>
            </div>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Customize / Edit URLs form */}
        <form onSubmit={handleSave} className="mt-5 pt-4 border-t border-[#DECDBE] space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5D4037] block">
            Drop Your Actual Link Here
          </span>

          <div>
            <label className="block text-[11px] font-medium text-[#4A2E1B] mb-1">
              Facebook Page URL
            </label>
            <input
              type="url"
              value={fb}
              onChange={(e) => setFb(e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full rounded-xl border border-[#D8C7B6] bg-white px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4A2E1B] mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              value={ig}
              onChange={(e) => setIg(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full rounded-xl border border-[#D8C7B6] bg-white px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4A2E1B] mb-1">
              TikTok URL
            </label>
            <input
              type="url"
              value={tt}
              onChange={(e) => setTt(e.target.value)}
              placeholder="https://tiktok.com/@..."
              className="w-full rounded-xl border border-[#D8C7B6] bg-white px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 rounded-full bg-[#3D2517] hover:bg-[#2C1810] text-[#FAF7F2] py-2.5 px-4 text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Custom Links</span>
          </button>
        </form>
      </div>
    </div>
  );
};
