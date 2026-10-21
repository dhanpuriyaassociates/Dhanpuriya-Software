import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCircle2, 
  Building2, 
  ChefHat, 
  CreditCard, 
  Truck, 
  Users, 
  Smartphone,
  X,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { UserRole, UserAccount } from '../types/rbac';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  onSelectUser: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  onSelectUser,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98201 11222');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVal, setOtpVal] = useState<string>('420911');

  if (!isOpen) return null;

  const roleDescriptions: Record<UserRole, { title: string; subtitle: string; icon: any }> = {
    SUPER_ADMIN: {
      title: 'Super Admin (Root Master)',
      subtitle: 'Complete platform control, all tenants, global menus, user impersonation & audit logs.',
      icon: ShieldCheck,
    },
    BUSINESS_OWNER: {
      title: 'Business Owner (Tenant Admin)',
      subtitle: 'Manage branches, staff, menus, inventory, catering, and business financials.',
      icon: Building2,
    },
    BRANCH_MANAGER: {
      title: 'Branch Manager',
      subtitle: 'Branch sales, live order queue, floor plan, staff shifts & store room alerts.',
      icon: Users,
    },
    CASHIER: {
      title: 'Cashier (POS Operator)',
      subtitle: 'Sub-second POS counter, table checkout, tokens, and thermal tax invoices.',
      icon: CreditCard,
    },
    KITCHEN_STAFF: {
      title: 'Kitchen Staff (KDS Master)',
      subtitle: 'Multi-station KDS line, prep timers, warning alerts & bump bar dispatch.',
      icon: ChefHat,
    },
    WAITER: {
      title: 'Captain & Waiter',
      subtitle: 'Handheld table floor grid, order taking pad, and guest service call queue.',
      icon: Users,
    },
    DELIVERY_PARTNER: {
      title: 'Delivery Partner',
      subtitle: 'Assigned deliveries, route directions, OTP handover verification & earnings.',
      icon: Truck,
    },
    CUSTOMER: {
      title: 'Dining Customer',
      subtitle: 'Online menu ordering, live order tracker, prepaid wallet & loyalty points.',
      icon: Smartphone,
    },
  };

  const handleOtpVerify = () => {
    // Find matching user or fallback to owner
    const matched = users.find((u) => u.phoneNumber.includes(phoneNumber.slice(-5))) || users[1];
    onSelectUser(matched);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase bg-orange-950 text-orange-400 border border-orange-800 px-2 py-0.5 rounded font-bold">
              Multi-Role Authentication Engine
            </span>
            <h2 className="text-base font-bold text-white mt-1">
              FoodOS™ Role-Based Access Control (RBAC) Switcher
            </h2>
            <p className="text-xs text-slate-400">
              Select any role to experience dedicated logins, custom sidebars, APIs, and permissions.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Fast Login Grid */}
        <div>
          <span className="text-xs font-bold text-slate-300 block mb-2.5">
            1-Click Instant Login as Role:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {users.map((u) => {
              const info = roleDescriptions[u.role];
              const Icon = info.icon;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u);
                    onClose();
                  }}
                  className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/60 rounded-xl text-left transition-all group flex items-start gap-3 active:scale-[0.99]"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white group-hover:text-orange-400 truncate">
                        {info.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                      {u.fullName} · {u.phoneNumber}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {info.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* OTP Login Form Simulation */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-200 block">
            Or Sign In via Fast2SMS / Twilio Phone OTP (+91 Bharat-First):
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98200 XXXXX"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
            />
            {!otpSent ? (
              <button
                onClick={() => setOtpSent(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Send 6-Digit OTP
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpVal}
                  onChange={(e) => setOtpVal(e.target.value)}
                  className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs font-mono font-bold text-white text-center tracking-widest focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={handleOtpVerify}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  Verify & Enter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
