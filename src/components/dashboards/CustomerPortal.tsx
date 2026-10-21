import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  Wallet, 
  Gift, 
  Clock, 
  Star, 
  MapPin, 
  Check, 
  Plus, 
  Minus, 
  Search, 
  CreditCard,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { MenuItem, Order } from '../../types/foodos';
import { UserAccount } from '../../types/rbac';
import { formatINR } from '../../utils/taxEngine';
import { sound } from '../../utils/audioCue';

interface CustomerPortalProps {
  currentUser: UserAccount;
  menuItems: MenuItem[];
  orders: Order[];
  onPlaceOrder: (items: { item: MenuItem; qty: number }[], paymentMode: string) => void;
  onTopupWallet: (amount: number) => void;
  activeView: string;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentUser,
  menuItems,
  orders,
  onPlaceOrder,
  onTopupWallet,
  activeView,
}) => {
  const [cart, setCart] = useState<{ [id: string]: number }>({
    item_101: 1, // Dal Makhani Handi
    item_102: 2, // 2x Butter Naan
    item_401: 2, // 2x Chai
  });

  const [search, setSearch] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [orderSuccessNotice, setOrderSuccessNotice] = useState<boolean>(false);

  const cartTotal = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return acc + (item ? item.basePrice * qty : 0);
  }, 0);

  const gstAmount = Number((cartTotal * 0.05).toFixed(2));
  const finalPayable = Math.round(cartTotal + gstAmount);

  const handleUpdate = (id: string, delta: number) => {
    sound.playScannerBeep();
    setCart((prev) => {
      const next = { ...prev };
      const current = next[id] || 0;
      const res = current + delta;
      if (res <= 0) {
        delete next[id];
      } else {
        next[id] = res;
      }
      return next;
    });
  };

  const handleCheckout = (mode: string) => {
    sound.playCashRegister();
    const items = Object.entries(cart).map(([id, qty]) => ({
      item: menuItems.find((m) => m.id === id)!,
      qty,
    })).filter(x => Boolean(x.item));

    onPlaceOrder(items, mode);
    setCart({});
    setOrderSuccessNotice(true);
    setTimeout(() => setOrderSuccessNotice(false), 4000);
  };

  const filteredItems = menuItems.filter((m) => {
    const matchesVeg = !vegOnly || m.isVeg;
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    return matchesVeg && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
      {/* Top Banner with Loyalty & Wallet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-bold">
              Dhanpuriya Food Club · Customer Member
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Welcome, {currentUser.fullName}!</span>
          </div>
          <h1 className="text-base font-bold text-white mt-1">
            Order Gourmet Dining, QSR Rolls & Handis Online
          </h1>
          <p className="text-xs text-slate-400">
            Earn 1 Loyalty Point for every ₹10 spent. Free express contactless delivery across Bandra & Powai.
          </p>
        </div>

        {/* Wallet & Rewards Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Prepaid Wallet</span>
              <strong className="font-mono text-emerald-400 font-bold">
                ₹{currentUser.walletBalance?.toFixed(2) || '850.00'}
              </strong>
            </div>
            <button
              onClick={() => onTopupWallet(500)}
              className="ml-2 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded text-[10px] font-bold"
            >
              +₹500
            </button>
          </div>

          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
            <Gift className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Loyalty Points</span>
              <strong className="font-mono text-purple-300 font-bold">
                {currentUser.loyaltyPoints || 340} Pts
              </strong>
            </div>
          </div>
        </div>
      </div>

      {orderSuccessNotice && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>
              Order placed successfully! Chef has received your KOT and is preparing the dishes.
            </span>
          </div>
          <span className="font-mono text-xs text-white">Estimated time: 14 mins</span>
        </div>
      )}

      {/* Main Grid: Menu Browse (Left 65%) vs Live Cart (Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Menu Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Veg Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Dal Makhani, Paneer, Naan, Chai..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-xs">Pure Veg:</span>
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  vegOnly ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    vegOnly ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const qty = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-xl p-3.5 flex flex-col justify-between space-y-2.5 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <h4 className="font-bold text-xs text-white">{item.name}</h4>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">#{item.itemCode}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="font-mono font-bold text-sm text-orange-400">
                      ₹{item.basePrice}
                    </span>

                    {qty === 0 ? (
                      <button
                        onClick={() => handleUpdate(item.id, 1)}
                        className="px-3 py-1 bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/40 rounded-lg text-xs font-bold transition-all"
                      >
                        ADD +
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                        <button
                          onClick={() => handleUpdate(item.id, -1)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-white px-2">{qty}</span>
                        <button
                          onClick={() => handleUpdate(item.id, 1)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Order Cart & UPI Intent */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span>Your Food Basket</span>
            </h3>

            {Object.keys(cart).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Your basket is empty. Select dishes to build order.
              </p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(cart).map(([id, qty]) => {
                  const it = menuItems.find((m) => m.id === id);
                  if (!it) return null;
                  return (
                    <div
                      key={id}
                      className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{it.name}</div>
                        <span className="font-mono text-[10px] text-slate-400">
                          ₹{it.basePrice} × {qty}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-white">
                        ₹{it.basePrice * qty}
                      </span>
                    </div>
                  );
                })}

                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="font-mono">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (5% CGST+SGST):</span>
                    <span className="font-mono">₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Packaging:</span>
                    <span className="font-mono text-emerald-400">FREE</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 font-bold text-sm text-white">
                    <span>Total Payable:</span>
                    <span className="font-mono text-base text-orange-400">
                      ₹{finalPayable.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleCheckout('UPI_DYNAMIC_INTENT')}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{finalPayable} via UPI (GPay/PhonePe)</span>
                  </button>

                  <button
                    onClick={() => handleCheckout('MESS_WALLET')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Pay from Dhanpuriya Wallet Balance</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-1.5 shadow-xl">
            <span className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>Saved Delivery Location:</span>
            </span>
            <p className="text-slate-300">
              Flat 402, Sea Green Apts, Perry Cross Road, Bandra West, Mumbai 400050
            </p>
            <span className="text-[10px] text-slate-500 font-mono">Contact: +91 98199 88776</span>
          </div>
        </div>
      </div>
    </div>
  );
};
