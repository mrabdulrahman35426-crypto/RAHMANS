import React from 'react';
import { X, CheckCircle, Printer, Download, MapPin, Car, ShieldCheck } from 'lucide-react';
import { ActiveRide, BrandSettings } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: ActiveRide | null;
  brandSettings: BrandSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  ride,
  brandSettings,
}) => {
  if (!isOpen || !ride) return null;

  const currency = brandSettings.currencySymbol;
  const dateStr = new Date(ride.completedAt || ride.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = new Date(ride.completedAt || ride.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-xl shadow-lg"
              style={{ backgroundColor: brandSettings.primaryColorHex }}
            >
              {brandSettings.appName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-wide">{brandSettings.appName} Receipt</h3>
              <p className="text-xs text-slate-400">{brandSettings.tagline}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              Paid • Completed
            </span>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">#{ride.rideId}</p>
          </div>
        </div>

        {/* Date & Journey Meta */}
        <div className="py-4 grid grid-cols-2 gap-4 border-b border-slate-800 text-xs">
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Date & Time</p>
            <p className="font-semibold text-white mt-0.5">{dateStr}</p>
            <p className="text-slate-400">{timeStr}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Payment Method</p>
            <p className="font-semibold text-white mt-0.5">{ride.paymentMethod}</p>
            <p className="text-slate-400">{ride.category.name}</p>
          </div>
        </div>

        {/* Route Details */}
        <div className="py-4 border-b border-slate-800 space-y-3">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Route Summary</p>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">{ride.pickup.title}</p>
                <p className="text-slate-400 text-[11px]">{ride.pickup.subtitle}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">{ride.destination.title}</p>
                <p className="text-slate-400 text-[11px]">{ride.destination.subtitle}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
            <span>Distance: <strong className="text-white">{ride.fare.distanceKm} km</strong></span>
            <span>Duration: <strong className="text-white">{Math.round(ride.fare.durationMin)} mins</strong></span>
            {ride.driver && (
              <span>Driver: <strong className="text-white">{ride.driver.name}</strong> ({ride.driver.vehicleModel})</span>
            )}
          </div>
        </div>

        {/* Itemized Fare Table */}
        <div className="py-4 border-b border-slate-800 space-y-2 text-xs">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Itemized Charges</p>
          <div className="flex justify-between text-slate-300">
            <span>Base Fare</span>
            <span>{currency}{ride.fare.baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Distance Charge ({ride.fare.distanceKm} km @ {currency}{ride.category.perKmPrice}/km)</span>
            <span>{currency}{ride.fare.distanceCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Time Charge ({Math.round(ride.fare.durationMin)} mins @ {currency}{ride.category.perMinutePrice}/min)</span>
            <span>{currency}{ride.fare.timeCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Booking Fee</span>
            <span>{currency}{ride.fare.bookingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Platform Fee</span>
            <span>{currency}{ride.fare.platformFee.toFixed(2)}</span>
          </div>

          {ride.fare.surgeMultiplier > 1.0 && (
            <div className="flex justify-between text-amber-400 font-bold">
              <span>Surge Pricing ({ride.fare.surgeMultiplier}x)</span>
              <span>+{currency}{ride.fare.surgeAmount.toFixed(2)}</span>
            </div>
          )}

          {ride.fare.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Promo Discount ({ride.couponCode || 'PROMO'})</span>
              <span>-{currency}{ride.fare.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-300">
            <span>Taxes & Regulatory Surcharges</span>
            <span>{currency}{ride.fare.taxes.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Cost Display */}
        <div className="py-4 flex justify-between items-center border-b border-slate-800">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Amount Paid</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3.5 h-3.5" /> Charged to {ride.paymentMethod}
            </p>
          </div>
          <span className="text-3xl font-black text-white">
            {currency}{ride.fare.totalFare.toFixed(2)}
          </span>
        </div>

        {/* Customer Rating if any */}
        {ride.ratingGivenByCustomer && (
          <div className="py-3 border-b border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">Your Rating</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <span>★ {ride.ratingGivenByCustomer}/5</span>
              {ride.customerReview && (
                <span className="text-slate-400 font-normal italic truncate max-w-[200px]">
                  "{ride.customerReview}"
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-5 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-black font-extrabold text-xs transition-colors"
            style={{ backgroundColor: brandSettings.primaryColorHex }}
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
