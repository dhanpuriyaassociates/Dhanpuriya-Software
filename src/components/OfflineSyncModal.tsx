import React from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, Database, Server, ArrowRight, X } from 'lucide-react';
import { OfflineSyncQueue } from '../types/foodos';

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: OfflineSyncQueue[];
  onSyncAll: () => void;
  isOnline: boolean;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  isOpen,
  onClose,
  queue,
  onSyncAll,
  isOnline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">
              Dual-Clock Synchronization Engine (ULID FIFO Queue)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Protocol Architecture Explanation */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between font-mono text-[11px] text-orange-400 pb-1 border-b border-slate-800">
            <span>Client State: {isOnline ? 'Online Gateway Connected' : 'Local IndexedDB Autonomous'}</span>
            <span>Vector Clock v2.1</span>
          </div>
          <p className="text-[11px] text-slate-400">
            When network drops, Dhanpuriya POS generates cryptographically verifiable, sortable <strong>ULIDs</strong> and persists thermal KOTs over LAN TCP 9100. As soon as internet connectivity resumes, this FIFO buffer reconciles atomically with the primary Aurora PostgreSQL database.
          </p>
        </div>

        {/* Queued Items List */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 block">
            Offline Buffer Queue ({queue.length} items):
          </span>
          <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs">
            {queue.length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-xs font-sans">
                ✓ Queue clean: All transactions are 100% synchronized with Cloud RDS.
              </p>
            ) : (
              queue.map((q) => (
                <div
                  key={q.id}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <span className="text-orange-400 font-bold">{q.ulid}</span>
                    <span className="text-slate-500 text-[10px] block">
                      {q.operation} · {new Date(q.queuedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    {q.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
          >
            Close
          </button>
          <button
            onClick={onSyncAll}
            disabled={queue.length === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Flush FIFO Sync Batch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
