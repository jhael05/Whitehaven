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
    <div className="py-6 bg-[#E8DCCF]/50 border-y border-[#DECDBE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#FAF7F2] border border-[#DECDBE] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Text */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3D2517] text-white shadow-md shrink-0">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-cafe text-lg font-bold text-[#2C1810]">
                  White Haven Coffee Club
                </h3>
                <span className="rounded-full bg-[#8C5332] text-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  8 Stamps = 1 Free Drink
                </span>
              </div>
              <p className="text-xs text-[#6F4E37] mt-0.5">
                Earn 1 digital stamp for every handcrafted coffee ordered online or in-store.
              </p>
            </div>
          </div>

          {/* Right Stamp Slots */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {Array.from({ length: 8 }).map((_, i) => {
                const isStamped = i < stampsCount;
                return (
                  <div
                    key={i}
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 transition-all ${
                      isStamped
                        ? 'border-[#8C5332] bg-[#8C5332] text-white shadow-sm scale-105'
                        : 'border-dashed border-[#C5B3A1] bg-[#F5ECE2] text-[#A8988B]'
                    }`}
                    title={`Stamp ${i + 1} of 8`}
                  >
                    {isStamped ? (
                      <Coffee className="w-4 h-4 text-amber-200" />
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
                  className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Claim Free Drink!</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-[#8C5332] whitespace-nowrap">
                  {8 - stampsCount} more {8 - stampsCount === 1 ? 'stamp' : 'stamps'} to go!
                </span>
              )
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="rounded-full bg-[#3D2517] hover:bg-[#2C1810] text-white px-4 py-2 text-xs font-bold shadow transition-colors whitespace-nowrap"
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
