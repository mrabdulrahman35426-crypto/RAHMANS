import React from 'react';
import { useRideStore } from '../store/useRideStore';
import { Shield, Car, Navigation, Settings, Wallet } from 'lucide-react';
import { AppRole } from '../types';

interface NavbarProps {
  onOpenSos: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSos }) => {
  const { currentRole, setRole, brandSettings, currentCustomer, currentDriver } = useRideStore();

  const roles: { id: AppRole; label: string; icon: any }[] = [
    { id: 'CUSTOMER', label: 'Customer App', icon: Car },
    { id: 'DRIVER', label: 'Driver Partner', icon: Navigation },
    { id: 'ADMIN', label: 'Admin Dashboard', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-black text-xl shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: brandSettings.primaryColorHex }}
            >
              {brandSettings.appName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-white">
                  {brandSettings.appName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                {brandSettings.tagline}
              </p>
            </div>
          </div>

          {/* Quick SOS button for mobile */}
          <button
            onClick={onOpenSos}
            className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/25 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            SOS
          </button>
        </div>

        {/* Global Persona / Role Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 w-full sm:w-auto justify-center">
          {roles.map(({ id, label, icon: Icon }) => {
            const isSelected = currentRole === id;
            return (
              <button
                key={id}
                onClick={() => setRole(id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'text-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                style={isSelected ? { backgroundColor: brandSettings.primaryColorHex } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                {id === 'DRIVER' && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentDriver.status !== 'OFFLINE' ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Header Right Tools */}
        <div className="hidden sm:flex items-center gap-3">
          {currentRole === 'CUSTOMER' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {brandSettings.currencySymbol}
                {currentCustomer.walletBalance.toLocaleString()}
              </span>
            </div>
          )}

          {currentRole === 'DRIVER' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                Today: {brandSettings.currencySymbol}
                {currentDriver.todayEarnings.toLocaleString()}
              </span>
            </div>
          )}

          <button
            onClick={onOpenSos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/25 transition-colors"
          >
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Safety SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
