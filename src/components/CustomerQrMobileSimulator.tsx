import React, { useState } from 'react';
import { 
  Smartphone, 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Check, 
  Clock, 
  ArrowLeft,
  X,
  CreditCard,
  QrCode
} from 'lucide-react';
import { MenuItem } from '../types/foodos';
import { formatINR } from '../utils/taxEngine';
import { sound } from '../utils/audioCue';

interface CustomerQrMobileSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onCustomerOrderPlaced: (cartItems: { item: MenuItem; qty: number }[]) => void;
}

export const CustomerQrMobileSimulator: React.FC<CustomerQrMobileSimulatorProps> = ({
  isOpen,
  onClose,
  menuItems,
  onCustomerOrderPlaced,
}) => {
  const [cart, setCart] = useState<{ [id: string]: number }>({
    item_401: 2, // 2x Adrak Elaichi Kulhad Chai
    item_501: 1, // 1x Classic Bun Maska Butter Jam
  });

  const [activeStep, setActiveStep] = useState<'menu' | 'status'>('menu');
  const [filterVegOnly, setFilterVegOnly] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  if (!isOpen) return null;

  const handleUpdate = (id: string, delta: number) => {
    sound.playScannerBeep();
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const cartTotal = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return acc + (item ? item.basePrice * qty : 0);
  }, 0);

  const cartGst = Number((cartTotal * 0.05).toFixed(2));
  const grandPayable = Math.round(cartTotal + cartGst);

  const handlePayViaUpi = () => {
    sound.playCashRegister();
    setActiveStep('status');
    const orderItems = Object.entries(cart).map(([id, qty]) => ({
      item: menuItems.find((m) => m.id === id)!,
      qty,
    })).filter(x => Boolean(x.item));
    onCustomerOrderPlaced(orderItems);
  };

  const filtered = menuItems.filter((m) => {
    const matchesVeg = !filterVegOnly || m.isVeg;
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    return matchesVeg && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Phone Case Frame */}
      <div className="relative w-full max-w-[360px] h-[700px] bg-slate-900 border-4 border-slate-700 rounded-[44px] shadow-2xl overflow-hidden flex flex-col ring-8 ring-slate-800">
        {/* Notch / Dynamic Island */}
        <div className="h-6 bg-slate-900 flex items-center justify-center shrink-0 z-20">
          <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-800 mr-2"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          </div>
        </div>

        {/* Close Simulator Floating Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full shadow-lg"
          title="Close Mobile Simulator"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Phone Content Screen */}
        <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans">
          {/* Mobile Top Header */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Dhanpuriya Express</span>
              <span className="text-[10px] bg-orange-600/30 text-orange-400 border border-orange-500/50 px-1.5 py-0.2 rounded font-mono font-bold">
                Table #04
              </span>
            </div>
          </div>

          {activeStep === 'menu' ? (
            <>
              {/* Search & Veg toggle */}
              <div className="p-3 bg-slate-900/60 border-b border-slate-800 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Find chai, rolls, handi..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Pure Veg Only:</span>
                  <button
                    onClick={() => setFilterVegOnly(!filterVegOnly)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      filterVegOnly ? 'bg-emerald-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        filterVegOnly ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Popular Near You
                </span>
                {filtered.map((item) => {
                  const qty = cart[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-start justify-between gap-2"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <h4 className="font-bold text-xs text-white">{item.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                        <span className="font-mono font-bold text-xs text-orange-400 block mt-1">
                          ₹{item.basePrice}
                        </span>
                      </div>

                      {/* Add Button or Stepper */}
                      {qty === 0 ? (
                        <button
                          onClick={() => handleUpdate(item.id, 1)}
                          className="px-2.5 py-1 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/40 rounded-lg text-xs font-bold transition-all shrink-0"
                        >
                          ADD +
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-0.5 shrink-0">
                          <button
                            onClick={() => handleUpdate(item.id, -1)}
                            className="p-1 text-slate-300 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold px-1 text-white">{qty}</span>
                          <button
                            onClick={() => handleUpdate(item.id, 1)}
                            className="p-1 text-slate-300 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Sticky Floating Cart & UPI Pay Button */}
              {cartTotal > 0 && (
                <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 shrink-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total with 5% GST:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      ₹{grandPayable.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handlePayViaUpi}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>PAY ₹{grandPayable} VIA UPI (GPay/PhonePe)</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Live Order Tracking Screen */
            <div className="flex-1 p-5 flex flex-col justify-between text-center">
              <div className="space-y-4 pt-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-600 mx-auto flex items-center justify-center text-emerald-400 animate-bounce shadow-xl">
                  <Check className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="font-bold text-base text-white">Payment Confirmed!</h3>
                  <p className="font-mono text-xs text-orange-400 mt-0.5">Order #POS-MUM-0042</p>
                  <p className="text-xs text-slate-400 mt-1">Table #04 · Serving Time ~ 8 mins</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
                  <span className="font-bold text-slate-300 block pb-1 border-b border-slate-800">
                    Live Kitchen Status:
                  </span>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-semibold">Chef is preparing your dishes</span>
                  </div>
                  <div className="space-y-1 text-slate-400 font-mono text-[11px] pt-1">
                    {Object.entries(cart).map(([id, q]) => {
                      const item = menuItems.find((m) => m.id === id);
                      return item ? (
                        <div key={id} className="flex justify-between">
                          <span>{q}x {item.name}</span>
                          <span>₹{item.basePrice * q}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('menu')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Order More Items
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
