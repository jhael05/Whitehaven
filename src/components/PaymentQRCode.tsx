import React, { useState } from 'react';
import { GCashLogo, MayaLogo } from './PaymentLogos';
import { Copy, Check, ZoomIn, Download, Smartphone, QrCode } from 'lucide-react';

interface PaymentQRCodeProps {
  method: 'gcash' | 'maya';
  amount: number;
  merchantName?: string;
  accountNumber?: string;
}

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  method,
  amount,
  merchantName = 'WHITE HAVEN CAFÉ',
  accountNumber = '0917 842 8360',
}) => {
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const isGCash = method === 'gcash';
  const brandColor = isGCash ? '#007DFE' : '#00897B';
  const brandBg = isGCash ? 'bg-[#007DFE]' : 'bg-[#00897B]';
  const brandBgLight = isGCash ? 'bg-[#EBF4FF]' : 'bg-[#E0F2F1]';
  const brandBorder = isGCash ? 'border-[#B9D8FF]' : 'border-[#80CBC4]';
  const brandText = isGCash ? 'text-[#007DFE]' : 'text-[#00897B]';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(accountNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate authentic QR pattern matrix with 3 finder patterns + data matrix
  const renderQRMatrix = (size = 180) => {
    return (
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="w-full h-full"
        shapeRendering="crispEdges"
      >
        <rect width="200" height="200" fill="#FFFFFF" />

        {/* Finder Pattern Top-Left */}
        <rect x="10" y="10" width="50" height="50" fill={brandColor} rx="6" />
        <rect x="18" y="18" width="34" height="34" fill="#FFFFFF" rx="4" />
        <rect x="25" y="25" width="20" height="20" fill={brandColor} rx="3" />

        {/* Finder Pattern Top-Right */}
        <rect x="140" y="10" width="50" height="50" fill={brandColor} rx="6" />
        <rect x="148" y="18" width="34" height="34" fill="#FFFFFF" rx="4" />
        <rect x="155" y="25" width="20" height="20" fill={brandColor} rx="3" />

        {/* Finder Pattern Bottom-Left */}
        <rect x="10" y="140" width="50" height="50" fill={brandColor} rx="6" />
        <rect x="18" y="148" width="34" height="34" fill="#FFFFFF" rx="4" />
        <rect x="25" y="155" width="20" height="20" fill={brandColor} rx="3" />

        {/* Timing Lines */}
        <line x1="65" y1="35" x2="135" y2="35" stroke={brandColor} strokeWidth="6" strokeDasharray="6,6" />
        <line x1="35" y1="65" x2="35" y2="135" stroke={brandColor} strokeWidth="6" strokeDasharray="6,6" />

        {/* Simulated QR Code Data Blocks */}
        {/* Top middle block */}
        <rect x="70" y="12" width="10" height="10" fill={brandColor} />
        <rect x="90" y="12" width="16" height="8" fill={brandColor} />
        <rect x="115" y="12" width="12" height="12" fill={brandColor} />
        <rect x="75" y="24" width="22" height="8" fill={brandColor} />
        <rect x="108" y="26" width="14" height="14" fill={brandColor} />

        {/* Middle row details */}
        <rect x="12" y="70" width="16" height="8" fill={brandColor} />
        <rect x="14" y="86" width="10" height="16" fill={brandColor} />
        <rect x="12" y="112" width="22" height="10" fill={brandColor} />

        <rect x="52" y="72" width="14" height="14" fill={brandColor} />
        <rect x="74" y="68" width="18" height="10" fill={brandColor} />
        <rect x="100" y="68" width="14" height="14" fill={brandColor} />
        <rect x="122" y="72" width="10" height="18" fill={brandColor} />
        <rect x="140" y="68" width="22" height="10" fill={brandColor} />
        <rect x="170" y="70" width="18" height="12" fill={brandColor} />

        {/* Center alignment patterns */}
        <rect x="54" y="100" width="16" height="16" fill={brandColor} />
        <rect x="58" y="104" width="8" height="8" fill="#FFFFFF" />
        <rect x="60" y="106" width="4" height="4" fill={brandColor} />

        <rect x="134" y="100" width="16" height="16" fill={brandColor} />
        <rect x="138" y="104" width="8" height="8" fill="#FFFFFF" />
        <rect x="140" y="106" width="4" height="4" fill={brandColor} />

        <rect x="78" y="120" width="20" height="12" fill={brandColor} />
        <rect x="106" y="118" width="18" height="16" fill={brandColor} />

        {/* Right middle */}
        <rect x="145" y="125" width="20" height="10" fill={brandColor} />
        <rect x="172" y="120" width="16" height="18" fill={brandColor} />
        <rect x="142" y="145" width="14" height="14" fill={brandColor} />
        <rect x="165" y="145" width="24" height="10" fill={brandColor} />
        <rect x="145" y="168" width="20" height="12" fill={brandColor} />
        <rect x="172" y="165" width="16" height="20" fill={brandColor} />

        {/* Bottom middle block */}
        <rect x="70" y="145" width="16" height="16" fill={brandColor} />
        <rect x="94" y="145" width="14" height="10" fill={brandColor} />
        <rect x="115" y="145" width="16" height="18" fill={brandColor} />
        <rect x="72" y="170" width="22" height="14" fill={brandColor} />
        <rect x="102" y="168" width="18" height="16" fill={brandColor} />

        {/* Center Brand Badge (Cutout) */}
        <rect x="74" y="74" width="52" height="52" fill="#FFFFFF" rx="10" stroke={brandColor} strokeWidth="3" />
        <foreignObject x="76" y="76" width="48" height="48">
          <div className="w-full h-full flex flex-col items-center justify-center p-1">
            {isGCash ? (
              <div className="w-8 h-8 rounded-full bg-[#007DFE] flex items-center justify-center text-white font-black text-xs shadow-sm">
                G
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#00897B] flex items-center justify-center text-white font-black text-xs shadow-sm">
                M
              </div>
            )}
            <span className="text-[7px] font-black uppercase tracking-tighter text-gray-800 mt-0.5">
              QR Ph
            </span>
          </div>
        </foreignObject>
      </svg>
    );
  };

  return (
    <div className={`mt-3 rounded-2xl ${brandBgLight} p-4 border ${brandBorder} text-xs shadow-sm`}>
      {/* Top Banner with QR Ph & Brand Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isGCash ? <GCashLogo size="sm" className="h-6" /> : <MayaLogo size="sm" className="h-6" />}
          <div>
            <h4 className={`font-bold text-xs ${brandText}`}>
              {isGCash ? 'Official GCash QR Ph' : 'Official Maya QR Ph'}
            </h4>
            <p className="text-[10px] text-gray-600">Scan to pay directly from your app</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`rounded-full ${brandBg} text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs`}>
            Verified Merchant
          </span>
        </div>
      </div>

      {/* Main QR Card Container */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-md flex flex-col sm:flex-row items-center gap-5">
        {/* Visual QR Code Display with Hover Zoom */}
        <div className="relative group flex flex-col items-center shrink-0">
          <div
            onClick={() => setIsZoomed(true)}
            className="w-44 h-44 sm:w-48 sm:h-48 p-2.5 rounded-2xl bg-white border-2 border-gray-100 shadow-inner flex items-center justify-center cursor-pointer transition-transform group-hover:scale-[1.02]"
            title="Click to enlarge QR Code"
          >
            {renderQRMatrix(180)}
          </div>
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold ${brandText} hover:underline cursor-pointer`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Tap to Enlarge QR</span>
          </button>
        </div>

        {/* Merchant & Payment Info */}
        <div className="flex-1 w-full space-y-2.5 text-left">
          <div className="border-b border-gray-100 pb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
              Pay To Merchant
            </span>
            <p className="font-bold text-sm text-gray-900">{merchantName}</p>
            <span className="text-[11px] text-gray-500">Novaliches, Quezon City</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
              {isGCash ? 'GCash Registered Mobile' : 'Maya / Mobile Number'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`font-mono text-base font-extrabold ${brandText}`}>
                {accountNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Copy phone number"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl ${brandBgLight} border ${brandBorder} flex items-center justify-between`}>
            <div>
              <span className="text-[10px] text-gray-600 block">Exact Amount to Pay:</span>
              <span className="text-lg font-black text-gray-900">₱{amount.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-gray-700 border border-gray-200">
                Fee: ₱0.00
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-600 leading-tight">
            💡 <strong>Quick Steps:</strong> Open your {isGCash ? 'GCash' : 'Maya or Banking'} app &gt; Scan this QR or Send to <strong>{accountNumber}</strong> &gt; Enter reference number below to confirm.
          </p>
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in cursor-pointer"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-white cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`inline-flex items-center gap-2 rounded-full ${brandBg} text-white px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3`}>
              <QrCode className="w-4 h-4" />
              <span>{isGCash ? 'GCash QR Ph Stand' : 'Maya QR Ph Stand'}</span>
            </div>

            <h3 className="font-serif-cafe text-xl font-bold text-gray-900">
              {merchantName}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Novaliches, Quezon City • {accountNumber}
            </p>

            {/* Large QR Display */}
            <div className="mx-auto w-64 h-64 p-3 bg-white rounded-2xl border-2 border-gray-200 shadow-md flex items-center justify-center">
              {renderQRMatrix(240)}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-xs text-gray-500 block">Total Due</span>
              <span className={`text-2xl font-black ${brandText}`}>
                ₱{amount.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="mt-4 w-full rounded-full bg-gray-900 text-white py-2.5 text-xs font-bold hover:bg-black transition-colors cursor-pointer"
            >
              Close QR View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
