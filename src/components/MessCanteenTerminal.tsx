import React, { useState } from 'react';
import { 
  Scan, 
  CreditCard, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Wallet, 
  ShieldCheck, 
  History,
  Sparkles,
  Search,
  Plus
} from 'lucide-react';
import { 
  MealSlot, 
  StudentMessProfile, 
  MessMealPlan, 
  MessMealLog 
} from '../types/foodos';
import { sound } from '../utils/audioCue';

interface MessCanteenTerminalProps {
  students: StudentMessProfile[];
  mealPlans: MessMealPlan[];
  mealLogs: MessMealLog[];
  onLogMeal: (log: MessMealLog) => void;
  onTopupWallet: (studentId: string, amount: number) => void;
}

export const MessCanteenTerminal: React.FC<MessCanteenTerminalProps> = ({
  students,
  mealPlans,
  mealLogs,
  onLogMeal,
  onTopupWallet,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('DINNER');
  const [manualCardUid, setManualCardUid] = useState<string>('');
  const [activeVerification, setActiveVerification] = useState<{
    status: 'SUCCESS' | 'DENIED_EXPIRED' | 'DUPLICATE_ALERT' | 'NOT_FOUND';
    student?: StudentMessProfile;
    message: string;
    timestamp: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'punch' | 'directory' | 'plans'>('punch');
  const [searchStudent, setSearchStudent] = useState<string>('');

  const mealSlots: { id: MealSlot; label: string; timing: string }[] = [
    { id: 'BREAKFAST', label: 'Breakfast', timing: '07:30 - 10:00' },
    { id: 'LUNCH', label: 'Lunch Handi', timing: '12:30 - 15:00' },
    { id: 'EVENING_SNACKS', label: 'Evening Snacks & Chai', timing: '17:00 - 18:30' },
    { id: 'DINNER', label: 'Dinner Handi', timing: '20:00 - 22:30' },
  ];

  const handlePunchCard = (cardUid: string) => {
    const student = students.find((s) => s.rfidCardUid.toUpperCase() === cardUid.toUpperCase().trim());
    const nowIso = new Date().toISOString();

    if (!student) {
      sound.playRfidDenied();
      setActiveVerification({
        status: 'NOT_FOUND',
        message: 'Unknown RFID Card UID: No student record registered in university database.',
        timestamp: nowIso,
      });
      return;
    }

    // Check expiration date
    const expiryDate = new Date(student.subscriptionEndDate);
    const isExpired = expiryDate < new Date('2026-10-01');

    if (isExpired || student.isSuspended) {
      sound.playRfidDenied();
      setActiveVerification({
        status: 'DENIED_EXPIRED',
        student,
        message: `Plan Expired on ${student.subscriptionEndDate}. Please renew subscription at Mess Office.`,
        timestamp: nowIso,
      });
      return;
    }

    // Check duplicate punch in same slot today
    const alreadyPunched = mealLogs.some(
      (log) =>
        log.studentProfileId === student.id &&
        log.mealSlot === selectedSlot &&
        new Date(log.consumedAt).toDateString() === new Date().toDateString()
    );

    if (alreadyPunched) {
      sound.playAlertGong();
      setActiveVerification({
        status: 'DUPLICATE_ALERT',
        student,
        message: `Duplicate Tap Warning: ${student.fullName} has already consumed ${selectedSlot} today!`,
        timestamp: nowIso,
      });
      return;
    }

    // Verified successfully
    sound.playRfidSuccess();
    setActiveVerification({
      status: 'SUCCESS',
      student,
      message: `Access Granted! Welcome to ${selectedSlot.replace('_', ' ')}.`,
      timestamp: nowIso,
    });

    const newLog: MessMealLog = {
      id: `log_${Date.now()}`,
      branchId: 'br_powai_mess_03',
      studentProfileId: student.id,
      studentName: student.fullName,
      rollNumber: student.rollNumber,
      mealSlot: selectedSlot,
      consumedAt: nowIso,
      deviceVerificationMethod: 'RFID_SCAN',
      billingStatus: 'INCLUDED_IN_PLAN',
      notes: `Reader RDR_MESS_GATE_02 · Verified`,
    };

    onLogMeal(newLog);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.hostelBlockRoom.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Banner: Meal Slot selection and stats */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-orange-400" />
          <h2 className="font-bold text-white tracking-wide">
            HOSTEL MESS & CANTEEN · RFID VALIDATION TERMINAL
          </h2>
          <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded font-mono">
            GATE #02 (RDR_MESS_GATE_02)
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('punch')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'punch'
                ? 'bg-orange-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Live RFID Tap Reader
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'directory'
                ? 'bg-orange-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Student Directory ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'plans'
                ? 'bg-orange-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Meal Subscription Plans
          </button>
        </div>
      </div>

      {activeTab === 'punch' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT: RFID Hardware Reader Simulator & Punch Cards */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 border-r border-slate-800">
            {/* Meal Slot Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-xs text-slate-400 font-medium block mb-2">
                Active Meal Slot (Attendance Logging Window):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {mealSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedSlot === slot.id
                        ? 'border-orange-500 bg-orange-600/20 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs">{slot.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {slot.timing}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick One-Click Student RFID Card Tap Buttons */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-orange-400" />
                  <span>Simulate RFID / NFC Smartcard Tap (Gate Sensor)</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
                  Reader Ready
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {students.map((std) => (
                  <button
                    key={std.id}
                    onClick={() => handlePunchCard(std.rfidCardUid)}
                    className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/60 rounded-xl text-left transition-all group flex items-start gap-3 active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-orange-400 shrink-0">
                      {std.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white group-hover:text-orange-400 truncate">
                          {std.fullName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {std.rollNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {std.hostelBlockRoom}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
                        <span className="text-slate-400">{std.planName.split(' ')[0]}</span>
                        <span className="text-orange-300">Tap to Punch &gt;</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Manual Custom UID input */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={manualCardUid}
                  onChange={(e) => setManualCardUid(e.target.value)}
                  placeholder="Enter manual 24-digit RFID UID (e.g. E280117000000208226068AA)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={() => {
                    if (manualCardUid) handlePunchCard(manualCardUid);
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Punch Card
                </button>
              </div>
            </div>

            {/* Recent Attendance Punch Log Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-400" />
                  <span>Real-Time Gate Punch Logs (Audit Trail)</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Total Today: {mealLogs.length} meals served
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Roll No</th>
                      <th className="pb-2">Student</th>
                      <th className="pb-2">Slot</th>
                      <th className="pb-2">Method</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {mealLogs.slice(0, 8).map((log) => (
                      <tr key={log.id} className="text-slate-300">
                        <td className="py-2 text-slate-400 text-[11px]">
                          {new Date(log.consumedAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="py-2 font-semibold text-white">{log.rollNumber}</td>
                        <td className="py-2 text-slate-200">{log.studentName}</td>
                        <td className="py-2 text-orange-400">{log.mealSlot}</td>
                        <td className="py-2 text-[10px] text-slate-400">
                          {log.deviceVerificationMethod}
                        </td>
                        <td className="py-2">
                          <span className="text-[10px] bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 px-1.5 py-0.5 rounded">
                            {log.billingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Visual Verification Terminal Screen */}
          <div className="w-full lg:w-96 bg-slate-900 p-5 flex flex-col justify-between shrink-0">
            <div>
              <div className="text-center pb-3 border-b border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Canteen Entry Turnstile Display
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  Reader Station #02 Screen
                </h3>
              </div>

              {/* Status Display Card */}
              {activeVerification ? (
                <div className="mt-5 space-y-4">
                  {/* Status Banner */}
                  <div
                    className={`p-3.5 rounded-xl border text-center font-bold text-sm flex items-center justify-center gap-2 ${
                      activeVerification.status === 'SUCCESS'
                        ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                        : activeVerification.status === 'DUPLICATE_ALERT'
                        ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                        : 'bg-rose-950/60 border-rose-700 text-rose-300'
                    }`}
                  >
                    {activeVerification.status === 'SUCCESS' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span>
                      {activeVerification.status === 'SUCCESS'
                        ? 'ACCESS GRANTED'
                        : activeVerification.status === 'DUPLICATE_ALERT'
                        ? 'DUPLICATE PUNCH'
                        : 'PUNCH REJECTED'}
                    </span>
                  </div>

                  {/* Student Details Card */}
                  {activeVerification.student && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center space-y-3">
                      {/* Avatar */}
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 p-0.5 shadow-xl">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl font-bold text-white">
                          {activeVerification.student.fullName.charAt(0)}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-white">
                          {activeVerification.student.fullName}
                        </h4>
                        <p className="font-mono text-xs text-orange-400">
                          {activeVerification.student.rollNumber}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {activeVerification.student.hostelBlockRoom}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Meal Plan:</span>
                          <span className="font-medium text-slate-200">
                            {activeVerification.student.planName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Valid Till:</span>
                          <span className="font-mono text-slate-200">
                            {activeVerification.student.subscriptionEndDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Prepaid Wallet:</span>
                          <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-400">
                            <Wallet className="w-3.5 h-3.5" />
                            <span>₹{activeVerification.student.walletPrepaidBalance.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 text-center px-2">
                    {activeVerification.message}
                  </p>
                </div>
              ) : (
                <div className="my-16 text-center text-slate-500 space-y-2">
                  <Scan className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                  <p className="text-xs font-medium text-slate-400">
                    Awaiting Student NFC / RFID Tap...
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Touch smartcard or university identity badge to reader.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
              FSSAI Campus Safe Food Certified · IIT Powai Cluster
            </div>
          </div>
        </div>
      )}

      {/* DIRECTORY TAB */}
      {activeTab === 'directory' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between gap-4 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Search by student name, roll number, or hostel room..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStudents.map((std) => (
              <div
                key={std.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">{std.fullName}</h4>
                    <span className="font-mono text-xs text-orange-400">{std.rollNumber}</span>
                    <p className="text-xs text-slate-400 mt-1">{std.hostelBlockRoom}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                      UID: {std.rfidCardUid}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono block mb-1">
                      {std.planName.split(' ')[0]}
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-400">
                      ₹{std.walletPrepaidBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Valid: {std.subscriptionEndDate}
                  </span>
                  <button
                    onClick={() => onTopupWallet(std.id, 500)}
                    className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-orange-400 px-2.5 py-1 rounded font-semibold transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Topup ₹500</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl">
            {mealPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div>
                  <h3 className="font-bold text-base text-white">{plan.planName}</h3>
                  <div className="mt-2 font-mono text-2xl font-bold text-orange-400">
                    ₹{plan.monthlySubscriptionPrice}
                    <span className="text-xs text-slate-400 font-normal"> / month</span>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Breakfast (07:30 - 10:00):</span>
                      <span className={plan.includedBreakfast ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {plan.includedBreakfast ? 'Included' : 'Excluded'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Lunch Handi (12:30 - 15:00):</span>
                      <span className={plan.includedLunch ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {plan.includedLunch ? 'Included' : 'Excluded'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Evening Snacks & Chai:</span>
                      <span className={plan.includedSnacks ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {plan.includedSnacks ? 'Included' : 'Excluded'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Dinner Handi (20:00 - 22:30):</span>
                      <span className={plan.includedDinner ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {plan.includedDinner ? 'Included' : 'Excluded'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Plan "${plan.planName}" is currently active for campus admissions.`)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Manage Subscribers
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
