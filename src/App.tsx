/**
 * @license
 * Dhanpuriya — FoodOS™ Enterprise Architecture & System Specification
 * Role-Based Access Control (RBAC) Cloud-Native Operating System
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PosTerminal } from './components/PosTerminal';
import { KitchenDisplaySystem } from './components/KitchenDisplaySystem';
import { MessCanteenTerminal } from './components/MessCanteenTerminal';
import { CateringPipeline } from './components/CateringPipeline';
import { InventoryAndBOM } from './components/InventoryAndBOM';
import { TaxAndAnalytics } from './components/TaxAndAnalytics';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { CustomerQrMobileSimulator } from './components/CustomerQrMobileSimulator';
import { OfflineSyncModal } from './components/OfflineSyncModal';
import { LoginModal } from './components/LoginModal';
import { ArchitectureModal } from './components/ArchitectureModal';

import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { BusinessOwnerDashboard } from './components/dashboards/BusinessOwnerDashboard';
import { BranchManagerDashboard } from './components/dashboards/BranchManagerDashboard';
import { WaiterDashboard } from './components/dashboards/WaiterDashboard';
import { DeliveryDashboard } from './components/dashboards/DeliveryDashboard';
import { CustomerPortal } from './components/dashboards/CustomerPortal';

import {
  INITIAL_TENANT,
  INITIAL_BRANCHES,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_RAW_MATERIALS,
  INITIAL_RECIPES,
  INITIAL_KOTS,
  INITIAL_MESS_PLANS,
  INITIAL_STUDENTS,
  INITIAL_MEAL_LOGS,
  INITIAL_CATERING_BOOKINGS,
} from './data/mockData';

import {
  ALL_APP_MODULES,
  DEFAULT_ROLE_PERMISSIONS,
  INITIAL_USER_ACCOUNTS,
  INITIAL_BUSINESS_TENANTS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DELIVERY_ASSIGNMENTS,
  INITIAL_WAITER_REQUESTS,
} from './data/rbacInitialData';

import {
  Branch,
  Order,
  KitchenOrderTicket,
  RawMaterial,
  ItemRecipe,
  StudentMessProfile,
  MessMealLog,
  CateringBooking,
  OfflineSyncQueue,
  KotStatus,
  MenuItem,
  DiningTable,
} from './types/foodos';

import {
  UserRole,
  UserAccount,
  BusinessTenant,
  SubscriptionPlan,
  AuditLogEntry,
  RolePermissions,
  AppModule,
  PermissionAction,
  DeliveryAssignment,
  WaiterServiceRequest,
} from './types/rbac';

export default function App() {
  // Global RBAC State
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USER_ACCOUNTS);
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USER_ACCOUNTS[0]); // default Super Admin
  const [impersonatingFromUser, setImpersonatingFromUser] = useState<UserAccount | null>(null);
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<UserRole, RolePermissions>>(DEFAULT_ROLE_PERMISSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Multi-Tenancy & Subscriptions
  const [tenants, setTenants] = useState<BusinessTenant[]>(INITIAL_BUSINESS_TENANTS);
  const [plans] = useState<SubscriptionPlan[]>(INITIAL_SUBSCRIPTION_PLANS);

  // Active View & Navigation
  const [activeView, setActiveView] = useState<string>('super_overview');

  // Operational Data
  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [categories] = useState(INITIAL_CATEGORIES);
  const [tables, setTables] = useState<DiningTable[]>(INITIAL_TABLES);
  const [materials, setMaterials] = useState<RawMaterial[]>(INITIAL_RAW_MATERIALS);
  const [recipes] = useState<ItemRecipe[]>(INITIAL_RECIPES);
  const [kots, setKots] = useState<KitchenOrderTicket[]>(INITIAL_KOTS);
  const [students, setStudents] = useState<StudentMessProfile[]>(INITIAL_STUDENTS);
  const [mealPlans] = useState(INITIAL_MESS_PLANS);
  const [mealLogs, setMealLogs] = useState<MessMealLog[]>(INITIAL_MEAL_LOGS);
  const [cateringBookings, setCateringBookings] = useState<CateringBooking[]>(INITIAL_CATERING_BOOKINGS);
  const [deliveryAssignments, setDeliveryAssignments] = useState<DeliveryAssignment[]>(INITIAL_DELIVERY_ASSIGNMENTS);
  const [waiterRequests, setWaiterRequests] = useState<WaiterServiceRequest[]>(INITIAL_WAITER_REQUESTS);

  // Orders Ledger
  const [orders, setOrders] = useState<Order[]>([]);
  const [thermalReceiptOrder, setThermalReceiptOrder] = useState<Order | null>(null);

  // Deductions audit
  const [deductionLogs, setDeductionLogs] = useState<
    { timestamp: string; materialName: string; amount: number; uom: string; dishName: string }[]
  >([]);

  // Offline queue & resilience
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncQueue[]>([]);

  // Modals
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [showCustomerQr, setShowCustomerQr] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);

  // Helper to append to immutable Audit Trail
  const recordAudit = (
    action: string,
    entityType: string,
    entityId: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const entry: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress: '103.241.144.12',
      device: 'Chrome 128 / macOS',
      timestamp: new Date().toISOString(),
      businessId: currentUser.businessId,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Switch User / Role
  const handleSelectUser = (user: UserAccount) => {
    setCurrentUser(user);
    // Set default initial view for that role
    if (user.role === 'SUPER_ADMIN') setActiveView('super_overview');
    else if (user.role === 'BUSINESS_OWNER') setActiveView('owner_overview');
    else if (user.role === 'BRANCH_MANAGER') setActiveView('mgr_overview');
    else if (user.role === 'CASHIER') setActiveView('cashier_pos');
    else if (user.role === 'KITCHEN_STAFF') setActiveView('kitchen_kds');
    else if (user.role === 'WAITER') setActiveView('waiter_tables');
    else if (user.role === 'DELIVERY_PARTNER') setActiveView('delivery_assigned');
    else if (user.role === 'CUSTOMER') setActiveView('customer_menu');
  };

  // Impersonate User (Super Admin Master Capability)
  const handleImpersonateUser = (targetUser: UserAccount) => {
    setImpersonatingFromUser(currentUser);
    setCurrentUser(targetUser);
    handleSelectUser(targetUser);
    recordAudit('USER_IMPERSONATED', 'USER', targetUser.id, undefined, `Impersonated as ${targetUser.fullName} (${targetUser.role})`);
  };

  const handleStopImpersonating = () => {
    if (impersonatingFromUser) {
      recordAudit('USER_IMPERSONATION_ENDED', 'USER', currentUser.id, `Exited ${currentUser.fullName}`, `Returned to ${impersonatingFromUser.fullName}`);
      setCurrentUser(impersonatingFromUser);
      setImpersonatingFromUser(null);
      setActiveView('super_overview');
    }
  };

  // Update Dynamic Permissions Matrix
  const handleUpdatePermission = (
    role: UserRole,
    module: AppModule,
    action: PermissionAction,
    value: boolean
  ) => {
    setPermissionsMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role][module],
          [action]: value,
        },
      },
    }));
    recordAudit(
      'PERMISSION_MUTATED',
      'RBAC_MATRIX',
      `${role}:${module}:${action}`,
      String(!value),
      String(value)
    );
  };

  // Business Tenant CRUD
  const handleToggleTenantStatus = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const nextStatus = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          recordAudit('TENANT_STATUS_TOGGLED', 'TENANT', t.businessName, t.status, nextStatus);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleDeleteTenant = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (target) {
      recordAudit('TENANT_DELETED', 'TENANT', target.id, target.businessName, 'DELETED');
      setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    }
  };

  const handleCreateTenant = (
    data: Omit<BusinessTenant, 'id' | 'createdAt' | 'monthlyRevenue' | 'totalOrders' | 'branchesCount'>
  ) => {
    const newTenant: BusinessTenant = {
      ...data,
      id: `biz_${Date.now()}`,
      monthlyRevenue: 0,
      totalOrders: 0,
      branchesCount: 1,
      createdAt: new Date().toISOString(),
    };
    setTenants((prev) => [newTenant, ...prev]);
    recordAudit('TENANT_PROVISIONED', 'TENANT', newTenant.id, undefined, newTenant.businessName);
  };

  // Master Global Price Override
  const handleUpdateMenuItemPrice = (itemId: string, newPrice: number) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          recordAudit(
            'PRICE_OVERRIDE_GLOBAL',
            'MENU_ITEM',
            item.name,
            `₹${item.basePrice}`,
            `₹${newPrice}`
          );
          return { ...item, basePrice: newPrice };
        }
        return item;
      })
    );
  };

  // Super Admin: Menu Item Mutation
  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === updatedItem.id) {
          recordAudit('MENU_ITEM_MUTATED', 'MENU_ITEM', updatedItem.name, `₹${item.basePrice}`, `₹${updatedItem.basePrice}`);
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems((prev) => [newItem, ...prev]);
    recordAudit('MENU_ITEM_CREATED', 'MENU_ITEM', newItem.name, undefined, `₹${newItem.basePrice} (${newItem.categoryName})`);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    const target = menuItems.find((i) => i.id === itemId);
    if (target) {
      setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
      recordAudit('MENU_ITEM_DELETED', 'MENU_ITEM', target.name, `₹${target.basePrice}`, 'DELETED');
    }
  };

  // Super Admin: Staff & Roles Management
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          recordAudit('USER_ROLE_CHANGED', 'STAFF_USER', u.fullName, u.role, newRole);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    }
  };

  const handleUpdateUserDetails = (userId: string, data: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          recordAudit('USER_DETAILS_MUTATED', 'STAFF_USER', u.fullName, undefined, JSON.stringify(data));
          return { ...u, ...data };
        }
        return u;
      })
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...data }));
    }
  };

  const handleCreateUser = (newUser: UserAccount) => {
    setUsers((prev) => [newUser, ...prev]);
    recordAudit('USER_PROVISIONED', 'STAFF_USER', newUser.fullName, undefined, `${newUser.role} (${newUser.businessName})`);
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      recordAudit('USER_DELETED', 'STAFF_USER', target.fullName, target.role, 'DELETED');
    }
  };

  // Super Admin & Branch Manager: Order Status Override
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          recordAudit('ORDER_STATUS_MUTATED', 'ORDER', o.orderNumber, o.orderStatus, newStatus);
          return { ...o, orderStatus: newStatus as any };
        }
        return o;
      })
    );
  };

  // Branch Manager: Dynamic Table QR & Floor Plan Management
  const handleUpdateTableToken = (tableId: string, newToken: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, qrSecretToken: newToken } : t))
    );
    recordAudit('TABLE_QR_TOKEN_REGENERATED', 'TABLE', tableId, undefined, `New Token: ${newToken}`);
  };

  const handleAddTable = (newTable: DiningTable) => {
    setTables((prev) => [...prev, newTable]);
    recordAudit('TABLE_CREATED', 'TABLE', newTable.tableNumber, undefined, `Capacity: ${newTable.seatingCapacity}`);
  };

  const handleToggleTableOccupancy = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, isOccupied: !t.isOccupied } : t))
    );
    recordAudit('TABLE_OCCUPANCY_TOGGLED', 'TABLE', tableId);
  };

  // Order created at Counter POS
  const handleOrderCreated = (
    order: Order,
    deductions: { materialId: string; amount: number }[]
  ) => {
    setOrders((prev) => [order, ...prev]);
    recordAudit('ORDER_SETTLED', 'ORDER', order.orderNumber, 'UNPAID', `₹${order.finalPayableAmount} (${order.paymentMode})`);

    // If offline, append to offline queue
    if (!isOnline) {
      const qItem: OfflineSyncQueue = {
        id: `q_${Date.now()}`,
        ulid: order.ulid,
        operation: 'CREATE_ORDER',
        payload: order,
        queuedAt: new Date().toISOString(),
        status: 'PENDING',
      };
      setOfflineQueue((prev) => [...prev, qItem]);
    }

    // 1. Deduct Inventory via Recipe BOM
    const newLogs: typeof deductionLogs = [];
    setMaterials((prev) => {
      const updated = [...prev];
      deductions.forEach((d) => {
        const matIndex = updated.findIndex((m) => m.id === d.materialId);
        if (matIndex >= 0) {
          const mat = updated[matIndex];
          const newStock = Math.max(0, mat.availableStock - d.amount);
          updated[matIndex] = {
            ...mat,
            availableStock: Number(newStock.toFixed(3)),
          };
          newLogs.push({
            timestamp: new Date().toISOString(),
            materialName: mat.materialName,
            amount: d.amount,
            uom: mat.stockUom,
            dishName: order.items[0]?.name || 'Dish',
          });
        }
      });
      return updated;
    });

    if (newLogs.length > 0) {
      setDeductionLogs((prev) => [...newLogs, ...prev]);
    }

    // 2. Dispatch Kitchen Order Ticket (KOT)
    const newKot: KitchenOrderTicket = {
      id: `kot_${Date.now()}`,
      orderId: order.id,
      branchId: order.branchId,
      orderNumber: order.orderNumber,
      dailyTokenNumber: order.dailyTokenNumber,
      kotSequenceNumber: kots.length + 1,
      status: 'QUEUED',
      stationTag: 'MAIN_KITCHEN',
      orderType: order.orderType,
      tableOrToken: order.tableName ? `Table ${order.tableName}` : `Token #${order.dailyTokenNumber}`,
      items: order.items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        notes: it.itemNotes,
        isVeg: true,
      })),
      createdAt: new Date().toISOString(),
      elapsedSeconds: 0,
    };
    setKots((prev) => [newKot, ...prev]);

    // 3. Show Thermal Receipt Modal
    setThermalReceiptOrder(order);
  };

  // KOT status bump
  const handleUpdateKotStatus = (kotId: string, status: KotStatus) => {
    setKots((prev) =>
      prev.map((k) => {
        if (k.id === kotId) {
          recordAudit('KOT_STATUS_MUTATED', 'KITCHEN_TICKET', k.orderNumber, k.status, status);
          return { ...k, status };
        }
        return k;
      })
    );
  };

  // Waiter Order Dispatch
  const handleSendWaiterKot = (tableNumber: string, items: { item: MenuItem; qty: number }[]) => {
    const dailyToken = Math.floor(Math.random() * 40) + 70;
    const orderNumber = `WTR-BND-${dailyToken}`;
    const newKot: KitchenOrderTicket = {
      id: `kot_wtr_${Date.now()}`,
      orderId: `ord_wtr_${Date.now()}`,
      branchId: currentBranch.id,
      orderNumber,
      dailyTokenNumber: dailyToken,
      kotSequenceNumber: kots.length + 1,
      status: 'QUEUED',
      stationTag: 'MAIN_KITCHEN',
      orderType: 'DINE_IN',
      tableOrToken: `Table ${tableNumber} (Captain Pad)`,
      items: items.map((c) => ({
        name: c.item.name,
        quantity: c.qty,
        isVeg: c.item.isVeg,
      })),
      createdAt: new Date().toISOString(),
      elapsedSeconds: 0,
    };
    setKots((prev) => [newKot, ...prev]);
    recordAudit('WAITER_KOT_DISPATCHED', 'TABLE_ORDER', tableNumber, undefined, `${items.length} dishes`);
    alert(`Table ${tableNumber} KOT successfully dispatched to Kitchen!`);
  };

  // Waiter Service Request Attended
  const handleAttendServiceRequest = (requestId: string) => {
    setWaiterRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'ATTENDED' } : r))
    );
    recordAudit('SERVICE_REQUEST_ATTENDED', 'TABLE_SERVICE', requestId, 'PENDING', 'ATTENDED');
  };

  // Delivery status mutation
  const handleUpdateDeliveryStatus = (id: string, status: DeliveryAssignment['status']) => {
    setDeliveryAssignments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
    recordAudit('DELIVERY_STATUS_UPDATED', 'DELIVERY', id, undefined, status);
  };

  // Customer order placed via consumer portal
  const handleCustomerPortalOrder = (items: { item: MenuItem; qty: number }[], paymentMode: string) => {
    const subtotal = items.reduce((acc, c) => acc + c.item.basePrice * c.qty, 0);
    const cgst = Number((subtotal * 0.025).toFixed(2));
    const sgst = Number((subtotal * 0.025).toFixed(2));
    const finalPayable = Math.round(subtotal + cgst + sgst);
    const dailyToken = Math.floor(Math.random() * 50) + 80;

    const newOrder: Order = {
      id: `ord_cust_${Date.now()}`,
      ulid: `ULID-CUST-${Date.now().toString(36).toUpperCase()}`,
      tenantId: currentBranch.tenantId,
      branchId: currentBranch.id,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phoneNumber,
      cashierId: 'usr_portal_engine',
      cashierName: 'Online Web Engine',
      orderNumber: `ONLINE-MUM-${dailyToken}`,
      dailyTokenNumber: dailyToken,
      orderType: 'DELIVERY',
      orderStatus: 'CONFIRMED',
      items: items.map((it, idx) => ({
        id: `oi_${idx}`,
        menuItemId: it.item.id,
        name: it.item.name,
        quantity: it.qty,
        unitPrice: it.item.basePrice,
        taxableValue: it.item.basePrice * it.qty,
        cgstRate: 2.5,
        cgstAmount: Number((it.item.basePrice * it.qty * 0.025).toFixed(2)),
        sgstRate: 2.5,
        sgstAmount: Number((it.item.basePrice * it.qty * 0.025).toFixed(2)),
        totalAmount: Number((it.item.basePrice * it.qty * 1.05).toFixed(2)),
      })),
      subtotalAmount: subtotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: 0,
      serviceChargeAmount: 0,
      packagingChargeAmount: 0,
      deliveryChargeAmount: 0,
      discountAmount: 0,
      roundingAdjustment: 0,
      finalPayableAmount: finalPayable,
      paymentMode: paymentMode as any,
      paymentStatus: 'SUCCESSFUL',
      createdAt: new Date().toISOString(),
      isOfflineSynced: true,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Send KOT to kitchen
    const newKot: KitchenOrderTicket = {
      id: `kot_online_${Date.now()}`,
      orderId: newOrder.id,
      branchId: newOrder.branchId,
      orderNumber: newOrder.orderNumber,
      dailyTokenNumber: dailyToken,
      kotSequenceNumber: kots.length + 1,
      status: 'QUEUED',
      stationTag: 'MAIN_KITCHEN',
      orderType: 'DELIVERY',
      tableOrToken: `Online Delivery (#${dailyToken})`,
      items: items.map((c) => ({
        name: c.item.name,
        quantity: c.qty,
        isVeg: c.item.isVeg,
      })),
      createdAt: new Date().toISOString(),
      elapsedSeconds: 0,
    };
    setKots((prev) => [newKot, ...prev]);

    // Deduct wallet if paid via wallet
    if (paymentMode === 'MESS_WALLET' && currentUser.walletBalance) {
      setCurrentUser((prev) => ({
        ...prev,
        walletBalance: Math.max(0, (prev.walletBalance || 0) - finalPayable),
        loyaltyPoints: (prev.loyaltyPoints || 0) + Math.floor(finalPayable / 10),
      }));
    }

    recordAudit('CUSTOMER_ORDER_PLACED', 'ORDER', newOrder.orderNumber, undefined, `₹${finalPayable} (${paymentMode})`);
  };

  const handleTopupWallet = (amount: number) => {
    setCurrentUser((prev) => ({
      ...prev,
      walletBalance: (prev.walletBalance || 0) + amount,
    }));
    recordAudit('WALLET_TOPUP', 'WALLET', currentUser.phoneNumber, undefined, `+₹${amount}`);
    alert(`Wallet successfully recharged with ₹${amount}!`);
  };

  const activeKotCount = kots.filter((k) => k.status !== 'SERVED').length;
  const pendingDeliveries = deliveryAssignments.filter((d) => d.status !== 'DELIVERED').length;
  const pendingRequests = waiterRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans select-none text-slate-100">
      {/* Top Header with Impersonation & Role indicator */}
      <Header
        branches={branches}
        currentBranch={currentBranch}
        onSelectBranch={setCurrentBranch}
        currentRole={currentUser.role}
        currentUser={currentUser}
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        offlineQueueCount={offlineQueue.length}
        onOpenSyncModal={() => setShowSyncModal(true)}
        onOpenCustomerQr={() => setShowCustomerQr(true)}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onOpenArchitectureModal={() => setShowArchitectureModal(true)}
        impersonatingFromUser={impersonatingFromUser}
        onStopImpersonating={handleStopImpersonating}
      />

      {/* Main Container with Sidebar + Main Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dynamic Role-Based Sidebar */}
        <Sidebar
          currentRole={currentUser.role}
          currentUser={currentUser}
          activeView={activeView}
          onSelectView={setActiveView}
          pendingDeliveriesCount={pendingDeliveries}
          pendingServiceRequestsCount={pendingRequests}
          activeKotsCount={activeKotCount}
        />

        {/* Viewport Router strictly bound to role & view */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* 1. SUPER ADMIN VIEWS */}
          {currentUser.role === 'SUPER_ADMIN' && (
            <SuperAdminDashboard
              tenants={tenants}
              plans={plans}
              users={users}
              auditLogs={auditLogs}
              permissionsMatrix={permissionsMatrix}
              menuItems={menuItems}
              orders={orders}
              onToggleTenantStatus={handleToggleTenantStatus}
              onDeleteTenant={handleDeleteTenant}
              onCreateTenant={handleCreateTenant}
              onUpdateMenuItemPrice={handleUpdateMenuItemPrice}
              onUpdateMenuItem={handleUpdateMenuItem}
              onAddMenuItem={handleAddMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onUpdateUserRole={handleUpdateUserRole}
              onUpdateUserDetails={handleUpdateUserDetails}
              onCreateUser={handleCreateUser}
              onDeleteUser={handleDeleteUser}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdatePermission={handleUpdatePermission}
              onImpersonateUser={handleImpersonateUser}
              activeView={activeView}
            />
          )}

          {/* 2. BUSINESS OWNER VIEWS */}
          {currentUser.role === 'BUSINESS_OWNER' && (
            <>
              {activeView === 'owner_overview' && (
                <BusinessOwnerDashboard
                  currentBusinessName={currentUser.businessName || 'Dhanpuriya Hospitality'}
                  branches={branches}
                  orders={orders}
                  staffUsers={users.filter((u) => u.businessId === currentUser.businessId)}
                  menuItems={menuItems}
                  onNavigateModule={setActiveView}
                  onUpdateMenuItemPrice={handleUpdateMenuItemPrice}
                  onUpdateUserRole={handleUpdateUserRole}
                  activeView={activeView}
                />
              )}
              {activeView === 'owner_inventory' && (
                <InventoryAndBOM
                  materials={materials}
                  recipes={recipes}
                  menuItems={menuItems}
                  onUpdateStock={(mId, amt) => {
                    setMaterials((prev) =>
                      prev.map((m) => (m.id === mId ? { ...m, availableStock: m.availableStock + amt } : m))
                    );
                  }}
                  deductionLogs={deductionLogs}
                />
              )}
              {activeView === 'owner_catering' && (
                <CateringPipeline
                  bookings={cateringBookings}
                  menuItems={menuItems}
                  onAddBooking={(b) => setCateringBookings((prev) => [b, ...prev])}
                  onUpdateStatus={(id, st) =>
                    setCateringBookings((prev) => prev.map((b) => (b.id === id ? { ...b, contractStatus: st } : b)))
                  }
                />
              )}
              {activeView === 'owner_reports' && (
                <TaxAndAnalytics
                  orders={orders}
                  branches={branches}
                  currentBranch={currentBranch}
                />
              )}
              {(activeView === 'owner_branches' ||
                activeView === 'owner_staff' ||
                activeView === 'owner_menu' ||
                activeView === 'owner_orders' ||
                activeView === 'owner_delivery') && (
                <BusinessOwnerDashboard
                  currentBusinessName={currentUser.businessName || 'Dhanpuriya Hospitality'}
                  branches={branches}
                  orders={orders}
                  staffUsers={users.filter((u) => u.businessId === currentUser.businessId)}
                  menuItems={menuItems}
                  onNavigateModule={setActiveView}
                  onUpdateMenuItemPrice={handleUpdateMenuItemPrice}
                  onUpdateUserRole={handleUpdateUserRole}
                  activeView={activeView}
                />
              )}
            </>
          )}

          {/* 3. BRANCH MANAGER VIEWS */}
          {currentUser.role === 'BRANCH_MANAGER' && (
            <>
              {activeView === 'mgr_kitchen' ? (
                <KitchenDisplaySystem
                  kots={kots}
                  onUpdateKotStatus={handleUpdateKotStatus}
                />
              ) : activeView === 'mgr_inventory' ? (
                <InventoryAndBOM
                  materials={materials}
                  recipes={recipes}
                  menuItems={menuItems}
                  onUpdateStock={(mId, amt) => {
                    setMaterials((prev) =>
                      prev.map((m) => (m.id === mId ? { ...m, availableStock: m.availableStock + amt } : m))
                    );
                  }}
                  deductionLogs={deductionLogs}
                />
              ) : (
                <BranchManagerDashboard
                  branch={currentBranch}
                  orders={orders}
                  tables={tables}
                  materials={materials}
                  staff={users.filter((u) => u.branchId === currentBranch.id)}
                  kots={kots}
                  onNavigateTab={setActiveView}
                  onUpdateTableToken={handleUpdateTableToken}
                  onAddTable={handleAddTable}
                  onToggleTableOccupancy={handleToggleTableOccupancy}
                  activeView={activeView}
                />
              )}
            </>
          )}

          {/* 4. CASHIER VIEWS */}
          {currentUser.role === 'CASHIER' && (
            <PosTerminal
              currentBranch={currentBranch}
              categories={categories}
              menuItems={menuItems}
              tables={tables}
              isOnline={isOnline}
              onOrderCreated={handleOrderCreated}
              recipes={recipes}
            />
          )}

          {/* 5. KITCHEN STAFF (KDS) VIEWS */}
          {currentUser.role === 'KITCHEN_STAFF' && (
            <KitchenDisplaySystem
              kots={kots}
              onUpdateKotStatus={handleUpdateKotStatus}
            />
          )}

          {/* 6. WAITER / CAPTAIN VIEWS */}
          {currentUser.role === 'WAITER' && (
            <WaiterDashboard
              tables={tables}
              menuItems={menuItems}
              serviceRequests={waiterRequests}
              onAttendServiceRequest={handleAttendServiceRequest}
              onSendWaiterKot={handleSendWaiterKot}
            />
          )}

          {/* 7. DELIVERY PARTNER VIEWS */}
          {currentUser.role === 'DELIVERY_PARTNER' && (
            <DeliveryDashboard
              assignments={deliveryAssignments}
              onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
            />
          )}

          {/* 8. CUSTOMER PORTAL VIEWS */}
          {currentUser.role === 'CUSTOMER' && (
            <CustomerPortal
              currentUser={currentUser}
              menuItems={menuItems}
              orders={orders}
              onPlaceOrder={handleCustomerPortalOrder}
              onTopupWallet={handleTopupWallet}
              activeView={activeView}
            />
          )}
        </main>
      </div>

      {/* Role Switcher & Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        users={users}
        onSelectUser={handleSelectUser}
      />

      {/* Architecture & Technical Specification Modal */}
      <ArchitectureModal
        isOpen={showArchitectureModal}
        onClose={() => setShowArchitectureModal(false)}
      />

      {/* Thermal Receipt Modal (ESC/POS 80mm Print Preview & WhatsApp) */}
      <ThermalReceiptModal
        order={thermalReceiptOrder}
        branch={currentBranch}
        onClose={() => setThermalReceiptOrder(null)}
      />

      {/* Customer QR Mobile Simulator */}
      <CustomerQrMobileSimulator
        isOpen={showCustomerQr}
        onClose={() => setShowCustomerQr(false)}
        menuItems={menuItems}
        onCustomerOrderPlaced={(cartItems) => {
          handleCustomerPortalOrder(cartItems, 'UPI_DYNAMIC_INTENT');
        }}
      />

      {/* Offline Dual-Clock Synchronization Modal */}
      <OfflineSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        queue={offlineQueue}
        onSyncAll={() => {
          setOfflineQueue([]);
          alert('FIFO Sync Batch processed successfully: All local offline transactions reconciled with PostgreSQL Primary cluster.');
          setShowSyncModal(false);
        }}
        isOnline={isOnline}
      />
    </div>
  );
}
