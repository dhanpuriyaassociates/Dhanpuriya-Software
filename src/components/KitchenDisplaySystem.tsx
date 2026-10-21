import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Filter,
  Check
} from 'lucide-react';
import { KitchenOrderTicket, KitchenStation, KotStatus } from '../types/foodos';
import { sound } from '../utils/audioCue';

interface KitchenDisplaySystemProps {
  kots: KitchenOrderTicket[];
  onUpdateKotStatus: (kotId: string, status: KotStatus) => void;
}

export const KitchenDisplaySystem: React.FC<KitchenDisplaySystemProps> = ({
  kots,
  onUpdateKotStatus,
}) => {
  const [selectedStation, setSelectedStation] = useState<KitchenStation>('ALL');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showRecalledDrawer, setShowRecalledDrawer] = useState<boolean>(false);
  const [secondsTick, setSecondsTick] = useState<number>(0);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stations: { id: KitchenStation; label: string }[] = [
    { id: 'ALL', label: 'All Stations' },
    { id: 'MAIN_KITCHEN', label: 'Main Handi & Gravy' },
    { id: 'TANDOOR_GRILL', label: 'Tandoor & Kebabs' },
    { id: 'BEVERAGE_BAR', label: 'Chai & Beverage Bar' },
    { id: 'FRY_ASSEMBLY', label: 'Fryer & QSR Rolls' },
  ];

  // Active (non-served) tickets
  const activeKots = kots.filter((kot) => {
    const matchesStation = selectedStation === 'ALL' || kot.stationTag === selectedStation;
    return matchesStation && kot.status !== 'SERVED';
  });

  // Completed/served tickets for recall
  const completedKots = kots.filter((kot) => kot.status === 'SERVED');

  const handleToggleItemCheck = (kotId: string, itemIdx: number) => {
    const key = `${kotId}_${itemIdx}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleBumpTicket = (kot: KitchenOrderTicket) => {
    if (soundEnabled) {
      sound.playKotBumpChime();
    }
    let nextStatus: KotStatus = 'COOKING';
    if (kot.status === 'QUEUED') nextStatus = 'COOKING';
    else if (kot.status === 'COOKING') nextStatus = 'READY';
    else if (kot.status === 'READY') nextStatus = 'SERVED';

    onUpdateKotStatus(kot.id, nextStatus);
  };

  const handleRecallTicket = (kotId: string) => {
    if (soundEnabled) {
      sound.playKotBumpChime();
    }
    onUpdateKotStatus(kotId, 'READY');
  };

  // Keyboard shortcut listener for F1-F4 ticket bump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['F1', 'F2', 'F3', 'F4'].includes(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key.replace('F', ''), 10) - 1;
        if (activeKots[index]) {
          handleBumpTicket(activeKots[index]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeKots]);

  const getElapsedTimeFormatted = (createdIso: string) => {
    const elapsedSecs = Math.max(0, Math.floor((Date.now() - new Date(createdIso).getTime()) / 1000));
    const mins = Math.floor(elapsedSecs / 60);
    const secs = elapsedSecs % 60;
    return {
      text: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      totalMins: mins,
    };
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden text-slate-100">
      {/* KDS Header Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-orange-400" />
            <h2 className="font-bold text-white tracking-wide">
              KDS LINE ENGINE · DHANPURIYA
            </h2>
          </div>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>WSS Pub/Sub: 14ms Latency</span>
          </div>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {stations.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStation(st.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedStation === st.id
                  ? 'bg-orange-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Right Tools: Sound, Recall */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title={soundEnabled ? 'Kitchen Chime Sound ON' : 'Kitchen Chime Sound OFF'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setShowRecalledDrawer(!showRecalledDrawer)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300"
          >
            <RotateCcw className="w-3 h-3 text-orange-400" />
            <span>Recall ({completedKots.length})</span>
          </button>
        </div>
      </div>

      {/* Main KDS Grid (3-4 columns) */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeKots.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-500/40" />
            <h3 className="text-base font-semibold text-slate-300">All Kitchen Stations Clear!</h3>
            <p className="text-xs text-slate-500 mt-1">
              No orders queued for {selectedStation === 'ALL' ? 'any station' : selectedStation}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeKots.map((kot, index) => {
              const elapsed = getElapsedTimeFormatted(kot.createdAt);
              const isWarning = elapsed.totalMins >= 5 && elapsed.totalMins < 10;
              const isCritical = elapsed.totalMins >= 10;

              return (
                <div
                  key={kot.id}
                  className={`bg-slate-900 rounded-xl border flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                    isCritical
                      ? 'border-rose-500 shadow-rose-950/40 ring-1 ring-rose-500/50'
                      : isWarning
                      ? 'border-amber-500/80'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Ticket Header */}
                  <div
                    className={`p-3 border-b flex items-start justify-between ${
                      isCritical
                        ? 'bg-rose-950/40 border-rose-900/60'
                        : isWarning
                        ? 'bg-amber-950/30 border-amber-900/40'
                        : 'bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          #{kot.dailyTokenNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          [{kot.tableOrToken}]
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                        <span>{kot.orderType}</span>
                        <span>·</span>
                        <span className="uppercase">{kot.stationTag.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Timer Badge */}
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold text-xs flex items-center gap-1 ${
                          isCritical
                            ? 'text-rose-400 animate-pulse'
                            : isWarning
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{elapsed.text}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                        {isCritical ? 'CRITICAL ALERT' : isWarning ? 'WARNING' : 'OPTIMAL'}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Items Checklist */}
                  <div className="p-3 flex-1 overflow-y-auto space-y-2.5 max-h-64">
                    {kot.items.map((it, itemIdx) => {
                      const isDone = checkedItems[`${kot.id}_${itemIdx}`];
                      return (
                        <div
                          key={itemIdx}
                          onClick={() => handleToggleItemCheck(kot.id, itemIdx)}
                          className={`p-2 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-2 select-none ${
                            isDone
                              ? 'bg-slate-950/80 border-slate-800/60 text-slate-500 line-through'
                              : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                                isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-600 bg-slate-900'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <div className="text-xs font-semibold">
                                <span className="font-mono text-orange-400 mr-1.5 font-bold">
                                  {it.quantity}x
                                </span>
                                <span>{it.name}</span>
                              </div>
                              {it.notes && (
                                <p className="text-[11px] text-amber-400/90 italic mt-0.5">
                                  *Note: {it.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div
                            className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                              it.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            title={it.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Bump Status Action Bar */}
                  <div className="p-2.5 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-400 font-mono">
                      State:{' '}
                      <span className="font-bold text-white uppercase">
                        {kot.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleBumpTicket(kot)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                        kot.status === 'QUEUED'
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : kot.status === 'COOKING'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-orange-600 hover:bg-orange-500 text-white'
                      }`}
                    >
                      <span>
                        {kot.status === 'QUEUED'
                          ? 'START COOKING'
                          : kot.status === 'COOKING'
                          ? 'MARK READY'
                          : 'DISPATCH / SERVE'}
                      </span>
                      {index < 4 && (
                        <span className="text-[10px] font-mono opacity-80">
                          [F{index + 1}]
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recalled Tickets Drawer */}
      {showRecalledDrawer && (
        <div className="fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-800 p-4 shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="font-bold text-sm text-white">Recalled KOT Tickets</h3>
            <button
              onClick={() => setShowRecalledDrawer(false)}
              className="text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-xs">
            {completedKots.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No served tickets to recall.</p>
            ) : (
              completedKots.map((k) => (
                <div
                  key={k.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">Token #{k.dailyTokenNumber}</div>
                    <div className="text-[10px] text-slate-400">{k.tableOrToken}</div>
                  </div>
                  <button
                    onClick={() => handleRecallTicket(k.id)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded text-xs font-semibold"
                  >
                    Restore
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
