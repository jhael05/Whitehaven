import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, Customization, CartItem, OrderType, PaymentMethod, Order, OrderStatus } from '../types/cafe';
import confetti from 'canvas-confetti';

export interface OrderNotification {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  title: string;
  message: string;
  timestamp: string;
}

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
  orderNotification: OrderNotification | null;
  dismissOrderNotification: () => void;
  advanceOrderStatus: (orderId: string) => void;
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
  const [orderNotification, setOrderNotification] = useState<OrderNotification | null>(null);

  // Play a pleasant ambient cafe chime on status notification
  const playNotificationChime = (type: 'received' | 'preparing' | 'ready' | 'completed') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = type === 'completed' ? 659.25 : type === 'ready' ? 587.33 : 523.25;
      const targetFreq = type === 'completed' ? 880 : 659.25;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy catch
    }
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    title: string,
    message: string
  ) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let resolvedOrderNumber = '';

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          resolvedOrderNumber = o.orderNumber;
          return {
            ...o,
            status: newStatus,
            statusUpdatedAt: timeNow,
          };
        }
        return o;
      })
    );

    setActiveOrderModal(prev => {
      if (prev && prev.id === orderId) {
        resolvedOrderNumber = resolvedOrderNumber || prev.orderNumber;
        return {
          ...prev,
          status: newStatus,
          statusUpdatedAt: timeNow,
        };
      }
      return prev;
    });

    setOrderNotification({
      id: `notif_${Date.now()}_${newStatus}`,
      orderNumber: resolvedOrderNumber,
      status: newStatus,
      title,
      message,
      timestamp: timeNow,
    });

    playNotificationChime(newStatus);
  };

  const dismissOrderNotification = () => {
    setOrderNotification(null);
  };

  const advanceOrderStatus = (orderId: string) => {
    setOrders(prev => {
      const target = prev.find(o => o.id === orderId);
      if (!target) return prev;
      if (target.status === 'received') {
        setTimeout(() => updateOrderStatus(orderId, 'preparing', '🔥 Brewing & Crafting', `Order ${target.orderNumber} is now brewing at the espresso bar.`), 0);
      } else if (target.status === 'preparing') {
        setTimeout(() => updateOrderStatus(orderId, 'ready', target.orderType === 'pickup' ? '🎉 Ready for Pick-up!' : '🎉 Serving to Table!', target.orderType === 'pickup' ? `Order ${target.orderNumber} is packed & ready at the pick-up counter!` : `Order ${target.orderNumber} is freshly brewed & being served to ${target.tableNumber || 'your table'}!`), 0);
      } else if (target.status === 'ready') {
        setTimeout(() => {
          updateOrderStatus(orderId, 'completed', '✨ Order Completed!', `Order ${target.orderNumber} is completed! Enjoy your handcrafted coffee at White Haven!`);
          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
              colors: ['#00897B', '#8C5332', '#F5ECE2', '#007DFE', '#FFB300'],
            });
          } catch {
            // ignore
          }
        }, 0);
      }
      return prev;
    });
  };

  useEffect(() => {
    if (orderNotification) {
      const timer = setTimeout(() => {
        setOrderNotification(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [orderNotification]);

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

    // Stage 1: Order Received (Immediate)
    setOrderNotification({
      id: `notif_${Date.now()}_received`,
      orderNumber: newOrder.orderNumber,
      status: 'received',
      title: '☕ Order Received!',
      message: `Order ${newOrder.orderNumber} has been received and sent to the White Haven kitchen.`,
      timestamp: newOrder.createdAt,
    });
    playNotificationChime('received');

    // Stage 2: Brewing & Crafting (4.5 seconds - completely automatic!)
    setTimeout(() => {
      updateOrderStatus(
        newOrder.id,
        'preparing',
        '🔥 Brewing & Crafting',
        `Order ${newOrder.orderNumber} is now brewing at the espresso bar.`
      );
    }, 4500);

    // Stage 3: Ready for Pick-up or Serving (10 seconds - completely automatic!)
    setTimeout(() => {
      updateOrderStatus(
        newOrder.id,
        'ready',
        newOrder.orderType === 'pickup' ? '🎉 Ready for Pick-up!' : '🎉 Serving to Table!',
        newOrder.orderType === 'pickup'
          ? `Order ${newOrder.orderNumber} is ready at the counter for collection.`
          : `Order ${newOrder.orderNumber} is ready and heading to ${newOrder.tableNumber || 'your table'}!`
      );
    }, 10000);

    // Stage 4: Order Completed (16 seconds - reaches all 4 stages automatically!)
    setTimeout(() => {
      updateOrderStatus(
        newOrder.id,
        'completed',
        '✨ Order Completed!',
        `Order ${newOrder.orderNumber} is completed! Thank you for choosing White Haven Café!`
      );
      try {
        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#00897B', '#8C5332', '#F5ECE2', '#007DFE', '#FFB300'],
        });
      } catch {
        // ignore
      }
    }, 16000);

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
        orderNotification,
        dismissOrderNotification,
        advanceOrderStatus,
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
