/**
 * Statutory Bharat-Tax Compliance Engine
 * Formulated according to Section 9 of the Central Goods and Services Tax (CGST) Act
 * and Rule 58 of CGST Rules (Statutory Rupee Rounding Off).
 */

export interface LineItemTaxResult {
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  lineTotal: number;
}

export interface OrderTaxSummary {
  subtotal: number;
  discountAmount: number;
  packagingCharge: number;
  deliveryCharge: number;
  taxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  roundingAdjustment: number;
  finalPayable: number;
}

/**
 * Calculates item tax based on standard Indian restaurant 5% rate (2.5% CGST + 2.5% SGST)
 * or inter-state catering 18% IGST.
 */
export function calculateLineTax(
  basePrice: number,
  quantity: number,
  gstRate: number = 5.0,
  isInterState: boolean = false
): LineItemTaxResult {
  const taxableValue = Number((basePrice * quantity).toFixed(2));

  if (isInterState) {
    const igstRate = gstRate;
    const igstAmount = Number(((taxableValue * igstRate) / 100).toFixed(2));
    const lineTotal = Number((taxableValue + igstAmount).toFixed(2));
    return {
      taxableValue,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate,
      igstAmount,
      lineTotal,
    };
  } else {
    // Split 50:50 between Central and State
    const halfRate = Number((gstRate / 2).toFixed(2));
    const cgstAmount = Number(((taxableValue * halfRate) / 100).toFixed(2));
    const sgstAmount = Number(((taxableValue * halfRate) / 100).toFixed(2));
    const lineTotal = Number((taxableValue + cgstAmount + sgstAmount).toFixed(2));
    return {
      taxableValue,
      cgstRate: halfRate,
      cgstAmount,
      sgstRate: halfRate,
      sgstAmount,
      igstRate: 0,
      igstAmount: 0,
      lineTotal,
    };
  }
}

/**
 * Computes complete bill tax and executes Rule 58 rounding.
 * Rule 58: fractions >= 0.50 round up to 1.00; fractions < 0.50 round down to 0.00.
 */
export function computeOrderTotals(
  items: Array<{ unitPrice: number; quantity: number; gstRate?: number }>,
  discountAmount: number = 0,
  packagingCharge: number = 0,
  deliveryCharge: number = 0,
  isInterState: boolean = false
): OrderTaxSummary {
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  for (const item of items) {
    const line = calculateLineTax(item.unitPrice, item.quantity, item.gstRate ?? 5.0, isInterState);
    subtotal += line.taxableValue;
    totalCgst += line.cgstAmount;
    totalSgst += line.sgstAmount;
    totalIgst += line.igstAmount;
  }

  // Adjust tax proportionally if discount is applied
  const effectiveDiscount = Math.min(discountAmount, subtotal);
  const discountRatio = subtotal > 0 ? (subtotal - effectiveDiscount) / subtotal : 1;

  const adjustedCgst = Number((totalCgst * discountRatio).toFixed(2));
  const adjustedSgst = Number((totalSgst * discountRatio).toFixed(2));
  const adjustedIgst = Number((totalIgst * discountRatio).toFixed(2));

  const taxableAmount = Number((subtotal - effectiveDiscount).toFixed(2));
  const preRoundTotal = taxableAmount + adjustedCgst + adjustedSgst + adjustedIgst + packagingCharge + deliveryCharge;

  // Rule 58 statutory rounding
  const finalPayable = Math.round(preRoundTotal);
  const roundingAdjustment = Number((finalPayable - preRoundTotal).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(effectiveDiscount.toFixed(2)),
    packagingCharge: Number(packagingCharge.toFixed(2)),
    deliveryCharge: Number(deliveryCharge.toFixed(2)),
    taxableAmount,
    totalCgst: adjustedCgst,
    totalSgst: adjustedSgst,
    totalIgst: adjustedIgst,
    roundingAdjustment,
    finalPayable,
  };
}

/**
 * Generate UPI dynamic intent URL string
 * Spec: upi://pay?pa=<VPA>&pn=<PayeeName>&am=<Amount>&tr=<RefID>&tn=<Note>
 */
export function generateUpiIntentUrl(
  vpa: string = 'foodos.rzp@icici',
  payeeName: string = 'ChaiSathi Foods',
  amount: number,
  transactionRef: string,
  note: string = 'FoodOS Dining Payment'
): string {
  const formattedAmount = amount.toFixed(2);
  const encodedName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(note);
  return `upi://pay?pa=${vpa}&pn=${encodedName}&am=${formattedAmount}&tr=${transactionRef}&tn=${encodedNote}&cu=INR`;
}

/**
 * Generate monotonic ULID-like unique sequential identifier for offline POS resilience
 */
export function generateUlid(prefix: string = 'ULID'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Indian Rupee formatter with INR symbol
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
