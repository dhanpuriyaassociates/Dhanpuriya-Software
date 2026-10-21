import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  QrCode, 
  IndianRupee, 
  CreditCard, 
  Banknote, 
  Receipt, 
  Users, 
  Check, 
  Tag, 
  ArrowRight,
  Flame,
  ChefHat,
  Send,
  PauseCircle,
  Scissors,
  Smartphone
} from 'lucide-react';
import { 
  MenuItem, 
  Category, 
  OrderType, 
  DiningTable, 
  Order, 
  OrderItem, 
  PaymentMode, 
  Branch,
  RawMaterial,
  ItemRecipe
} from '../types/foodos';
import { computeOrderTotals, formatINR, generateUlid, generateUpiIntentUrl } from '../utils/taxEngine';
import { sound } from '../utils/audioCue';

interface PosTerminalProps {
  currentBranch: Branch;
  categories: Category[];
  menuItems: MenuItem[];
  tables: DiningTable[];
  isOnline: boolean;
  onOrderCreated: (order: Order, deductedMaterials: { materialId: string; amount: number }[]) => void;
  recipes: ItemRecipe[];
}

export const PosTerminal: React.FC<PosTerminalProps> = ({
  currentBranch,
  categories,
  menuItems,
  tables,
  isOnline,
  onOrderCreated,
  recipes,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(tables.find(t => t.tableNumber === 'T14') || tables[0]);
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [waiterName, setWaiterName] = useState<string>('Suresh Kumar');
  const [cashierName] = useState<string>('Rohan V.');
  
  // Cart state
  const [cart, setCart] = useState<Array<{
    menuItem: MenuItem;
    variantId?: string;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>>([
    // Pre-populate with typical Indian order for instant interactivity
    {
      menuItem: menuItems.find(m => m.itemCode === '101') || menuItems[0],
      quantity: 2,
      unitPrice: 280,
      notes: 'Extra Cream on top',
    },
    {
      menuItem: menuItems.find(m => m.itemCode === '102') || menuItems[1],
      quantity: 4,
      unitPrice: 45,
    },
    {
      menuItem: menuItems.find(m => m.itemCode === '205') || menuItems[3],
      quantity: 1,
      unitPrice: 340,
      notes: 'Medium spice',
    },
  ]);

  // Discount & notes
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [showCouponInput, setShowCouponInput] = useState<boolean>(false);
  const [guestCount, setGuestCount] = useState<number>(4);

  // Settlement Modal State
  const [showSettleModal, setShowSettleModal] = useState<boolean>(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI_DYNAMIC_INTENT');
  const [cashTendered, setCashTendered] = useState<string>('1200');
  const [showSplitModal, setShowSplitModal] = useState<boolean>(false);
  const [splitCount, setSplitCount] = useState<number>(2);

  // Selected item variant modal
  const [activeItemForVariant, setActiveItemForVariant] = useState<MenuItem | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query || 
        item.name.toLowerCase().includes(query) || 
        item.itemCode.includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Calculate bill totals
  const billTaxSummary = useMemo(() => {
    const packagingCharge = (orderType === 'TAKEAWAY' || orderType === 'DELIVERY') ? 25 : 0;
    const deliveryCharge = orderType === 'DELIVERY' ? 40 : 0;

    let discountAmt = 0;
    if (appliedCoupon) {
      const rawSubtotal = cart.reduce((acc, c) => acc + c.unitPrice * c.quantity, 0);
      discountAmt = (rawSubtotal * appliedCoupon.percent) / 100;
    }

    return computeOrderTotals(
      cart.map((c) => ({ unitPrice: c.unitPrice, quantity: c.quantity, gstRate: 5.0 })),
      discountAmt,
      packagingCharge,
      deliveryCharge,
      false // Intra-state 2.5% + 2.5%
    );
  }, [cart, appliedCoupon, orderType]);

  // Add item to cart
  const handleAddItem = (item: MenuItem, variantId?: string, variantName?: string, priceDelta: number = 0) => {
    sound.playScannerBeep();
    const unitPrice = item.basePrice + priceDelta;
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.menuItem.id === item.id && c.variantId === variantId
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [
        ...prev,
        {
          menuItem: item,
          variantId,
          variantName,
          quantity: 1,
          unitPrice,
        },
      ];
    });
  };

  const handleUpdateQuantity = (idx: number, delta: number) => {
    sound.playScannerBeep();
    setCart((prev) => {
      const next = [...prev];
      const target = next[idx];
      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== idx);
      }
      target.quantity = newQty;
      return next;
    });
  };

  const handleRemoveItem = (idx: number) => {
    sound.playScannerBeep();
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (code === 'OFFICE10') {
      setAppliedCoupon({ code, percent: 10 });
      setShowCouponInput(false);
    } else if (code === 'FLAT50') {
      setAppliedCoupon({ code, percent: 15 });
      setShowCouponInput(false);
    } else {
      alert('Invalid coupon code. Try "OFFICE10" (10% off) or "FLAT50" (15% off).');
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        setOrderType('DINE_IN');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setOrderType('TAKEAWAY');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setOrderType('DELIVERY');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setOrderType('QSR_COUNTER');
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) {
          alert('Cart held in temporary memory. Recall anytime.');
        }
      } else if (e.key === 'F9') {
        e.preventDefault();
        setShowSplitModal(true);
      } else if (e.key === 'F10') {
        e.preventDefault();
        setShowCouponInput(prev => !prev);
      } else if (e.key === 'F11') {
        e.preventDefault();
        handleSendKotOnly();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (cart.length > 0) {
          setShowSettleModal(true);
        }
      } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  // Send KOT only to kitchen
  const handleSendKotOnly = () => {
    if (cart.length === 0) return;
    sound.playKotBumpChime();
    alert(`KOT Ticket sent to Kitchen Stations for ${orderType === 'DINE_IN' ? selectedTable?.tableNumber : 'Token'}!`);
  };

  // Complete Settlement & create full Order
  const handleFinalizeSettlement = () => {
    if (cart.length === 0) return;

    sound.playCashRegister();

    const ulid = generateUlid('ULID');
    const dailyToken = Math.floor(Math.random() * 50) + 45;
    const orderNumber = `POS-MUM-20261021-${String(dailyToken).padStart(4, '0')}`;

    // Compute line items
    const orderItems: OrderItem[] = cart.map((c, idx) => {
      const lineTaxable = c.unitPrice * c.quantity;
      const cgst = Number((lineTaxable * 0.025).toFixed(2));
      const sgst = Number((lineTaxable * 0.025).toFixed(2));
      return {
        id: `oi_${Date.now()}_${idx}`,
        menuItemId: c.menuItem.id,
        variantId: c.variantId,
        variantName: c.variantName,
        name: c.menuItem.name,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        taxableValue: lineTaxable,
        cgstRate: 2.5,
        cgstAmount: cgst,
        sgstRate: 2.5,
        sgstAmount: sgst,
        totalAmount: Number((lineTaxable + cgst + sgst).toFixed(2)),
        itemNotes: c.notes,
      };
    });

    const upiIntent = generateUpiIntentUrl(
      'foodos.rzp@icici',
      'ChaiSathi Foods',
      billTaxSummary.finalPayable,
      ulid,
      `Token #${dailyToken}`
    );

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      ulid,
      tenantId: currentBranch.tenantId,
      branchId: currentBranch.id,
      tableId: orderType === 'DINE_IN' ? selectedTable?.id : undefined,
      tableName: orderType === 'DINE_IN' ? selectedTable?.tableNumber : undefined,
      cashierId: 'usr_cashier_01',
      cashierName,
      waiterId: 'usr_waiter_01',
      waiterName,
      orderNumber,
      dailyTokenNumber: dailyToken,
      orderType,
      orderStatus: 'CONFIRMED',
      items: orderItems,
      subtotalAmount: billTaxSummary.subtotal,
      cgstAmount: billTaxSummary.totalCgst,
      sgstAmount: billTaxSummary.totalSgst,
      igstAmount: 0,
      serviceChargeAmount: 0,
      packagingChargeAmount: billTaxSummary.packagingCharge,
      deliveryChargeAmount: billTaxSummary.deliveryCharge,
      discountAmount: billTaxSummary.discountAmount,
      discountCode: appliedCoupon?.code,
      roundingAdjustment: billTaxSummary.roundingAdjustment,
      finalPayableAmount: billTaxSummary.finalPayable,
      paymentMode,
      paymentStatus: 'SUCCESSFUL',
      createdAt: new Date().toISOString(),
      isOfflineSynced: isOnline,
      upiIntentUrl: upiIntent,
      transactionReference: `TXN-${Date.now().toString().slice(-8)}`,
    };

    // Calculate BOM deductions
    const deductions: { materialId: string; amount: number }[] = [];
    cart.forEach((c) => {
      const itemRecipes = recipes.filter(r => r.menuItemId === c.menuItem.id);
      itemRecipes.forEach(r => {
        deductions.push({
          materialId: r.materialId,
          amount: r.consumptionQuantity * c.quantity * (1 + (r.wastageMarginPercent / 100)),
        });
      });
    });

    onOrderCreated(newOrder, deductions);
    setShowSettleModal(false);
    // Clear cart for next customer
    setCart([]);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950">
      {/* LEFT: Menu Browsing & Fast Keypad (60% width on desktop) */}
      <div className="flex-1 flex flex-col border-r border-slate-800 overflow-hidden">
        {/* Top Info Ribbon: Branch GSTIN, Register, Cashier */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{currentBranch.branchName}</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-slate-400">GSTIN: {currentBranch.gstin}</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-slate-400">FSSAI: {currentBranch.fssaiLicenseNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Reg #01</span>
            <span className="text-slate-500">·</span>
            <span className="text-orange-400 font-medium">Cashier: {cashierName}</span>
          </div>
        </div>

        {/* Order Type Selector Tabs */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { type: 'DINE_IN' as OrderType, label: 'Dine-In', shortcut: 'F1' },
              { type: 'TAKEAWAY' as OrderType, label: 'Takeaway', shortcut: 'F2' },
              { type: 'DELIVERY' as OrderType, label: 'Delivery', shortcut: 'F3' },
              { type: 'QSR_COUNTER' as OrderType, label: 'QSR Counter', shortcut: 'F4' },
            ].map((btn) => (
              <button
                key={btn.type}
                onClick={() => setOrderType(btn.type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  orderType === btn.type
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{btn.label}</span>
                <span className="text-[10px] opacity-75 font-mono">[{btn.shortcut}]</span>
              </button>
            ))}
          </div>

          {orderType === 'DINE_IN' && (
            <button
              onClick={() => setShowTableModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 transition-colors shrink-0"
            >
              <Users className="w-3.5 h-3.5 text-orange-400" />
              <span>Table: {selectedTable ? selectedTable.tableNumber : 'Select'}</span>
              <span className="text-slate-400 text-[10px]">({guestCount} Guests)</span>
            </button>
          )}
        </div>

        {/* Search & Categories */}
        <div className="p-3 bg-slate-900/60 border-b border-slate-800 space-y-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or item code (e.g. 101, Dal, Kebab, Chai) [ALT+S]"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 content-start">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.variants && item.variants.length > 0) {
                  setActiveItemForVariant(item);
                } else {
                  handleAddItem(item);
                }
              }}
              className="bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-orange-500/50 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] group relative"
            >
              {/* Item Code & Veg/Non-Veg Dot */}
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <span className="font-mono text-[11px] text-slate-400 group-hover:text-orange-400 transition-colors">
                  #{item.itemCode}
                </span>
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    item.isVeg
                      ? 'border-emerald-500 bg-emerald-950/40'
                      : 'border-rose-500 bg-rose-950/40'
                  }`}
                  title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-slate-100 leading-snug group-hover:text-white line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {item.description}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                <span className="font-mono font-bold text-white">
                  ₹{item.basePrice}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {item.preparationTimeMinutes}m
                </span>
              </div>

              {item.variants && item.variants.length > 0 && (
                <div className="mt-1 text-[10px] text-orange-400/90 font-mono text-right">
                  +variants
                </div>
              )}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No matching menu dishes found</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: High-Throughput Cart & Tax Engine (40% width on desktop) */}
      <div className="w-full lg:w-[420px] xl:w-[460px] bg-slate-900 flex flex-col justify-between shrink-0 border-t lg:border-t-0 border-slate-800">
        {/* Cart Header: Table, Guests, Waiter */}
        <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {orderType === 'DINE_IN' ? `Table ${selectedTable?.tableNumber || '14'}` : orderType}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">
                {orderType === 'DINE_IN' ? `${guestCount} Guests` : 'Counter Token'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Waiter: <span className="text-slate-200">{waiterName}</span>
            </p>
          </div>
          <button
            onClick={() => setCart([])}
            disabled={cart.length === 0}
            className="text-[11px] text-slate-400 hover:text-rose-400 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Receipt className="w-8 h-8 mb-2 opacity-30 text-slate-400" />
              <p>Cart is empty</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Select items from menu or enter item codes
              </p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.menuItem.id}-${item.variantId || 'base'}-${idx}`}
                className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 text-xs flex flex-col gap-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-400 text-[11px]">
                        #{item.menuItem.itemCode}
                      </span>
                      <span className="font-medium text-white">{item.menuItem.name}</span>
                      {item.variantName && (
                        <span className="text-[10px] bg-slate-800 text-orange-300 px-1.5 py-0.2 rounded font-mono">
                          {item.variantName}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-amber-400/90 italic mt-0.5">
                        * {item.notes}
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-white">
                    ₹{item.unitPrice * item.quantity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/40">
                  <span className="font-mono">
                    ₹{item.unitPrice} × {item.quantity} (GST 5%)
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1 py-0.5">
                    <button
                      onClick={() => handleUpdateQuantity(idx, -1)}
                      className="p-1 hover:text-white"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold px-1.5 text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(idx, 1)}
                      className="p-1 hover:text-white"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Breakdown (Section 9 CGST Tax Engine & Rule 58 Rounding) */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-1.5 text-xs">
          {/* Coupon Input Toggle */}
          {showCouponInput ? (
            <div className="flex items-center gap-1.5 pb-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon (e.g. OFFICE10, FLAT50)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white uppercase focus:outline-none focus:border-orange-500 font-mono"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-2.5 py-1 bg-orange-600 text-white rounded text-xs font-semibold"
              >
                Apply
              </button>
              <button
                onClick={() => setShowCouponInput(false)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
          ) : appliedCoupon ? (
            <div className="flex items-center justify-between text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-1 rounded text-xs">
              <span>Coupon Applied ({appliedCoupon.code} - {appliedCoupon.percent}%)</span>
              <button
                onClick={() => setAppliedCoupon(null)}
                className="text-xs hover:text-emerald-200"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCouponInput(true)}
              className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              <span>Apply Promo Coupon [F10]</span>
            </button>
          )}

          <div className="space-y-1 pt-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal:</span>
              <span className="font-mono">₹{billTaxSummary.subtotal.toFixed(2)}</span>
            </div>
            {billTaxSummary.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount:</span>
                <span className="font-mono">-₹{billTaxSummary.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>CGST (2.5%):</span>
              <span className="font-mono">₹{billTaxSummary.totalCgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SGST (2.5%):</span>
              <span className="font-mono">₹{billTaxSummary.totalSgst.toFixed(2)}</span>
            </div>
            {billTaxSummary.packagingCharge > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Packaging Charge:</span>
                <span className="font-mono">₹{billTaxSummary.packagingCharge.toFixed(2)}</span>
              </div>
            )}
            {billTaxSummary.deliveryCharge > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge:</span>
                <span className="font-mono">₹{billTaxSummary.deliveryCharge.toFixed(2)}</span>
              </div>
            )}
            {billTaxSummary.roundingAdjustment !== 0 && (
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Rounding Off (Rule 58):</span>
                <span className="font-mono">
                  {billTaxSummary.roundingAdjustment > 0 ? '+' : ''}
                  ₹{billTaxSummary.roundingAdjustment.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-800 text-sm font-bold text-white">
              <span>GRAND TOTAL:</span>
              <span className="font-mono text-base text-orange-400">
                ₹{billTaxSummary.finalPayable.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Button Controls (ASCII Matching) */}
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            <button
              onClick={() => setShowSplitModal(true)}
              disabled={cart.length === 0}
              className="py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Scissors className="w-3 h-3 text-slate-400" />
              <span>[F9] Split Bill</span>
            </button>
            <button
              onClick={handleSendKotOnly}
              disabled={cart.length === 0}
              className="py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Send className="w-3 h-3 text-orange-400" />
              <span>[F11] Send KOT</span>
            </button>
          </div>

          {/* Main Action Bar: SPACEBAR Settle Payment */}
          <button
            onClick={() => setShowSettleModal(true)}
            disabled={cart.length === 0}
            className="w-full py-2.5 mt-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold tracking-wide shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <IndianRupee className="w-4 h-4" />
            <span>[SPACEBAR] SETTLE PAYMENT & PRINT TAX INVOICE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TABLE SELECTOR MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Select Dine-In Table</h3>
                <p className="text-xs text-slate-400">{currentBranch.branchName}</p>
              </div>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 max-h-80 overflow-y-auto mb-4">
              {tables.map((tbl) => (
                <div
                  key={tbl.id}
                  onClick={() => {
                    setSelectedTable(tbl);
                    setShowTableModal(false);
                  }}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                    selectedTable?.id === tbl.id
                      ? 'border-orange-500 bg-orange-600/20 text-white'
                      : tbl.isOccupied
                      ? 'border-amber-600/60 bg-amber-950/20 text-amber-200'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm">{tbl.tableNumber}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{tbl.sectionName}</div>
                  <div className="text-[10px] font-mono mt-1">
                    {tbl.isOccupied ? (
                      <span className="text-amber-400 font-bold">Occupied</span>
                    ) : (
                      <span className="text-emerald-400">Available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Guest Count:</span>
              <div className="flex items-center gap-2">
                {[1, 2, 4, 6, 8].map((c) => (
                  <button
                    key={c}
                    onClick={() => setGuestCount(c)}
                    className={`px-2.5 py-1 rounded font-mono text-xs ${
                      guestCount === c ? 'bg-orange-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VARIANT SELECTION MODAL */}
      {activeItemForVariant && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">
              Select Variant: {activeItemForVariant.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{activeItemForVariant.description}</p>

            <div className="space-y-2 mb-4">
              {activeItemForVariant.variants?.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    handleAddItem(activeItemForVariant, v.id, v.variantName, v.priceDelta);
                    setActiveItemForVariant(null);
                  }}
                  className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-medium text-white">{v.variantName}</span>
                  <span className="font-mono text-orange-400 font-bold">
                    ₹{activeItemForVariant.basePrice + v.priceDelta}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveItemForVariant(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SPLIT BILL MODAL */}
      {showSplitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">Split Bill Evenly</h3>
            <p className="text-xs text-slate-400 mb-4">
              Total: ₹{billTaxSummary.finalPayable.toFixed(2)}
            </p>

            <div className="flex items-center justify-between mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300">Number of Guests:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                  className="w-7 h-7 rounded bg-slate-800 text-white flex items-center justify-center text-sm font-bold"
                >
                  -
                </button>
                <span className="font-mono font-bold text-sm px-2 text-white">{splitCount}</span>
                <button
                  onClick={() => setSplitCount(splitCount + 1)}
                  className="w-7 h-7 rounded bg-slate-800 text-white flex items-center justify-center text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-orange-950/30 border border-orange-800/40 p-3 rounded-xl mb-4 text-center">
              <span className="text-[11px] text-orange-300 block">Each Guest Pays:</span>
              <span className="font-mono text-xl font-bold text-orange-400">
                ₹{(billTaxSummary.finalPayable / splitCount).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setShowSplitModal(false)}
              className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold"
            >
              Confirm Split & Return
            </button>
          </div>
        </div>
      )}

      {/* SETTLEMENT MODAL (UPI Intent, Cash with change, Card) */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Settle Payment</h3>
                <p className="text-xs text-slate-400">
                  {orderType === 'DINE_IN' ? `Table ${selectedTable?.tableNumber}` : orderType} · Order Total: ₹{billTaxSummary.finalPayable.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setShowSettleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { mode: 'UPI_DYNAMIC_INTENT' as PaymentMode, label: 'UPI QR', icon: QrCode },
                { mode: 'CASH' as PaymentMode, label: 'Cash Tender', icon: Banknote },
                { mode: 'CREDIT_CARD' as PaymentMode, label: 'Card POS', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMode === m.mode;
                return (
                  <button
                    key={m.mode}
                    onClick={() => setPaymentMode(m.mode)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-600/20 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mode-specific content */}
            {paymentMode === 'UPI_DYNAMIC_INTENT' && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center mb-4 space-y-3">
                <div className="inline-block p-3 bg-white rounded-xl shadow-lg">
                  {/* Visual SVG QR representation */}
                  <svg className="w-36 h-36" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                    <rect x="14" y="14" width="17" height="17" fill="white" />
                    <rect x="18" y="18" width="9" height="9" fill="#0f172a" />

                    <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                    <rect x="69" y="14" width="17" height="17" fill="white" />
                    <rect x="73" y="18" width="9" height="9" fill="#0f172a" />

                    <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                    <rect x="14" y="69" width="17" height="17" fill="white" />
                    <rect x="18" y="73" width="9" height="9" fill="#0f172a" />

                    {/* QR data pattern dots */}
                    <rect x="42" y="15" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="20" width="6" height="6" fill="#0f172a" />
                    <rect x="42" y="35" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="45" width="6" height="6" fill="#0f172a" />
                    <rect x="25" y="45" width="6" height="6" fill="#0f172a" />
                    <rect x="65" y="45" width="6" height="6" fill="#0f172a" />
                    <rect x="75" y="55" width="6" height="6" fill="#0f172a" />
                    <rect x="45" y="65" width="6" height="6" fill="#0f172a" />
                    <rect x="55" y="75" width="6" height="6" fill="#0f172a" />
                    <rect x="65" y="75" width="6" height="6" fill="#0f172a" />
                    <rect x="75" y="85" width="6" height="6" fill="#0f172a" />
                    <circle cx="50" cy="50" r="6" fill="#ea580c" />
                  </svg>
                </div>
                <div className="font-mono text-xs text-slate-300">
                  <span className="text-orange-400 font-bold">₹{billTaxSummary.finalPayable.toFixed(2)}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">UPI ID: foodos.rzp@icici</p>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">
                    Supports Google Pay, PhonePe, Paytm, CRED
                  </p>
                </div>
              </div>
            )}

            {paymentMode === 'CASH' && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cash Tendered:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">₹</span>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono font-bold text-white text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
                {Number(cashTendered) >= billTaxSummary.finalPayable && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-emerald-400 font-medium">Change to Return:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ₹{(Number(cashTendered) - billTaxSummary.finalPayable).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(cashTendered) < billTaxSummary.finalPayable && (
                  <div className="text-[11px] text-rose-400 pt-1">
                    Tendered cash is less than bill amount.
                  </div>
                )}
              </div>
            )}

            {paymentMode === 'CREDIT_CARD' && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 text-center text-xs text-slate-300 space-y-2">
                <CreditCard className="w-8 h-8 mx-auto text-orange-400" />
                <p className="font-medium">Swipe, Dip or Tap Card on PineLabs / Mosambee POS</p>
                <p className="text-[11px] text-slate-500">Terminal #01 listening for settlement...</p>
              </div>
            )}

            {/* Offline Resilience Note */}
            {!isOnline && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-[11px] mb-4">
                ⚡ Offline resilience active: Order will be committed locally with monotonic ULID and auto-reconciled when internet resumes.
              </div>
            )}

            {/* Final Action Button */}
            <button
              onClick={handleFinalizeSettlement}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Check className="w-4 h-4" />
              <span>CONFIRM SETTLEMENT & PRINT ESC/POS INVOICE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
