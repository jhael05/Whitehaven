import React from 'react';

export const OFFICIAL_CAFE_LOGO_URL = '/assets/aistudio/592746460_10215438614435820_8793960037591621354_n_b34158cb.jpg';

interface CafeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'stacked' | 'badge' | 'icon-only';
  light?: boolean;
}

export const CafeLogo: React.FC<CafeLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  light = false,
}) => {
  const textColor = light ? 'text-white' : 'text-[#2C1810]';
  const accentColor = light ? 'text-amber-200' : 'text-[#8C5332]';
  const borderColor = light ? 'border-white/30' : 'border-[#D8C7B6]';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const stackedSizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  if (variant === 'badge' || variant === 'icon-only') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-2xl overflow-hidden border ${borderColor} bg-[#FAF7F2] shadow-sm p-0.5 ${iconSizes[size]} ${className}`}
      >
        <img
          src={OFFICIAL_CAFE_LOGO_URL}
          alt="White Haven Café"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center ${className}`}>
        <div
          className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-[#FAF7F2] p-1 shadow-md ${stackedSizes[size]}`}
        >
          <img
            src={OFFICIAL_CAFE_LOGO_URL}
            alt="White Haven Café Logo"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
      </div>
    );
  }

  // Default: Horizontal lockup (used in Navbar & Footer)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`relative overflow-hidden rounded-xl border ${borderColor} bg-[#FAF7F2] p-0.5 shadow-sm shrink-0 ${iconSizes[size]}`}
      >
        <img
          src={OFFICIAL_CAFE_LOGO_URL}
          alt="White Haven Café Logo"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex flex-col text-left">
        <span
          className={`font-serif-cafe font-bold tracking-[0.16em] uppercase leading-tight ${titleSizes[size]} ${textColor}`}
        >
          WHITE HAVEN
        </span>
        <span
          className={`font-hand text-sm sm:text-base italic tracking-widest ${accentColor} -mt-0.5`}
        >
          café
        </span>
      </div>
    </div>
  );
};

