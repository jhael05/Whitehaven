import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { OrderType, PaymentMethod, AVAILABLE_VOUCHERS, DeliveryDetails } from '../types/cafe';
import {
  X,
  Check,
  CreditCard,
  Banknote,
  Smartphone,
  Store,
  ShoppingBag,
  Clock,
  Lock,
  UserCheck,
  Dices,
  Shuffle,
  Armchair,
  Award,
  QrCode,
  Tag,
  Gift,
  Ticket,
  CheckCircle2,
  Bike,
  MapPin,
  Navigation,
} from 'lucide-react';
import { GCashLogo, MayaLogo, CardsLogo, CashLogo } from './PaymentLogos';
import { CafeLogo } from './CafeLogo';
import { PaymentQRCode } from './PaymentQRCode';

interface SeatOption {
  id: string;
  name: string;
  area: 'Patio & Deck' | 'Indoor Lounge' | 'Espresso Bar';
  capacity: string;
  isOccupied: boolean;
}

const DEFAULT_SEATS: Omit<SeatOption, 'isOccupied'>[] = [
  { id: 't1', name: 'Table 1', area: 'Indoor Lounge', capacity: '2-Seater' },
  { id: 't2', name: 'Table 2', area: 'Indoor Lounge', capacity: '2-Seater' },
  { id: 't3', name: 'Table 3', area: 'Indoor Lounge', capacity: '4-Seater' },
  { id: 't4', name: 'Table 4', area: 'Indoor Lounge', capacity: '4-Seater' },
  { id: 't5', name: 'Table 5', area: 'Indoor Lounge', capacity: '4-Seater' },
  { id: 't6', name: 'Table 6', area: 'Indoor Lounge', capacity: '6-Seater' },
  { id: 'p1', name: 'Patio Table 1', area: 'Patio & Deck', capacity: '2-Seater' },
  { id: 'p2', name: 'Patio Table 2', area: 'Patio & Deck', capacity: '4-Seater' },
  { id: 'p3', name: 'Patio Table 3', area: 'Patio & Deck', capacity: '4-Seater' },
  { id: 'gd', name: 'Garden Deck Lounge', area: 'Patio & Deck', capacity: '6-Seater' },
  { id: 'b1', name: 'Bar Stool 1', area: 'Espresso Bar', capacity: '1-Seater' },
  { id: 'b2', name: 'Bar Stool 2', area: 'Espresso Bar', capacity: '1-Seater' },
  { id: 'b3', name: 'Bar Stool 3', area: 'Espresso Bar', capacity: '1-Seater' },
  { id: 'b4', name: 'Bar Stool 4', area: 'Espresso Bar', capacity: '1-Seater' },
];

const generateRandomizedSeats = (): SeatOption[] => {
  return DEFAULT_SEATS.map((seat, index) => {
    // Keep ~30% occupied, rest available for customers
    const isOccupied = Math.random() < 0.35 && index !== 1 && index !== 3 && index !== 7;
    return { ...seat, isOccupied };
  });
};

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
    deliveryFee,
    deliveryDetails: contextDeliveryDetails,
    setDeliveryDetails: setContextDeliveryDetails,
    specialInstructions,
    setSpecialInstructions,
    promoCode,
    applyPromoCode,
    removePromoCode,
    isFreeDrinkClaimed,
    toggleFreeDrinkClaim,
    freeDrinkValue,
    loyaltyDiscount,
    createOrder,
  } = useCart();

  const { user, isAuthenticated, addLoyaltyStamp, claimLoyaltyReward } = useAuth();

  // Checkout form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [contactNumber, setContactNumber] = useState(user?.emailOrContact || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');

  // Delivery address states for doorstep delivery (pre-filled from user saved address if available)
  const [houseNumber, setHouseNumber] = useState(
    contextDeliveryDetails?.houseNumber || user?.defaultAddress?.houseNumber || ''
  );
  const [street, setStreet] = useState(
    contextDeliveryDetails?.street || user?.defaultAddress?.street || ''
  );
  const [barangay, setBarangay] = useState(
    contextDeliveryDetails?.barangay || user?.defaultAddress?.barangay || 'Novaliches Proper'
  );
  const [customBarangay, setCustomBarangay] = useState('');
  const [city, setCity] = useState(
    contextDeliveryDetails?.city || user?.defaultAddress?.city || 'Quezon City'
  );
  const [landmark, setLandmark] = useState(
    contextDeliveryDetails?.landmark || user?.defaultAddress?.landmark || ''
  );
  const [riderNotes, setRiderNotes] = useState(
    contextDeliveryDetails?.riderNotes || user?.defaultAddress?.riderNotes || ''
  );

  // Voucher states in Checkout
  const [voucherInput, setVoucherInput] = useState(promoCode || '');
  const [voucherMessage, setVoucherMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [rewardNotice, setRewardNotice] = useState<string | null>(null);

  const handleApplyVoucher = (codeToApply?: string) => {
    const target = (codeToApply || voucherInput).trim();
    if (!target) {
      setVoucherMessage({ text: 'Please enter or select a promo code.', success: false });
      return;
    }
    const res = applyPromoCode(target);
    setVoucherMessage({ text: res.message, success: res.success });
    if (res.success) {
      setVoucherInput(target.toUpperCase());
    }
  };

  const handleClaimFreeDrink = () => {
    const res = toggleFreeDrinkClaim(user?.stampsCount || 0);
    setRewardNotice(res.message);
    setTimeout(() => setRewardNotice(null), 4500);
  };

  // Randomized seats state for Dine-In
  const [seats, setSeats] = useState<SeatOption[]>(() => generateRandomizedSeats());
  const [seatAreaFilter, setSeatAreaFilter] = useState<'All' | 'Patio & Deck' | 'Indoor Lounge' | 'Espresso Bar'>('All');
  const [seatNotice, setSeatNotice] = useState<string | null>(null);

  const handleRandomizeSeats = () => {
    const fresh = generateRandomizedSeats();
    setSeats(fresh);
    const available = fresh.filter(s => !s.isOccupied);
    if (available.length > 0) {
      const randomPick = available[Math.floor(Math.random() * available.length)];
      setTableNumber(randomPick.name);
      setSeatNotice(`🎲 Re-shuffled tables! Assigned to ${randomPick.name} (${randomPick.capacity} • ${randomPick.area})`);
    }
    setTimeout(() => setSeatNotice(null), 3500);
  };

  const handlePickRandomSeat = () => {
    const available = seats.filter(s => !s.isOccupied);
    if (available.length > 0) {
      const randomPick = available[Math.floor(Math.random() * available.length)];
      setTableNumber(randomPick.name);
      setSeatNotice(`🎲 Randomly picked ${randomPick.name} (${randomPick.capacity} • ${randomPick.area})`);
    }
    setTimeout(() => setSeatNotice(null), 3500);
  };

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
  useEffect(() => {
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

    let deliveryData: DeliveryDetails | undefined = undefined;
    if (orderType === 'delivery') {
      if (!houseNumber.trim()) {
        setErrorMessage('Please enter your House, Unit, or Building Number for delivery.');
        return;
      }
      if (!street.trim()) {
        setErrorMessage('Please enter your Street Name and Subdivision / Village.');
        return;
      }
      const resolvedBrgy = barangay === 'Other' ? customBarangay.trim() : barangay.trim();
      if (!resolvedBrgy) {
        setErrorMessage('Please specify your Barangay for delivery.');
        return;
      }

      const landmarkText = landmark.trim() ? ` (Landmark: ${landmark.trim()})` : '';
      deliveryData = {
        houseNumber: houseNumber.trim(),
        street: street.trim(),
        barangay: resolvedBrgy,
        city: city.trim(),
        landmark: landmark.trim() || undefined,
        riderNotes: riderNotes.trim() || undefined,
        formattedAddress: `${houseNumber.trim()}, ${street.trim()}, Brgy. ${resolvedBrgy}, ${city.trim()}${landmarkText}`,
      };
      setContextDeliveryDetails(deliveryData);
    }

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

    if (isFreeDrinkClaimed) {
      claimLoyaltyReward();
    } else {
      // Reward loyalty stamp for standard orders
      addLoyaltyStamp(1);
    }

    createOrder({
      customerName,
      contactNumber,
      paymentMethod,
      loyaltyDiscount,
      claimedFreeDrink: isFreeDrinkClaimed,
      deliveryDetails: deliveryData,
      paymentDetails,
    });

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
          {/* 1. Dining Mode: Delivery vs Pick-up vs In-Store */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#5D4037]">
              1. Dining Preference
            </label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Delivery Button */}
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`flex items-center gap-2.5 rounded-2xl p-3.5 border text-left transition-all cursor-pointer ${
                  orderType === 'delivery'
                    ? 'border-[#8C5332] bg-[#F5ECE3] ring-2 ring-[#8C5332] shadow-sm'
                    : 'border-[#D8C7B6] bg-white hover:bg-[#F9F5F0]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    orderType === 'delivery'
                      ? 'bg-[#8C5332] text-white shadow-xs'
                      : 'bg-[#EFE8DF] text-[#5D4037]'
                  }`}
                >
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-[#2C1810]">Doorstep Delivery</div>
                  <div className="text-[11px] text-[#7C6656]">30-45 mins • ₱49 fee</div>
                </div>
              </button>

              {/* Pick-up Button */}
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`flex items-center gap-2.5 rounded-2xl p-3.5 border text-left transition-all cursor-pointer ${
                  orderType === 'pickup'
                    ? 'border-[#8C5332] bg-[#F5ECE3] ring-2 ring-[#8C5332] shadow-sm'
                    : 'border-[#D8C7B6] bg-white hover:bg-[#F9F5F0]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    orderType === 'pickup'
                      ? 'bg-[#8C5332] text-white shadow-xs'
                      : 'bg-[#EFE8DF] text-[#5D4037]'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-[#2C1810]">Pick-up Order</div>
                  <div className="text-[11px] text-[#7C6656]">Grab & go at cafe</div>
                </div>
              </button>

              {/* In-Store Button */}
              <button
                type="button"
                onClick={() => setOrderType('in_store')}
                className={`flex items-center gap-2.5 rounded-2xl p-3.5 border text-left transition-all cursor-pointer ${
                  orderType === 'in_store'
                    ? 'border-[#8C5332] bg-[#F5ECE3] ring-2 ring-[#8C5332] shadow-sm'
                    : 'border-[#D8C7B6] bg-white hover:bg-[#F9F5F0]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    orderType === 'in_store'
                      ? 'bg-[#8C5332] text-white shadow-xs'
                      : 'bg-[#EFE8DF] text-[#5D4037]'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-[#2C1810]">In-Store / Dine-in</div>
                  <div className="text-[11px] text-[#7C6656]">Served at your table</div>
                </div>
              </button>
            </div>

            {/* Sub-options: Delivery vs Pick-up vs In-Store */}
            {orderType === 'delivery' && (
              <div className="mt-3 rounded-2xl bg-[#F0E6DB] p-4 sm:p-5 border border-[#DECDBE] space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DECDBE] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#8C5332] text-white">
                      <Bike className="w-4 h-4 text-amber-200" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#2C1810]">
                        Delivery Address & Rider Details
                      </h3>
                      <p className="text-[11px] text-[#7C6656]">
                        Delivering directly from White Haven Café Novaliches
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user?.defaultAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          if (user.defaultAddress) {
                            setHouseNumber(user.defaultAddress.houseNumber);
                            setStreet(user.defaultAddress.street);
                            setBarangay(user.defaultAddress.barangay);
                            setCity(user.defaultAddress.city);
                            setLandmark(user.defaultAddress.landmark || '');
                            setRiderNotes(user.defaultAddress.riderNotes || '');
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8C5332] bg-[#FAF7F2] hover:bg-white px-2.5 py-1 rounded-lg border border-[#DECDBE] cursor-pointer shadow-xs active:scale-95 transition"
                        title="Click to fill with your saved default address"
                      >
                        <MapPin className="w-3 h-3 text-[#8C5332]" />
                        <span>Use Saved ({user.defaultAddress.label})</span>
                      </button>
                    )}
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                      🛵 ₱49 Local Delivery
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A2E1B] mb-1">
                      House / Unit / Bldg / Floor Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      placeholder="e.g. Unit 4B, 3rd Floor / Lot 12 Blk 5"
                      className="w-full rounded-xl border border-[#D0BFB0] bg-white px-3.5 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A2E1B] mb-1">
                      Street Name & Subdivision / Village *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. Midway St., Foresthill Subd. / Jordan Plains"
                      className="w-full rounded-xl border border-[#D0BFB0] bg-white px-3.5 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A2E1B] mb-1">
                      Barangay *
                    </label>
                    <select
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
                      className="w-full rounded-xl border border-[#D0BFB0] bg-white px-3.5 py-2 text-xs text-[#2C1810] font-medium focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                    >
                      <option value="Novaliches Proper">Novaliches Proper</option>
                      <option value="Gulod">Gulod</option>
                      <option value="San Bartolome">San Bartolome</option>
                      <option value="Nagkaisang Nayon">Nagkaisang Nayon</option>
                      <option value="Bagbag">Bagbag</option>
                      <option value="Greater Lagro">Greater Lagro</option>
                      <option value="Fairview">Fairview</option>
                      <option value="Santa Monica">Santa Monica</option>
                      <option value="Kaligayahan">Kaligayahan</option>
                      <option value="Pasong Putik">Pasong Putik</option>
                      <option value="Talipapa">Talipapa</option>
                      <option value="Sauyo">Sauyo</option>
                      <option value="Santa Lucia">Santa Lucia</option>
                      <option value="Capri">Capri</option>
                      <option value="Other">Other Barangay (Specify)</option>
                    </select>

                    {barangay === 'Other' && (
                      <input
                        type="text"
                        required
                        value={customBarangay}
                        onChange={(e) => setCustomBarangay(e.target.value)}
                        placeholder="Type your Barangay name here..."
                        className="mt-2 w-full rounded-xl border border-amber-400 bg-amber-50/50 px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A2E1B] mb-1">
                      City / Municipality *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-[#D0BFB0] bg-white px-3.5 py-2 text-xs text-[#2C1810] font-medium focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                    >
                      <option value="Quezon City">Quezon City</option>
                      <option value="Caloocan (North)">Caloocan (North)</option>
                      <option value="Caloocan (South)">Caloocan (South)</option>
                      <option value="Valenzuela City">Valenzuela City</option>
                      <option value="San Jose del Monte">San Jose del Monte</option>
                      <option value="Manila">Manila</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A2E1B] mb-1">
                      Nearby Landmark / House Description
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Green gate with black fence, near 7-Eleven"
                      className="w-full rounded-xl border border-[#D0BFB0] bg-white px-3.5 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A2E1B] mb-1">
                      Delivery Instructions for Rider
                    </label>
                    <input
                      type="text"
                      value={riderNotes}
                      onChange={(e) => setRiderNotes(e.target.value)}
                      placeholder="e.g. Please call upon arrival, leave with guard"
                      className="w-full rounded-xl border border-[#D0BFB0] bg-white px-3.5 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                    />
                  </div>
                </div>

                {/* Formatted Real-time Address Preview */}
                <div className="rounded-xl bg-white p-3 border border-[#D0BFB0] flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#8C5332] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#7C6656] block">
                      Delivery Destination Preview
                    </span>
                    <span className="font-semibold text-[#2C1810]">
                      {houseNumber || street ? (
                        `${houseNumber ? `${houseNumber}, ` : ''}${street || ''}, Brgy. ${barangay === 'Other' ? (customBarangay || '...') : barangay}, ${city}${landmark ? ` (Landmark: ${landmark})` : ''}`
                      ) : (
                        <span className="text-gray-400 italic">Enter house number and street above to preview...</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pick-up estimated time option */}
            {orderType === 'pickup' && (
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
            )}

            {/* In-Store table & seating area selection (strictly hidden during Delivery and Pick-up) */}
            {orderType === 'in_store' && (
              <div className="mt-3 rounded-2xl bg-[#F0E6DB] p-4 border border-[#DECDBE] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-[#2C1810] block">
                      Select Table / Seating Area
                    </label>
                    <p className="text-[11px] text-[#7C6656]">
                      Choose an available table or let us assign a random cozy spot for you!
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Randomize / Auto-assign button */}
                    <button
                      type="button"
                      onClick={handlePickRandomSeat}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3D2517] hover:bg-[#2C1810] text-amber-200 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                      title="Quickly assign a random available table"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>Randomize Seat</span>
                    </button>

                    {/* Shuffle status button */}
                    <button
                      type="button"
                      onClick={handleRandomizeSeats}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#5D4037] border border-[#D0BFB0] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                      title="Re-randomize seat availability in the cafe"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-[#8C5332]" />
                      <span className="hidden sm:inline">Shuffle</span>
                    </button>
                  </div>
                </div>

                {/* Randomized Pick Feedback Notice */}
                {seatNotice && (
                  <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-xs font-semibold text-amber-900 flex items-center gap-2 animate-fade-in">
                    <span>☕</span>
                    <span>{seatNotice}</span>
                  </div>
                )}

                {/* Selected Table Summary Badge */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#D0BFB0] text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#3D2517] text-white flex items-center justify-center">
                      <Armchair className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">
                        Your Reserved Table
                      </span>
                      <span className="font-bold text-[#2C1810]">
                        {tableNumber || 'Please select a table below'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Dine-in Ready
                  </span>
                </div>

                {/* Area Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {(['All', 'Patio & Deck', 'Indoor Lounge', 'Espresso Bar'] as const).map(zone => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => setSeatAreaFilter(zone)}
                      className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        seatAreaFilter === zone
                          ? 'bg-[#8C5332] text-white shadow-xs'
                          : 'bg-white/80 text-[#5D4037] hover:bg-white'
                      }`}
                    >
                      {zone === 'Patio & Deck' ? '🌿 Patio & Deck' : zone === 'Indoor Lounge' ? '☕ Indoor Lounge' : zone === 'Espresso Bar' ? '🪑 Espresso Bar' : 'All Areas'}
                    </button>
                  ))}
                </div>

                {/* Seat Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                  {seats
                    .filter(s => seatAreaFilter === 'All' || s.area === seatAreaFilter)
                    .map(seat => {
                      const isSelected = tableNumber === seat.name;
                      return (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => {
                            setTableNumber(seat.name);
                            if (seat.isOccupied) {
                              setSeatNotice(`Note: ${seat.name} is currently occupied; seat will be cleared for your order!`);
                              setTimeout(() => setSeatNotice(null), 3500);
                            }
                          }}
                          className={`relative p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#3D2517] text-white border-[#3D2517] shadow-md ring-2 ring-amber-400/50'
                              : seat.isOccupied
                              ? 'bg-[#EAE4DC] border-[#D8C7B6] text-gray-500 hover:bg-[#E2DCD4]'
                              : 'bg-white border-[#DECDBE] text-[#2C1810] hover:bg-[#FAF7F2] hover:border-[#8C5332]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#2C1810]'}`}>
                              {seat.name}
                            </span>
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3] shrink-0" />
                            ) : seat.isOccupied ? (
                              <span className="text-[9px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                                Busy
                              </span>
                            ) : (
                              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Available" />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] mt-1">
                            <span className={isSelected ? 'text-amber-200' : 'text-gray-500'}>
                              {seat.capacity}
                            </span>
                            <span className={isSelected ? 'text-white/80' : 'text-[#8C5332] font-medium'}>
                              {seat.isOccupied && !isSelected ? 'Occupied' : 'Available'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
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
              <div className="space-y-3">
                <PaymentQRCode
                  method="gcash"
                  amount={total}
                  merchantName="WHITE HAVEN CAFÉ"
                  accountNumber="0917 842 8360"
                />

                <div className="rounded-2xl bg-[#EBF4FF] p-3.5 border border-[#B9D8FF]">
                  <label className="block text-[11px] font-bold text-[#007DFE] mb-1">
                    GCash Reference Number / Sender Mobile (Required)
                  </label>
                  <input
                    type="text"
                    value={gcashRef}
                    onChange={(e) => setGcashRef(e.target.value)}
                    placeholder="e.g. 90284729104 or 0917XXXXXXX"
                    className="w-full rounded-xl border border-[#B9D8FF] bg-white px-3.5 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#007DFE]"
                  />
                  <p className="mt-1 text-[10px] text-gray-500">
                    Once paid via GCash QR or Express Send, enter your reference number to fast-track verification.
                  </p>
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
              <div className="space-y-3">
                <PaymentQRCode
                  method="maya"
                  amount={total}
                  merchantName="WHITE HAVEN CAFÉ"
                  accountNumber="0917 842 8360"
                />

                <div className="rounded-2xl bg-[#E0F2F1] p-3.5 border border-[#80CBC4]">
                  <label className="block text-[11px] font-bold text-[#00897B] mb-1">
                    Maya / Bank Reference Number (Required)
                  </label>
                  <input
                    type="text"
                    value={gcashRef}
                    onChange={(e) => setGcashRef(e.target.value)}
                    placeholder="e.g. 782019482910 or Transaction ID"
                    className="w-full rounded-xl border border-[#80CBC4] bg-white px-3.5 py-2 text-xs text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#00897B]"
                  />
                  <p className="mt-1 text-[10px] text-gray-500">
                    Scan using Maya or any QR Ph banking app (BDO, BPI, UnionBank, RCBC), then enter the transaction reference code.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4. Vouchers & Loyalty Rewards */}
          <div className="space-y-4 rounded-2xl bg-[#F5ECE2] p-4 border border-[#DECDBE]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5D4037] flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#8C5332]" />
                <span>4. Vouchers & Loyalty Rewards</span>
              </label>
            </div>

            {/* A. VOUCHER APPLICATION */}
            <div className="rounded-xl bg-white p-3.5 border border-[#DECDBE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#3D2517] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#8C5332]" />
                  <span>Apply Promo Voucher</span>
                </span>
                {promoCode && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Active: {promoCode} (-₱{discount})
                  </span>
                )}
              </div>

              {/* Promo input field */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    placeholder="Enter voucher code (e.g. WHITEHAVEN10)"
                    className="w-full rounded-xl border border-[#DECDBE] bg-white px-3 py-2 text-xs uppercase font-semibold text-[#2C1810] focus:outline-none focus:ring-1 focus:ring-[#8C5332]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyVoucher()}
                  className="rounded-xl bg-[#5D4037] hover:bg-[#3D2517] px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Apply
                </button>
                {promoCode && (
                  <button
                    type="button"
                    onClick={() => {
                      removePromoCode();
                      setVoucherInput('');
                      setVoucherMessage({ text: 'Voucher removed.', success: true });
                    }}
                    className="rounded-xl bg-gray-100 hover:bg-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              {voucherMessage && (
                <p
                  className={`text-[11px] font-semibold ${
                    voucherMessage.success ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {voucherMessage.text}
                </p>
              )}

              {/* Quick Select Voucher Cards */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7C6656] mb-1.5">
                  Available New Customer Voucher (Tap to apply):
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {AVAILABLE_VOUCHERS.map((v) => {
                    const isCurrent = promoCode === v.code;
                    return (
                      <button
                        key={v.code}
                        type="button"
                        onClick={() => handleApplyVoucher(v.code)}
                        className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
                            : 'bg-[#FAF7F2] border-[#DECDBE] hover:border-[#8C5332] hover:bg-[#F9F5F0]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-black text-[#8C5332]">
                            {v.code}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {v.discountDisplay}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#7C6656] mt-0.5 leading-snug">
                          {v.title} • {v.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* B. LOYALTY STAMPS & 8 STAMPS FREE DRINK CLAIM */}
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8C5332] text-amber-200">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#3D2517] block">
                      Digital Loyalty Stamp Card
                    </span>
                    <span className="text-[10px] text-[#7C6656]">
                      Collect 8 stamps = 1 FREE Handcrafted Drink!
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#8C5332] bg-white px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                    {user?.stampsCount || 0} / 8 Stamps
                  </span>
                </div>
              </div>

              {/* 8 Stamp Circles Grid */}
              <div className="grid grid-cols-8 gap-1.5 py-1">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const isFilled = idx < (user?.stampsCount || 0);
                  const isEighth = idx === 7;
                  return (
                    <div
                      key={idx}
                      className={`h-9 rounded-xl flex flex-col items-center justify-center transition-all ${
                        isFilled
                          ? isEighth
                            ? 'bg-amber-600 text-white font-bold shadow-xs scale-105 ring-2 ring-amber-300'
                            : 'bg-[#8C5332] text-amber-100 font-semibold shadow-2xs'
                          : 'border-2 border-dashed border-[#D8C7B6] bg-white/60 text-[#9E8B7A]'
                      }`}
                    >
                      {isFilled ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                      <span className="text-[8px] leading-none mt-0.5">
                        {isEighth ? 'FREE' : `S${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* If reached 8 stamps, show prominent claim button */}
              {(user?.stampsCount || 0) >= 8 ? (
                <div className="bg-white rounded-xl p-3 border-2 border-amber-400 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>🎉 8/8 Stamps Reached! Reward Unlocked!</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Worth ₱{freeDrinkValue}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#7C6656] leading-relaxed">
                    You have completed all 8 stamps! You can now claim 1 free handcrafted coffee or beverage on this order.
                  </p>

                  <button
                    type="button"
                    onClick={handleClaimFreeDrink}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isFreeDrinkClaimed
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400'
                        : 'bg-gradient-to-r from-[#8C5332] to-[#B36838] hover:from-[#6F3E22] hover:to-[#8C5332] text-amber-100 hover:text-white animate-pulse'
                    }`}
                  >
                    {isFreeDrinkClaimed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>✓ 1 Free Drink Claimed (-₱{freeDrinkValue}) • Tap to Remove</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 text-amber-300" />
                        <span>🎁 Claim 1 Free Drink Now (Redeem 8 Stamps)</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-[#7C6656] bg-white/70 p-2 rounded-lg border border-amber-100 flex items-center justify-between">
                  <span>
                    Collect <strong>{8 - (user?.stampsCount || 0)} more</strong> stamp{8 - (user?.stampsCount || 0) > 1 ? 's' : ''} to unlock your 1 Free Drink!
                  </span>
                  <span className="text-[10px] text-[#8C5332] font-bold">1 order = 1 stamp</span>
                </div>
              )}

              {rewardNotice && (
                <div className="rounded-lg bg-amber-100/90 border border-amber-300 p-2 text-xs font-semibold text-[#8C5332]">
                  {rewardNotice}
                </div>
              )}
            </div>
          </div>

          {/* 5. Order Summary Overview */}
          <div className="rounded-2xl bg-[#F0E6DB] p-4 border border-[#DECDBE]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#5D4037] mb-2 flex items-center justify-between">
              <span>Order Summary ({items.length} items)</span>
              {isFreeDrinkClaimed && (
                <span className="text-[10px] font-bold bg-amber-200 text-[#8C5332] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Gift className="w-3 h-3 text-amber-700" />
                  Free Drink Applied
                </span>
              )}
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
              {orderType === 'delivery' && (
                <div className="flex justify-between text-[#8C5332] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5" />
                    <span>Doorstep Delivery Fee</span>
                  </span>
                  <span>₱{deliveryFee}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Voucher Discount ({promoCode})</span>
                  <span>-₱{discount}</span>
                </div>
              )}
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-[#8C5332] font-bold bg-amber-50/80 px-2 py-1 rounded-md border border-amber-200">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    <span>8 Stamps Reward: 1 Free Drink</span>
                  </span>
                  <span>-₱{loyaltyDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#2C1810] pt-1.5 border-t border-[#DECDBE]">
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
