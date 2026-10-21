import React from 'react';
import {
  ShieldAlert,
  Building2,
  CreditCard,
  ChefHat,
  Users,
  KeyRound,
  FileText,
  Settings,
  UtensilsCrossed,
  Truck,
  Package,
  Layers,
  BarChart3,
  QrCode,
  LayoutGrid,
  ClipboardList,
  Clock,
  MapPin,
  Wallet,
  Gift,
  History,
  PhoneCall,
  BellRing,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { UserRole, UserAccount } from '../types/rbac';

interface SidebarProps {
  currentRole: UserRole;
  currentUser: UserAccount;
  activeView: string;
  onSelectView: (viewId: string) => void;
  pendingDeliveriesCount?: number;
  pendingServiceRequestsCount?: number;
  activeKotsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentUser,
  activeView,
  onSelectView,
  pendingDeliveriesCount = 0,
  pendingServiceRequestsCount = 0,
  activeKotsCount = 0,
}) => {
  // Navigation menus customized per role
  const getNavItems = () => {
    switch (currentRole) {
      case 'SUPER_ADMIN':
        return [
          { id: 'super_overview', label: 'Master Overview', icon: ShieldAlert },
          { id: 'super_businesses', label: 'Businesses & Tenants', icon: Building2 },
          { id: 'super_subscriptions', label: 'Plans & MRR Revenue', icon: DollarSign },
          { id: 'super_users', label: 'Staff & Roles Management', icon: Users },
          { id: 'super_menus', label: 'Global Menu & Prices', icon: UtensilsCrossed },
          { id: 'super_orders', label: 'All Platform Orders', icon: ClipboardList },
          { id: 'super_permissions', label: 'RBAC Permission Matrix', icon: KeyRound },
          { id: 'super_audit', label: 'Live Audit Log Trail', icon: FileText },
          { id: 'super_settings', label: 'Gateways & System Config', icon: Settings },
          { id: 'super_architecture', label: 'Architecture & System Blueprint', icon: BookOpen },
        ];

      case 'BUSINESS_OWNER':
        return [
          { id: 'owner_overview', label: 'Executive Dashboard', icon: BarChart3 },
          { id: 'owner_branches', label: 'Branches Network', icon: Building2 },
          { id: 'owner_staff', label: 'Staff & Roles', icon: Users },
          { id: 'owner_menu', label: 'Menu & Prices', icon: UtensilsCrossed },
          { id: 'owner_orders', label: 'All Orders Ledger', icon: ClipboardList },
          { id: 'owner_inventory', label: 'Inventory & Recipe BOM', icon: Package },
          { id: 'owner_catering', label: 'Catering Pipeline', icon: Layers },
          { id: 'owner_delivery', label: 'Delivery Logistics', icon: Truck },
          { id: 'owner_reports', label: 'Finance & Tax Reports', icon: FileText },
        ];

      case 'BRANCH_MANAGER':
        return [
          { id: 'mgr_overview', label: 'Branch Console', icon: BarChart3 },
          { id: 'mgr_qr_generator', label: 'Dynamic Table QR Generator', icon: QrCode },
          { id: 'mgr_orders', label: 'Live Orders Queue', icon: ClipboardList },
          { id: 'mgr_tables', label: 'Floor Plan & Tables', icon: LayoutGrid },
          { id: 'mgr_staff', label: 'Staff on Shift', icon: Users },
          { id: 'mgr_inventory', label: 'Stock Alerts & GRN', icon: Package },
          { id: 'mgr_kitchen', label: 'Kitchen KDS Oversight', icon: ChefHat },
        ];

      case 'CASHIER':
        return [
          { id: 'cashier_pos', label: 'Sub-Second POS Counter', icon: CreditCard },
          { id: 'cashier_tables', label: 'Dine-In Table Map', icon: LayoutGrid },
          { id: 'cashier_queue', label: 'Billing Queue', icon: Clock },
          { id: 'cashier_tokens', label: 'Daily Token Engine', icon: QrCode },
        ];

      case 'KITCHEN_STAFF':
        return [
          { id: 'kitchen_kds', label: 'All Kitchen Stations', icon: ChefHat, badge: activeKotsCount },
          { id: 'kitchen_tandoor', label: 'Tandoor & Kebab Line', icon: UtensilsCrossed },
          { id: 'kitchen_main', label: 'Main Handi & Gravy', icon: Package },
          { id: 'kitchen_bev', label: 'Chai & Beverage Bar', icon: Clock },
        ];

      case 'WAITER':
        return [
          { id: 'waiter_tables', label: 'Floor Seating Grid', icon: LayoutGrid },
          { id: 'waiter_take_order', label: 'Table Order Pad', icon: ClipboardList },
          { id: 'waiter_requests', label: 'Guest Service Calls', icon: BellRing, badge: pendingServiceRequestsCount },
        ];

      case 'DELIVERY_PARTNER':
        return [
          { id: 'delivery_assigned', label: 'Assigned Deliveries', icon: Truck, badge: pendingDeliveriesCount },
          { id: 'delivery_route', label: 'Route Map & Directions', icon: MapPin },
          { id: 'delivery_earnings', label: 'Earnings & Tips (UPI)', icon: DollarSign },
        ];

      case 'CUSTOMER':
        return [
          { id: 'customer_menu', label: 'Explore Food Menu', icon: UtensilsCrossed },
          { id: 'customer_track', label: 'Track Active Orders', icon: Clock },
          { id: 'customer_wallet', label: 'Dhanpuriya Wallet & UPI', icon: Wallet },
          { id: 'customer_loyalty', label: 'Loyalty Rewards', icon: Gift },
          { id: 'customer_history', label: 'Order History & Invoices', icon: History },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const roleBadgeInfo: Record<UserRole, { label: string; color: string }> = {
    SUPER_ADMIN: { label: 'SUPER ADMIN (ROOT)', color: 'bg-rose-950/80 border-rose-700/80 text-rose-300' },
    BUSINESS_OWNER: { label: 'BUSINESS OWNER', color: 'bg-purple-950/80 border-purple-700/80 text-purple-300' },
    BRANCH_MANAGER: { label: 'BRANCH MANAGER', color: 'bg-blue-950/80 border-blue-700/80 text-blue-300' },
    CASHIER: { label: 'CASHIER (POS)', color: 'bg-amber-950/80 border-amber-700/80 text-amber-300' },
    KITCHEN_STAFF: { label: 'CHEF (KDS)', color: 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300' },
    WAITER: { label: 'WAITER / CAPTAIN', color: 'bg-indigo-950/80 border-indigo-700/80 text-indigo-300' },
    DELIVERY_PARTNER: { label: 'DELIVERY RIDER', color: 'bg-orange-950/80 border-orange-700/80 text-orange-300' },
    CUSTOMER: { label: 'DINING CUSTOMER', color: 'bg-teal-950/80 border-teal-700/80 text-teal-300' },
  };

  const badge = roleBadgeInfo[currentRole];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none text-slate-100">
      {/* Top Sidebar Header with Role Tag */}
      <div>
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Active Security Scope
            </span>
          </div>
          <div className={`px-2.5 py-1 rounded-md border text-xs font-bold font-mono tracking-wide ${badge.color}`}>
            {badge.label}
          </div>
          {currentUser.businessName && (
            <p className="text-[11px] text-slate-400 mt-2 truncate font-medium">
              {currentUser.businessName}
            </p>
          )}
          {currentUser.branchName && (
            <p className="text-[10px] text-slate-500 truncate">
              {currentUser.branchName}
            </p>
          )}
        </div>

        {/* Dynamic Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-white text-orange-600' : 'bg-rose-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="font-semibold text-xs text-white truncate">{currentUser.fullName}</h5>
            <p className="text-[10px] font-mono text-slate-400 truncate">{currentUser.phoneNumber}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
