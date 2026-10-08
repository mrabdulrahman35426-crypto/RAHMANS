import React, { useState } from 'react';
import { useRideStore } from '../store/useRideStore';
import {
  BarChart3,
  DollarSign,
  Car,
  Users,
  Settings,
  Plus,
  Edit2,
  CheckCircle,
  Tag,
  ShieldAlert,
  Save,
  Check,
} from 'lucide-react';
import { RideCategory, Coupon } from '../types';

export const AdminView: React.FC = () => {
  const {
    brandSettings,
    categories,
    drivers,
    completedRides,
    activeRide,
    coupons,
    supportTickets,
    updateBrandSettings,
    updateCategoryPricing,
    addCategory,
    addCoupon,
    updateDriverStatus,
    resolveSupportTicket,
  } = useRideStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'drivers' | 'coupons' | 'settings' | 'tickets'>('overview');

  // Brand settings form state
  const [appName, setAppName] = useState(brandSettings.appName);
  const [tagline, setTagline] = useState(brandSettings.tagline);
  const [currencySymbol, setCurrencySymbol] = useState(brandSettings.currencySymbol);
  const [primaryColor, setPrimaryColor] = useState(brandSettings.primaryColorHex);
  const [driverComm, setDriverComm] = useState(brandSettings.defaultDriverCommissionPercent.toString());
  const [rydeComm, setRydeComm] = useState(brandSettings.defaultRydeCommissionPercent.toString());
  const [taxPercent, setTaxPercent] = useState(brandSettings.taxPercent.toString());
  const [globalSurge, setGlobalSurge] = useState(brandSettings.globalSurgeMultiplier.toString());
  const [isSurgeActive, setIsSurgeActive] = useState(brandSettings.isSurgeActive);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Edit category modal state
  const [editingCategory, setEditingCategory] = useState<RideCategory | null>(null);
  const [editBaseFare, setEditBaseFare] = useState('');
  const [editPerKm, setEditPerKm] = useState('');
  const [editPerMin, setEditPerMin] = useState('');
  const [editSurge, setEditSurge] = useState('');
  const [editDriverSplit, setEditDriverSplit] = useState('');
  const [editRydeSplit, setEditRydeSplit] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // New category modal state
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatBase, setNewCatBase] = useState('70');
  const [newCatKm, setNewCatKm] = useState('15');

  // New coupon modal state
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCpCode, setNewCpCode] = useState('');
  const [newCpPercent, setNewCpPercent] = useState('25');
  const [newCpMax, setNewCpMax] = useState('100');
  const [newCpDesc, setNewCpDesc] = useState('');

  // Calculations
  const grossVolume = completedRides.reduce((sum, r) => sum + r.fare.totalFare, 0);
  const rydeRevenue = completedRides.reduce((sum, r) => sum + r.fare.rydeCommission, 0);
  const driverPayouts = completedRides.reduce((sum, r) => sum + r.fare.driverEarnings, 0);
  const onlineCount = drivers.filter((d) => d.status === 'ONLINE').length;

  const handleOpenEditCat = (cat: RideCategory) => {
    setEditingCategory(cat);
    setEditBaseFare(cat.baseFare.toString());
    setEditPerKm(cat.perKmPrice.toString());
    setEditPerMin(cat.perMinutePrice.toString());
    setEditSurge(cat.surgeMultiplier.toString());
    setEditDriverSplit(cat.driverCommissionPercent.toString());
    setEditRydeSplit(cat.rydeCommissionPercent.toString());
    setEditIsActive(cat.isActive);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    updateCategoryPricing(editingCategory.id, {
      baseFare: parseFloat(editBaseFare) || editingCategory.baseFare,
      perKmPrice: parseFloat(editPerKm) || editingCategory.perKmPrice,
      perMinutePrice: parseFloat(editPerMin) || editingCategory.perMinutePrice,
      surgeMultiplier: parseFloat(editSurge) || editingCategory.surgeMultiplier,
      driverCommissionPercent: parseFloat(editDriverSplit) || editingCategory.driverCommissionPercent,
      rydeCommissionPercent: parseFloat(editRydeSplit) || editingCategory.rydeCommissionPercent,
      isActive: editIsActive,
    });
    setEditingCategory(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandSettings({
      appName,
      tagline,
      currencySymbol,
      primaryColorHex: primaryColor,
      defaultDriverCommissionPercent: parseFloat(driverComm) || 80,
      defaultRydeCommissionPercent: parseFloat(rydeComm) || 20,
      taxPercent: parseFloat(taxPercent) || 5,
      globalSurgeMultiplier: parseFloat(globalSurge) || 1.0,
      isSurgeActive,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>{brandSettings.appName} Operations Console</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Super Admin
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time business controls, dynamic pricing, and commission settings
          </p>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'categories', label: 'Categories & Rates', icon: Car },
            { id: 'drivers', label: 'Fleet Audit', icon: Users },
            { id: 'coupons', label: 'Promotions', icon: Tag },
            { id: 'settings', label: 'Brand & Rules', icon: Settings },
            { id: 'tickets', label: 'Tickets', icon: ShieldAlert },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === id
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Live Activity Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live System Status</p>
              <p className="text-sm font-bold text-white mt-0.5">
                {activeRide
                  ? `Active Ride in Progress (#${activeRide.rideId} • ${activeRide.status})`
                  : 'All Dispatches Nominal • No Active Alerts'}
              </p>
            </div>
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Booking Volume</p>
              <h3 className="text-2xl font-black text-white">
                {brandSettings.currencySymbol}
                {grossVolume.toFixed(2)}
              </h3>
              <p className="text-xs text-slate-400">{completedRides.length} rides executed</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{brandSettings.appName} Net Revenue</p>
              <h3 className="text-2xl font-black text-cyan-400">
                {brandSettings.currencySymbol}
                {rydeRevenue.toFixed(2)}
              </h3>
              <p className="text-xs text-slate-400">Platform take (~{brandSettings.defaultRydeCommissionPercent}%)</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Driver Partner Payouts</p>
              <h3 className="text-2xl font-black text-emerald-400">
                {brandSettings.currencySymbol}
                {driverPayouts.toFixed(2)}
              </h3>
              <p className="text-xs text-slate-400">Net driver earnings (~{brandSettings.defaultDriverCommissionPercent}%)</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Online Fleet Coverage</p>
              <h3 className="text-2xl font-black text-amber-400">
                {onlineCount} / {drivers.length}
              </h3>
              <p className="text-xs text-slate-400">Active roaming drivers</p>
            </div>
          </div>

          {/* Commission Split Transparency Diagram */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white">Platform Commission Structure</h4>
            <p className="text-xs text-slate-400">
              On every {brandSettings.currencySymbol}500 ride: Driver receives{' '}
              <strong className="text-emerald-400">
                {brandSettings.currencySymbol}
                {(500 * (brandSettings.defaultDriverCommissionPercent / 100)).toFixed(0)}
              </strong>{' '}
              ({brandSettings.defaultDriverCommissionPercent}%) and {brandSettings.appName} collects{' '}
              <strong className="text-cyan-400">
                {brandSettings.currencySymbol}
                {(500 * (brandSettings.defaultRydeCommissionPercent / 100)).toFixed(0)}
              </strong>{' '}
              ({brandSettings.defaultRydeCommissionPercent}%). Configurable anytime below.
            </p>

            <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${brandSettings.defaultDriverCommissionPercent}%` }}
              />
              <div
                className="h-full bg-cyan-400"
                style={{ width: `${brandSettings.defaultRydeCommissionPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Categories & Pricing Rules */}
      {activeTab === 'categories' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Ride Categories & Pricing Rules</h3>
              <p className="text-xs text-slate-400">
                Adjust base fares, distance rates, surge multiplier, and commission splits without code changes.
              </p>
            </div>
            <button
              onClick={() => setShowAddCatModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`p-5 rounded-2xl border bg-slate-900 flex flex-col justify-between space-y-4 ${
                  cat.isActive ? 'border-slate-800' : 'border-rose-500/30 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-base text-white">{cat.name}</span>
                    <button
                      onClick={() => handleOpenEditCat(cat)}
                      className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{cat.description}</p>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Base Fare:</span>
                      <span className="font-bold">{brandSettings.currencySymbol}{cat.baseFare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Per Km Rate:</span>
                      <span className="font-bold">{brandSettings.currencySymbol}{cat.perKmPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Per Min Rate:</span>
                      <span className="font-bold">{brandSettings.currencySymbol}{cat.perMinutePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Surge Multiplier:</span>
                      <span className="font-bold text-amber-400">{cat.surgeMultiplier}x</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs flex justify-between items-center text-slate-400">
                  <span>Driver: <strong className="text-emerald-400">{cat.driverCommissionPercent}%</strong></span>
                  <span>{brandSettings.appName}: <strong className="text-cyan-400">{cat.rydeCommissionPercent}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Drivers Fleet Audit */}
      {activeTab === 'drivers' && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-white">Driver Partner Fleet</h3>
            <p className="text-xs text-slate-400">Review documents, verification status, and ratings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((drv) => (
              <div key={drv.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{drv.name}</h4>
                    {drv.isVerified && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {drv.vehicleMake} {drv.vehicleModel} • {drv.licensePlate}
                  </p>
                  <p className="text-[11px] text-amber-400 mt-1">
                    ★ {drv.rating} • {drv.totalRides} trips • {drv.acceptanceRate}% acceptance
                  </p>
                </div>

                <button
                  onClick={() => updateDriverStatus(drv.id, !drv.isVerified)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    drv.isVerified
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                      : 'bg-emerald-500 text-black font-extrabold'
                  }`}
                >
                  {drv.isVerified ? 'Revoke Status' : 'Approve Driver'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Promotions & Coupons */}
      {activeTab === 'coupons' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Coupon & Offer Rules</h3>
              <p className="text-xs text-slate-400">Create discount codes and usage limits.</p>
            </div>
            <button
              onClick={() => setShowAddCouponModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((cp) => (
              <div key={cp.code} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-sm text-emerald-400 font-mono tracking-wider">{cp.code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 font-bold">
                    {cp.discountPercent > 0 ? `${cp.discountPercent}% OFF` : `FLAT ${brandSettings.currencySymbol}${cp.flatDiscount}`}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{cp.description}</p>
                <p className="text-[11px] text-slate-500">
                  Max Cap: {brandSettings.currencySymbol}{cp.maxDiscount} • Min Fare: {brandSettings.currencySymbol}{cp.minFare}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Brand Identity & Business Rules (Database-driven Config) */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 max-w-2xl animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-white">Dynamic Brand & Platform Settings</h3>
            <p className="text-xs text-slate-400">Everything is stored dynamically without modifying application code.</p>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Platform settings updated successfully across all client apps!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">App Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          {/* Color Scheme Preset */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Primary Theme Color</label>
            <div className="flex items-center gap-3">
              {['#00E599', '#00D2FF', '#FF6B00', '#8B5CF6', '#FFD600'].map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setPrimaryColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    primaryColor.toUpperCase() === color.toUpperCase() ? 'border-white scale-110 ring-2 ring-white/50' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-28 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-white text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Driver Commission %</label>
              <input
                type="number"
                value={driverComm}
                onChange={(e) => setDriverComm(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">{brandSettings.appName} Fee %</label>
              <input
                type="number"
                value={rydeComm}
                onChange={(e) => setRydeComm(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          {/* Surge Toggle */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Global Surge Pricing Switch</p>
              <p className="text-[11px] text-slate-400">Forces surge multiplier across all ride categories in high-demand events</p>
            </div>
            <input
              type="checkbox"
              checked={isSurgeActive}
              onChange={(e) => setIsSurgeActive(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" /> Save & Apply Business Rules
          </button>
        </form>
      )}

      {/* 6. Tickets Desk */}
      {activeTab === 'tickets' && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-white">Support & Escalations Desk</h3>
            <p className="text-xs text-slate-400">Review tickets from customers and driver partners.</p>
          </div>

          <div className="space-y-3">
            {supportTickets.map((tck) => (
              <div key={tck.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{tck.id} • {tck.subject}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tck.status === 'RESOLVED'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {tck.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{tck.message}</p>
                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>From: {tck.userName} ({tck.userType})</span>
                  {tck.status !== 'RESOLVED' && (
                    <button
                      onClick={() => resolveSupportTicket(tck.id)}
                      className="px-2.5 py-1 rounded bg-emerald-500 text-black font-bold text-[10px]"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSaveCat} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white">Edit Pricing for {editingCategory.name}</h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Base Fare ({brandSettings.currencySymbol})</label>
                <input
                  type="number"
                  value={editBaseFare}
                  onChange={(e) => setEditBaseFare(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Per Km Price ({brandSettings.currencySymbol})</label>
                <input
                  type="number"
                  value={editPerKm}
                  onChange={(e) => setEditPerKm(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Per Minute Price ({brandSettings.currencySymbol})</label>
                <input
                  type="number"
                  value={editPerMin}
                  onChange={(e) => setEditPerMin(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Surge Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  value={editSurge}
                  onChange={(e) => setEditSurge(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Driver Split %</label>
                <input
                  type="number"
                  value={editDriverSplit}
                  onChange={(e) => setEditDriverSplit(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">RYDE Split %</label>
                <input
                  type="number"
                  value={editRydeSplit}
                  onChange={(e) => setEditRydeSplit(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-white">Active in Passenger App</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs"
              >
                Save Rates
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-bold text-white">Create Ride Category</h4>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category Name (e.g. RYDE Pet, Express)"
              className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            />
            <input
              type="text"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Description"
              className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="number"
                value={newCatBase}
                onChange={(e) => setNewCatBase(e.target.value)}
                placeholder="Base Fare"
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
              />
              <input
                type="number"
                value={newCatKm}
                onChange={(e) => setNewCatKm(e.target.value)}
                placeholder="Per Km"
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddCatModal(false)}
                className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newCatName) {
                    addCategory({
                      id: `cat_${Date.now()}`,
                      name: newCatName,
                      description: newCatDesc || 'Special vehicle tier',
                      vehicleType: 'Sedan / SUV',
                      capacity: 4,
                      baseFare: parseFloat(newCatBase) || 70,
                      minFare: 90,
                      perKmPrice: parseFloat(newCatKm) || 15,
                      perMinutePrice: 2,
                      bookingFee: 10,
                      platformFee: 5,
                      cancellationFee: 25,
                      surgeMultiplier: 1.0,
                      driverCommissionPercent: 80,
                      rydeCommissionPercent: 20,
                      estimatedArrivalMinutes: 4,
                      iconKey: 'car',
                      isActive: true,
                    });
                    setShowAddCatModal(false);
                  }
                }}
                className="flex-1 py-2 rounded-lg bg-emerald-500 text-black text-xs font-extrabold"
              >
                Add Tier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-bold text-white">Create Promo Coupon</h4>
            <input
              type="text"
              value={newCpCode}
              onChange={(e) => setNewCpCode(e.target.value.toUpperCase())}
              placeholder="Code (e.g. FLASH50)"
              className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
            />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="number"
                value={newCpPercent}
                onChange={(e) => setNewCpPercent(e.target.value)}
                placeholder="Discount %"
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
              />
              <input
                type="number"
                value={newCpMax}
                onChange={(e) => setNewCpMax(e.target.value)}
                placeholder="Max Cap"
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <input
              type="text"
              value={newCpDesc}
              onChange={(e) => setNewCpDesc(e.target.value)}
              placeholder="Description"
              className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddCouponModal(false)}
                className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newCpCode) {
                    addCoupon({
                      code: newCpCode,
                      discountPercent: parseFloat(newCpPercent) || 20,
                      flatDiscount: 0,
                      maxDiscount: parseFloat(newCpMax) || 100,
                      minFare: 80,
                      description: newCpDesc || 'Promotional coupon',
                      isActive: true,
                    });
                    setShowAddCouponModal(false);
                  }
                }}
                className="flex-1 py-2 rounded-lg bg-emerald-500 text-black text-xs font-extrabold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
