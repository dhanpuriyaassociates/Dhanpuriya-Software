import React, { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, 
  Calendar, 
  Users, 
  MapPin, 
  IndianRupee, 
  FileText, 
  Share2, 
  Check, 
  Plus, 
  TrendingUp, 
  CheckCircle2,
  Clock,
  Send
} from 'lucide-react';
import { CateringBooking, MenuItem } from '../types/foodos';
import { formatINR } from '../utils/taxEngine';

interface CateringPipelineProps {
  bookings: CateringBooking[];
  menuItems: MenuItem[];
  onAddBooking: (booking: CateringBooking) => void;
  onUpdateStatus: (id: string, status: CateringBooking['contractStatus']) => void;
}

export const CateringPipeline: React.FC<CateringPipelineProps> = ({
  bookings,
  menuItems,
  onAddBooking,
  onUpdateStatus,
}) => {
  const [showBuilderModal, setShowBuilderModal] = useState<boolean>(false);
  const [selectedBookingForQuote, setSelectedBookingForQuote] = useState<CateringBooking | null>(null);

  // Form State for new quote builder
  const [customerName, setCustomerName] = useState<string>('Piramal Realty Corporate Summit');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98200 45678');
  const [customerEmail, setCustomerEmail] = useState<string>('events@piramal.com');
  const [eventType, setEventType] = useState<CateringBooking['eventType']>('CORPORATE_GALA');
  const [targetGuestCount, setTargetGuestCount] = useState<number>(350);
  const [eventDate, setEventDate] = useState<string>('2026-11-28');
  const [venueAddress, setVenueAddress] = useState<string>('Piramal Tower, Lower Parel, Mumbai');
  const [profitMargin, setProfitMargin] = useState<number>(45);

  // Selected dishes
  const [selectedStarters, setSelectedStarters] = useState<string[]>(['Murgh Tikka Kebab', 'Paneer Tikka Shashlik']);
  const [selectedMains, setSelectedMains] = useState<string[]>(['Dal Makhani Handi', 'Paneer Butter Masala', 'Dum Murgh Biryani']);
  const [selectedBreads, setSelectedBreads] = useState<string[]>(['Butter Naan', 'Garlic Butter Naan']);
  const [selectedDesserts, setSelectedDesserts] = useState<string[]>(['Gulab Jamun Handi (2 Pcs)']);

  // Calculated Raw BOM Cost
  const rawCostPerPlate = useMemo(() => {
    // Typical BOM cost estimation based on selected courses
    const baseStarterCost = selectedStarters.length * 55;
    const baseMainCost = selectedMains.length * 85;
    const baseBreadCost = selectedBreads.length * 15;
    const baseDessertCost = selectedDesserts.length * 35;
    const basePrepCost = 50; // Chef, live tandoor logistics, transport
    return baseStarterCost + baseMainCost + baseBreadCost + baseDessertCost + basePrepCost;
  }, [selectedStarters, selectedMains, selectedBreads, selectedDesserts]);

  // Quoted Price per plate based on Margin
  const quotedPricePerPlate = useMemo(() => {
    return Math.round(rawCostPerPlate / (1 - profitMargin / 100));
  }, [rawCostPerPlate, profitMargin]);

  const totalContractValue = useMemo(() => {
    return quotedPricePerPlate * targetGuestCount;
  }, [quotedPricePerPlate, targetGuestCount]);

  const advanceRequired = useMemo(() => {
    return Math.round(totalContractValue * 0.3); // 30% advance
  }, [totalContractValue]);

  const handleCreateBooking = () => {
    const newBooking: CateringBooking = {
      id: `cat_${Date.now()}`,
      tenantId: 'ten_01HZX87K9W1234567890ABCDEF',
      customerName,
      customerPhone,
      customerEmail,
      eventType,
      eventDate: new Date(eventDate).toISOString(),
      venueAddress,
      targetGuestCount,
      quotedPricePerPlate,
      totalContractValue,
      advanceReceivedAmount: 0,
      contractStatus: 'PROPOSAL_SENT',
      selectedStarters,
      selectedMains,
      selectedBreads,
      selectedDesserts,
      rawCostPerPlate,
      profitMarginPercent: profitMargin,
      createdAt: new Date().toISOString(),
    };

    onAddBooking(newBooking);
    setShowBuilderModal(false);
  };

  const columns: { status: CateringBooking['contractStatus']; label: string; badgeColor: string }[] = [
    { status: 'INQUIRY', label: '1. Inquiries & Leads', badgeColor: 'border-slate-700 bg-slate-800' },
    { status: 'PROPOSAL_SENT', label: '2. Quotation Dispatched', badgeColor: 'border-blue-700/60 bg-blue-950/40 text-blue-300' },
    { status: 'CONFIRMED', label: '3. Confirmed & Advance Paid', badgeColor: 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300' },
    { status: 'EXECUTED', label: '4. Executed & Settled', badgeColor: 'border-purple-700/60 bg-purple-950/40 text-purple-300' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Banner: Metrics & New Quotation Button */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-orange-400" />
            <h2 className="font-bold text-white tracking-wide">
              CATERING OPERATIONS & CONTRACT ENGINE · DHANPURIYA
            </h2>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Pipeline: <strong className="text-white font-mono">{bookings.length} Events</strong>
          </span>
        </div>

        <button
          onClick={() => setShowBuilderModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Catering Quotation Builder</span>
        </button>
      </div>

      {/* Pipeline Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-900/60 border-b border-slate-800 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 text-[11px] block">Total Contract Pipeline</span>
          <div className="font-mono text-base font-bold text-white mt-0.5">
            {formatINR(bookings.reduce((acc, b) => acc + b.totalContractValue, 0))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 text-[11px] block">Advance Collected</span>
          <div className="font-mono text-base font-bold text-emerald-400 mt-0.5">
            {formatINR(bookings.reduce((acc, b) => acc + b.advanceReceivedAmount, 0))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 text-[11px] block">Total Guests Catered</span>
          <div className="font-mono text-base font-bold text-orange-400 mt-0.5">
            {bookings.reduce((acc, b) => acc + b.targetGuestCount, 0)} Plates
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-400 text-[11px] block">Average Margin Target</span>
          <div className="font-mono text-base font-bold text-amber-400 mt-0.5">
            48.5% Gross COGS
          </div>
        </div>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-start">
        {columns.map((col) => {
          const colBookings = bookings.filter((b) => b.contractStatus === col.status);
          return (
            <div
              key={col.status}
              className="w-80 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col max-h-full shrink-0 shadow-lg"
            >
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs text-white">{col.label}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                  {colBookings.length}
                </span>
              </div>

              <div className="p-3 overflow-y-auto space-y-3 flex-1 max-h-[calc(100vh-280px)]">
                {colBookings.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-600">No events in this stage</p>
                ) : (
                  colBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-slate-950 border border-slate-800 hover:border-orange-500/50 rounded-xl p-3.5 space-y-2.5 transition-all text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-white">{b.customerName}</h4>
                          <span className="text-[10px] text-orange-400 font-mono uppercase">
                            {b.eventType.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs text-emerald-400">
                          {formatINR(b.totalContractValue)}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-400 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {new Date(b.eventDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>{b.targetGuestCount} Guests · ₹{b.quotedPricePerPlate}/plate</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{b.venueAddress}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-400">
                          Adv: {formatINR(b.advanceReceivedAmount)}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedBookingForQuote(b)}
                            className="text-orange-400 hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Quote</span>
                          </button>

                          {b.contractStatus === 'PROPOSAL_SENT' && (
                            <button
                              onClick={() => onUpdateStatus(b.id, 'CONFIRMED')}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold"
                            >
                              Confirm
                            </button>
                          )}
                          {b.contractStatus === 'CONFIRMED' && (
                            <button
                              onClick={() => onUpdateStatus(b.id, 'EXECUTED')}
                              className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-semibold"
                            >
                              Execute
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW CATERING QUOTE & INTELLIGENT BOM MODELER MODAL */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Catering Cost & Menu Modeler</h3>
                <p className="text-xs text-slate-400">
                  Dynamic Recipe BOM Calculation & GST-Compliant Estimation
                </p>
              </div>
              <button
                onClick={() => setShowBuilderModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Event Basic Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Customer / Organization Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Contact Phone (WhatsApp)</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="WEDDING">Wedding Sangeet / Reception</option>
                  <option value="CORPORATE_GALA">Corporate Gala / Leadership Summit</option>
                  <option value="BIRTHDAY">Anniversary / Birthday Banquet</option>
                  <option value="COLLEGE_FEST">College Campus Festival</option>
                  <option value="CONFERENCE">Industry Conference</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Target Guest Count (Plates)</label>
                <input
                  type="number"
                  value={targetGuestCount}
                  onChange={(e) => setTargetGuestCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Venue Address</label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Tasting Menu Selections */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 space-y-3 text-xs">
              <span className="font-bold text-white block">Tasting Menu Configuration:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Starters & Kebabs</label>
                  <div className="space-y-1">
                    {['Murgh Tikka Kebab', 'Paneer Tikka Shashlik'].map((item) => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={selectedStarters.includes(item)}
                          onChange={() => {
                            setSelectedStarters((prev) =>
                              prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                            );
                          }}
                          className="accent-orange-500"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Mains & Handis</label>
                  <div className="space-y-1">
                    {['Dal Makhani Handi', 'Paneer Butter Masala', 'Dum Murgh Biryani'].map((item) => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={selectedMains.includes(item)}
                          onChange={() => {
                            setSelectedMains((prev) =>
                              prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                            );
                          }}
                          className="accent-orange-500"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Intelligent Cost Modeling (Margin Slider & Contract Totals) */}
            <div className="bg-orange-950/20 border border-orange-800/40 rounded-xl p-4 mb-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-300">Intelligent Cost & Margin Modeling:</span>
                <span className="font-mono text-slate-300">
                  Target Profit Margin: <strong className="text-orange-400 font-bold">{profitMargin}%</strong>
                </span>
              </div>

              <input
                type="range"
                min="20"
                max="60"
                step="1"
                value={profitMargin}
                onChange={(e) => setProfitMargin(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-orange-900/40 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Raw BOM Cost / Plate</span>
                  <span className="font-bold text-slate-200 text-sm">₹{rawCostPerPlate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Quoted Price / Plate</span>
                  <span className="font-bold text-orange-400 text-base">₹{quotedPricePerPlate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Contract Value</span>
                  <span className="font-bold text-emerald-400 text-base">{formatINR(totalContractValue)}</span>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400 pt-1 font-mono">
                30% Booking Advance Required: <strong className="text-white">{formatINR(advanceRequired)}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBuilderModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBooking}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-orange-600/30 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save & Dispatch Quotation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW QUOTATION MODAL */}
      {selectedBookingForQuote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">GST Catering Estimate & Proposal</h3>
              <button
                onClick={() => setSelectedBookingForQuote(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-white text-slate-900 p-5 rounded-lg font-mono text-[11px] space-y-3">
              <div className="text-center pb-2 border-b border-slate-300">
                <h4 className="font-bold text-sm">DHANPURIYA CATERING SERVICES</h4>
                <p className="text-[10px] text-slate-600">Waterfield Road, Bandra West, Mumbai</p>
                <p className="text-[10px] font-semibold">GSTIN: 27AAAAA0000A1Z5 · SAC: 996337</p>
              </div>

              <div className="flex justify-between">
                <span>Client: {selectedBookingForQuote.customerName}</span>
                <span>Date: {new Date(selectedBookingForQuote.eventDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests: {selectedBookingForQuote.targetGuestCount} Pax</span>
                <span>Rate: ₹{selectedBookingForQuote.quotedPricePerPlate} / plate</span>
              </div>

              <div className="py-2 border-y border-slate-300">
                <span className="font-bold block mb-1">Approved Tasting Menu:</span>
                <p>Starters: {selectedBookingForQuote.selectedStarters.join(', ')}</p>
                <p>Mains: {selectedBookingForQuote.selectedMains.join(', ')}</p>
                <p>Breads: {selectedBookingForQuote.selectedBreads.join(', ')}</p>
                <p>Dessert: {selectedBookingForQuote.selectedDesserts.join(', ')}</p>
              </div>

              <div className="space-y-1 pt-1 font-bold">
                <div className="flex justify-between">
                  <span>Total Contract Value:</span>
                  <span>{formatINR(selectedBookingForQuote.totalContractValue)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Advance Received:</span>
                  <span>{formatINR(selectedBookingForQuote.advanceReceivedAmount)}</span>
                </div>
                <div className="flex justify-between text-orange-700">
                  <span>Balance Payable on Execution:</span>
                  <span>
                    {formatINR(
                      selectedBookingForQuote.totalContractValue -
                        selectedBookingForQuote.advanceReceivedAmount
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  alert(`Quotation dispatched via Interakt WhatsApp API to ${selectedBookingForQuote.customerPhone}`);
                  setSelectedBookingForQuote(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Send via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
