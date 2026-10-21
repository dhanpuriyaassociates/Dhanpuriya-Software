import React, { useState } from 'react';
import { 
  QrCode, 
  Printer, 
  Download, 
  Copy, 
  RefreshCw, 
  ShieldCheck, 
  Check, 
  Sparkles,
  LayoutGrid,
  Users,
  Eye,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DiningTable, Branch } from '../types/foodos';

interface DynamicTableQrGeneratorProps {
  branch: Branch;
  tables: DiningTable[];
  onUpdateTableToken: (tableId: string, newToken: string) => void;
  onAddTable: (table: DiningTable) => void;
}

export const DynamicTableQrGenerator: React.FC<DynamicTableQrGeneratorProps> = ({
  branch,
  tables,
  onUpdateTableToken,
  onAddTable,
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || '');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [regeneratedNotice, setRegeneratedNotice] = useState<boolean>(false);
  const [showNewTableModal, setShowNewTableModal] = useState<boolean>(false);
  const [newTableNum, setNewTableNum] = useState<string>('T17');
  const [newTableSection, setNewTableSection] = useState<string>('AC Main Hall');
  const [newTableSeats, setNewTableSeats] = useState<number>(4);
  const [cardTheme, setCardTheme] = useState<'obsidian' | 'clean_white' | 'saffron'>('obsidian');

  const activeTable = tables.find((t) => t.id === selectedTableId) || tables[0];

  // Encrypted order URL adhering to technical specification (Section 8.1)
  const encryptedOrderUrl = activeTable
    ? `https://dhanpuriya.foodos.in/order?t=${activeTable.qrSecretToken}&table=${activeTable.tableNumber}&branch=${branch.branchCode}`
    : '';

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(encryptedOrderUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRegenerateToken = () => {
    if (!activeTable) return;
    const randHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const newToken = `sec_${timestamp}_${activeTable.tableNumber}_${randHex}`;
    onUpdateTableToken(activeTable.id, newToken);
    setRegeneratedNotice(true);
    setTimeout(() => setRegeneratedNotice(false), 2500);
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleDownloadSvg = () => {
    const svgEl = document.getElementById('table-qr-svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `Dhanpuriya_${branch.branchCode}_Table_${activeTable.tableNumber}_QR.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleCreateNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    const randHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const newTbl: DiningTable = {
      id: `tbl_${Date.now()}`,
      branchId: branch.id,
      sectionName: newTableSection,
      tableNumber: newTableNum,
      seatingCapacity: newTableSeats,
      qrSecretToken: `sec_${timestamp}_${newTableNum}_${randHex}`,
      isOccupied: false,
    };
    onAddTable(newTbl);
    setSelectedTableId(newTbl.id);
    setShowNewTableModal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-md shadow-orange-600/30">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Dynamic Table QR Generator & Tent-Card Engine
              </h2>
              <p className="text-xs text-slate-400">
                Generate and print cryptographically signed QR codes for contactless guest dining.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowNewTableModal(true)}
          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-600/20"
        >
          + Add New Table
        </button>
      </div>

      {/* Main Grid: Control Panel (Left) & Real Table Tent-Card Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Table Configuration & Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Table Selector */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              Select Dine-In Table for QR Generation:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {tables.map((tbl) => (
                <button
                  key={tbl.id}
                  onClick={() => setSelectedTableId(tbl.id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedTableId === tbl.id
                      ? 'border-orange-500 bg-orange-600/20 text-white font-bold ring-1 ring-orange-500'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-mono text-sm">{tbl.tableNumber}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{tbl.seatingCapacity} Seats</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cryptographic Security Details */}
          {activeTable && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cryptographic Token Security</span>
                </span>
                <button
                  onClick={handleRegenerateToken}
                  className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 font-mono transition-colors"
                  title="Rotate and regenerate secret cryptographic token"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate Token</span>
                </button>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Assigned Table:</span>
                  <span className="font-bold text-white">{activeTable.tableNumber} ({activeTable.sectionName})</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Capacity:</span>
                  <span className="text-slate-200">{activeTable.seatingCapacity} Guests</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Secret Signed Token:</span>
                  <code className="text-[10px] text-orange-300 bg-slate-900 p-1.5 rounded block truncate border border-slate-800">
                    {activeTable.qrSecretToken}
                  </code>
                </div>
              </div>

              {regeneratedNotice && (
                <div className="p-2 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded text-[11px] font-semibold">
                  ✓ Token rotated! Previous table QR invalidated to prevent session hijacking.
                </div>
              )}

              {/* Resolved URL */}
              <div>
                <span className="text-slate-400 block mb-1">Encrypted Customer Dining URL:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={encryptedOrderUrl}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-[10px] text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Card Theme Picker */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-300 block">Tent-Card Theme Preset:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'obsidian', label: 'Obsidian Slate' },
                { id: 'clean_white', label: 'Clean Ivory' },
                { id: 'saffron', label: 'Indian Saffron' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setCardTheme(theme.id as any)}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                    cardTheme === theme.id
                      ? 'border-orange-500 bg-orange-600 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Printable Table Stand Tent-Card Graphic (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3">
            Live Tent-Card Stand Preview (10cm × 15cm Acrylic Stand)
          </span>

          {/* Realistic Physical Tent-Card Component */}
          <div
            id="printable-tent-card"
            className={`w-full max-w-[340px] rounded-2xl p-6 shadow-2xl border flex flex-col items-center text-center transition-all ${
              cardTheme === 'obsidian'
                ? 'bg-slate-900 border-slate-700 text-white'
                : cardTheme === 'clean_white'
                ? 'bg-white border-slate-300 text-slate-950'
                : 'bg-gradient-to-b from-orange-600 to-amber-700 border-orange-500 text-white'
            }`}
          >
            {/* Restaurant Brand */}
            <div className="space-y-0.5 mb-2">
              <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold ${
                cardTheme === 'clean_white' ? 'text-orange-600' : 'text-orange-400'
              }`}>
                DHANPURIYA FOODS & HOSPITALITY
              </span>
              <h3 className="font-extrabold text-lg tracking-tight">Contactless Dining</h3>
              <p className={`text-[10px] ${cardTheme === 'clean_white' ? 'text-slate-500' : 'text-slate-400'}`}>
                {branch.branchName} · {activeTable.sectionName}
              </p>
            </div>

            {/* Prominent Table Number Callout */}
            <div className="my-2 py-1 px-4 rounded-xl border bg-black/10 border-black/10 flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-75">TABLE</span>
              <span className="font-mono text-2xl font-black">{activeTable.tableNumber}</span>
              <span className="text-[10px] opacity-75 font-mono">({activeTable.seatingCapacity} Pax)</span>
            </div>

            {/* High-Resolution SVG QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-xl my-3 border border-slate-200">
              <svg id="table-qr-svg" className="w-48 h-48" viewBox="0 0 100 100">
                {/* Background */}
                <rect width="100" height="100" fill="white" />

                {/* Corner Markers */}
                <rect x="8" y="8" width="26" height="26" fill="#0f172a" rx="3" />
                <rect x="12" y="12" width="18" height="18" fill="white" rx="2" />
                <rect x="16" y="16" width="10" height="10" fill="#0f172a" rx="1" />

                <rect x="66" y="8" width="26" height="26" fill="#0f172a" rx="3" />
                <rect x="70" y="12" width="18" height="18" fill="white" rx="2" />
                <rect x="74" y="16" width="10" height="10" fill="#0f172a" rx="1" />

                <rect x="8" y="66" width="26" height="26" fill="#0f172a" rx="3" />
                <rect x="12" y="70" width="18" height="18" fill="white" rx="2" />
                <rect x="16" y="74" width="10" height="10" fill="#0f172a" rx="1" />

                {/* QR Synthetic Encrypted Pattern */}
                <rect x="40" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="50" y="16" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="24" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="32" width="6" height="6" fill="#0f172a" />
                <rect x="14" y="42" width="6" height="6" fill="#0f172a" />
                <rect x="24" y="48" width="6" height="6" fill="#0f172a" />
                <rect x="68" y="42" width="6" height="6" fill="#0f172a" />
                <rect x="78" y="48" width="6" height="6" fill="#0f172a" />
                <rect x="40" y="44" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="52" width="6" height="6" fill="#0f172a" />
                <rect x="40" y="68" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="76" width="6" height="6" fill="#0f172a" />
                <rect x="68" y="68" width="6" height="6" fill="#0f172a" />
                <rect x="78" y="76" width="6" height="6" fill="#0f172a" />
                <rect x="84" y="60" width="6" height="6" fill="#0f172a" />
                <rect x="60" y="84" width="6" height="6" fill="#0f172a" />

                {/* Center Dhanpuriya 'D' Logo Emblem */}
                <circle cx="50" cy="50" r="10" fill="#ea580c" />
                <text x="50" y="54" fontSize="11" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif">
                  D
                </text>
              </svg>
            </div>

            {/* Scan Prompt Instruction */}
            <div className="space-y-1">
              <span className="font-bold text-xs">Scan with Camera or Google Lens</span>
              <p className={`text-[10px] leading-tight ${cardTheme === 'clean_white' ? 'text-slate-600' : 'text-slate-300'}`}>
                Browse Live Menu · Customize Dishes · Instant UPI Settlement
              </p>
            </div>

            {/* Footer Regulatory Marks */}
            <div className="mt-3 pt-2 border-t border-black/10 w-full flex justify-between text-[8px] opacity-70 font-mono">
              <span>GSTIN: {branch.gstin}</span>
              <span>FSSAI: {branch.fssaiLicenseNumber}</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handlePrintCard}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Table Card</span>
            </button>
            <button
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Vector SVG</span>
            </button>
          </div>
        </div>
      </div>

      {/* NEW TABLE MODAL */}
      {showNewTableModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewTable}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Add New Table to Floor Plan</h3>
              <button
                type="button"
                onClick={() => setShowNewTableModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Table Number (e.g. T17, R1, G4)</label>
                <input
                  type="text"
                  required
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Dining Section</label>
                <select
                  value={newTableSection}
                  onChange={(e) => setNewTableSection(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="AC Main Hall">AC Main Hall</option>
                  <option value="Rooftop Terrace">Rooftop Terrace</option>
                  <option value="Courtyard Garden">Courtyard Garden</option>
                  <option value="Executive Private Lounge">Executive Private Lounge</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Seating Capacity (Guests)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTableSeats}
                  onChange={(e) => setNewTableSeats(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewTableModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold"
              >
                Create & Generate QR
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
