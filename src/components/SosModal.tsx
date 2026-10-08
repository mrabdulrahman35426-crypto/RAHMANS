import React, { useState } from 'react';
import { Shield, AlertTriangle, Phone, CheckCircle2, X } from 'lucide-react';
import { useRideStore } from '../store/useRideStore';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const [triggered, setTriggered] = useState(false);
  const { activeRide } = useRideStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
          <Shield className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">RYDE Safety Shield • SOS</h3>

        {triggered ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>
                Emergency signal transmitted! Police dispatch and registered emergency contacts have been shared your live telemetry for ride {activeRide?.rideId || 'TRIP-ACTIVE'}.
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live tracking channel opened. A safety monitoring specialist is verifying telemetry.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
            >
              Close Shield Window
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <p className="text-sm text-slate-300">
              Triggering SOS immediately notifies local emergency dispatch and your trusted contacts with live GPS coordinates, vehicle registration, and driver details.
            </p>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Instant police dispatch coordinate broadcast</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <Phone className="w-4 h-4 text-rose-400" />
                <span>24/7 dedicated safety escalation helpline</span>
              </div>
            </div>

            <button
              onClick={() => setTriggered(true)}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <Shield className="w-4 h-4" />
              Confirm & Broadcast Emergency Alert
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold text-center"
            >
              Dismiss / False Alarm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
