import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Wifi, 
  WifiOff, 
  UserCircle2, 
  QrCode, 
  Layers, 
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  ShieldAlert,
  BookOpen,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Branch } from '../types/foodos';
import { UserRole, UserAccount } from '../types/rbac';

interface HeaderProps {
  branches: Branch[];
  currentBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  currentRole: UserRole;
  currentUser: UserAccount;
  isOnline: boolean;
  onToggleOnline: () => void;
  offlineQueueCount: number;
  onOpenSyncModal: () => void;
  onOpenCustomerQr: () => void;
  onOpenLoginModal: () => void;
  onOpenArchitectureModal: () => void;
  impersonatingFromUser?: UserAccount | null;
  onStopImpersonating?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  branches,
  currentBranch,
  onSelectBranch,
  currentRole,
  currentUser,
  isOnline,
  onToggleOnline,
  offlineQueueCount,
  onOpenSyncModal,
  onOpenCustomerQr,
  onOpenLoginModal,
  onOpenArchitectureModal,
  impersonatingFromUser,
  onStopImpersonating,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Impersonation Banner */}
      {impersonatingFromUser && (
        <div className="bg-amber-600 text-slate-950 font-bold px-4 py-1.5 text-xs flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>
              Impersonation Active: You are currently viewing as <strong>{currentUser.fullName} ({currentRole})</strong>.
            </span>
          </div>
          <button
            onClick={onStopImpersonating}
            className="px-3 py-0.5 bg-slate-950 text-amber-300 rounded text-[11px] font-bold hover:bg-slate-900 transition-colors"
          >
            ← Exit & Return to Super Admin
          </button>
        </div>
      )}

      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          {/* Left: Brand Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white shadow-lg shadow-orange-600/30 text-base">
              D
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">Dhanpuriya</span>
                <span className="text-[10px] font-mono text-orange-400 bg-orange-950/80 border border-orange-800/60 px-1 py-0.2 rounded font-bold">
                  FoodOS™ RBAC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block truncate">
                {currentUser.businessName || 'Enterprise Root Node'}
              </p>
            </div>
          </div>

          {/* Center: Branch Selector (if multi-branch scope permitted) */}
          <div className="flex items-center gap-2">
            {currentRole !== 'SUPER_ADMIN' && currentRole !== 'CUSTOMER' && (
              <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
                <Building2 className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <select
                  value={currentBranch.id}
                  onChange={(e) => {
                    const b = branches.find((br) => br.id === e.target.value);
                    if (b) onSelectBranch(b);
                  }}
                  className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1 text-xs"
                  aria-label="Select Restaurant Branch"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                      {b.branchName} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Architecture Blueprint Trigger */}
            <button
              onClick={onOpenArchitectureModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-colors"
              title="View Complete System Architecture & RBAC Specifications"
            >
              <BookOpen className="w-3.5 h-3.5 text-orange-400" />
              <span>System Blueprint</span>
            </button>
          </div>

          {/* Right: Role Switcher & User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Customer QR preview trigger */}
            <button
              onClick={onOpenCustomerQr}
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-colors"
              title="Preview Customer Mobile QR Contactless Menu"
            >
              <QrCode className="w-3.5 h-3.5 text-orange-400" />
              <span>Table QR</span>
            </button>

            {/* Network Resilience Mode Toggle */}
            <button
              onClick={onToggleOnline}
              className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg border transition-all ${
                isOnline
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/70 border-amber-600/70 text-amber-300 hover:bg-amber-900/70'
              }`}
              title={isOnline ? 'Cloud DB Active (Aurora RLS)' : 'Offline Local Queue (ULID Vector)'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span className="hidden xl:inline text-[11px]">Cloud</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span className="hidden xl:inline text-[11px]">Offline</span>
                </>
              )}
            </button>

            {/* Offline Sync Buffer Pill */}
            {offlineQueueCount > 0 && (
              <button
                onClick={onOpenSyncModal}
                className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-mono hover:bg-amber-500/30 transition-colors"
              >
                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                <span>{offlineQueueCount}</span>
              </button>
            )}

            {/* Role Switcher Button */}
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 rounded-lg text-xs font-semibold transition-all shadow-sm"
              title="Switch user role or log in as another profile"
            >
              <UserCircle2 className="w-4 h-4 text-orange-400" />
              <div className="text-left hidden md:block">
                <span className="text-[11px] text-white block leading-tight font-bold">
                  {currentUser.fullName.split(' ')[0]}
                </span>
                <span className="text-[9px] font-mono text-orange-400 block leading-tight">
                  {currentRole.replace('_', ' ')}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 md:ml-1">Switch ▾</span>
            </button>

            {/* Real-time Clock */}
            <div className="hidden lg:flex items-center gap-1 font-mono text-[11px] text-slate-300 bg-slate-950/70 px-2 py-1 rounded border border-slate-800">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{time}</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
