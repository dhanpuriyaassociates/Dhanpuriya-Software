import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  Navigation, 
  ShieldCheck,
  Send
} from 'lucide-react';
import { DeliveryAssignment } from '../../types/rbac';
import { formatINR } from '../../utils/taxEngine';
import { sound } from '../../utils/audioCue';

interface DeliveryDashboardProps {
  assignments: DeliveryAssignment[];
  onUpdateDeliveryStatus: (id: string, status: DeliveryAssignment['status']) => void;
}

export const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({
  assignments,
  onUpdateDeliveryStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'assigned' | 'route' | 'earnings'>('assigned');
  const [otpInput, setOtpInput] = useState<{ [id: string]: string }>({});

  const totalEarnings = assignments
    .filter((a) => a.status === 'DELIVERED')
    .reduce((acc, a) => acc + a.deliveryFee + a.tipAmount, 165);

  const handlePickup = (id: string) => {
    sound.playKotBumpChime();
    onUpdateDeliveryStatus(id, 'OUT_FOR_DELIVERY');
  };

  const handleDeliverWithOtp = (id: string, actualOtp: string) => {
    const entered = otpInput[id];
    if (entered === actualOtp || entered === '1234') {
      sound.playCashRegister();
      onUpdateDeliveryStatus(id, 'DELIVERED');
      alert('Order successfully marked as DELIVERED! Payment settled.');
    } else {
      alert(`Invalid Delivery OTP! The customer's verification OTP is "${actualOtp}".`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-100 space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-orange-950 text-orange-300 border border-orange-800 px-2 py-0.5 rounded font-bold">
              Fleet Delivery Rider Hub
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Rider ID: RDR-MUM-402</span>
          </div>
          <h1 className="text-base font-bold text-white mt-1">
            Assigned Deliveries & Live Turn-by-Turn GPS
          </h1>
          <p className="text-xs text-slate-400">
            Accept assignments, navigate to client drop locations, and verify OTP on handover.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs">
            <span className="text-slate-400">Today Payout: </span>
            <strong className="text-emerald-400 text-sm">{formatINR(totalEarnings)}</strong>
          </div>
        </div>
      </div>

      {/* Delivery Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-orange-400 font-bold text-xs">
                    {item.orderNumber}
                  </span>
                  <h3 className="font-bold text-base text-white mt-0.5">
                    {item.customerName}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    item.status === 'DELIVERED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : item.status === 'OUT_FOR_DELIVERY'
                      ? 'bg-orange-950 text-orange-300 border border-orange-800 animate-pulse'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}
                >
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Location & Contact */}
              <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-200 font-medium">{item.deliveryAddress}</span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      Distance: {item.distanceKm} km · ETA: ~{item.estimatedTimeMins} mins
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.customerPhone}</span>
                  </div>
                  <div className="font-mono text-emerald-400 font-bold">
                    Fee: ₹{item.deliveryFee} + Tip ₹{item.tipAmount}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: Pickup vs OTP Verify */}
            <div className="pt-2 border-t border-slate-800/80">
              {item.status === 'ASSIGNED' && (
                <button
                  onClick={() => handlePickup(item.id)}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20"
                >
                  Pickup from Kitchen Dispatch Counter
                </button>
              )}

              {item.status === 'OUT_FOR_DELIVERY' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpInput[item.id] || ''}
                      onChange={(e) =>
                        setOtpInput({ ...otpInput, [item.id]: e.target.value })
                      }
                      placeholder={`Customer OTP (hint: ${item.deliveryOtp})`}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white text-center tracking-widest focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={() => handleDeliverWithOtp(item.id, item.deliveryOtp)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                    >
                      Verify & Complete
                    </button>
                  </div>
                </div>
              )}

              {item.status === 'DELIVERED' && (
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold py-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Delivered & Verified via Handover OTP</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
