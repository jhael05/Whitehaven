import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, Customization, CartItem, OrderType, PaymentMethod, Order } from '../types/cafe';
import confetti from 'canvas-confetti';

interface CartContextType {
  items: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  pickupTime: string;
  setPickupTime: (time: string) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  specialInstructions: string;
  setSpecialInstructions: (notes: string) => void;
  addToCart: (menuItem: MenuItem, customization: Customization, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  total: number;
  totalCount: number;
  promoCode: string;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  orders: Order[];
  createOrder: (details: {
    customerName: string;
    contactNumber: string;
    paymentMethod: PaymentMethod;
    paymentDetails?: {
      cashTendered?: number;
      change?: number;
      cardLast4?: string;
      gcashReference?: string;
      accountName?: string;
    };
  }) => Order;
  reorder: (order: Order) => void;
  activeOrderModal: Order | null;
  setActiveOrderModal: (order: Order | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'white_haven_cart_items';
const ORDERS_STORAGE_KEY = 'white_haven_orders_history';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [pickupTime, setPickupTime] = useState<string>('As soon as possible (15-20 mins)');
  const [tableNumber, setTableNumber] = useState<string>('Table 4');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [activeOrderModal, setActiveOrderModal] = useState<Order | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const calculateItemUnitPrice = (basePrice: number, cust: Customization): number => {
    let price = basePrice;
    if (cust.size.includes('+₱25')) price += 25;
    if (cust.milkType.includes('+₱30')) price += 30;
    if (cust.milkType.includes('+₱20')) price += 20;
    cust.addOns.forEach(addon => {
      if (addon.includes('+₱30')) price += 30;
      else if (addon.includes('+₱25')) price += 25;
      else if (addon.includes('+₱20')) price += 20;
    });
    return price;
  };

  const addToCart = (menuItem: MenuItem, customization: Customization, quantity = 1) => {
    const unitPrice = calculateItemUnitPrice(menuItem.price, customization);
    const cartItemId = `${menuItem.id}-${customization.size}-${customization.temperature}-${customization.sweetness}-${customization.milkType}-${customization.addOns.sort().join(',')}`;

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => i.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const next = [...prevItems];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return next;
      }
      return [
        ...prevItems,
        {
          cartItemId,
          menuItem,
          quantity,
          customization,
          unitPrice,
          totalPrice: quantity * unitPrice,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: qty, totalPrice: qty * item.unitPrice }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode('');
    setDiscountPercent(0);
    setSpecialInstructions('');
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discount);
  const totalCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'WHITEHAVEN10' || clean === 'HAVEN10') {
      setPromoCode(clean);
      setDiscountPercent(10);
      return { success: true, message: '🎉 10% Welcome discount applied!' };
    }
    if (clean === 'COZYCOFFEE' || clean === 'HAVEN20') {
      setPromoCode(clean);
      setDiscountPercent(20);
      return { success: true, message: '☕ 20% Special Haven discount applied!' };
    }
    return { success: false, message: 'Invalid promo code. Try "WHITEHAVEN10" for 10% off.' };
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscountPercent(0);
  };

  const createOrder = (details: {
    customerName: string;
    contactNumber: string;
    paymentMethod: PaymentMethod;
    paymentDetails?: {
      cashTendered?: number;
      change?: number;
      cardLast4?: string;
      gcashReference?: string;
      accountName?: string;
    };
  }): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `order_${Date.now()}`,
      orderNumber: `WHC-${randomSuffix}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...items],
      subtotal,
      discount,
      total,
      orderType,
      customerName: details.customerName,
      contactNumber: details.contactNumber,
      pickupTime: orderType === 'pickup' ? pickupTime : undefined,
      tableNumber: orderType === 'in_store' ? tableNumber : undefined,
      specialInstructions: specialInstructions || undefined,
      paymentMethod: details.paymentMethod,
      paymentDetails: details.paymentDetails,
      status: 'received',
      statusUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8C5332', '#C29B63', '#FAF7F2', '#2C1810'],
      });
    } catch {
      // ignore
    }

    setActiveOrderModal(newOrder);

    // Simulate baristas updating order progress from received -> preparing -> ready
    setTimeout(() => {
      setOrders(prev =>
        prev.map(o =>
          o.id === newOrder.id
            ? { ...o, status: 'preparing', statusUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            : o
        )
      );
    }, 6000);

    setTimeout(() => {
      setOrders(prev =>
        prev.map(o =>
          o.id === newOrder.id
            ? { ...o, status: 'ready', statusUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            : o
        )
      );
    }, 18000);

    return newOrder;
  };

  const reorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart(item.menuItem, item.customization, item.quantity);
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        orderType,
        setOrderType,
        pickupTime,
        setPickupTime,
        tableNumber,
        setTableNumber,
        specialInstructions,
        setSpecialInstructions,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discount,
        total,
        totalCount,
        promoCode,
        applyPromoCode,
        removePromoCode,
        orders,
        createOrder,
        reorder,
        activeOrderModal,
        setActiveOrderModal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
