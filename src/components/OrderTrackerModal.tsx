import React from 'react';
import { Order } from '../types/cafe';
import { X, CheckCircle2, Clock, Coffee, Printer, Store, ShoppingBag, Sparkles, Check } from 'lucide-react';

interface OrderTrackerModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderAgain: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderAgain,
}) => {
  if (!isOpen || !order) return null;

  const steps = [
    { key: 'received', title: 'Order Received', desc: 'Queued in the cafe kitchen' },
    { key: 'preparing', title: 'Brewing & Crafting', desc: 'Barista is handcrafting your drinks' },
    {
      key: 'ready',
      title: order.orderType === 'pickup' ? 'Ready for Pick-up' : 'Serving to Table',
      desc: order.orderType === 'pickup' ? 'Available at the pick-up counter' : `Barista is heading to ${order.tableNumber || 'your table'}`,
    },
    { key: 'completed', title: 'Order Completed', desc: 'Served & ready to enjoy!' },
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

  const handlePrint = () => {
    window.print();
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
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5D4037] block">
                Live Order Tracker • Stage {currentStep + 1} of 4
              </span>
              <span className="text-[11px] text-[#7C6656]">
                {order.status === 'received' && 'Step 1/4: Order received and placed in kitchen queue'}
                {order.status === 'preparing' && 'Step 2/4: Barista is brewing espresso & blending drinks'}
                {order.status === 'ready' && 'Step 3/4: Freshly prepared & ready for pick-up/table'}
                {order.status === 'completed' && 'Step 4/4: Successfully completed & served!'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs ${
                  order.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : order.status === 'ready'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                    : 'bg-[#FAF7F2] text-[#8C5332] border border-[#DECDBE]'
                }`}
              >
                {order.status !== 'completed' ? (
                  <Clock className="w-3.5 h-3.5 animate-spin text-[#8C5332]" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="capitalize">{order.status}</span>
              </span>
            </div>
          </div>

          {/* Automatic Progress Tracker */}
          <div className="mb-4 bg-white/70 rounded-2xl p-2.5 border border-[#DECDBE]/80 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#7C6656] mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${order.status === 'completed' ? 'bg-emerald-500' : 'bg-[#8C5332] animate-ping'}`} />
                <span className="font-semibold text-[#3D2517]">
                  {order.status === 'completed' ? 'Order Completed' : 'Automatic Live Tracking'}
                </span>
              </span>
              <span className="text-[10px] text-[#8C5332] font-semibold">
                {order.status === 'received' && 'Progressing automatically to Brewing...'}
                {order.status === 'preparing' && 'Progressing automatically to Serving...'}
                {order.status === 'ready' && 'Progressing automatically to Complete...'}
                {order.status === 'completed' && 'All 4 stages completed ✓'}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E5D7C7] overflow-hidden">
              <div
                className="h-full transition-all duration-700 ease-out rounded-full"
                style={{
                  width:
                    order.status === 'received'
                      ? '25%'
                      : order.status === 'preparing'
                      ? '50%'
                      : order.status === 'ready'
                      ? '75%'
                      : '100%',
                  backgroundColor: order.status === 'completed' ? '#059669' : '#8C5332',
                }}
              />
            </div>
          </div>

          {/* If completed, show celebratory message */}
          {order.status === 'completed' && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
              <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <p className="font-bold">Order Fulfilled & Complete!</p>
                <p className="text-[11px] text-emerald-700">Thank you for dining with White Haven Café Novaliches. Have a wonderful day!</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              const isCompletedAll = order.status === 'completed';
              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-[1px] transition-colors ${
                        idx < currentStep ? 'bg-[#8C5332]' : 'bg-[#D8C7B6]'
                      }`}
                    />
                  )}
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full z-10 transition-all ${
                      isPast || (isCurrent && isCompletedAll)
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#3D2517] text-white ring-4 ring-[#8C5332]/30 scale-105'
                        : 'bg-[#D8C7B6] text-white'
                    }`}
                  >
                    {isPast || (isCurrent && isCompletedAll) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-[#2C1810] text-sm font-black'
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
