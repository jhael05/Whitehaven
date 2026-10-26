import React from 'react';

interface CafeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'stacked' | 'badge';
  light?: boolean;
}

export const CafeLogo: React.FC<CafeLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  light = false,
}) => {
  const textColor = light ? 'text-white' : 'text-[#3E2723]';
  const accentColor = light ? 'text-[#F3E5D8]' : 'text-[#8C5332]';
  const borderColor = light ? 'border-white/30' : 'border-[#6F4E37]';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const IconGraphic = () => (
    <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
      {/* SVG recreation of White Haven Café house + coffee cup logo */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* House Roof and Chimney */}
        <path
          d="M50 16L18 42H28V76H72V42H82L50 16Z"
          stroke={light ? '#FFFFFF' : '#5D4037'}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Chimney */}
        <path
          d="M68 28V20H76V34"
          stroke={light ? '#FFFFFF' : '#5D4037'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Coffee Cup body inside the house */}
        <path
          d="M33 52C33 66 41 71 50 71C59 71 67 66 67 52H33Z"
          fill={light ? '#FFFFFF' : '#5D4037'}
        />
        {/* Cup handle */}
        <path
          d="M66 54C72 54 75 58 75 62C75 66 71 68 65 68"
          stroke={light ? '#FFFFFF' : '#5D4037'}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Steam */}
        <path
          d="M45 42C43 37 47 34 45 29"
          stroke={light ? '#F3E5D8' : '#8C5332'}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M55 42C53 37 57 34 55 29"
          stroke={light ? '#F3E5D8' : '#8C5332'}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex flex-col items-center justify-center rounded-full border-2 ${borderColor} bg-[#FAF7F2] p-4 text-center shadow-md ${className}`}
      >
        <IconGraphic />
        <span className="mt-1 font-serif-cafe font-bold tracking-widest text-[#3E2723] uppercase text-xs">
          WHITE HAVEN
        </span>
        <span className="font-hand italic text-[#8C5332] text-sm -mt-1">
          café
        </span>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center ${className}`}>
        <IconGraphic />
        <div className="mt-1.5 flex flex-col items-center">
          <span
            className={`font-display font-bold tracking-[0.2em] uppercase leading-tight ${titleSizes[size]} ${textColor}`}
          >
            WHITE HAVEN
          </span>
          <span className={`font-hand text-lg italic tracking-wider ${accentColor} -mt-0.5`}>
            café
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <IconGraphic />
      <div className="flex flex-col">
        <span
          className={`font-display font-bold tracking-[0.16em] uppercase leading-none ${titleSizes[size]} ${textColor}`}
        >
          WHITE HAVEN
        </span>
        <span
          className={`font-hand text-base italic tracking-widest ${accentColor} -mt-0.5`}
        >
          café
        </span>
      </div>
    </div>
  );
};
