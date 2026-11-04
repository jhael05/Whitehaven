import React, { useState } from 'react';
import { Order } from '../types/cafe';
import { X, CheckCircle2, Clock, Coffee, Printer, Store, ShoppingBag, HardDrive, Check, ExternalLink } from 'lucide-react';
import { uploadFileToDrive, getDriveAccessToken, signInWithGoogleDrive } from '../services/googleDriveService';

interface OrderTrackerModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderAgain: () => void;
  onOpenDrive?: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderAgain,
}) => {
  if (!isOpen || !order) return null;

  const steps = [
    { key: 'received', title: 'Order Received', desc: 'Sent to cafe kitchen' },
    { key: 'preparing', title: 'Brewing & Crafting', desc: 'Barista is preparing drinks' },
    { key: 'ready', title: order.orderType === 'pickup' ? 'Ready for Pick-up' : 'Serving to Table', desc: order.orderType === 'pickup' ? 'Available at pickup counter' : `Heading to ${order.tableNumber || 'your table'}` },
    { key: 'completed', title: 'Order Completed', desc: 'Enjoy your coffee!' },
  ];

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(order.status);

  const [isSavingDrive, setIsSavingDrive] = useState(false);
  const [driveSavedLink, setDriveSavedLink] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToDrive = async () => {
    setIsSavingDrive(true);
    setDriveError(null);
    try {
      let token = getDriveAccessToken();
      if (!token) {
        const res = await signInWithGoogleDrive();
        if (!res?.accessToken) {
          throw new Error('Please sign in with Google to save to Drive.');
        }
      }

      const receiptText = [
        '====================================================',
        'WHITE HAVEN CAFÉ - OFFICIAL ORDER RECEIPT',
        `Order Number: ${order.orderNumber}`,
        `Date: ${new Date(order.createdAt).toLocaleString()}`,
        `Customer: ${order.customerName}`,
        `Contact: ${order.contactNumber}`,
        `Dining Type: ${order.orderType === 'pickup' ? `Pick-up (${order.pickupTime || 'ASAP'})` : `In-Store (${order.tableNumber})`}`,
        `Payment Method: ${order.paymentMethod.toUpperCase()}`,
        `Status: ${order.status.toUpperCase()}`,
        '----------------------------------------------------',
        'ORDER ITEMS:',
        ...order.items.map(
          (item) =>
            `${item.quantity}x ${item.menuItem.name} [${item.customization.size}, ${item.customization.temperature}, ${item.customization.sweetness} Sweetness${
              item.customization.milkType !== 'Whole Milk' ? `, ${item.customization.milkType}` : ''
            }${item.customization.addOns.length ? `, Add-ons: ${item.customization.addOns.join(', ')}` : ''}] = ₱${item.totalPrice}`
        ),
        '----------------------------------------------------',
        `Subtotal: ₱${order.subtotal}`,
        order.discount > 0 ? `Discount: -₱${order.discount}` : '',
        `TOTAL PAID: ₱${order.total}`,
        '----------------------------------------------------',
        'WHITE HAVEN CAFÉ',
        '22 Midway St., Foresthill Subd., Novaliches, Quezon City',
        'Hours: 8:00 AM - 12:00 MN | @white_havencafe',
        'Thank you for brewing memories with White Haven Café!',
        '====================================================',
      ]
        .filter(Boolean)
        .join('\n');

      const file = await uploadFileToDrive(
        `White_Haven_Receipt_${order.orderNumber}.txt`,
        receiptText,
        'text/plain'
      );

      setDriveSavedLink(file.webViewLink || 'https://drive.google.com');
    } catch (err: any) {
      setDriveError(err.message || 'Failed to save receipt to Google Drive.');
    } finally {
      setIsSavingDrive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 rounded-3xl bg-[#FAF7F2] shadow-2xl border border-[#D8C7B6] overflow-hidden">
        {/* Header */}
        <div className="bg-[#3D2517] text-[#FAF7F2] p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8C5332] text-white shadow-inner mb-2 animate-bounce">
            <Coffee className="w-7 h-7" />
          </div>

          <span className="inline-block rounded-full bg-[#8C5332]/60 px-3 py-1 text-xs font-bold tracking-widest uppercase text-amber-200 mb-1">
            Order {order.orderNumber}
          </span>
          <h2 className="font-serif-cafe text-2xl font-bold tracking-tight">
            Thank You, {order.customerName}!
          </h2>
          <p className="text-xs text-[#E8DCCF]/90 mt-1">
            Your White Haven order has been successfully placed.
          </p>
        </div>

        {/* Live Status Progress Stepper */}
        <div className="p-6 bg-[#F5ECE2] border-b border-[#DECDBE]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5D4037]">
              Live Order Tracker
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#8C5332]">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              {order.status === 'received' && 'Kitchen queued'}
              {order.status === 'preparing' && 'Brewing now...'}
              {order.status === 'ready' && 'Ready now!'}
              {order.status === 'completed' && 'Delivered'}
            </span>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-[1px] ${
                        idx < currentStep ? 'bg-[#8C5332]' : 'bg-[#D8C7B6]'
                      }`}
                    />
                  )}
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full z-10 transition-colors ${
                      isPast
                        ? 'bg-[#8C5332] text-white'
                        : isCurrent
                        ? 'bg-[#3D2517] text-white ring-4 ring-[#8C5332]/30'
                        : 'bg-[#D8C7B6] text-white'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-[#2C1810] text-sm'
                          : isPast
                          ? 'text-[#5D4037]'
                          : 'text-[#9E8B7A]'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-[#7C6656]">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details & Summary Receipt */}
        <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
          {/* Order Info Chips */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-white p-3 border border-[#DECDBE]">
              <span className="text-[#7C6656] block text-[10px] uppercase font-semibold">
                Fulfillment Type
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[#2C1810] mt-0.5">
                {order.orderType === 'pickup' ? (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#8C5332]" />
                    <span>Pick-up ({order.pickupTime?.split(' ')[0] || 'ASAP'})</span>
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4 text-[#8C5332]" />
                    <span>In-Store ({order.tableNumber})</span>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-white p-3 border border-[#DECDBE]">
              <span className="text-[#7C6656] block text-[10px] uppercase font-semibold">
                Payment Method
              </span>
              <div className="font-bold text-[#2C1810] mt-0.5 uppercase">
                {order.paymentMethod} •{' '}
                <span className="text-emerald-700">
                  {order.paymentMethod === 'cash' ? 'Pay upon Pickup' : 'Confirmed'}
                </span>
              </div>
            </div>
          </div>

          {/* Receipt Items */}
          <div className="rounded-2xl border border-[#DECDBE] bg-white p-4">
            <div className="text-xs font-bold text-[#5D4037] uppercase tracking-wider mb-2">
              Receipt Items
            </div>
            <div className="space-y-2 divide-y divide-[#F5ECE2]">
              {order.items.map((item) => (
                <div key={item.cartItemId} className="pt-2 first:pt-0 text-xs">
                  <div className="flex justify-between font-semibold text-[#2C1810]">
                    <span>
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span>₱{item.totalPrice}</span>
                  </div>
                  <div className="text-[10px] text-[#7C6656]">
                    {item.customization.temperature} • {item.customization.size.split(' ')[0]} •{' '}
                    {item.customization.sweetness} Sugar
                    {item.customization.milkType !== 'Whole Milk' &&
                      ` • ${item.customization.milkType.split(' ')[0]}`}
                    {item.customization.addOns.length > 0 &&
                      ` • +${item.customization.addOns.map((a) => a.split(' (')[0]).join(', ')}`}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t border-[#DECDBE] pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-[#7C6656]">
                <span>Subtotal</span>
                <span>₱{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-₱{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#2C1810] pt-1 border-t border-[#DECDBE]">
                <span>Total Paid</span>
                <span className="text-[#8C5332] text-base">₱{order.total}</span>
              </div>
            </div>
          </div>

          {/* Google Drive Receipt Status */}
          {driveSavedLink && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between animate-fade-in">
              <span className="flex items-center gap-1.5 font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                Receipt saved to Google Drive!
              </span>
              <a
                href={driveSavedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950"
              >
                <span>View File</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {driveError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 animate-fade-in">
              {driveError}
            </div>
          )}

          <div className="text-center text-[11px] text-[#7C6656]">
            📍 White Haven Café • 22 Midway St., Foresthill Subd., Novaliches, Quezon City
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="p-4 bg-[#EFE7DD] border-t border-[#DECDBE] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-full border border-[#D8C7B6] bg-white px-3.5 py-2 text-xs font-semibold text-[#5D4037] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              disabled={isSavingDrive}
              onClick={handleSaveToDrive}
              className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Save receipt file directly to your Google Drive"
            >
              <HardDrive className={`w-3.5 h-3.5 ${isSavingDrive ? 'animate-spin' : 'text-blue-600'}`} />
              <span>{isSavingDrive ? 'Saving...' : 'Save to Drive'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOrderAgain();
            }}
            className="flex-1 min-w-[140px] rounded-full bg-[#3D2517] hover:bg-[#2C1810] py-2 px-4 text-xs font-bold text-[#FAF7F2] shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-300" />
            <span>Order Another</span>
          </button>
        </div>
      </div>
    </div>
  );
};
