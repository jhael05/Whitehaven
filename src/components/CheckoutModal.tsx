import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { OrderType, PaymentMethod } from '../types/cafe';
import { X, Check, CreditCard, Banknote, Smartphone, Store, ShoppingBag, Clock, Lock, UserCheck } from 'lucide-react';
import { GCashLogo, MayaLogo, CardsLogo, CashLogo } from './PaymentLogos';
import { CafeLogo } from './CafeLogo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequireAuth?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onRequireAuth }) => {
  const {
    items,
    subtotal,
    discount,
    total,
    orderType,
    setOrderType,
    pickupTime,
    setPickupTime,
    tableNumber,
    setTableNumber,
    specialInstructions,
    setSpecialInstructions,
    createOrder,
  } = useCart();

  const { user, isAuthenticated, addLoyaltyStamp } = useAuth();

  // Checkout form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [contactNumber, setContactNumber] = useState(user?.emailOrContact || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');

  // Cash change calculation
  const [cashTendered, setCashTendered] = useState<string>('');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // GCash details
  const [gcashRef, setGcashRef] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  // Auto-sync real logged in user details
  React.useEffect(() => {
    if (user && isOpen) {
      setCustomerName(user.name);
      setContactNumber(user.emailOrContact);
      setCardHolder(user.name);
    }
  }, [user, isOpen]);

  if (!isOpen || items.length === 0) return null;

  // STRICT LOGIN GUARD: Ordering is forbidden without logging in or signing up
  if (!isAuthenticated || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-md rounded-3xl bg-[#FAF7F2] p-7 shadow-2xl border border-[#D8C7B6] text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-black/5 p-2 text-[#5D4037] hover:bg-black/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mx-auto mb-4 flex justify-center">
            <CafeLogo size="md" variant="stacked" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-[#8C5332] px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Account Required</span>
          </div>

          <h2 className="font-serif-cafe text-2xl font-bold text-[#2C1810]">
            Log In or Sign Up to Order
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-[#6F4E37] leading-relaxed">
            An account is required to place an order at White Haven Café. Please log in or sign up to save your order, track live brewing progress, and earn digital loyalty stamps.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onRequireAuth) onRequireAuth();
              }}
              className="w-full rounded-full bg-[#3D2517] hover:bg-[#2C1810] active:scale-[0.99] py-3.5 px-6 text-sm font-bold text-[#FAF7F2] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>Log In / Sign Up Now</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs text-[#7C6656] hover:text-[#2C1810] py-1 font-medium cursor-pointer"
            >
              Return to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const parsedCash = parseFloat(cashTendered) || 0;
  const computedChange = parsedCash > total ? parsedCash - total : 0;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setErrorMessage('You must be logged in with a registered account to place an order.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!contactNumber.trim()) {
      setErrorMessage('Please enter your contact phone number.');
      return;
    }

    setErrorMessage('');

    let paymentDetails: any = {};
    if (paymentMethod === 'cash') {
      paymentDetails = {
        cashTendered: parsedCash,
        change: computedChange,
      };
    } else if (paymentMethod === 'card') {
      paymentDetails = {
        cardLast4: cardNumber.slice(-4),
        accountName: cardHolder,
      };
    } else if (paymentMethod === 'gcash' || paymentMethod === 'maya') {
      paymentDetails = {
        gcashReference: gcashRef || `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
        accountName: customerName,
      };
    }

    createOrder({
      customerName,
      contactNumber,
      paymentMethod,
      paymentDetails,
    });

    // Reward loyalty stamp if user is logged in
    addLoyaltyStamp(1);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-[#FAF7F2] shadow-2xl border border-[#D8C7B6] overflow-hidden">
        {/* Header */}
        <div className="bg-[#3D2517] text-[#FAF7F2] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="font-serif-cafe text-xl font-bold tracking-wide">
              Complete Your White Haven Order
            </h2>
            <p className="text-xs text-[#E8DCCF]/80 mt-0.5">
              Review details, choose pick-up or in-store dining, and select payment
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 rounded-xl bg-red-100 border border-red-300 p-3 text-xs text-red-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Dining Mode: Pick-up vs In-Store */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#5D4037]">
              1. Dining Preference
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`flex items-center gap-3 rounded-2xl p-4 border text-left transition-all ${
                  orderType === 'pickup'
                    ? 'border-[#8C5332] bg-[#F5ECE3] ring-2 ring-[#8C5332]'
                    : 'border-[#D8C7B6] bg-white hover:bg-[#F9F5F0]'
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    orderType === 'pickup'
                      ? 'bg-[#8C5332] text-white'
                      : 'bg-[#EFE8DF] text-[#5D4037]'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#2C1810]">Pick-up Order</div>
                  <div className="text-xs text-[#7C6656]">Grab & go at cafe counter</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('in_store')}
                className={`flex items-center gap-3 rounded-2xl p-4 border text-left transition-all ${
                  orderType === 'in_store'
                    ? 'border-[#8C5332] bg-[#F5ECE3] ring-2 ring-[#8C5332]'
                    : 'border-[#D8C7B6] bg-white hover:bg-[#F9F5F0]'
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    orderType === 'in_store'
                      ? 'bg-[#8C5332] text-white'
                      : 'bg-[#EFE8DF] text-[#5D4037]'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#2C1810]">In-Store / Dine-in</div>
                  <div className="text-xs text-[#7C6656]">Served at your cafe table</div>
                </div>
              </button>
            </div>

            {/* Sub-options depending on Pick-up vs In-Store */}
            {orderType === 'pickup' ? (
              <div className="mt-3 rounded-2xl bg-[#F0E6DB] p-4 border border-[#DECDBE]">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#5D4037] mb-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Estimated Pick-up Time
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full rounded-xl border border-[#D0BFB0] bg-white px-3.5 py-2.5 text-sm font-medium text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                >
                  <option value="As soon as possible (15-20 mins)">
                    As soon as possible (15-20 mins)
                  </option>
                  <option value="In 30 minutes">In 30 minutes</option>
                  <option value="In 45 minutes">In 45 minutes</option>
                  <option value="In 1 hour">In 1 hour</option>
                  <option value="Scheduled for later today">Scheduled for later today</option>
                </select>
                <p className="mt-1.5 text-[11px] text-[#7C6656]">
                  📍 Pick up at: 22 Midway St., Foresthill Subd., Novaliches, Quezon City
                </p>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl bg-[#F0E6DB] p-4 border border-[#DECDBE]">
                <label className="text-xs font-semibold text-[#5D4037] mb-1.5 block">
                  Select Your Table / Seating Area
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    'Table 1',
                    'Table 2',
                    'Table 3',
                    'Table 4',
                    'Table 5',
                    'Table 6',
                    'Outdoor Garden Deck',
                    'Bar Counter',
                  ].map(tbl => (
                    <button
                      key={tbl}
                      type="button"
                      onClick={() => setTableNumber(tbl)}
                      className={`rounded-xl py-2 px-1 text-xs font-semibold text-center transition-all border ${
                        tableNumber === tbl
                          ? 'bg-[#3D2517] text-white border-[#3D2517]'
                          : 'bg-white text-[#4A2E1B] border-[#D0BFB0] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {tbl}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Customer Contact Information */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#5D4037]">
              2. Customer Details
            </label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#4A2E1B] mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full rounded-xl border border-[#D0BFB0] bg-white px-3.5 py-2.5 text-sm text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4A2E1B] mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. 0917 123 4567"
                  className="w-full rounded-xl border border-[#D0BFB0] bg-white px-3.5 py-2.5 text-sm text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                />
              </div>
            </div>

            <div className="mt-2.5">
              <label className="block text-xs font-medium text-[#4A2E1B] mb-1">
                Order Notes / Dietary Requests (Optional)
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Please put ice in a separate cup, extra napkins..."
                className="w-full rounded-xl border border-[#D0BFB0] bg-white px-3.5 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
              />
            </div>
          </div>

          {/* 3. Payment Method: Cash, Card, GCash, Maya (Aesthetic Logo Buttons) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5D4037]">
                3. Select Payment Method
              </label>
              <span className="text-[11px] text-[#7C6656] italic">Tap logo to select</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* GCash Logo */}
              <button
                type="button"
                onClick={() => setPaymentMethod('gcash')}
                aria-label="Pay with GCash"
                className={`relative flex items-center justify-center rounded-2xl p-3 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                  paymentMethod === 'gcash'
                    ? 'border-[#007DFE] bg-[#EBF4FF] ring-2 ring-[#007DFE] ring-offset-2'
                    : 'border-[#D8C7B6] bg-white hover:bg-[#F9F5F0]'
                }`}
              >
                <GCashLogo size="md" className="h-8 transition-transform group-hover:scale-105" />
                {paymentMethod === 'gcash' && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#007DFE] text-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>

              {/* Maya Logo */}
              <button
                type="button"
                onClick={() => setPaymentMethod('maya')}
                aria-label="Pay with Maya"
                className={`relative flex items-center justify-center rounded-2xl p-3 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                  paymentMethod === 'maya'
                    ? 'border-[#00D084] bg-[#0A0A0A]/5 ring-2 ring-[#00D084] ring-offset-2'
                    : 'border-[#D8C7B6] bg-white hover:bg-[#F9F5F0]'
                }`}
              >
                <MayaLogo size="md" className="h-8 transition-transform group-hover:scale-105" />
                {paymentMethod === 'maya' && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00D084] text-black">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>

              {/* Cards (Visa & Mastercard) Logo */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                aria-label="Pay with Visa or Mastercard"
                className={`relative flex items-center justify-center rounded-2xl p-3 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                  paymentMethod === 'card'
                    ? 'border-[#3D2517] bg-[#F5ECE3] ring-2 ring-[#3D2517] ring-offset-2'
                    : 'border-[#D8C7B6] bg-white hover:bg-[#F9F5F0]'
                }`}
              >
                <CardsLogo size="md" className="h-8 transition-transform group-hover:scale-105" />
                {paymentMethod === 'card' && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#3D2517] text-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>

              {/* Cash Logo */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                aria-label="Pay with Cash at counter"
                className={`relative flex items-center justify-center rounded-2xl p-3 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                  paymentMethod === 'cash'
                    ? 'border-[#1B4D3E] bg-[#EAF7ED] ring-2 ring-[#1B4D3E] ring-offset-2'
                    : 'border-[#D8C7B6] bg-white hover:bg-[#F9F5F0]'
                }`}
              >
                <CashLogo size="md" className="h-8 transition-transform group-hover:scale-105" />
                {paymentMethod === 'cash' && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1B4D3E] text-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>
            </div>

            {/* Method Details Form */}
            {paymentMethod === 'gcash' && (
              <div className="mt-3 rounded-2xl bg-[#EBF4FF] p-4 border border-[#B9D8FF] text-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <GCashLogo size="sm" className="h-6" />
                    <span className="font-bold text-[#007DFE] text-xs">Official Merchant Payment</span>
                  </div>
                  <span className="rounded-full bg-[#007DFE] text-white px-2.5 py-0.5 text-[10px] font-semibold">
                    Instant Verified
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-[#CCE4FF]">
                  {/* Simulated QR Code */}
                  <div className="flex flex-col items-center justify-center p-2 bg-[#F9FBFF] rounded-lg border border-dashed border-[#007DFE]">
                    <div className="w-24 h-24 bg-[#007DFE]/10 rounded flex flex-col items-center justify-center text-center p-1">
                      <Smartphone className="w-6 h-6 text-[#007DFE] mb-1" />
                      <span className="text-[9px] font-mono text-[#007DFE] font-bold">SCAN QR Ph</span>
                      <span className="text-[8px] text-gray-500">White Haven Cafe</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-left flex-1">
                    <p className="text-[11px] text-gray-600">Scan QR or Send Money to:</p>
                    <p className="font-bold text-sm text-[#007DFE]">0917 842 8360</p>
                    <p className="font-medium text-gray-800">WHITE HAVEN CAFÉ</p>
                    <p className="text-[11px] text-gray-500">Total: <strong>₱{total}</strong></p>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    GCash Reference Number / Sender Name
                  </label>
                  <input
                    type="text"
                    value={gcashRef}
                    onChange={(e) => setGcashRef(e.target.value)}
                    placeholder="e.g. 90284729104"
                    className="w-full rounded-xl border border-[#B9D8FF] bg-white px-3 py-2 text-xs text-[#2C1810] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="mt-3 rounded-2xl bg-[#EAF7ED] p-4 border border-[#BEE5C8] text-xs">
                <span className="font-bold text-[#1E7E34]">Cash Payment at Counter</span>
                <p className="text-[11px] text-[#2C5E3B] mt-0.5">
                  You can pay cash directly to our barista upon picking up or dining in.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-[#1E7E34] mb-1">
                      Cash you will pay (for change calculation):
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-gray-500 text-xs">₱</span>
                        <input
                          type="number"
                          value={cashTendered}
                          onChange={(e) => setCashTendered(e.target.value)}
                          placeholder="500"
                          className="w-full rounded-xl border border-[#BEE5C8] bg-white pl-7 pr-3 py-2 text-xs text-[#2C1810] font-semibold focus:outline-none"
                        />
                      </div>
                      {['500', '1000'].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCashTendered(val)}
                          className="rounded-lg bg-white border border-[#BEE5C8] px-2.5 py-1.5 text-xs font-semibold text-[#1E7E34] hover:bg-[#E1F3E5]"
                        >
                          ₱{val}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-[#BEE5C8] text-center min-w-[100px]">
                    <div className="text-[10px] text-gray-500">Change Due</div>
                    <div className="text-sm font-bold text-[#1E7E34]">
                      ₱{computedChange >= 0 ? computedChange : 0}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="mt-3 rounded-2xl bg-[#F5ECE3] p-4 border border-[#DECDBE] text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardsLogo size="sm" className="h-6" />
                    <span className="font-bold text-[#3D2517] text-xs">Credit & Debit Card</span>
                  </div>
                  <span className="text-[10px] text-[#7C6656] font-medium">Encrypted & Secure</span>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="•••• •••• •••• ••••"
                    className="w-full rounded-xl border border-[#DECDBE] bg-white px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full rounded-xl border border-[#DECDBE] bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                      Expiry
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full rounded-xl border border-[#DECDBE] bg-white px-3 py-2 text-xs text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'maya' && (
              <div className="mt-3 rounded-2xl bg-[#E0F2F1] p-4 border border-[#80CBC4] text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <MayaLogo size="sm" className="h-6" />
                    <span className="font-bold text-[#00897B] text-xs">Maya / QR Ph Standard</span>
                  </div>
                  <span className="rounded-full bg-[#00897B] text-white px-2 py-0.5 text-[10px] font-semibold">
                    QR Ph
                  </span>
                </div>
                <p className="text-[11px] text-[#004D40] mt-0.5">
                  Scan using Maya or any QR Ph compliant banking app (BDO, BPI, UnionBank, RCBC).
                </p>
                <div className="mt-2 bg-white rounded-xl p-3 border border-[#80CBC4] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500">Merchant</span>
                    <p className="font-bold text-[#00897B]">White Haven Café Quezon City</p>
                  </div>
                  <span className="font-bold text-sm text-[#00897B]">₱{total}</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Order Summary Overview */}
          <div className="rounded-2xl bg-[#F0E6DB] p-4 border border-[#DECDBE]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#5D4037] mb-2">
              Order Summary ({items.length} items)
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.cartItemId} className="flex items-center justify-between text-xs">
                  <div className="truncate max-w-[70%]">
                    <span className="font-semibold text-[#2C1810]">
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span className="text-[11px] text-[#7C6656] ml-1.5">
                      ({item.customization.temperature}, {item.customization.size.split(' ')[0]})
                    </span>
                  </div>
                  <span className="font-semibold text-[#2C1810]">₱{item.totalPrice}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t border-[#DECDBE] pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-[#7C6656]">
                <span>Subtotal</span>
                <span>₱{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-₱{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#2C1810] pt-1 border-t border-[#DECDBE]">
                <span>Total Amount Due</span>
                <span className="text-[#8C5332] text-base">₱{total}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-full bg-[#3D2517] hover:bg-[#2C1810] active:scale-[0.99] py-4 text-base font-bold text-[#FAF7F2] shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Confirm & Place Order</span>
            <span className="text-amber-200">• ₱{total}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
