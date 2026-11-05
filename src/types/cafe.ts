export type Category = 'All' | 'Signature Drinks' | 'Espresso & Coffee' | 'Non-Coffee & Milk' | 'Matcha & Tea' | 'Pastries & Snacks';

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
}

export interface User {
  id: string;
  name: string;
  emailOrContact: string;
  provider: 'google' | 'facebook' | 'instagram' | 'tiktok' | 'email' | 'guest';
  avatarUrl?: string;
  stampsCount: number;
}

export interface AccountRecord {
  id: string;
  name: string;
  emailOrContact: string;
  password: string;
  provider: 'google' | 'facebook' | 'instagram' | 'tiktok' | 'email';
  avatarUrl?: string;
  stampsCount: number;
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
    title: 'Welcome Haven Treat',
    description: '10% off your entire order',
    discountDisplay: '10% OFF',
    percent: 10,
  },
  {
    code: 'COZYCOFFEE',
    title: 'Cozy Haven Special',
    description: '20% off handcrafted coffees and beverages',
    discountDisplay: '20% OFF',
    percent: 20,
  },
  {
    code: 'HAVEN20',
    title: 'Loyal Haven Vibe',
    description: '20% discount voucher for beloved regular guests',
    discountDisplay: '20% OFF',
    percent: 20,
  },
];
