import React from 'react';

/**
 * Aesthetic, high-fidelity SVGs for Accepted Payment Logos:
 * - GCash (authentic official blue with sleek modern mark)
 * - Maya (vibrant modern mint/teal brand mark)
 * - Visa & Mastercard (classic card network emblems)
 * - Cash (clean minimalist cash banknote icon)
 */

interface PaymentLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GCashLogo: React.FC<PaymentLogoProps> = ({ className = '', size = 'md' }) => {
  const height = size === 'sm' ? 'h-5' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <svg
      viewBox="0 0 120 40"
      className={`${height} w-auto object-contain ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GCash"
      role="img"
    >
      {/* Soft rounded pill background / mark */}
      <rect width="120" height="40" rx="9" fill="#007DFE" />
      {/* Icon G mark with wave */}
      <g transform="translate(10, 7)">
        <circle cx="13" cy="13" r="11" stroke="#FFFFFF" strokeWidth="3" fill="none" />
        <path
          d="M13 7.5A5.5 5.5 0 1 0 18.5 13H13"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="13" r="2.2" fill="#FFFFFF" />
      </g>
      {/* "GCash" clean bold typography */}
      <text
        x="42"
        y="25.5"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="17"
        fontWeight="800"
        letterSpacing="-0.5px"
      >
        GCash
      </text>
    </svg>
  );
};

export const MayaLogo: React.FC<PaymentLogoProps> = ({ className = '', size = 'md' }) => {
  const height = size === 'sm' ? 'h-5' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <svg
      viewBox="0 0 120 40"
      className={`${height} w-auto object-contain ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Maya"
      role="img"
    >
      {/* Modern Maya black badge */}
      <rect width="120" height="40" rx="9" fill="#080808" />
      {/* Maya signature dual-tone green / mint geometric shapes */}
      <g transform="translate(10, 8)">
        {/* Left leaf/pill */}
        <path
          d="M3 18C1.34315 18 0 16.6569 0 15V6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6V18H3Z"
          fill="#00D084"
        />
        {/* Right leaf/pill with slight angle */}
        <path
          d="M14 18C12.3431 18 11 16.6569 11 15V9C11 5.68629 13.6863 3 17 3C20.3137 3 23 5.68629 23 9V18H14Z"
          fill="#7EE787"
        />
      </g>
      {/* "maya" modern brand lettering */}
      <text
        x="41"
        y="25.5"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="17.5"
        fontWeight="800"
        letterSpacing="-0.6px"
      >
        maya
      </text>
    </svg>
  );
};

export const CardsLogo: React.FC<PaymentLogoProps> = ({ className = '', size = 'md' }) => {
  const height = size === 'sm' ? 'h-5' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <svg
      viewBox="0 0 120 40"
      className={`${height} w-auto object-contain ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Visa & Mastercard"
      role="img"
    >
      {/* Dark sleek card background */}
      <rect width="120" height="40" rx="9" fill="#1C1917" stroke="#44403C" strokeWidth="1" />
      
      {/* Visa Logo Section */}
      <g transform="translate(10, 11)">
        <text
          x="0"
          y="15.5"
          fill="#1A1F71"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="15"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="0.5px"
        >
          <tspan fill="#F7B600">/</tspan>
          <tspan fill="#FFFFFF">VISA</tspan>
        </text>
      </g>

      {/* Divider */}
      <line x1="61" y1="10" x2="61" y2="30" stroke="#57534E" strokeWidth="1.2" />

      {/* Mastercard Interlocking Circles */}
      <g transform="translate(68, 9)">
        <circle cx="11" cy="11" r="10" fill="#EB001B" />
        <circle cx="23" cy="11" r="10" fill="#F79E1B" fillOpacity="0.9" />
        <path
          d="M17 4.1C19.5 6 21 8.8 21 12C21 15.2 19.5 18 17 19.9C14.5 18 13 15.2 13 12C13 8.8 14.5 6 17 4.1Z"
          fill="#FF5F00"
        />
      </g>
    </svg>
  );
};

export const CashLogo: React.FC<PaymentLogoProps> = ({ className = '', size = 'md' }) => {
  const height = size === 'sm' ? 'h-5' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <svg
      viewBox="0 0 120 40"
      className={`${height} w-auto object-contain ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cash"
      role="img"
    >
      {/* Classic warm green bill background */}
      <rect width="120" height="40" rx="9" fill="#1B4D3E" stroke="#2E7D32" strokeWidth="1" />
      <rect x="4" y="4" width="112" height="32" rx="6" stroke="#81C784" strokeWidth="1" strokeDasharray="3 2" />
      {/* Central Philippine Peso Emblem */}
      <g transform="translate(18, 9)">
        <circle cx="11" cy="11" r="10" fill="#2E7D32" stroke="#A5D6A7" strokeWidth="1.2" />
        <text
          x="11"
          y="16"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="14"
          fontWeight="900"
        >
          ₱
        </text>
      </g>
      {/* "CASH" text */}
      <text
        x="51"
        y="25.5"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="15"
        fontWeight="800"
        letterSpacing="1px"
      >
        CASH
      </text>
    </svg>
  );
};

/**
 * Compact Icon-Only Logo Badges (No Text) for super aesthetic minimalist UI
 */
export const GCashIconMark: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 32,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`object-contain ${className}`}
    aria-label="GCash"
  >
    <rect width="40" height="40" rx="12" fill="#007DFE" />
    <g transform="translate(7, 7)">
      <circle cx="13" cy="13" r="11" stroke="#FFFFFF" strokeWidth="3" fill="none" />
      <path
        d="M13 7.5A5.5 5.5 0 1 0 18.5 13H13"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="13" r="2.2" fill="#FFFFFF" />
    </g>
  </svg>
);

export const MayaIconMark: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 32,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`object-contain ${className}`}
    aria-label="Maya"
  >
    <rect width="40" height="40" rx="12" fill="#0A0A0A" />
    <g transform="translate(9, 10)">
      <path
        d="M3 18C1.34315 18 0 16.6569 0 15V6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6V18H3Z"
        fill="#00D084"
      />
      <path
        d="M13 18C11.3431 18 10 16.6569 10 15V9C10 5.68629 12.6863 3 16 3C19.3137 3 22 5.68629 22 9V18H13Z"
        fill="#7EE787"
      />
    </g>
  </svg>
);

export const CardsIconMark: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 32,
}) => (
  <svg
    width={size * 1.5}
    height={size}
    viewBox="0 0 60 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`object-contain ${className}`}
    aria-label="Visa & Mastercard"
  >
    <rect width="60" height="40" rx="12" fill="#1C1917" stroke="#44403C" strokeWidth="1" />
    <g transform="translate(13, 9)">
      <circle cx="11" cy="11" r="10" fill="#EB001B" />
      <circle cx="23" cy="11" r="10" fill="#F79E1B" fillOpacity="0.9" />
      <path
        d="M17 4.1C19.5 6 21 8.8 21 12C21 15.2 19.5 18 17 19.9C14.5 18 13 15.2 13 12C13 8.8 14.5 6 17 4.1Z"
        fill="#FF5F00"
      />
    </g>
  </svg>
);

export const CashIconMark: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 32,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`object-contain ${className}`}
    aria-label="Cash"
  >
    <rect width="40" height="40" rx="12" fill="#1B4D3E" stroke="#2E7D32" strokeWidth="1" />
    <circle cx="20" cy="20" r="11" fill="#2E7D32" stroke="#A5D6A7" strokeWidth="1.2" />
    <text
      x="20"
      y="26"
      textAnchor="middle"
      fill="#FFFFFF"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="17"
      fontWeight="900"
    >
      ₱
    </text>
  </svg>
);
