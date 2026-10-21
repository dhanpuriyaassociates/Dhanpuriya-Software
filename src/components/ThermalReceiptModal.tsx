import React, { useState } from 'react';
import { Printer, Share2, Check, Download, X, QrCode } from 'lucide-react';
import { Order, Branch } from '../types/foodos';
import { formatINR } from '../utils/taxEngine';

interface ThermalReceiptModalProps {
  order: Order | null;
  branch: Branch;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  branch,
  onClose,
}) => {
  const [whatsappSent, setWhatsappSent] = useState<boolean>(false);
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98201 98765');
  const [showWhatsappInput, setShowWhatsappInput] = useState<boolean>(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsapp = () => {
    setWhatsappSent(true);
    setTimeout(() => {
      setShowWhatsappInput(false);
      setWhatsappSent(false);
    }, 2500);
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Controls Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-white">ESC/POS 80mm Tax Invoice</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body (Styled as authentic 80mm thermal receipt) */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex justify-center">
          <div
            id="thermal-receipt-printable"
            className="w-full max-w-[320px] bg-white text-slate-900 p-4 font-mono text-[11px] leading-tight shadow-md rounded-sm border border-slate-300"
          >
            {/* Header / Brand */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-0.5">
              <h2 className="text-sm font-bold tracking-wider uppercase">DHANPURIYA FOODS</h2>
              <p className="text-[10px] text-slate-600">{branch.branchName}</p>
              <p className="text-[9px] text-slate-600">{branch.addressLine1}, {branch.city}</p>
              <p className="text-[9px] text-slate-600">Ph: {branch.phone}</p>
              <p className="text-[9px] font-semibold text-slate-800">GSTIN: {branch.gstin}</p>
              <p className="text-[9px] text-slate-600">FSSAI Lic No: {branch.fssaiLicenseNumber}</p>
            </div>

            {/* Invoice Meta */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between font-bold">
                <span>TAX INVOICE</span>
                <span>TOKEN: #{order.dailyTokenNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Inv: {order.orderNumber}</span>
                <span>{order.orderType}</span>
              </div>
              <div className="flex justify-between">
                <span>Date: {formattedDate}</span>
                <span>Time: {formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {order.orderType === 'DINE_IN' ? `Table: ${order.tableName || '14'}` : 'Counter'}
                </span>
                <span>Cashier: {order.cashierName}</span>
              </div>
              {order.waiterName && (
                <div className="flex justify-between">
                  <span>Server: {order.waiterName}</span>
                  <span>ULID: {order.ulid.slice(-6)}</span>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="py-2 border-b border-dashed border-slate-400">
              <div className="grid grid-cols-12 font-bold pb-1 text-[10px] border-b border-slate-200">
                <span className="col-span-6">ITEM (HSN 996331)</span>
                <span className="col-span-2 text-center">QTY</span>
                <span className="col-span-2 text-right">RATE</span>
                <span className="col-span-2 text-right">AMT</span>
              </div>
              <div className="divide-y divide-slate-100 py-1">
                {order.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 py-1 items-start">
                    <div className="col-span-6">
                      <div className="font-semibold">{it.name}</div>
                      {it.variantName && (
                        <div className="text-[9px] text-slate-500">[{it.variantName}]</div>
                      )}
                      {it.itemNotes && (
                        <div className="text-[9px] text-slate-500 italic">*{it.itemNotes}</div>
                      )}
                    </div>
                    <span className="col-span-2 text-center font-bold">{it.quantity}</span>
                    <span className="col-span-2 text-right">₹{it.unitPrice}</span>
                    <span className="col-span-2 text-right font-bold">
                      ₹{it.unitPrice * it.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Computation Breakdown */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>Subtotal (Taxable Value):</span>
                <span>₹{order.subtotalAmount.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount {order.discountCode ? `(${order.discountCode})` : ''}:</span>
                  <span>-₹{order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>CGST @ 2.50%:</span>
                <span>₹{order.cgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST @ 2.50%:</span>
                <span>₹{order.sgstAmount.toFixed(2)}</span>
              </div>
              {order.packagingChargeAmount > 0 && (
                <div className="flex justify-between">
                  <span>Packaging Charges:</span>
                  <span>₹{order.packagingChargeAmount.toFixed(2)}</span>
                </div>
              )}
              {order.deliveryChargeAmount > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Charges:</span>
                  <span>₹{order.deliveryChargeAmount.toFixed(2)}</span>
                </div>
              )}
              {order.roundingAdjustment !== 0 && (
                <div className="flex justify-between text-slate-500 text-[9px]">
                  <span>Round Off (Rule 58):</span>
                  <span>
                    {order.roundingAdjustment > 0 ? '+' : ''}
                    ₹{order.roundingAdjustment.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-300">
                <span>GRAND TOTAL:</span>
                <span>₹{order.finalPayableAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Settlement Information */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold">{order.paymentMode}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </div>
              {order.transactionReference && (
                <div className="flex justify-between">
                  <span>Ref:</span>
                  <span className="font-mono text-[9px]">{order.transactionReference}</span>
                </div>
              )}
            </div>

            {/* QR Code & Statutory Footer */}
            <div className="pt-2 text-center space-y-1.5">
              <div className="flex justify-center">
                {/* Simulated digital receipt verify QR */}
                <svg className="w-16 h-16" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="22" height="22" fill="#0f172a" />
                  <rect x="14" y="14" width="14" height="14" fill="white" />
                  <rect x="18" y="18" width="6" height="6" fill="#0f172a" />
                  <rect x="68" y="10" width="22" height="22" fill="#0f172a" />
                  <rect x="72" y="14" width="14" height="14" fill="white" />
                  <rect x="76" y="18" width="6" height="6" fill="#0f172a" />
                  <rect x="10" y="68" width="22" height="22" fill="#0f172a" />
                  <rect x="14" y="72" width="14" height="14" fill="white" />
                  <rect x="18" y="76" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="25" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="35" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="65" width="6" height="6" fill="#0f172a" />
                  <rect x="65" y="65" width="6" height="6" fill="#0f172a" />
                </svg>
              </div>
              <p className="text-[9px] text-slate-500">Scan for GST e-Invoice verification</p>
              <p className="text-[8px] text-slate-600 uppercase">
                FSSAI Regd. · Thank you for dining with Dhanpuriya!
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-850 border-t border-slate-800 space-y-2">
          {showWhatsappInput ? (
            <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-lg border border-slate-700">
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="flex-1 bg-transparent text-xs text-white px-2 py-1 focus:outline-none font-mono"
              />
              <button
                onClick={handleSendWhatsapp}
                disabled={whatsappSent}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                {whatsappSent ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Dispatched!</span>
                  </>
                ) : (
                  <span>Send PDF</span>
                )}
              </button>
              <button
                onClick={() => setShowWhatsappInput(false)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-orange-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print ESC/POS (80mm)</span>
            </button>
            <button
              onClick={() => setShowWhatsappInput(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
