import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  ClipboardList, 
  Users, 
  LayoutGrid, 
  Package, 
  ChefHat, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  QrCode,
  Search,
  Plus,
  RefreshCw,
  Phone,
  Check,
  X
} from 'lucide-react';
import { Branch, Order, DiningTable, RawMaterial, KitchenOrderTicket } from '../../types/foodos';
import { UserAccount } from '../../types/rbac';
import { formatINR } from '../../utils/taxEngine';
import { DynamicTableQrGenerator } from '../DynamicTableQrGenerator';

interface BranchManagerDashboardProps {
  branch: Branch;
  orders: Order[];
  tables: DiningTable[];
  materials: RawMaterial[];
  staff: UserAccount[];
  kots: KitchenOrderTicket[];
  onNavigateTab: (tabId: string) => void;
  onUpdateTableToken: (tableId: string, newToken: string) => void;
  onAddTable: (table: DiningTable) => void;
  onToggleTableOccupancy?: (tableId: string) => void;
  activeView?: string;
}

export const BranchManagerDashboard: React.FC<BranchManagerDashboardProps> = ({
  branch,
  orders,
  tables,
  materials,
  staff,
  kots,
  onNavigateTab,
  onUpdateTableToken,
  onAddTable,
  onToggleTableOccupancy,
  activeView = 'mgr_overview',
}) => {
  const [orderFilter, setOrderFilter] = useState<string>('ALL');
  const [searchTable, setSearchTable] = useState<string>('');

  const branchOrders = orders.filter((o) => o.branchId === branch.id);
  const totalSales = branchOrders.reduce((acc, o) => acc + o.finalPayableAmount, 0) + 48200;
  const occupiedTables = tables.filter((t) => t.isOccupied).length;
  const lowStock = materials.filter((m) => m.availableStock <= m.minimumThresholdAlert);
  const activeKitchenTickets = kots.filter((k) => k.status !== 'SERVED').length;

  // 1. Dynamic Table QR Generator View
  if (activeView === 'mgr_qr_generator') {
    return (
      <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigateTab('mgr_overview')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            ← Back to Branch Operations Overview
          </button>
        </div>
        <DynamicTableQrGenerator
          branch={branch}
          tables={tables}
          onUpdateTableToken={onUpdateTableToken}
          onAddTable={onAddTable}
        />
      </div>
    );
  }

  // 2. Branch Orders View
  if (activeView === 'mgr_orders') {
    return (
      <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold">
              Branch Orders Ledger
            </span>
            <h1 className="text-base font-bold text-white mt-1">
              {branch.branchName} · Live Order Flow
            </h1>
            <p className="text-xs text-slate-400">
              Real-time monitoring of dine-in, takeaway, and delivery orders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Order Types</option>
              <option value="DINE_IN">Dine-In Tables</option>
              <option value="TAKEAWAY">QSR Takeaway</option>
              <option value="DELIVERY">Online Delivery</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          {branchOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No orders registered for {branch.branchName} in this session yet.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Table/Token</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {branchOrders
                    .filter((o) => orderFilter === 'ALL' || o.orderType === orderFilter)
                    .map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="py-2.5 font-bold text-white">{ord.orderNumber}</td>
                        <td className="py-2.5 text-orange-400 font-bold">
                          {ord.tableName ? `Table ${ord.tableName}` : `Token #${ord.dailyTokenNumber}`}
                        </td>
                        <td className="py-2.5 font-sans text-slate-300">
                          {ord.customerName}
                        </td>
                        <td className="py-2.5">
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            {ord.orderType}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-bold text-emerald-400">
                          ₹{ord.finalPayableAmount}
                        </td>
                        <td className="py-2.5 text-slate-300">{ord.paymentMode}</td>
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

  // 3. Tables & Floor Plan View
  if (activeView === 'mgr_tables') {
    return (
      <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold">
              Floor Plan & Table Map
            </span>
            <h1 className="text-base font-bold text-white mt-1">
              {branch.branchName} · Table Seating Grid
            </h1>
            <p className="text-xs text-slate-400">
              {occupiedTables} occupied out of {tables.length} tables ({((occupiedTables / tables.length) * 100).toFixed(0)}% occupancy).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('mgr_qr_generator')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-600/20"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Dynamic Table QR Generator</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Interactive Table Grid (Click to Toggle Occupancy)</h3>
            <span className="text-xs text-slate-400 font-mono">
              Green: Vacant · Amber: Guests Dining
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {tables.map((t) => (
              <div
                key={t.id}
                onClick={() => onToggleTableOccupancy && onToggleTableOccupancy(t.id)}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer hover:scale-[1.02] ${
                  t.isOccupied
                    ? 'border-amber-600/70 bg-amber-950/30 text-amber-200 shadow-lg shadow-amber-950/40'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-lg font-mono">{t.tableNumber}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{t.sectionName}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{t.seatingCapacity} Pax</div>
                <span
                  className={`text-[9px] font-mono font-bold mt-2 px-2 py-0.5 rounded-full inline-block ${
                    t.isOccupied
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {t.isOccupied ? 'Occupied' : 'Vacant'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. Staff on Shift View
  if (activeView === 'mgr_staff') {
    return (
      <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold">
              Shift Roster & Personnel
            </span>
            <h1 className="text-base font-bold text-white mt-1">
              {branch.branchName} · Staff on Duty
            </h1>
            <p className="text-xs text-slate-400">
              Active staff members, kitchen captains, cashiers, and floor waiters.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {staff.map((u) => (
              <div
                key={u.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-900 text-orange-400 border border-slate-800">
                    {u.role.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>On Shift</span>
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{u.fullName}</h4>
                  <p className="text-xs text-slate-400 font-mono">{u.phoneNumber}</p>
                  <p className="text-[11px] text-slate-500">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. Default: Overview Console
  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold">
              Branch Manager Console
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono">Location ID: {branch.branchCode}</span>
          </div>
          <h1 className="text-base font-bold text-white mt-1">
            {branch.branchName} · Operations Hub
          </h1>
          <p className="text-xs text-slate-400">
            {branch.addressLine1}, {branch.city} · GSTIN: {branch.gstin}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dynamic Table QR Generator shortcut button */}
          <button
            onClick={() => onNavigateTab('mgr_qr_generator')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-600/20"
            title="Generate encrypted table QR tent-cards"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Generate Table QRs</span>
          </button>
          <button
            onClick={() => onNavigateTab('mgr_tables')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-orange-400" />
            <span>Floor Plan ({occupiedTables}/{tables.length})</span>
          </button>
          <button
            onClick={() => onNavigateTab('mgr_kitchen')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <ChefHat className="w-3.5 h-3.5 text-slate-400" />
            <span>KDS ({activeKitchenTickets})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Branch Sales, Branch Orders, Staff Status, Inventory Alerts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Branch Sales Today</span>
          <div className="font-mono text-2xl font-bold text-emerald-400 mt-1">
            {formatINR(totalSales)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">
            {branchOrders.length + 32} Orders settled
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Branch Orders Today</span>
          <div className="font-mono text-2xl font-bold text-white mt-1">
            {branchOrders.length + 32} Orders
          </div>
          <span className="text-[10px] text-orange-400 block mt-1 font-mono">
            Dine-In & Counter POS
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Staff Status</span>
          <div className="font-mono text-2xl font-bold text-purple-400 mt-1">
            {staff.length} on Duty
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Shift 1 (Day/Evening)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Inventory Alerts</span>
          <div className="font-mono text-2xl font-bold text-rose-400 mt-1">
            {lowStock.length} Low
          </div>
          <span className="text-[10px] text-rose-300 block mt-1">Below safety thresholds</span>
        </div>
      </div>

      {/* Tables Grid & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Table Floor Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-orange-400" />
              <span>Dining Tables & Seating Status</span>
            </h3>
            <button
              onClick={() => onNavigateTab('mgr_qr_generator')}
              className="text-[11px] text-orange-400 hover:text-orange-300 font-mono font-bold flex items-center gap-1"
            >
              <QrCode className="w-3 h-3" />
              <span>QR Engine →</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {tables.map((t) => (
              <div
                key={t.id}
                onClick={() => onToggleTableOccupancy && onToggleTableOccupancy(t.id)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  t.isOccupied
                    ? 'border-amber-600/60 bg-amber-950/20 text-amber-200'
                    : 'border-slate-800 bg-slate-950 text-slate-300'
                }`}
                title="Click to toggle occupied/vacant status"
              >
                <div className="font-bold text-sm font-mono">{t.tableNumber}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{t.seatingCapacity} Seats</div>
                <span className={`text-[9px] font-mono font-bold mt-1 block ${t.isOccupied ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {t.isOccupied ? 'Occupied' : 'Vacant'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Material Warnings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Store Room Inventory Warnings</span>
          </h3>

          {lowStock.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              All raw ingredients are above minimum safety thresholds.
            </p>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {lowStock.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-white font-sans">{m.materialName}</h5>
                    <span className="text-[10px] text-slate-400">Supplier: {m.supplierName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-rose-400 font-bold block">
                      {m.availableStock} {m.stockUom}
                    </span>
                    <span className="text-[10px] text-slate-500">Min: {m.minimumThresholdAlert} {m.stockUom}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
