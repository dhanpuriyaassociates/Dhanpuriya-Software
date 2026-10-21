import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Plus, 
  BellRing, 
  Receipt, 
  CheckCircle2, 
  Users, 
  Clock, 
  Coffee, 
  UtensilsCrossed,
  Send,
  Sparkles
} from 'lucide-react';
import { DiningTable, MenuItem, Order } from '../../types/foodos';
import { WaiterServiceRequest } from '../../types/rbac';
import { sound } from '../../utils/audioCue';

interface WaiterDashboardProps {
  tables: DiningTable[];
  menuItems: MenuItem[];
  serviceRequests: WaiterServiceRequest[];
  onAttendServiceRequest: (requestId: string) => void;
  onSendWaiterKot: (tableNumber: string, items: { item: MenuItem; qty: number }[]) => void;
}

export const WaiterDashboard: React.FC<WaiterDashboardProps> = ({
  tables,
  menuItems,
  serviceRequests,
  onAttendServiceRequest,
  onSendWaiterKot,
}) => {
  const [selectedTable, setSelectedTable] = useState<DiningTable>(tables[0]);
  const [quickCart, setQuickCart] = useState<{ [id: string]: number }>({});
  const [guestCount, setGuestCount] = useState<number>(4);
  const [showOrderPad, setShowOrderPad] = useState<boolean>(false);

  const handleAddItem = (itemId: string) => {
    sound.playScannerBeep();
    setQuickCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    sound.playScannerBeep();
    setQuickCart((prev) => {
      const next = { ...prev };
      if (next[itemId] <= 1) {
        delete next[itemId];
      } else {
        next[itemId] -= 1;
      }
      return next;
    });
  };

  const handleDispatchTableKot = () => {
    const items = Object.entries(quickCart).map(([id, qty]) => ({
      item: menuItems.find((m) => m.id === id)!,
      qty,
    })).filter(x => Boolean(x.item));

    if (items.length === 0) return;

    sound.playKotBumpChime();
    onSendWaiterKot(selectedTable.tableNumber, items);
    setQuickCart({});
    setShowOrderPad(false);
  };

  const pendingRequests = serviceRequests.filter((r) => r.status === 'PENDING');

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-bold">
              Captain & Waiter Tablet Terminal
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Mobile Handheld View</span>
          </div>
          <h1 className="text-base font-bold text-white mt-1">
            Floor Seating & Captain Order Pad
          </h1>
          <p className="text-xs text-slate-400">
            Take contactless table orders, send KOT directly to kitchen stations, and manage service requests.
          </p>
        </div>

        <button
          onClick={() => setShowOrderPad(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Table Order Pad</span>
        </button>
      </div>

      {/* Guest Service Calls Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <BellRing className="w-4 h-4 text-orange-400 animate-bounce" />
            <span>Active Guest Service Calls ({pendingRequests.length} Pending)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Bandra Floor Station</span>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">
            All guest calls attended. No pending service alerts.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950 border border-orange-500/50 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">Table {req.tableNumber}</div>
                  <span className="text-orange-400 text-[11px] font-semibold">
                    {req.requestType.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">{req.timestamp}</span>
                </div>
                <button
                  onClick={() => {
                    sound.playScannerBeep();
                    onAttendServiceRequest(req.id);
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                >
                  Mark Attended
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floor Table Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-orange-400" />
          <span>Table Layout & Occupancy Grid</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {tables.map((tbl) => (
            <div
              key={tbl.id}
              onClick={() => {
                setSelectedTable(tbl);
                setShowOrderPad(true);
              }}
              className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                tbl.isOccupied
                  ? 'border-amber-600/70 bg-amber-950/20 text-amber-200 shadow-md'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="font-bold text-base font-mono">{tbl.tableNumber}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{tbl.seatingCapacity} Pax</div>
              <div className="mt-2">
                {tbl.isOccupied ? (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold block">
                    Occupied
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 block">
                    Available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WAITER QUICK ORDER PAD MODAL */}
      {showOrderPad && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <h3 className="font-bold text-base text-white">
                  Table Order Pad · {selectedTable.tableNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedTable.sectionName} · Guest Count: {guestCount}
                </p>
              </div>
              <button onClick={() => setShowOrderPad(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Quick Menu Selection */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
              {menuItems.map((item) => {
                const qty = quickCart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-500 text-[10px]">#{item.itemCode}</span>
                        <span className="font-bold text-white">{item.name}</span>
                      </div>
                      <span className="font-mono text-orange-400 font-bold">₹{item.basePrice}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-1">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={qty === 0}
                        className="px-1.5 text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-white px-2">{qty}</span>
                      <button
                        onClick={() => handleAddItem(item.id)}
                        className="px-1.5 text-slate-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-300">
                Total Items: {Object.values(quickCart).reduce((a, b) => a + b, 0)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOrderPad(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatchTableKot}
                  disabled={Object.keys(quickCart).length === 0}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send KOT to Kitchen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
