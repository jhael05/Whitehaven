import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Coffee, Gift, Check } from 'lucide-react';

export const LoyaltyStampBanner: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, claimLoyaltyReward } = useAuth();
  const [rewardToast, setRewardToast] = useState(false);

  const stampsCount = user?.stampsCount || 0;
  const isFull = stampsCount >= 8;

  const handleClaim = () => {
    if (claimLoyaltyReward()) {
      setRewardToast(true);
      setTimeout(() => setRewardToast(false), 3000);
    }
  };

  return (
    <div className="py-6 bg-[#E8DCCF]/50 border-y border-[#DECDBE] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#2C1810] via-[#3A2216] to-[#24130B] border border-[#C29B63]/40 p-5 sm:p-6 vip-card-shadow flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle gold sheen background */}
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#C29B63]/10 to-transparent pointer-events-none" />

          {/* Left Text */}
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C29B63]/20 border border-[#C29B63]/40 text-amber-300 shadow-md shrink-0">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif-cafe text-lg font-bold text-white tracking-wide">
                  White Haven Privilège Card
                </h3>
                <span className="rounded-full bg-gradient-to-r from-[#C29B63] to-[#A37841] text-[#2C1810] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-sm">
                  8 Stamps = 1 Free Drink
                </span>
              </div>
              <p className="text-xs text-[#E8DCCF]/85 mt-0.5">
                Earn 1 digital stamp for every handcrafted coffee ordered online or in-store.
              </p>
            </div>
          </div>

          {/* Right Stamp Slots */}
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {Array.from({ length: 8 }).map((_, i) => {
                const isStamped = i < stampsCount;
                return (
                  <div
                    key={i}
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 transition-all ${
                      isStamped
                        ? 'border-amber-400 bg-gradient-to-br from-amber-400 to-[#8C5332] text-white shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-105'
                        : 'border-dashed border-[#8C5332]/50 bg-black/25 text-[#A8988B]'
                    }`}
                    title={`Stamp ${i + 1} of 8`}
                  >
                    {isStamped ? (
                      <Coffee className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-[11px] font-bold">{i + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action button */}
            {isAuthenticated ? (
              isFull ? (
                <button
                  type="button"
                  onClick={handleClaim}
                  className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-5 py-2 text-xs font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer border border-emerald-300/40"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Claim Free Drink!</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-amber-200 whitespace-nowrap bg-black/30 px-3 py-1.5 rounded-full border border-amber-400/20">
                  {8 - stampsCount} more {8 - stampsCount === 1 ? 'stamp' : 'stamps'} to go!
                </span>
              )
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="rounded-full bg-gradient-to-r from-[#C29B63] to-[#A37841] hover:from-[#D4AF37] hover:to-[#B88949] text-[#2C1810] px-5 py-2 text-xs font-bold shadow-md transition-all whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95"
              >
                Log In to Save Stamps
              </button>
            )}
          </div>
        </div>

        {rewardToast && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-100 border border-emerald-300 p-2.5 text-xs text-emerald-800 text-center font-medium animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>🎉 Congratulations! Your free coffee reward has been credited to your account!</span>
          </div>
        )}
      </div>
    </div>
  );
};
