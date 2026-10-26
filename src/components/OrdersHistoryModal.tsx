import React from 'react';
import { useCart } from '../context/CartContext';
import { Order } from '../types/cafe';
import { X, RefreshCw, ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';

interface OrdersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
}

export const OrdersHistoryModal: React.FC<OrdersHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const { orders, reorder } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 rounded-3xl bg-[#FAF7F2] shadow-2xl border border-[#D8C7B6] overflow-hidden">
        {/* Header */}
        <div className="bg-[#3D2517] text-[#FAF7F2] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#8C5332] flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-cafe text-xl font-bold">Your White Haven Orders</h2>
              <p className="text-xs text-[#E8DCCF]/80">Track active orders or re-order your favorites</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-[#7C6656]">
              <Clock className="w-10 h-10 mx-auto opacity-40 mb-2" />
              <p className="font-semibold text-sm">No orders yet</p>
              <p className="text-xs mt-1">Start by browsing our specialty drink menu!</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="rounded-2xl border border-[#DECDBE] bg-white p-4 shadow-sm hover:border-[#8C5332] transition-colors"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#F0E6DB]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2C1810]">
                        {ord.orderNumber}
                      </span>
                      <span className="rounded-full bg-[#F5ECE2] text-[#8C5332] px-2 py-0.5 text-[11px] font-semibold">
                        {ord.orderType === 'pickup' ? 'Pick-up' : 'In-Store'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#7C6656]">Placed at {ord.createdAt}</span>
                  </div>

                  {/* Status chip */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize flex items-center gap-1 ${
                        ord.status === 'ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'preparing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ord.status === 'ready' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-2.5 space-y-1 text-xs">
                  {ord.items.map((item) => (
                    <div key={item.cartItemId} className="flex justify-between text-[#4A2E1B]">
                      <span>
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="font-medium">₱{item.totalPrice}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F0E6DB] text-xs">
                  <div>
                    <span className="text-[#7C6656]">Total: </span>
                    <span className="font-bold text-[#8C5332] text-sm">₱{ord.total}</span>
                    <span className="text-[10px] text-gray-400 ml-1">({ord.paymentMethod})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(ord)}
                      className="rounded-full bg-[#F0E6DB] px-3 py-1.5 text-xs font-semibold text-[#5D4037] hover:bg-[#E5D7C7] transition-colors"
                    >
                      Track / Receipt
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        reorder(ord);
                        onClose();
                      }}
                      className="flex items-center gap-1 rounded-full bg-[#3D2517] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2C1810] transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-order</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
