import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  Plus, 
  Ban, 
  CheckCircle, 
  Trash2, 
  UserCheck, 
  KeyRound, 
  FileText, 
  Settings, 
  Sparkles,
  Search,
  BookOpen,
  ClipboardList,
  Edit,
  UtensilsCrossed,
  CreditCard,
  Percent,
  Check,
  X,
  Phone,
  Mail,
  Smartphone,
  MessageSquare,
  Activity,
  Layers
} from 'lucide-react';
import { 
  BusinessTenant, 
  SubscriptionPlan, 
  UserAccount, 
  AuditLogEntry, 
  RolePermissions, 
  AppModule, 
  PermissionAction,
  UserRole
} from '../../types/rbac';
import { MenuItem, Order } from '../../types/foodos';
import { formatINR } from '../../utils/taxEngine';
import { ALL_APP_MODULES } from '../../data/rbacInitialData';

interface SuperAdminDashboardProps {
  tenants: BusinessTenant[];
  plans: SubscriptionPlan[];
  users: UserAccount[];
  auditLogs: AuditLogEntry[];
  permissionsMatrix: Record<UserRole, RolePermissions>;
  menuItems: MenuItem[];
  orders?: Order[];
  onToggleTenantStatus: (tenantId: string) => void;
  onDeleteTenant: (tenantId: string) => void;
  onCreateTenant: (tenant: Omit<BusinessTenant, 'id' | 'createdAt' | 'monthlyRevenue' | 'totalOrders' | 'branchesCount'>) => void;
  onUpdateMenuItemPrice: (itemId: string, newPrice: number) => void;
  onUpdateMenuItem?: (item: MenuItem) => void;
  onAddMenuItem?: (item: MenuItem) => void;
  onDeleteMenuItem?: (itemId: string) => void;
  onUpdateUserRole?: (userId: string, newRole: UserRole) => void;
  onUpdateUserDetails?: (userId: string, data: Partial<UserAccount>) => void;
  onCreateUser?: (user: UserAccount) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: string) => void;
  onUpdatePermission: (role: UserRole, module: AppModule, action: PermissionAction, value: boolean) => void;
  onImpersonateUser: (user: UserAccount) => void;
  activeView: string;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  tenants,
  plans,
  users,
  auditLogs,
  permissionsMatrix,
  menuItems,
  orders = [],
  onToggleTenantStatus,
  onDeleteTenant,
  onCreateTenant,
  onUpdateMenuItemPrice,
  onUpdateMenuItem,
  onAddMenuItem,
  onDeleteMenuItem,
  onUpdateUserRole,
  onUpdateUserDetails,
  onCreateUser,
  onDeleteUser,
  onUpdateOrderStatus,
  onUpdatePermission,
  onImpersonateUser,
  activeView,
}) => {
  // New Tenant Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newBizName, setNewBizName] = useState<string>('');
  const [newBizSlug, setNewBizSlug] = useState<string>('');
  const [newBizOwner, setNewBizOwner] = useState<string>('');
  const [newBizEmail, setNewBizEmail] = useState<string>('');
  const [newBizPhone, setNewBizPhone] = useState<string>('+91 98200 ');
  const [newBizGstin, setNewBizGstin] = useState<string>('27XXXXX0000X1Z1');
  const [newBizPlan, setNewBizPlan] = useState<string>('plan_growth');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<UserRole>('BUSINESS_OWNER');

  // Price override modal state
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; price: number } | null>(null);
  const [overridePriceVal, setOverridePriceVal] = useState<number>(0);

  // Edit / Add Dish Modal State
  const [showDishModal, setShowDishModal] = useState<boolean>(false);
  const [editingDishItem, setEditingDishItem] = useState<MenuItem | null>(null);
  const [dishCode, setDishCode] = useState<string>('');
  const [dishName, setDishName] = useState<string>('');
  const [dishCategory, setDishCategory] = useState<string>('Curries & Gravies');
  const [dishPrice, setDishPrice] = useState<number>(200);
  const [dishIsVeg, setDishIsVeg] = useState<boolean>(true);
  const [dishDesc, setDishDesc] = useState<string>('');

  // Staff / User Management Modal State
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingTargetUser, setEditingTargetUser] = useState<UserAccount | null>(null);
  const [userFullName, setUserFullName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('+91 ');
  const [userRole, setUserRole] = useState<UserRole>('CASHIER');
  const [userBusinessName, setUserBusinessName] = useState<string>('Dhanpuriya Foods & Hospitality Ltd.');

  // Settings State
  const [razorpayKey, setRazorpayKey] = useState<string>('rzp_live_981248712349');
  const [razorpaySecret, setRazorpaySecret] = useState<string>('••••••••••••••••••••••••');
  const [whatsappApiToken, setWhatsappApiToken] = useState<string>('interakt_prod_token_live_891724');
  const [fast2smsApiKey, setFast2smsApiKey] = useState<string>('f2s_live_auth_key_dhanpuriya');
  const [smsSenderId, setSmsSenderId] = useState<string>('DHNPUR');
  const [defaultCgst, setDefaultCgst] = useState<number>(2.5);
  const [defaultSgst, setDefaultSgst] = useState<number>(2.5);
  const [defaultIgst, setDefaultIgst] = useState<number>(18.0);
  const [appName, setAppName] = useState<string>('Dhanpuriya');
  const [appTagline, setAppTagline] = useState<string>('FoodOS™ Enterprise Restaurant & Mess Operating System');
  const [savedSettingsNotice, setSavedSettingsNotice] = useState<boolean>(false);

  // Metrics computation for widgets
  const totalGMV = tenants.reduce((acc, t) => acc + t.monthlyRevenue, 0);
  const totalOrdersCount = tenants.reduce((acc, t) => acc + t.totalOrders, 0) + orders.length;
  const activeTenantsCount = tenants.filter((t) => t.status === 'ACTIVE').length;
  const activeUsersCount = users.filter((u) => u.isActive).length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName || !newBizOwner) return;
    const plan = plans.find((p) => p.id === newBizPlan) || plans[0];
    onCreateTenant({
      businessName: newBizName,
      slug: newBizSlug || newBizName.toLowerCase().replace(/\s+/g, '-'),
      ownerName: newBizOwner,
      ownerEmail: newBizEmail || `${newBizOwner.toLowerCase().replace(/\s+/g, '')}@foodos.in`,
      ownerPhone: newBizPhone,
      gstin: newBizGstin,
      panNumber: 'AABCP1234X',
      status: 'ACTIVE',
      planId: plan.id,
      planName: plan.planName,
    });
    setShowCreateModal(false);
    setNewBizName('');
    setNewBizOwner('');
  };

  const handleSavePriceOverride = () => {
    if (editingItem && overridePriceVal > 0) {
      onUpdateMenuItemPrice(editingItem.id, overridePriceVal);
      setEditingItem(null);
    }
  };

  const handleOpenAddDish = () => {
    setEditingDishItem(null);
    setDishCode(String(menuItems.length + 101));
    setDishName('');
    setDishCategory('Curries & Gravies');
    setDishPrice(240);
    setDishIsVeg(true);
    setDishDesc('');
    setShowDishModal(true);
  };

  const handleOpenEditDish = (item: MenuItem) => {
    setEditingDishItem(item);
    setDishCode(item.itemCode);
    setDishName(item.name);
    setDishCategory(item.categoryName);
    setDishPrice(item.basePrice);
    setDishIsVeg(item.isVeg);
    setDishDesc(item.description || '');
    setShowDishModal(true);
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName) return;

    if (editingDishItem && onUpdateMenuItem) {
      onUpdateMenuItem({
        ...editingDishItem,
        itemCode: dishCode,
        name: dishName,
        categoryName: dishCategory,
        basePrice: dishPrice,
        isVeg: dishIsVeg,
        description: dishDesc,
      });
    } else if (!editingDishItem && onAddMenuItem) {
      const newItem: MenuItem = {
        id: `mi_${Date.now()}`,
        tenantId: 'ten_01HZX87K9W1234567890ABCDEF',
        itemCode: dishCode,
        name: dishName,
        categoryId: 'cat_01',
        categoryName: dishCategory,
        basePrice: dishPrice,
        isVeg: dishIsVeg,
        isEgg: false,
        packagingCharges: 0,
        isAvailable: true,
        preparationTimeMinutes: 12,
        stationTag: 'MAIN_KITCHEN',
        description: dishDesc,
      };
      onAddMenuItem(newItem);
    } else {
      // fallback to price update if item existed
      if (editingDishItem) {
        onUpdateMenuItemPrice(editingDishItem.id, dishPrice);
      }
    }
    setShowDishModal(false);
  };

  const handleOpenAddUser = () => {
    setEditingTargetUser(null);
    setUserFullName('');
    setUserEmail('');
    setUserPhone('+91 98200 ');
    setUserRole('CASHIER');
    setUserBusinessName('Dhanpuriya Foods & Hospitality Ltd.');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: UserAccount) => {
    setEditingTargetUser(user);
    setUserFullName(user.fullName);
    setUserEmail(user.email);
    setUserPhone(user.phoneNumber);
    setUserRole(user.role);
    setUserBusinessName(user.businessName || 'Dhanpuriya Foods & Hospitality Ltd.');
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFullName) return;

    if (editingTargetUser && onUpdateUserDetails) {
      onUpdateUserDetails(editingTargetUser.id, {
        fullName: userFullName,
        email: userEmail,
        phoneNumber: userPhone,
        role: userRole,
        businessName: userBusinessName,
      });
      if (editingTargetUser.role !== userRole && onUpdateUserRole) {
        onUpdateUserRole(editingTargetUser.id, userRole);
      }
    } else if (!editingTargetUser && onCreateUser) {
      const newUser: UserAccount = {
        id: `usr_${Date.now()}`,
        fullName: userFullName,
        email: userEmail || `${userFullName.toLowerCase().replace(/\s+/g, '')}@foodos.in`,
        phoneNumber: userPhone,
        role: userRole,
        businessId: 'biz_01_dhanpuriya',
        businessName: userBusinessName,
        avatarSeed: userFullName,
        isActive: true,
      };
      onCreateUser(newUser);
    }
    setShowUserModal(false);
  };

  const handleSaveSettings = () => {
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
      {/* Super Admin Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-600/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                {appName} · Super Admin Master Control Console
              </h1>
              <p className="text-xs text-slate-400">
                Full root governance across all businesses, staff, roles, menus, prices, and orders.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddDish}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />
            <span>+ Add Menu Dish</span>
          </button>
          <button
            onClick={handleOpenAddUser}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>+ Add Staff Member</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Business</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          8 DASHBOARD WIDGETS SPECIFIED BY USER:
          1. Total Businesses
          2. Active Businesses
          3. Total Orders
          4. Revenue
          5. Active Users
          6. Subscriptions
          7. Payment Analytics
          8. Business Growth
         ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
            Master KPI Telemetry & Analytics Widgets
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">● All Micro-Daemons Operational</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* 1. Total Businesses */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <span className="text-[11px] text-slate-400 block font-medium flex items-center justify-between">
              <span>Total Businesses</span>
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
            </span>
            <div className="font-mono text-2xl font-bold text-white mt-1">
              {tenants.length} <span className="text-xs text-slate-400 font-sans font-normal">Entities</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">
              Across Mumbai, Delhi & Bangalore
            </span>
          </div>

          {/* 2. Active Businesses */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <span className="text-[11px] text-slate-400 block font-medium flex items-center justify-between">
              <span>Active Businesses</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="font-mono text-2xl font-bold text-emerald-400 mt-1">
              {activeTenantsCount} <span className="text-xs text-slate-400 font-sans font-normal">Active</span>
            </div>
            <span className="text-[10px] text-emerald-400/90 block mt-1 font-mono">
              {tenants.length - activeTenantsCount > 0 ? `${tenants.length - activeTenantsCount} Suspended` : '100% Operational'}
            </span>
          </div>

          {/* 3. Total Orders */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <span className="text-[11px] text-slate-400 block font-medium flex items-center justify-between">
              <span>Total Orders</span>
              <ClipboardList className="w-3.5 h-3.5 text-orange-400" />
            </span>
            <div className="font-mono text-2xl font-bold text-orange-400 mt-1">
              {totalOrdersCount.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">
              Dine-In, QSR, Mess & Catering
            </span>
          </div>

          {/* 4. Revenue */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <span className="text-[11px] text-slate-400 block font-medium flex items-center justify-between">
              <span>Platform Revenue (GMV)</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="font-mono text-2xl font-bold text-emerald-400 mt-1">
              {formatINR(totalGMV)}
            </div>
            <span className="text-[10px] text-emerald-400/90 block mt-1 font-mono">
              Monthly Platform Volume
            </span>
          </div>

          {/* 5. Active Users */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <span className="text-[11px] text-slate-400 block font-medium flex items-center justify-between">
              <span>Active Users & Staff</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </span>
            <div className="font-mono text-2xl font-bold text-blue-400 mt-1">
              {activeUsersCount} <span className="text-xs text-slate-400 font-sans font-normal">Online</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">
              Owners, Managers, Chefs, Cashiers
            </span>
          </div>

          {/* 6. Subscriptions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <span className="text-[11px] text-slate-400 block font-medium flex items-center justify-between">
              <span>Subscriptions & Tiers</span>
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            </span>
            <div className="font-mono text-2xl font-bold text-purple-400 mt-1">
              {plans.length} <span className="text-xs text-slate-400 font-sans font-normal">Active Tiers</span>
            </div>
            <span className="text-[10px] text-purple-300 block mt-1 font-mono">
              Starter, Growth, Enterprise Mess
            </span>
          </div>

          {/* 7. Payment Analytics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <span className="text-[11px] text-slate-400 block font-medium flex items-center justify-between">
              <span>Payment Analytics</span>
              <CreditCard className="w-3.5 h-3.5 text-teal-400" />
            </span>
            <div className="font-mono text-lg font-bold text-white mt-1">
              64% UPI <span className="text-xs text-slate-400 font-mono">· 21% Cash</span>
            </div>
            <span className="text-[10px] text-teal-400 block mt-1 font-mono">
              99.8% Gateway Settlement Rate
            </span>
          </div>

          {/* 8. Business Growth */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <span className="text-[11px] text-slate-400 block font-medium flex items-center justify-between">
              <span>Business Growth</span>
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            </span>
            <div className="font-mono text-2xl font-bold text-rose-400 mt-1">
              +28.4%
            </div>
            <span className="text-[10px] text-rose-300 block mt-1 font-mono">
              MoM Tenant Onboarding Velocity
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW: OVERVIEW OR BUSINESSES & TENANTS
         ========================================================================= */}
      {(activeView === 'super_overview' || activeView === 'super_businesses') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-400" />
                <span>Registered Businesses & Multi-Tenant Entities ({tenants.length})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Super Admin can suspend, activate, delete, or impersonate any business owner.
              </p>
            </div>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business or owner..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3">Business Entity</th>
                  <th className="pb-3">Owner & Contact</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3 text-right">Monthly GMV</th>
                  <th className="pb-3 text-center">Branches</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {tenants
                  .filter((t) => t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((t) => {
                    const ownerUser = users.find((u) => u.businessId === t.id && u.role === 'BUSINESS_OWNER');
                    return (
                      <tr key={t.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-white">{t.businessName}</div>
                          <span className="font-mono text-[10px] text-slate-400">GSTIN: {t.gstin}</span>
                        </td>
                        <td className="py-3">
                          <div className="text-slate-200 font-medium">{t.ownerName}</div>
                          <span className="font-mono text-[10px] text-slate-400">{t.ownerPhone}</span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-950 text-purple-300 border border-purple-800">
                            {t.planName}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-400">
                          {formatINR(t.monthlyRevenue)}
                        </td>
                        <td className="py-3 text-center font-mono font-bold">{t.branchesCount}</td>
                        <td className="py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              t.status === 'ACTIVE'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : t.status === 'SUSPENDED'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1.5 font-mono">
                          {ownerUser && (
                            <button
                              onClick={() => onImpersonateUser(ownerUser)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded text-[11px] font-semibold transition-colors"
                              title="Impersonate Owner session"
                            >
                              Impersonate
                            </button>
                          )}
                          <button
                            onClick={() => onToggleTenantStatus(t.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              t.status === 'ACTIVE'
                                ? 'bg-slate-800 hover:bg-rose-950 text-rose-400'
                                : 'bg-slate-800 hover:bg-emerald-950 text-emerald-400'
                            }`}
                          >
                            {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${t.businessName}? All database tables for this tenant will be purged.`)) {
                                onDeleteTenant(t.id);
                              }
                            }}
                            className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
                            title="Delete Business"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* =========================================================================
          VIEW: STAFF & ROLES MANAGEMENT (SUPER ADMIN CAN CHANGE STAFF & ROLES)
         ========================================================================= */}
      {activeView === 'super_users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                <span>Super Admin Staff & Role Management</span>
              </h3>
              <p className="text-xs text-slate-400">
                Super Admin can mutate any staff member's role, details, branch assignment, or login directly.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="SUPER_ADMIN">Super Admins</option>
                <option value="BUSINESS_OWNER">Business Owners</option>
                <option value="BRANCH_MANAGER">Branch Managers</option>
                <option value="CASHIER">Cashiers</option>
                <option value="KITCHEN_STAFF">Kitchen Chefs</option>
                <option value="WAITER">Waiters</option>
                <option value="DELIVERY_PARTNER">Delivery Riders</option>
                <option value="CUSTOMER">Customers</option>
              </select>

              <button
                onClick={handleOpenAddUser}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Staff</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {users
              .filter((u) => userRoleFilter === 'ALL' || u.role === userRoleFilter)
              .map((u) => (
                <div
                  key={u.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-lg hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      {/* Direct Role Changer Dropdown (Master Control) */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono font-bold">Role:</span>
                        <select
                          value={u.role}
                          onChange={(e) => {
                            const newRole = e.target.value as UserRole;
                            if (onUpdateUserRole) {
                              onUpdateUserRole(u.id, newRole);
                            }
                          }}
                          className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-900 border border-slate-700 text-orange-400 cursor-pointer focus:outline-none focus:border-orange-500"
                          title="Change user's security role"
                        >
                          <option value="SUPER_ADMIN">SUPER ADMIN</option>
                          <option value="BUSINESS_OWNER">BUSINESS OWNER</option>
                          <option value="BRANCH_MANAGER">BRANCH MANAGER</option>
                          <option value="CASHIER">CASHIER</option>
                          <option value="KITCHEN_STAFF">KITCHEN CHEF</option>
                          <option value="WAITER">WAITER</option>
                          <option value="DELIVERY_PARTNER">DELIVERY RIDER</option>
                          <option value="CUSTOMER">CUSTOMER</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Edit User Info"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {u.role !== 'SUPER_ADMIN' && onDeleteUser && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove staff user ${u.fullName}?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-white mt-2.5">{u.fullName}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{u.phoneNumber}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{u.email}</p>
                    {u.businessName && (
                      <p className="text-[10px] text-slate-400 mt-1.5 truncate">
                        🏢 {u.businessName} {u.branchName ? `· ${u.branchName}` : ''}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
                    <button
                      onClick={() => onImpersonateUser(u)}
                      className="flex-1 py-1.5 bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/40 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Impersonate {u.role.split('_')[0]}</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: GLOBAL MENU & PRICES (SUPER ADMIN CAN CHANGE MENU & PRICES)
         ========================================================================= */}
      {activeView === 'super_menus' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-orange-400" />
                <span>Global Menu Catalog & Master Price Control</span>
              </h3>
              <p className="text-xs text-slate-400">
                Super Admin can edit any item, add new dishes, toggle veg/non-veg status, and override pricing.
              </p>
            </div>

            <button
              onClick={handleOpenAddDish}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add New Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                        item.isVeg ? 'border-emerald-500' : 'border-rose-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">#{item.itemCode}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditDish(item)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Edit Dish Name, Category & Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteMenuItem && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete menu item ${item.name}?`)) {
                              onDeleteMenuItem(item.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-sm mt-1">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.categoryName}</p>
                  {item.description && (
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{item.description}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Current Price:</span>
                    <span className="font-mono font-bold text-orange-400 text-base">₹{item.basePrice}</span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingItem({ id: item.id, name: item.name, price: item.basePrice });
                      setOverridePriceVal(item.basePrice);
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Change Price
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: ALL PLATFORM ORDERS (SUPER ADMIN CAN CHANGE ANY ORDER)
         ========================================================================= */}
      {activeView === 'super_orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-orange-400" />
                <span>All Platform Orders Ledger & Master Override</span>
              </h3>
              <p className="text-xs text-slate-400">
                Super Admin can inspect orders across all businesses and mutate status (CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED).
              </p>
            </div>

            <span className="text-xs font-mono text-orange-400">
              {orders.length} Live Orders Recorded
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No orders placed yet in this session. Orders created at POS or Customer Portal appear here.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Dishes</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5 font-bold text-white">
                        {ord.orderNumber}
                        <span className="text-[10px] text-slate-500 block">Token #{ord.dailyTokenNumber}</span>
                      </td>
                      <td className="py-2.5 font-sans">
                        <div className="text-white">{ord.customerName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{ord.customerPhone}</span>
                      </td>
                      <td className="py-2.5">
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                          {ord.orderType}
                        </span>
                      </td>
                      <td className="py-2.5 font-sans max-w-xs truncate text-slate-300">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">
                        ₹{ord.finalPayableAmount}
                      </td>
                      <td className="py-2.5 text-slate-300">
                        {ord.paymentMode}
                      </td>
                      <td className="py-2.5 text-center">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => {
                            if (onUpdateOrderStatus) {
                              onUpdateOrderStatus(ord.id, e.target.value);
                            }
                          }}
                          className="bg-slate-950 border border-slate-700 text-white text-[10px] rounded px-2 py-1 font-bold focus:outline-none"
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="READY">READY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="py-2.5 text-right font-sans">
                        <button
                          onClick={() => {
                            if (confirm(`Cancel order ${ord.orderNumber}?`)) {
                              if (onUpdateOrderStatus) onUpdateOrderStatus(ord.id, 'CANCELLED');
                            }
                          }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
                        >
                          Cancel Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW: SUBSCRIPTIONS & PLANS
         ========================================================================= */}
      {activeView === 'super_subscriptions' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-sm text-white mb-1">SaaS Subscription Plans & Pricing</h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure tiers, branch limits, user quotas, and billing cadence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-white">{p.planName}</h4>
                      {p.isPopular && (
                        <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded font-bold uppercase">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div className="mt-3 font-mono text-2xl font-bold text-orange-400">
                      ₹{p.pricePerMonth.toLocaleString()}
                      <span className="text-xs text-slate-400 font-normal"> / month</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Max Branches:</span>
                        <span className="font-bold text-white">{p.maxBranches}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Max Staff Users:</span>
                        <span className="font-bold text-white">{p.maxUsers}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800/60 space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">Included Features:</span>
                        {p.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                            <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Plan ${p.planName} is configured in production billing.`)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Configure Plan Limits
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: DYNAMIC RBAC PERMISSIONS MATRIX
         ========================================================================= */}
      {activeView === 'super_permissions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-orange-400" />
                <span>Multi-Level Role Permission Matrix Engine</span>
              </h3>
              <p className="text-xs text-slate-400">
                Dynamically toggle Create, Read, Update, Delete, Export, and Approve capabilities per module.
              </p>
            </div>

            {/* Role Tab Selector */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(['BUSINESS_OWNER', 'BRANCH_MANAGER', 'CASHIER', 'KITCHEN_STAFF', 'WAITER', 'DELIVERY_PARTNER', 'CUSTOMER'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleForMatrix(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedRoleForMatrix === r
                      ? 'bg-orange-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-3 font-sans">Module Name</th>
                  <th className="pb-3 text-center">CREATE</th>
                  <th className="pb-3 text-center">READ</th>
                  <th className="pb-3 text-center">UPDATE</th>
                  <th className="pb-3 text-center">DELETE</th>
                  <th className="pb-3 text-center">EXPORT</th>
                  <th className="pb-3 text-center">APPROVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {ALL_APP_MODULES.map((mod) => {
                  const perm = permissionsMatrix[selectedRoleForMatrix]?.[mod] || {
                    CREATE: false,
                    READ: false,
                    UPDATE: false,
                    DELETE: false,
                    EXPORT: false,
                    APPROVE: false,
                  };
                  return (
                    <tr key={mod} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5 font-sans font-bold text-slate-200">
                        {mod.replace('_', ' ')}
                      </td>
                      {(['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE'] as PermissionAction[]).map((act) => {
                        const val = perm[act];
                        return (
                          <td key={act} className="py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={val}
                              onChange={(e) =>
                                onUpdatePermission(selectedRoleForMatrix, mod, act, e.target.checked)
                              }
                              className="accent-orange-500 cursor-pointer w-4 h-4"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: AUDIT LOGS
         ========================================================================= */}
      {activeView === 'super_audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              <span>Immutable Master Audit Trail (System Log)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Captures every user mutation with Old Value, New Value, IP Address, Device & Timestamp.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">User & Role</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Target Entity</th>
                  <th className="pb-3">Old Value</th>
                  <th className="pb-3">New Value</th>
                  <th className="pb-3">IP & Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-2.5 text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5">
                      <div className="font-bold text-white font-sans">{log.userName}</div>
                      <span className="text-[10px] text-orange-400">{log.userRole}</span>
                    </td>
                    <td className="py-2.5 font-bold text-emerald-400">{log.action}</td>
                    <td className="py-2.5 text-slate-300 font-sans">{log.entityType}</td>
                    <td className="py-2.5 text-slate-400 text-[11px] max-w-xs truncate">{log.oldValue || '—'}</td>
                    <td className="py-2.5 text-amber-300 font-bold text-[11px] max-w-xs truncate">{log.newValue || '—'}</td>
                    <td className="py-2.5 text-[10px] text-slate-500">
                      <div>{log.ipAddress}</div>
                      <span className="truncate">{log.device}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: SYSTEM SETTINGS, GATEWAYS & BRANDING
         ========================================================================= */}
      {activeView === 'super_settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl max-w-3xl">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-orange-400" />
              <span>Platform Gateways, APIs, Branding & Statutory Configuration</span>
            </h3>
            <p className="text-xs text-slate-400">
              Configure Razorpay, WhatsApp Business (Interakt), Fast2SMS, Branding ({appName}), and statutory GST splits.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Branding Settings */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Enterprise Branding & White-Label Configuration</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Application Brand Name</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-bold text-white text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Primary Color Scheme</label>
                  <input
                    type="text"
                    value="Deep Orange / Obsidian Slate"
                    readOnly
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-slate-400 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">System Tagline & Descriptor</label>
                <input
                  type="text"
                  value={appTagline}
                  onChange={(e) => setAppTagline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Payment Gateway: Razorpay */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Razorpay Payment Gateway (UPI / Dynamic QR / NetBanking):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Merchant Key ID</label>
                  <input
                    type="text"
                    value={razorpayKey}
                    onChange={(e) => setRazorpayKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Key Secret</label>
                  <input
                    type="password"
                    value={razorpaySecret}
                    onChange={(e) => setRazorpaySecret(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Business API */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Business API (Interakt / Gupshup / Fast2SMS):</span>
              </span>
              <div>
                <label className="text-slate-400 block mb-1">Access Bearer Token</label>
                <input
                  type="password"
                  value={whatsappApiToken}
                  onChange={(e) => setWhatsappApiToken(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                />
              </div>
            </div>

            {/* SMS Gateways */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>SMS Gateway (Fast2SMS / Twilio DLT Registered):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Fast2SMS API Key</label>
                  <input
                    type="password"
                    value={fast2smsApiKey}
                    onChange={(e) => setFast2smsApiKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">DLT Sender ID (6 Characters)</label>
                  <input
                    type="text"
                    value={smsSenderId}
                    onChange={(e) => setSmsSenderId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Statutory Tax Engine */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-orange-400" />
                <span>Statutory Bharat GST Rates (Section 9 CGST Act & Rule 58):</span>
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">CGST % (Intra)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={defaultCgst}
                    onChange={(e) => setDefaultCgst(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">SGST % (Intra)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={defaultSgst}
                    onChange={(e) => setDefaultSgst(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">IGST % (Inter)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={defaultIgst}
                    onChange={(e) => setDefaultIgst(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {savedSettingsNotice && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-medium">
                ✓ Platform configuration synchronized across all active tenant nodes.
              </div>
            )}

            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20"
            >
              Commit Platform Configuration & API Gateways
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: ARCHITECTURE BLUEPRINT & SPECIFICATION
         ========================================================================= */}
      {activeView === 'super_architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-400" />
              <span>{appName} — FoodOS™ Production Architecture & Technical Specification</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Multi-tenant Event-Driven Modular Monolith, Dual-Clock Vector Sync, and Statutory Bharat Compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white font-sans text-sm text-orange-400">1. Sub-Second POS Resilience</h4>
              <p className="text-slate-400 text-[11px] font-sans">
                Autonomous local node with IndexedDB / embedded storage. Orders assign monotonic ULIDs and reconcile via two-way Vector Clock conflict resolution when network reconnects.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white font-sans text-sm text-orange-400">2. Multi-Tenant RLS Isolation</h4>
              <p className="text-slate-400 text-[11px] font-sans">
                PostgreSQL Row-Level Security (RLS) enforced at pooled connection checkout: <code className="text-orange-300">SET LOCAL app.current_tenant_id = '...'</code> neutralizing any cross-tenant SQL injection leakage.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white font-sans text-sm text-orange-400">3. Real-Time KDS WebSockets</h4>
              <p className="text-slate-400 text-[11px] font-sans">
                Dual-clock kitchen routing driven by Station Profiles and item categories. Event delivery via Redis Pub/Sub backplane with automatic downgrade to Server-Sent Events (SSE).
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white font-sans text-sm text-orange-400">4. Statutory Bharat-Tax Engine</h4>
              <p className="text-slate-400 text-[11px] font-sans">
                Complies with Section 9 CGST Act (2.5% CGST + 2.5% SGST intra-state, 18% IGST inter-state catering) and Legal Metrology Rule 58 Rounding off.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE BUSINESS
         ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Provision New SaaS Business Entity</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  placeholder="e.g. Royal Punjab Thali"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subdomain Slug</label>
                <input
                  type="text"
                  value={newBizSlug}
                  onChange={(e) => setNewBizSlug(e.target.value)}
                  placeholder="royalpunjab"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={newBizOwner}
                    onChange={(e) => setNewBizOwner(e.target.value)}
                    placeholder="Sardar Jasbir"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Owner Phone</label>
                  <input
                    type="text"
                    required
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subscription Plan</label>
                <select
                  value={newBizPlan}
                  onChange={(e) => setNewBizPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.planName} (₹{p.pricePerMonth}/mo)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
              >
                Provision Tenant
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT / ADD DISH & CHANGE MENU
         ========================================================================= */}
      {showDishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDish}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {editingDishItem ? 'Edit Menu Dish & Pricing' : 'Add New Menu Dish'}
              </h3>
              <button
                type="button"
                onClick={() => setShowDishModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Item Code</label>
                  <input
                    type="text"
                    required
                    value={dishCode}
                    onChange={(e) => setDishCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">Dish Name</label>
                  <input
                    type="text"
                    required
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="e.g. Paneer Butter Masala"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="Curries & Gravies">Curries & Gravies</option>
                    <option value="Tandoor & Starters">Tandoor & Starters</option>
                    <option value="Breads & Naan">Breads & Naan</option>
                    <option value="Chai & Beverages">Chai & Beverages</option>
                    <option value="Rolls & Quick Bites">Rolls & Quick Bites</option>
                    <option value="Rice & Biryani">Rice & Biryani</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono font-bold text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Dietary Classification</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="dietType"
                      checked={dishIsVeg}
                      onChange={() => setDishIsVeg(true)}
                      className="accent-emerald-500"
                    />
                    <span className="text-emerald-400 font-semibold">Vegetarian (Green Dot)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="dietType"
                      checked={!dishIsVeg}
                      onChange={() => setDishIsVeg(false)}
                      className="accent-rose-500"
                    />
                    <span className="text-rose-400 font-semibold">Non-Veg (Red Dot)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description / Recipe Notes</label>
                <textarea
                  rows={2}
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  placeholder="Prepared with fresh makhan, cashew paste and kasuri methi..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDishModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold"
              >
                {editingDishItem ? 'Save Dish Updates' : 'Add Dish to Menu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT / ADD STAFF USER (SUPER ADMIN CAN CHANGE STAFF & ROLES)
         ========================================================================= */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveUser}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {editingTargetUser ? `Edit Staff: ${editingTargetUser.fullName}` : 'Create Staff Member'}
              </h3>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Phone Number (+91)</label>
                  <input
                    type="text"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Assigned Role</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-orange-400 font-bold text-xs focus:outline-none focus:border-orange-500"
                  >
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                    <option value="BUSINESS_OWNER">BUSINESS OWNER</option>
                    <option value="BRANCH_MANAGER">BRANCH MANAGER</option>
                    <option value="CASHIER">CASHIER</option>
                    <option value="KITCHEN_STAFF">KITCHEN CHEF</option>
                    <option value="WAITER">WAITER</option>
                    <option value="DELIVERY_PARTNER">DELIVERY RIDER</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="rahul@dhanpuriya.in"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Business Organization</label>
                <input
                  type="text"
                  value={userBusinessName}
                  onChange={(e) => setUserBusinessName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold"
              >
                {editingTargetUser ? 'Save Staff Changes' : 'Create Staff Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODAL: QUICK PRICE OVERRIDE
         ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-white">Override Menu Base Price</h3>
            <p className="text-slate-400">Dish: {editingItem.name}</p>

            <div>
              <label className="text-slate-400 block mb-1">New Base Price (₹)</label>
              <input
                type="number"
                value={overridePriceVal}
                onChange={(e) => setOverridePriceVal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono font-bold text-base text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePriceOverride}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold"
              >
                Commit Price Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
