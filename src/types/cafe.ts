export type Category =
  | 'All'
  | 'My Usuals'
  | 'Coffee'
  | 'Non-Coffee'
  | 'Blended Frappes'
  | 'Soda & Slushies'
  | 'Rice Meals & Sandwich'
  | 'Pasta & Snacks';

export interface OrderRating {
  rating: number; // 1 to 5 stars
  feedback?: string;
  tags?: string[];
  ratedAt: string;
}

export interface UsualDrink {
  id: string; // unique ID
  menuItemId: string;
  name: string;
  category: Category;
  image: string;
  price: number;
  customization?: Customization;
  savedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  canCustomize?: boolean;
  tags?: string[];
}

export interface Customization {
  temperature: 'Iced' | 'Hot';
  size: 'Regular (16oz)' | 'Grande (22oz) (+₱25)';
  sweetness: '0%' | '25%' | '50%' | '75%' | '100%';
  iceLevel: 'No Ice' | 'Less Ice' | 'Regular Ice' | 'Extra Ice';
  milkType: 'Whole Milk' | 'Oat Milk (+₱30)' | 'Almond Milk (+₱30)' | 'Soy Milk (+₱20)';
  addOns: string[];
  notes?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  customization: Customization;
  unitPrice: number;
  totalPrice: number;
  isComplimentaryReward?: boolean;
}

export type OrderType = 'pickup' | 'in_store' | 'delivery';
export type PaymentMethod = 'cash' | 'card' | 'gcash' | 'maya';
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed';

export interface DeliveryDetails {
  houseNumber: string; // e.g. "Unit 4B, 3rd Floor" or "Lot 12 Blk 5"
  street: string; // e.g. "Midway Street, Foresthill Subdivision"
  barangay: string; // e.g. "Gulod", "San Bartolome", "Novaliches Proper"
  city: string; // e.g. "Quezon City", "Caloocan"
  landmark?: string; // e.g. "Near Midway Gate / Beside 7-Eleven"
  riderNotes?: string; // e.g. "Please call upon arrival, leave with security"
  formattedAddress: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  loyaltyDiscount?: number;
  claimedFreeDrink?: boolean;
  total: number;
  orderType: OrderType;
  customerName: string;
  contactNumber: string;
  pickupTime?: string;
  tableNumber?: string;
  deliveryDetails?: DeliveryDetails;
  deliveryFee?: number;
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    cashTendered?: number;
    change?: number;
    cardLast4?: string;
    gcashReference?: string;
    accountName?: string;
  };
  status: OrderStatus;
  statusUpdatedAt: string;
  rating?: OrderRating;
}

export type CafeThemeId = 'warm-classic' | 'garden-patio' | 'midnight-espresso' | 'vanilla-oat' | 'autumn-cinnamon';

export interface CafeThemeOption {
  id: CafeThemeId;
  name: string;
  tagline: string;
  bgHex: string;
  primaryHex: string;
  accentHex: string;
  creamHex: string;
  badge: string;
}

export const CAFE_THEMES: CafeThemeOption[] = [
  {
    id: 'warm-classic',
    name: 'Haven Classic Warm',
    tagline: 'Signature artisanal roast, warm sand & caramel gold',
    bgHex: '#ECE4D8',
    primaryHex: '#3D2517',
    accentHex: '#8C5332',
    creamHex: '#FAF7F2',
    badge: 'Signature',
  },
  {
    id: 'garden-patio',
    name: 'Garden Patio Sage',
    tagline: 'Lush botanical garden lounge, olive pine & soothing matcha',
    bgHex: '#E6ECE5',
    primaryHex: '#253827',
    accentHex: '#415E44',
    creamHex: '#F6F9F5',
    badge: 'Outdoor Vibe',
  },
  {
    id: 'midnight-espresso',
    name: 'Midnight Espresso Bar',
    tagline: 'Moody evening velvet espresso, obsidian & warm candlelight gold',
    bgHex: '#1E1612',
    primaryHex: '#140D09',
    accentHex: '#D4A373',
    creamHex: '#291F1A',
    badge: 'Velvet Roast',
  },
  {
    id: 'vanilla-oat',
    name: 'Vanilla Oat Cream',
    tagline: 'Minimalist warm oat milk, toasted hazelnut & soft almond foam',
    bgHex: '#F4EFEB',
    primaryHex: '#45362B',
    accentHex: '#A07855',
    creamHex: '#FCFAF8',
    badge: 'Minimalist',
  },
  {
    id: 'autumn-cinnamon',
    name: 'Autumn Cinnamon Mocha',
    tagline: 'Rich spiced cinnamon bark, terracotta & roasted chestnut',
    bgHex: '#EFE4DC',
    primaryHex: '#4F2314',
    accentHex: '#9E4A28',
    creamHex: '#FAF3EE',
    badge: 'Warm Spiced',
  },
];

export interface UserSavedAddress {
  label: 'Home' | 'Work' | 'Other';
  houseNumber: string;
  street: string;
  barangay: string;
  city: string;
  landmark?: string;
  riderNotes?: string;
}

export interface User {
  id: string;
  name: string;
  emailOrContact: string;
  phoneNumber?: string;
  provider: 'google' | 'facebook' | 'instagram' | 'tiktok' | 'email' | 'guest';
  avatarUrl?: string; // If undefined or empty, renders clean body/silhouette icon
  stampsCount: number;
  selectedTheme?: CafeThemeId;
  defaultAddress?: UserSavedAddress;
  memberSince?: string;
}

export interface AccountRecord {
  id: string;
  name: string;
  emailOrContact: string;
  phoneNumber?: string;
  password: string;
  provider: 'google' | 'facebook' | 'instagram' | 'tiktok' | 'email';
  avatarUrl?: string; // If undefined or empty, renders clean body/silhouette icon
  stampsCount: number;
  selectedTheme?: CafeThemeId;
  defaultAddress?: UserSavedAddress;
  createdAt: string;
}

export interface VoucherOption {
  code: string;
  title: string;
  description: string;
  discountDisplay: string;
  percent: number;
}

export const AVAILABLE_VOUCHERS: VoucherOption[] = [
  {
    code: 'WHITEHAVEN10',
    title: 'New Customer Welcome Voucher',
    description: '10% off your entire order for new guests',
    discountDisplay: '10% OFF',
    percent: 10,
  },
];
