import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Star, 
  Layers, 
  Truck, 
  Package, 
  FileText,
  Clock,
  Plus,
  UtensilsCrossed,
  Search,
  ClipboardList,
  Edit,
  Trash2,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { Branch, Order, MenuItem } from '../../types/foodos';
import { UserAccount, UserRole } from '../../types/rbac';
import { formatINR } from '../../utils/taxEngine';

interface BusinessOwnerDashboardProps {
  currentBusinessName: string;
  branches: Branch[];
  orders: Order[];
  staffUsers: UserAccount[];
  menuItems: MenuItem[];
  onNavigateModule: (viewId: string) => void;
  onUpdateMenuItemPrice?: (itemId: string, newPrice: number) => void;
  onUpdateUserRole?: (userId: string, newRole: UserRole) => void;
  activeView?: string;
}

export const BusinessOwnerDashboard: React.FC<BusinessOwnerDashboardProps> = ({
  currentBusinessName,
  branches,
  orders,
  staffUsers,
  menuItems,
  onNavigateModule,
  onUpdateMenuItemPrice,
  onUpdateUserRole,
  activeView = 'owner_overview',
}) => {
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing price state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newPriceInput, setNewPriceInput] = useState<number>(0);

  // Aggregate statistics across owner's branches
  const totalRevenue = orders.reduce((acc, o) => acc + o.finalPayableAmount, 0) + 148500;
  const todayOrdersCount = orders.length + 84;
  const activeCustomers = 432;
  const aov = totalRevenue / Math.max(1, todayOrdersCount);

  // Top selling products
  const topProducts = [
    { name: 'Dal Makhani Handi', code: '#101', sales: 142, revenue: 39760 },
    { name: 'Adrak Elaichi Kulhad Chai', code: '#401', sales: 310, revenue: 12400 },
    { name: 'Butter Naan', code: '#102', sales: 260, revenue: 11700 },
    { name: 'Murgh Tikka Kebab', code: '#205', sales: 74, revenue: 25160 },
    { name: 'Chicken Kathi Roll', code: '#502', sales: 98, revenue: 17640 },
  ];

  // 1. MANAGE BRANCHES VIEW
  if (activeView === 'owner_branches') {
    return (
      <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
              Branches & Outlets
            </span>
            <h1 className="text-base font-bold text-white mt-1">
              {currentBusinessName} · Restaurant Network ({branches.length} Locations)
            </h1>
            <p className="text-xs text-slate-400">
              Manage physical outlets, store timings, FSSAI licenses, and statutory GSTIN per branch.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{b.branchName}</h3>
                  <span className="text-xs text-slate-400 font-mono">Code: {b.branchCode} · {b.city}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  OPERATIONAL
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <span className="text-right text-slate-300 font-sans">{b.addressLine1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GSTIN:</span>
                  <span className="text-white">{b.gstin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FSSAI License:</span>
                  <span className="text-white">{b.fssaiLicenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-white">{b.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. MANAGE STAFF VIEW
  if (activeView === 'owner_staff') {
    return (
      <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
              Business Staff Roster
            </span>
            <h1 className="text-base font-bold text-white mt-1">
              {currentBusinessName} · Employee & Staff Management
            </h1>
            <p className="text-xs text-slate-400">
              Manage branch managers, cashiers, chefs, and waiters for your business.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3">Employee Name</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Branch</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {staffUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3">
                      <div className="font-bold text-white">{u.fullName}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{u.email}</span>
                    </td>
                    <td className="py-3 font-mono text-slate-300">{u.phoneNumber}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-orange-400">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 font-mono text-xs">
                      {u.branchName || 'All Outlets'}
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'BUSINESS_OWNER' && (
                        <select
                          value={u.role}
                          onChange={(e) => {
                            if (onUpdateUserRole) onUpdateUserRole(u.id, e.target.value as UserRole);
                          }}
                          className="bg-slate-950 border border-slate-700 text-slate-200 text-[10px] rounded px-2 py-1 font-mono focus:outline-none"
                        >
                          <option value="BRANCH_MANAGER">BRANCH MANAGER</option>
                          <option value="CASHIER">CASHIER</option>
                          <option value="KITCHEN_STAFF">KITCHEN CHEF</option>
                          <option value="WAITER">WAITER</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. MANAGE MENU VIEW
  if (activeView === 'owner_menu') {
    return (
      <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
              Business Menu Catalog
            </span>
            <h1 className="text-base font-bold text-white mt-1">
              {currentBusinessName} · Dishes & Pricing
            </h1>
            <p className="text-xs text-slate-400">
              Customize prices, dietary badges, and active menu items.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                    item.isVeg ? 'border-emerald-500' : 'border-rose-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                    }`} />
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">#{item.itemCode}</span>
                  <h4 className="font-bold text-white text-sm">{item.name}</h4>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-1">{item.categoryName}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Menu Price:</span>
                  <span className="font-mono font-bold text-orange-400 text-base">₹{item.basePrice}</span>
                </div>

                {editingItemId === item.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={newPriceInput}
                      onChange={(e) => setNewPriceInput(Number(e.target.value))}
                      className="w-16 bg-slate-950 border border-slate-700 text-white rounded px-1.5 py-0.5 font-mono text-xs"
                    />
                    <button
                      onClick={() => {
                        if (onUpdateMenuItemPrice && newPriceInput > 0) {
                          onUpdateMenuItemPrice(item.id, newPriceInput);
                        }
                        setEditingItemId(null);
                      }}
                      className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px] font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingItemId(item.id);
                      setNewPriceInput(item.basePrice);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold"
                  >
                    Edit Price
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. MANAGE ORDERS VIEW
  if (activeView === 'owner_orders') {
    return (
      <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
              Business Orders Ledger
            </span>
            <h1 className="text-base font-bold text-white mt-1">
              {currentBusinessName} · Consolidated Orders Ledger
            </h1>
            <p className="text-xs text-slate-400">
              Audit all orders across Dine-In, QSR, Mess, and Delivery across all branches.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No orders recorded yet. Settle an order at Counter POS to inspect it here.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Order Type</th>
                    <th className="pb-3 text-right">Subtotal</th>
                    <th className="pb-3 text-right">GST (5%)</th>
                    <th className="pb-3 text-right">Total Payable</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5 font-bold text-white">
                        {ord.orderNumber}
                        <span className="text-[10px] text-slate-500 block">Token #{ord.dailyTokenNumber}</span>
                      </td>
                      <td className="py-2.5 font-sans text-slate-300">
                        {ord.customerName}
                      </td>
                      <td className="py-2.5">
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                          {ord.orderType}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-300">
                        ₹{ord.subtotalAmount}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-400">
                        ₹{(ord.cgstAmount + ord.sgstAmount).toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                        ₹{ord.finalPayableAmount}
                      </td>
                      <td className="py-2.5 text-slate-300 font-sans">
                        {ord.paymentMode}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. DEFAULT: EXECUTIVE OVERVIEW DASHBOARD
  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
              Business Owner Executive Suite
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono">Tenant Scoped</span>
          </div>
          <h1 className="text-base font-bold text-white mt-1">
            {currentBusinessName} · Executive Operations Console
          </h1>
          <p className="text-xs text-slate-400">
            Real-time branch telemetry, consolidated financials, and employee rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateModule('owner_reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>P&L Financials</span>
          </button>
          <button
            onClick={() => onNavigateModule('owner_orders')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-colors shadow-md shadow-orange-600/20"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Live Orders Hub</span>
          </button>
        </div>
      </div>

      {/* Metric Cards: Today Revenue, Orders, Customers, Top Selling Products, Branch Performance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Today Revenue</span>
          <div className="font-mono text-2xl font-bold text-emerald-400 mt-1">
            {formatINR(totalRevenue)}
          </div>
          <span className="text-[10px] text-emerald-400 block mt-1 font-mono">↑ 18.2% vs last week</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Orders Today</span>
          <div className="font-mono text-2xl font-bold text-white mt-1">
            {todayOrdersCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">Average Ticket: {formatINR(aov)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Active Customers</span>
          <div className="font-mono text-2xl font-bold text-blue-400 mt-1">
            {activeCustomers}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Dine-In & Online Members</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Staff on Duty</span>
          <div className="font-mono text-2xl font-bold text-purple-400 mt-1">
            {staffUsers.length} Staff
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Across all branches</span>
        </div>
      </div>

      {/* Branch Performance & Top Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Branch Network Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-400" />
            <span>Branch Performance & Revenue Split</span>
          </h3>

          <div className="space-y-2.5">
            {branches.map((b, i) => {
              const salesMulti = i === 0 ? 0.65 : i === 1 ? 0.25 : 0.10;
              const branchRev = totalRevenue * salesMulti;
              return (
                <div
                  key={b.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{b.branchName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Code: {b.branchCode} · GSTIN: {b.gstin}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      {formatINR(branchRev)}
                    </span>
                  </div>

                  {/* Progress ratio */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full"
                      style={{ width: `${salesMulti * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Contribution: {(salesMulti * 100).toFixed(0)}%</span>
                    <span>City: {b.city}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Top Selling Products & Revenue Drivers</span>
          </h3>

          <div className="space-y-2 font-mono text-xs">
            {topProducts.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-orange-400 font-mono">{p.code}</span>
                    <span className="font-semibold text-white">{p.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{p.sales} portions sold</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white text-sm">₹{p.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
