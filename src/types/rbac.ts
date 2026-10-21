export type UserRole = 
  | 'SUPER_ADMIN'
  | 'BUSINESS_OWNER'
  | 'BRANCH_MANAGER'
  | 'CASHIER'
  | 'KITCHEN_STAFF'
  | 'WAITER'
  | 'DELIVERY_PARTNER'
  | 'CUSTOMER';

export type AppModule = 
  | 'BUSINESSES'
  | 'BRANCHES'
  | 'USERS_STAFF'
  | 'MENU_CATALOG'
  | 'POS_BILLING'
  | 'KITCHEN_KDS'
  | 'INVENTORY'
  | 'CATERING'
  | 'MESS_CANTEEN'
  | 'DELIVERY'
  | 'LOYALTY_WALLET'
  | 'REPORTS_FINANCE'
  | 'SUBSCRIPTIONS'
  | 'SYSTEM_SETTINGS'
  | 'AUDIT_LOGS'
  | 'TABLES_SEATING'
  | 'CUSTOMER_ORDERS';

export type PermissionAction = 
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'APPROVE';

export interface RolePermissions {
  [module: string]: {
    CREATE: boolean;
    READ: boolean;
    UPDATE: boolean;
    DELETE: boolean;
    EXPORT: boolean;
    APPROVE: boolean;
  };
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  businessId?: string;
  businessName?: string;
  branchId?: string;
  branchName?: string;
  avatarSeed: string;
  isActive: boolean;
  walletBalance?: number;
  loyaltyPoints?: number;
  customPermissions?: Partial<RolePermissions>;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  device: string;
  timestamp: string;
  businessId?: string;
}

export interface SubscriptionPlan {
  id: string;
  planName: string;
  pricePerMonth: number;
  maxBranches: number;
  maxUsers: number;
  features: string[];
  isPopular?: boolean;
}

export interface BusinessTenant {
  id: string;
  businessName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  gstin: string;
  panNumber: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  planId: string;
  planName: string;
  monthlyRevenue: number;
  totalOrders: number;
  branchesCount: number;
  createdAt: string;
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  distanceKm: number;
  estimatedTimeMins: number;
  status: 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  deliveryFee: number;
  tipAmount: number;
  assignedToPartnerId: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  deliveryOtp: string;
}

export interface WaiterServiceRequest {
  id: string;
  tableNumber: string;
  requestType: 'CALL_WAITER' | 'REQUEST_WATER' | 'REQUEST_BILL' | 'EXTRA_CUTLERY';
  status: 'PENDING' | 'ATTENDED';
  timestamp: string;
  guestCount: number;
}
