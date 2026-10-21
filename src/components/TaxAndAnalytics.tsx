import React, { useState } from 'react';
import { 
  BarChart3, 
  IndianRupee, 
  FileCheck2, 
  PieChart, 
  TrendingUp, 
  Download, 
  Calculator,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Order, Branch } from '../types/foodos';
import { formatINR, calculateLineTax, computeOrderTotals } from '../utils/taxEngine';

interface TaxAndAnalyticsProps {
  orders: Order[];
  branches: Branch[];
  currentBranch: Branch;
}

export const TaxAndAnalytics: React.FC<TaxAndAnalyticsProps> = ({
  orders,
  branches,
  currentBranch,
}) => {
  const [testBasePrice, setTestBasePrice] = useState<number>(340);
  const [testQty, setTestQty] = useState<number>(2);
  const [testDiscount, setTestDiscount] = useState<number>(50);
  const [isTestInterState, setIsTestInterState] = useState<boolean>(false);

  // Compute analytics
  const branchOrders = orders.filter((o) => o.branchId === currentBranch.id);
  const totalRevenue = branchOrders.reduce((acc, o) => acc + o.finalPayableAmount, 0);
  const totalCgst = branchOrders.reduce((acc, o) => acc + o.cgstAmount, 0);
  const totalSgst = branchOrders.reduce((acc, o) => acc + o.sgstAmount, 0);
  const totalDiscount = branchOrders.reduce((acc, o) => acc + o.discountAmount, 0);
  const aov = branchOrders.length > 0 ? totalRevenue / branchOrders.length : 0;

  // Sandbox calculation
  const sandboxSummary = computeOrderTotals(
    [{ unitPrice: testBasePrice, quantity: testQty, gstRate: isTestInterState ? 18 : 5 }],
    testDiscount,
    0,
    0,
    isTestInterState
  );

  const handleExportGstr1 = () => {
    const csvContent = 
      "data:text/csv;charset=utf-8," +
      ["Invoice Number,Date,Type,Taxable Amount,CGST Rate,CGST Amount,SGST Rate,SGST Amount,Grand Total,Payment Mode",
        ...branchOrders.map(o => 
          `${o.orderNumber},${new Date(o.createdAt).toLocaleDateString()},${o.orderType},${o.subtotalAmount.toFixed(2)},2.5%,${o.cgstAmount.toFixed(2)},2.5%,${o.sgstAmount.toFixed(2)},${o.finalPayableAmount.toFixed(2)},${o.paymentMode}`
        )
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSTR1_Summary_${currentBranch.branchCode}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto p-4 text-slate-100 space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-400" />
            <h2 className="font-bold text-white tracking-wide text-sm">
              STATUTORY BHARAT-TAX COMPLIANCE & BRANCH ANALYTICS
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Section 9 Central Goods and Services Tax (CGST) Act & Rule 58 Rounding Engine
          </p>
        </div>

        <button
          onClick={handleExportGstr1}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export GSTR-1 Monthly Summary (CSV)</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 text-[11px] block">Branch Gross Revenue (Today)</span>
          <div className="font-mono text-xl font-bold text-white mt-1">
            {formatINR(totalRevenue)}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            ↑ 14.8% vs yesterday peak
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 text-[11px] block">Statutory GST Collected (CGST + SGST)</span>
          <div className="font-mono text-xl font-bold text-orange-400 mt-1">
            {formatINR(totalCgst + totalSgst)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            CGST: ₹{totalCgst.toFixed(2)} · SGST: ₹{totalSgst.toFixed(2)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 text-[11px] block">Orders Settled Today</span>
          <div className="font-mono text-xl font-bold text-white mt-1">
            {branchOrders.length} Orders
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Avg Ticket: {formatINR(aov)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 text-[11px] block">Total Discounts Granted</span>
          <div className="font-mono text-xl font-bold text-amber-400 mt-1">
            {formatINR(totalDiscount)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Promos: OFFICE10 / FLAT50
          </span>
        </div>
      </div>

      {/* Middle Grid: Statutory Rules & Live Tax Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Statutory Reference Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-white">Indian Statutory Framework Reference</h3>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-orange-300 block mb-1">
                1. Standalone Restaurant Tax Rate (HSN 996331):
              </span>
              <p className="text-[11px] text-slate-400">
                Standalone food joints without centralized air-conditioned star hotel lodging charge a flat <strong>5% GST</strong> with no Input Tax Credit (ITC), divided evenly: <strong>2.5% CGST</strong> and <strong>2.5% SGST</strong>.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-orange-300 block mb-1">
                2. Inter-State & Outdoor Catering Services (SAC 996337):
              </span>
              <p className="text-[11px] text-slate-400">
                Outdoor catering across state lines incurs <strong>18% IGST</strong> (or 5% without ITC where specified under GST Council notifications).
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-orange-300 block mb-1">
                3. Legal Metrology Rule 58 (Statutory Rounding Off):
              </span>
              <p className="text-[11px] text-slate-400">
                Fractional paise amounts $\ge ₹0.50$ are rounded up to the nearest rupee, while fractions $&lt; ₹0.50$ are rounded down. Rounding adjustments are recorded explicitly on the tax invoice.
              </p>
            </div>
          </div>
        </div>

        {/* Live Tax Engine Sandbox */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Live Bharat-Tax Simulator</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Interactive Tester</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Base Price / Rate (₹):</label>
              <input
                type="number"
                value={testBasePrice}
                onChange={(e) => setTestBasePrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Quantity:</label>
              <input
                type="number"
                value={testQty}
                onChange={(e) => setTestQty(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Promo Discount (₹):</label>
              <input
                type="number"
                value={testDiscount}
                onChange={(e) => setTestDiscount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Tax Jurisdiction:</label>
              <select
                value={isTestInterState ? 'inter' : 'intra'}
                onChange={(e) => setIsTestInterState(e.target.value === 'inter')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-orange-500"
              >
                <option value="intra">Intra-State (CGST 2.5% + SGST 2.5%)</option>
                <option value="inter">Inter-State Catering (18% IGST)</option>
              </select>
            </div>
          </div>

          {/* Computed Output */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono space-y-1.5 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Gross Item Value:</span>
              <span>₹{sandboxSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Less Discount:</span>
              <span>-₹{sandboxSummary.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Taxable Value:</span>
              <span>₹{sandboxSummary.taxableAmount.toFixed(2)}</span>
            </div>
            {!isTestInterState ? (
              <>
                <div className="flex justify-between text-slate-400">
                  <span>CGST @ 2.50%:</span>
                  <span>₹{sandboxSummary.totalCgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SGST @ 2.50%:</span>
                  <span>₹{sandboxSummary.totalSgst.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-400">
                <span>IGST @ 18.00%:</span>
                <span>₹{sandboxSummary.totalIgst.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Rule 58 Rounding:</span>
              <span>
                {sandboxSummary.roundingAdjustment > 0 ? '+' : ''}
                ₹{sandboxSummary.roundingAdjustment.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 font-bold text-sm text-white">
              <span>FINAL PAYABLE:</span>
              <span className="text-orange-400 text-base">₹{sandboxSummary.finalPayable.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="font-bold text-xs text-white mb-3">Live Settlement Audit Trail (Recent Branch Orders):</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2">Invoice #</th>
                <th className="pb-2">Token</th>
                <th className="pb-2">Type</th>
                <th className="pb-2 text-right">Taxable</th>
                <th className="pb-2 text-right">CGST</th>
                <th className="pb-2 text-right">SGST</th>
                <th className="pb-2 text-right">Total</th>
                <th className="pb-2">Payment</th>
                <th className="pb-2">Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {branchOrders.map((o) => (
                <tr key={o.id} className="text-slate-300">
                  <td className="py-2 font-semibold text-white">{o.orderNumber}</td>
                  <td className="py-2 text-orange-400">#{o.dailyTokenNumber}</td>
                  <td className="py-2 text-[10px] text-slate-400">{o.orderType}</td>
                  <td className="py-2 text-right">₹{o.subtotalAmount.toFixed(2)}</td>
                  <td className="py-2 text-right text-slate-400">₹{o.cgstAmount.toFixed(2)}</td>
                  <td className="py-2 text-right text-slate-400">₹{o.sgstAmount.toFixed(2)}</td>
                  <td className="py-2 text-right font-bold text-white">₹{o.finalPayableAmount.toFixed(2)}</td>
                  <td className="py-2 text-emerald-400">{o.paymentMode}</td>
                  <td className="py-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      SYNCED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
