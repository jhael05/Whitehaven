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

export type OrderType = 'pickup' | 'in_store';
export type PaymentMethod = 'cash' | 'card' | 'gcash' | 'maya';
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  orderType: OrderType;
  customerName: string;
  contactNumber: string;
  pickupTime?: string;
  tableNumber?: string;
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
