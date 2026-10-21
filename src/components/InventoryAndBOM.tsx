import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  ArrowDownRight, 
  CheckCircle2, 
  Search, 
  Layers, 
  RefreshCw,
  Scale,
  Sparkles
} from 'lucide-react';
import { RawMaterial, ItemRecipe, MenuItem } from '../types/foodos';
import { formatINR } from '../utils/taxEngine';

interface InventoryAndBOMProps {
  materials: RawMaterial[];
  recipes: ItemRecipe[];
  menuItems: MenuItem[];
  onUpdateStock: (materialId: string, addedStock: number) => void;
  deductionLogs: { timestamp: string; materialName: string; amount: number; uom: string; dishName: string }[];
}

export const InventoryAndBOM: React.FC<InventoryAndBOMProps> = ({
  materials,
  recipes,
  menuItems,
  onUpdateStock,
  deductionLogs,
}) => {
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>(menuItems[0]?.id || '');
  const [searchMaterial, setSearchMaterial] = useState<string>('');
  const [showInwardModal, setShowInwardModal] = useState<boolean>(false);
  const [inwardMaterialId, setInwardMaterialId] = useState<string>(materials[0]?.id || '');
  const [inwardQuantity, setInwardQuantity] = useState<number>(20);
  const [activeTab, setActiveTab] = useState<'inventory' | 'bom' | 'logs'>('inventory');

  const selectedItem = menuItems.find((m) => m.id === selectedMenuItemId) || menuItems[0];
  const itemRecipeIngredients = recipes.filter((r) => r.menuItemId === selectedItem?.id);

  // Compute calculated food cost for selected dish
  const computedDishFoodCost = itemRecipeIngredients.reduce((acc, ing) => {
    const raw = materials.find((m) => m.id === ing.materialId);
    if (!raw) return acc;
    const costForQuantity = ing.consumptionQuantity * raw.currentCostPerUom;
    const withWastage = costForQuantity * (1 + ing.wastageMarginPercent / 100);
    return acc + withWastage;
  }, 0);

  const filteredMaterials = materials.filter(
    (m) =>
      m.materialName.toLowerCase().includes(searchMaterial.toLowerCase()) ||
      m.supplierName.toLowerCase().includes(searchMaterial.toLowerCase())
  );

  const lowStockCount = materials.filter((m) => m.availableStock <= m.minimumThresholdAlert).length;

  const handleInwardSubmit = () => {
    if (inwardQuantity > 0 && inwardMaterialId) {
      onUpdateStock(inwardMaterialId, inwardQuantity);
      setShowInwardModal(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden text-slate-100">
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-400" />
            <h2 className="font-bold text-white tracking-wide">
              INVENTORY ENGINE & RECIPE BOM · DHANPURIYA
            </h2>
          </div>
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 font-mono text-[10px]">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>{lowStockCount} Items Low in Stock</span>
            </span>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'bg-orange-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Raw Materials ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab('bom')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'bom'
                ? 'bg-orange-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Recipe Bill of Materials (BOM)
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-orange-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Auto Deductions Log ({deductionLogs.length})
          </button>

          <button
            onClick={() => setShowInwardModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold transition-colors ml-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Receive Inward Stock (GRN)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RAW MATERIALS TABLE */}
      {activeTab === 'inventory' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between gap-4 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchMaterial}
                onChange={(e) => setSearchMaterial(e.target.value)}
                placeholder="Search raw material or vendor..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 text-[11px] font-mono">
                  <th className="p-3">Material Name</th>
                  <th className="p-3">Unit (UOM)</th>
                  <th className="p-3 text-right">Cost / Unit</th>
                  <th className="p-3 text-right">Available Stock</th>
                  <th className="p-3 text-right">Allocated</th>
                  <th className="p-3 text-right">Threshold Alert</th>
                  <th className="p-3">Supplier Vendor</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredMaterials.map((mat) => {
                  const isLow = mat.availableStock <= mat.minimumThresholdAlert;
                  return (
                    <tr key={mat.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="p-3 font-semibold text-white font-sans">{mat.materialName}</td>
                      <td className="p-3 text-slate-400">{mat.stockUom}</td>
                      <td className="p-3 text-right text-slate-300">₹{mat.currentCostPerUom.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-base">
                        <span className={isLow ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}>
                          {mat.availableStock.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400">{mat.allocatedStock.toFixed(2)}</td>
                      <td className="p-3 text-right text-slate-400">{mat.minimumThresholdAlert} {mat.stockUom}</td>
                      <td className="p-3 text-slate-400 font-sans text-[11px]">{mat.supplierName}</td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                            REORDER
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                            OPTIMAL
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setInwardMaterialId(mat.id);
                            setShowInwardModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded text-[11px] font-sans font-semibold transition-colors"
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RECIPE BILL OF MATERIALS (BOM) */}
      {activeTab === 'bom' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Dish Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="font-bold text-xs text-white mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-orange-400" />
                <span>Select Dish to Inspect Recipe BOM:</span>
              </h3>
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {menuItems.map((dish) => (
                  <button
                    key={dish.id}
                    onClick={() => setSelectedMenuItemId(dish.id)}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                      selectedMenuItemId === dish.id
                        ? 'border-orange-500 bg-orange-600/20 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div>#{dish.itemCode} {dish.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{dish.categoryName}</span>
                    </div>
                    <span className="font-mono text-orange-400 font-bold">₹{dish.basePrice}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: BOM Breakdown for chosen dish */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-base text-white">{selectedItem?.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedItem?.description}</p>
                  <span className="font-mono text-xs text-orange-400">
                    Selling Price: ₹{selectedItem?.basePrice} · Prep Time: {selectedItem?.preparationTimeMinutes}m
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">Calculated Food Cost (COGS)</span>
                  <span className="font-mono font-bold text-lg text-emerald-400">
                    ₹{computedDishFoodCost.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 block">
                    ({((computedDishFoodCost / (selectedItem?.basePrice || 1)) * 100).toFixed(1)}% of price)
                  </span>
                </div>
              </div>

              {/* Recipe Ingredients Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2">
                  Consumed Raw Materials per Serving (Automatic POS Deduction):
                </h4>
                {itemRecipeIngredients.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 italic">
                    No custom Bill of Materials configured for this dish yet. Defaulting to standard recipe index.
                  </p>
                ) : (
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="pb-2">Raw Material</th>
                        <th className="pb-2 text-right">Portion Quantity</th>
                        <th className="pb-2 text-right">Wastage %</th>
                        <th className="pb-2 text-right">Raw Rate</th>
                        <th className="pb-2 text-right">Net Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {itemRecipeIngredients.map((ing, i) => {
                        const raw = materials.find((m) => m.id === ing.materialId);
                        const rate = raw ? raw.currentCostPerUom : 0;
                        const netCost = ing.consumptionQuantity * rate * (1 + ing.wastageMarginPercent / 100);
                        return (
                          <tr key={i} className="text-slate-200">
                            <td className="py-2.5 font-sans font-medium">{ing.materialName}</td>
                            <td className="py-2.5 text-right font-bold text-orange-400">
                              {ing.consumptionQuantity} {ing.stockUom}
                            </td>
                            <td className="py-2.5 text-right text-slate-400">
                              {ing.wastageMarginPercent}%
                            </td>
                            <td className="py-2.5 text-right text-slate-400">
                              ₹{rate.toFixed(2)}/{ing.stockUom}
                            </td>
                            <td className="py-2.5 text-right font-bold text-emerald-400">
                              ₹{netCost.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Operational insight */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="text-orange-300 font-bold block">Automated Inventory Deduction Workflow:</span>
                <p>
                  Every time this dish is ordered at Counter POS, Online QR, or Mess Kitchen, the system atomically runs a database trigger reducing available stock in real-time according to the above BOM ratios.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTO DEDUCTION LOGS */}
      {activeTab === 'logs' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="font-bold text-xs text-white mb-3">Live Stock Deduction Ledger (Triggered by Orders):</h3>
            {deductionLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                No orders placed in this session yet. Settle an order in Counter POS to observe atomic recipe deductions!
              </p>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Dish Trigger</th>
                    <th className="pb-2">Deducted Raw Material</th>
                    <th className="pb-2 text-right">Quantity Deducted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deductionLogs.map((log, i) => (
                    <tr key={i} className="text-slate-300">
                      <td className="py-2 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2 font-sans font-semibold text-white">{log.dishName}</td>
                      <td className="py-2 text-slate-200">{log.materialName}</td>
                      <td className="py-2 text-right font-bold text-rose-400">
                        -{log.amount.toFixed(3)} {log.uom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* INWARD STOCK MODAL */}
      {showInwardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Receive Inward Stock (GRN)</h3>
              <button
                onClick={() => setShowInwardModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Raw Material:</label>
                <select
                  value={inwardMaterialId}
                  onChange={(e) => setInwardMaterialId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.materialName} ({m.availableStock} {m.stockUom} currently)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Inward Quantity to Add:</label>
                <input
                  type="number"
                  value={inwardQuantity}
                  onChange={(e) => setInwardQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              onClick={handleInwardSubmit}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Update Stock Ledger & Verify
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
