export type BusinessType = 
  | 'RESTAURANT'
  | 'FAST_FOOD'
  | 'QSR_CHAIN'
  | 'CAFETERIA'
  | 'COLLEGE_CANTEEN'
  | 'SCHOOL_CANTEEN'
  | 'HOSTEL_MESS'
  | 'CORPORATE_CAFETERIA'
  | 'CATERING'
  | 'FOOD_COURT';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'BUSINESS_OWNER'
  | 'BRANCH_MANAGER'
  | 'CASHIER'
  | 'KITCHEN_STAFF'
  | 'MESS_SUPERVISOR'
  | 'DELIVERY_PARTNER'
  | 'WAITER'
  | 'CUSTOMER';

export type OrderType = 
  | 'DINE_IN'
  | 'TAKEAWAY'
  | 'DELIVERY'
  | 'QSR_COUNTER'
  | 'MESS_MEAL'
  | 'CATERING';

export type OrderStatus = 
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'VOIDED';

export type PaymentMode = 
  | 'CASH'
  | 'UPI_STATIC_QR'
  | 'UPI_DYNAMIC_INTENT'
  | 'RAZORPAY_GATEWAY'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'MESS_WALLET'
  | 'CORPORATE_ALLOWANCE';

export type PaymentStatus = 
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REFUNDED';

export type MealSlot = 
  | 'BREAKFAST'
  | 'LUNCH'
  | 'EVENING_SNACKS'
  | 'DINNER'
  | 'MIDNIGHT_BUFFET';

export type KotStatus = 
  | 'QUEUED'
  | 'COOKING'
  | 'READY'
  | 'SERVED'
  | 'RECALLED';

export type KitchenStation = 
  | 'ALL'
  | 'MAIN_KITCHEN'
  | 'TANDOOR_GRILL'
  | 'BEVERAGE_BAR'
  | 'FRY_ASSEMBLY';

export interface Tenant {
  id: string;
  businessName: string;
  slug: string;
  businessType: BusinessType;
  cinNumber: string;
  panNumber: string;
  defaultCurrency: string;
  isActive: boolean;
}

export interface Branch {
  id: string;
  tenantId: string;
  branchCode: string;
  branchName: string;
  gstin: string;
  fssaiLicenseNumber: string;
  phone: string;
  email: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  isMainBranch: boolean;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  hsnCode: string;
  gstRate: number; // typically 5.00%
  sortOrder: number;
}

export interface ItemVariant {
  id: string;
  menuItemId: string;
  variantName: string; // e.g. 'Regular', 'Large', 'Half', 'Full', 'Double Cheese'
  priceDelta: number;
  sku: string;
}

export interface MenuItem {
  id: string;
  tenantId: string;
  categoryId: string;
  categoryName: string;
  itemCode: string; // e.g. '101', '205'
  name: string;
  description: string;
  isVeg: boolean;
  isEgg: boolean;
  basePrice: number;
  packagingCharges: number;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  stationTag: KitchenStation;
  variants?: ItemVariant[];
}

export interface DiningTable {
  id: string;
  branchId: string;
  sectionName: string; // 'AC First Floor', 'Courtyard Garden', 'Rooftop Lounge'
  tableNumber: string; // 'T1', 'T2', 'T14'
  seatingCapacity: number;
  qrSecretToken: string;
  isOccupied: boolean;
  activeOrderId?: string;
  guestCount?: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  variantId?: string;
  variantName?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  totalAmount: number;
  itemNotes?: string;
}

export interface Order {
  id: string;
  ulid: string; // For offline synchronization protocol
  tenantId: string;
  branchId: string;
  tableId?: string;
  tableName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierId: string;
  cashierName: string;
  waiterId?: string;
  waiterName?: string;
  orderNumber: string;
  dailyTokenNumber: number;
  orderType: OrderType;
  orderStatus: OrderStatus;
  items: OrderItem[];
  subtotalAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  serviceChargeAmount: number;
  packagingChargeAmount: number;
  deliveryChargeAmount: number;
  discountAmount: number;
  discountCode?: string;
  roundingAdjustment: number;
  finalPayableAmount: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  customerNotes?: string;
  createdAt: string;
  isOfflineSynced: boolean;
  upiIntentUrl?: string;
  transactionReference?: string;
}

export interface KitchenOrderTicket {
  id: string;
  orderId: string;
  branchId: string;
  orderNumber: string;
  dailyTokenNumber: number;
  kotSequenceNumber: number;
  status: KotStatus;
  stationTag: KitchenStation;
  orderType: OrderType;
  tableOrToken: string;
  items: {
    name: string;
    quantity: number;
    notes?: string;
    isVeg: boolean;
  }[];
  createdAt: string;
  preparationStartedAt?: string;
  readyAt?: string;
  elapsedSeconds: number;
}

export interface RawMaterial {
  id: string;
  tenantId: string;
  materialName: string;
  stockUom: 'KG' | 'LITRE' | 'UNITS' | 'GRAMS';
  minimumThresholdAlert: number;
  currentCostPerUom: number;
  availableStock: number;
  allocatedStock: number;
  reorderQuantity: number;
  supplierName: string;
}

export interface ItemRecipe {
  menuItemId: string;
  materialId: string;
  materialName: string;
  consumptionQuantity: number;
  stockUom: string;
  wastageMarginPercent: number;
}

export interface MessMealPlan {
  id: string;
  tenantId: string;
  planName: string;
  includedBreakfast: boolean;
  includedLunch: boolean;
  includedSnacks: boolean;
  includedDinner: boolean;
  monthlySubscriptionPrice: number;
  isActive: boolean;
}

export interface StudentMessProfile {
  id: string;
  tenantId: string;
  userId: string;
  rollNumber: string;
  fullName: string;
  hostelBlockRoom: string;
  rfidCardUid: string;
  currentPlanId: string;
  planName: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  walletPrepaidBalance: number;
  isSuspended: boolean;
  avatarSeed: string;
  phone: string;
}

export interface MessMealLog {
  id: string;
  branchId: string;
  studentProfileId: string;
  studentName: string;
  rollNumber: string;
  mealSlot: MealSlot;
  consumedAt: string;
  deviceVerificationMethod: 'RFID_SCAN' | 'QR_SCAN' | 'BIOMETRIC';
  billingStatus: 'INCLUDED_IN_PLAN' | 'WALLET_DEDUCTION' | 'DENIED_EXPIRED' | 'DUPLICATE_ALERT';
  notes?: string;
}

export interface CateringBooking {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: 'WEDDING' | 'CORPORATE_GALA' | 'BIRTHDAY' | 'COLLEGE_FEST' | 'CONFERENCE';
  eventDate: string;
  venueAddress: string;
  targetGuestCount: number;
  quotedPricePerPlate: number;
  totalContractValue: number;
  advanceReceivedAmount: number;
  contractStatus: 'INQUIRY' | 'PROPOSAL_SENT' | 'CONFIRMED' | 'EXECUTED';
  selectedStarters: string[];
  selectedMains: string[];
  selectedBreads: string[];
  selectedDesserts: string[];
  rawCostPerPlate: number;
  profitMarginPercent: number;
  createdAt: string;
}

export interface OfflineSyncQueue {
  id: string;
  ulid: string;
  operation: 'CREATE_ORDER' | 'UPDATE_KOT' | 'BUMP_STATION';
  payload: any;
  queuedAt: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
}
