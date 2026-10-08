import React from 'react';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FareCalculation, RideCategory } from '../types';

interface FareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fare: FareCalculation;
  category: RideCategory;
  currency: string;
  couponCode?: string | null;
}

export const FareModal: React.FC<FareModalProps> = ({
  isOpen,
  onClose,
  fare,
  category,
  currency,
  couponCode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Fare Breakdown</h3>
        <p className="text-xs text-slate-400 mb-4">{category.name} • Transparent Pricing Engine</p>

        <div className="space-y-2.5 text-xs text-slate-300 pb-4 border-b border-slate-800">
          <div className="flex justify-between">
            <span className="text-slate-400">Base Fare</span>
            <span className="font-semibold">{currency}{fare.baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Distance Charge ({fare.distanceKm} km @ {currency}{category.perKmPrice}/km)</span>
            <span className="font-semibold">{currency}{fare.distanceCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Estimated Duration ({Math.round(fare.durationMin)} mins)</span>
            <span className="font-semibold">{currency}{fare.timeCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Booking Fee</span>
            <span className="font-semibold">{currency}{fare.bookingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Platform Access Fee</span>
            <span className="font-semibold">{currency}{fare.platformFee.toFixed(2)}</span>
          </div>

          {fare.surgeMultiplier > 1.0 && (
            <div className="flex justify-between text-amber-400 font-bold">
              <span>Dynamic Surge Multiplier ({fare.surgeMultiplier}x)</span>
              <span>+{currency}{fare.surgeAmount.toFixed(2)}</span>
            </div>
          )}

          {fare.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Promo Coupon Discount ({couponCode || 'PROMO'})</span>
              <span>-{currency}{fare.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-slate-400">Applicable Taxes & Tolls (5%)</span>
            <span className="font-semibold">{currency}{fare.taxes.toFixed(2)}</span>
          </div>
        </div>

        {/* Total fare */}
        <div className="py-4 flex justify-between items-center border-b border-slate-800">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Upfront Fare</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Locked fare guarantee
            </p>
          </div>
          <span className="text-2xl font-black text-white">
            {currency}{fare.totalFare.toFixed(2)}
          </span>
        </div>

        {/* Commission split fairness */}
        <div className="my-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>RYDE Fairness & Commission Split</span>
          </div>
          <div className="flex justify-between text-slate-300 mt-1">
            <span>Driver Partner Earns (~{category.driverCommissionPercent}%)</span>
            <span className="font-bold text-emerald-400">{currency}{fare.driverEarnings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400 mt-0.5">
            <span>RYDE Platform Commission (~{category.rydeCommissionPercent}%)</span>
            <span>{currency}{fare.rydeCommission.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-colors"
        >
          Got It, Continue
        </button>
      </div>
    </div>
  );
};
