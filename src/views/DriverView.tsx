import React, { useState } from 'react';
import { useRideStore } from '../store/useRideStore';
import { MapCanvas } from '../components/MapCanvas';
import { ChatModal } from '../components/ChatModal';
import {
  Navigation,
  Power,
  TrendingUp,
  Award,
  Wallet,
  Phone,
  MessageSquare,
  Shield,
  CheckCircle,
  KeyRound,
  AlertTriangle,
  HelpCircle,
  Star,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  Building,
  Check,
  Clock,
  CreditCard,
  Percent,
} from 'lucide-react';

interface DriverViewProps {
  onOpenSos: () => void;
}

export const DriverView: React.FC<DriverViewProps> = ({ onOpenSos }) => {
  const {
    currentDriver,
    activeRide,
    incomingDriverRequest,
    matchingTimerSec,
    brandSettings,
    incentives,
    walletTransactions,
    toggleDriverOnline,
    driverAcceptRequest,
    driverRejectRequest,
    driverArrived,
    verifyPinAndStartTrip,
    completeTrip,
    submitDriverRating,
    resetRide,
    claimIncentive,
    withdrawDriverFunds,
    createSupportTicket,
  } = useRideStore();

  const [activeTab, setActiveTab] = useState<'console' | 'earnings' | 'incentives' | 'support'>('console');
  const [showChatModal, setShowChatModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [driverRating, setDriverRating] = useState(5);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('1000');
  const [earningsFilter, setEarningsFilter] = useState<'ALL' | 'EARNINGS' | 'WITHDRAWALS' | 'INCENTIVES'>('ALL');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccessNotice, setWithdrawSuccessNotice] = useState<string | null>(null);

  const isOnline = currentDriver.status !== 'OFFLINE';

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = verifyPinAndStartTrip(pinInput);
    if (!success) {
      setPinError(true);
    } else {
      setPinInput('');
      setPinError(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-68px)]">
      {/* Left / Top: Interactive Map Stage */}
      <div className="w-full lg:w-7/12 h-[340px] sm:h-[420px] lg:h-auto flex flex-col relative border-b lg:border-b-0 lg:border-r border-slate-800">
        <MapCanvas />

        {/* Online / Offline Floating Status */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={toggleDriverOnline}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black shadow-xl backdrop-blur transition-all border ${
              isOnline
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/20'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'ONLINE • ACCEPTING' : 'OFFLINE • TAP TO GO ONLINE'}</span>
          </button>
        </div>
      </div>

      {/* Right / Bottom: Driver Console */}
      <div className="w-full lg:w-5/12 flex flex-col bg-[#0B0F17] overflow-y-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-900/60 border-b border-slate-800 text-xs">
          {[
            { id: 'console', label: 'Console', icon: Navigation },
            { id: 'earnings', label: 'Earnings', icon: Wallet },
            { id: 'incentives', label: 'Bonuses', icon: Award },
            { id: 'support', label: 'Help Desk', icon: HelpCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              style={activeTab === id ? { borderBottom: `3px solid ${brandSettings.primaryColorHex}` } : {}}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          {activeTab === 'console' && (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* 1. Incoming Ride Request HUD Alert */}
              {incomingDriverRequest && isOnline && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border-2 border-emerald-400 shadow-2xl animate-in zoom-in-95 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-400 text-black font-black text-[10px] tracking-wider uppercase">
                      Incoming Ride Offer
                    </span>
                    <span className="text-sm font-black text-amber-400 animate-pulse">
                      {matchingTimerSec}s to respond
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Net Estimated Earning</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-400">
                        {brandSettings.currencySymbol}
                        {incomingDriverRequest.fare.driverEarnings.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400">
                        (Gross: {brandSettings.currencySymbol}
                        {incomingDriverRequest.fare.totalFare.toFixed(2)})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Pickup</p>
                        <p className="font-semibold text-white">{incomingDriverRequest.pickup.title}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Destination</p>
                        <p className="font-semibold text-white">{incomingDriverRequest.destination.title}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={driverRejectRequest}
                      className="py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => driverAcceptRequest()}
                      className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-all transform active:scale-95"
                    >
                      Accept Ride
                    </button>
                  </div>
                </div>
              )}

              {/* 2. State: En-route to Pickup */}
              {activeRide && activeRide.status === 'DRIVER_ARRIVING' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-cyan-400 tracking-wider">
                      Navigating to Pickup
                    </span>
                    <span className="text-xs text-slate-400">~1.2 km away</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{activeRide.pickup.title}</h3>
                    <p className="text-xs text-slate-400">{activeRide.pickup.subtitle}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/70 text-xs flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Rider</p>
                      <p className="font-bold text-white">{activeRide.customer.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowChatModal(true)}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <a
                        href={`tel:${activeRide.customer.phone}`}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={driverArrived}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-lg"
                  >
                    I Have Arrived at Pickup
                  </button>
                </div>
              )}

              {/* 3. State: Waiting at Pickup / Verify PIN */}
              {activeRide && activeRide.status === 'DRIVER_ARRIVED' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4 shadow-xl animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4" />
                    <span>Arrived • Waiting for Rider</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">Ask {activeRide.customer.name} for 4-digit PIN</h3>
                    <p className="text-xs text-slate-400">
                      Rider screen displays the verification code. Enter below to unlock navigation.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyPin} className="space-y-3">
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        maxLength={4}
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setPinError(false);
                        }}
                        placeholder="Enter 4-Digit PIN"
                        className="w-full py-3 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-center text-lg text-white tracking-widest placeholder:text-slate-500 placeholder:text-xs placeholder:font-sans focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    {pinError && (
                      <p className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Incorrect PIN. Check rider screen.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={pinInput.length < 4}
                      className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold text-xs transition-all shadow-lg"
                    >
                      Verify PIN & Start Trip
                    </button>
                  </form>
                </div>
              )}

              {/* 4. State: ON_TRIP */}
              {activeRide && activeRide.status === 'ON_TRIP' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                      Trip In Progress
                    </span>
                    <span className="text-xs text-slate-400">
                      ~{activeRide.fare.distanceKm} km remaining
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Navigating to</p>
                    <h3 className="text-base font-bold text-white">{activeRide.destination.title}</h3>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/70 flex justify-between items-center text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Net Payout Upon Completion</p>
                      <p className="text-lg font-black text-emerald-400">
                        {brandSettings.currencySymbol}
                        {activeRide.fare.driverEarnings.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={onOpenSos}
                      className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={completeTrip}
                    className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition-all shadow-lg"
                  >
                    Complete Trip & Collect Fare
                  </button>
                </div>
              )}

              {/* 5. State: COMPLETED / Driver Review */}
              {activeRide && activeRide.status === 'COMPLETED' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-center animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">Trip Finished Successfully</h3>
                    <p className="text-xs text-slate-400">Fare has been credited to your driver wallet.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/70 text-left space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Your Net Earning</span>
                      <span className="font-black text-emerald-400 text-sm">
                        {brandSettings.currencySymbol}
                        {activeRide.fare.driverEarnings.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Gross Fare</span>
                      <span>
                        {brandSettings.currencySymbol}
                        {activeRide.fare.totalFare.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>RYDE Fee ({activeRide.category.rydeCommissionPercent}%)</span>
                      <span>
                        -{brandSettings.currencySymbol}
                        {activeRide.fare.rydeCommission.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Rate Rider {activeRide.customer.name}</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setDriverRating(star)}>
                          <Star
                            className={`w-6 h-6 ${
                              star <= driverRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      submitDriverRating(driverRating);
                      resetRide();
                    }}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs"
                  >
                    Back Online for Next Ride
                  </button>
                </div>
              )}

              {/* 6. Idle State Dashboard */}
              {!activeRide && !incomingDriverRequest && (
                <div className="space-y-4">
                  {/* Today's Stats Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Today's Earnings</p>
                      <h3 className="text-2xl font-black text-emerald-400 mt-1">
                        {brandSettings.currencySymbol}
                        {currentDriver.todayEarnings.toLocaleString()}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">{currentDriver.completedRidesToday} rides completed</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Acceptance Rate</p>
                      <h3 className="text-2xl font-black text-white mt-1">{currentDriver.acceptanceRate}%</h3>
                      <p className="text-[11px] text-slate-400 mt-1">★ {currentDriver.rating} Rating</p>
                    </div>
                  </div>

                  {/* Online / Offline status box */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    {isOnline ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Online & Looking for Trips</h4>
                          <p className="text-[11px] text-slate-400">
                            High ride demand detected in central business district.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">You're currently offline</h4>
                          <p className="text-[11px] text-slate-400">Toggle online to start receiving nearby dispatches.</p>
                        </div>
                        <button
                          onClick={toggleDriverOnline}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow-md"
                        >
                          Go Online
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Notice Banner */}
              {withdrawSuccessNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in zoom-in-95">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{withdrawSuccessNotice}</span>
                  </div>
                  <button
                    onClick={() => setWithdrawSuccessNotice(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Main Available Payout Balance Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 border border-slate-700/80 shadow-2xl relative overflow-hidden space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Driver Partner Payouts
                    </span>
                    <p className="text-xs text-slate-400 font-medium mt-1.5">Available Wallet Balance</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                      <span className="text-emerald-400">{brandSettings.currencySymbol}</span>
                      {currentDriver.walletBalance.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setWithdrawError(null);
                      setShowWithdrawModal(true);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                  >
                    <TrendingUp className="w-4 h-4" /> Instant Cashout
                  </button>
                </div>

                {/* 4-Item Financial Performance Overview */}
                {(() => {
                  const drvTxs = walletTransactions.filter((t) => t.userType === 'DRIVER');
                  const earningsTxs = drvTxs.filter((t) => t.type === 'RIDE_EARNING');
                  const grossTotal = earningsTxs.reduce((sum, t) => sum + (t.grossAmount || t.amount * 1.25), 0);
                  const commissionTotal = earningsTxs.reduce((sum, t) => sum + (t.commissionAmount || t.amount * 0.25), 0);
                  const netEarned = earningsTxs.reduce((sum, t) => sum + t.amount, 0);
                  const withdrawnTotal = drvTxs
                    .filter((t) => t.type === 'WITHDRAWAL')
                    .reduce((sum, t) => sum + t.amount, 0);

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-800/40">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Gross Fares</p>
                        <p className="text-xs font-black text-white mt-0.5">
                          {brandSettings.currencySymbol}{grossTotal.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/40">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Platform Fee</p>
                        <p className="text-xs font-black text-rose-400 mt-0.5">
                          -{brandSettings.currencySymbol}{commissionTotal.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/40">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Net Take-Home</p>
                        <p className="text-xs font-black text-emerald-400 mt-0.5">
                          {brandSettings.currencySymbol}{netEarned.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/40">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Total Cashouts</p>
                        <p className="text-xs font-black text-cyan-400 mt-0.5">
                          {brandSettings.currencySymbol}{withdrawnTotal.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Commission Transparency Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Percent className="w-4 h-4 text-emerald-400" />
                    <span>Commission Structure & Tier</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    Tier 1 • Top Partner
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-medium">Partner Net Share</p>
                    <p className="text-sm font-black text-emerald-400 mt-0.5">
                      {brandSettings.defaultDriverCommissionPercent}% of Fare
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-medium">RYDE Platform Fee</p>
                    <p className="text-sm font-black text-slate-300 mt-0.5">
                      {brandSettings.defaultRydeCommissionPercent}% Platform
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Zero hidden deductions. 100% of customer waiting charges and surge multipliers are passed through to the partner wallet in real-time.
                </p>
              </div>

              {/* Linked Payout Bank Account */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">HDFC Bank •••• 4921</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                        Primary
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      IFSC: HDFC0001234 • Holder: {currentDriver.name} • IMPS Fast
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setWithdrawError(null);
                    setShowWithdrawModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all"
                >
                  Cashout
                </button>
              </div>

              {/* Transaction Ledger & Filter Tabs */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>Driver Partner Ledger</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Itemized trip fares, platform commissions, cashouts, and incentive credits
                    </p>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {[
                    { id: 'ALL', label: 'All Transactions' },
                    { id: 'EARNINGS', label: 'Trip Fares' },
                    { id: 'WITHDRAWALS', label: 'Bank Cashouts' },
                    { id: 'INCENTIVES', label: 'Bonuses' },
                  ].map(({ id, label }) => {
                    const isSel = earningsFilter === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setEarningsFilter(id as any)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold flex-shrink-0 transition-colors ${
                          isSel
                            ? 'bg-emerald-500 text-black shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Filtered Transactions List */}
                {(() => {
                  const filtered = walletTransactions
                    .filter((t) => t.userType === 'DRIVER')
                    .filter((t) => {
                      if (earningsFilter === 'ALL') return true;
                      if (earningsFilter === 'EARNINGS') return t.type === 'RIDE_EARNING';
                      if (earningsFilter === 'WITHDRAWALS') return t.type === 'WITHDRAWAL';
                      if (earningsFilter === 'INCENTIVES') return t.type === 'SURGE_BONUS';
                      return true;
                    });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                        No transaction records found for this view.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {filtered.map((tx) => {
                        const isWithdrawal = tx.type === 'WITHDRAWAL';
                        const isEarning = tx.type === 'RIDE_EARNING';
                        const date = new Date(tx.timestamp);
                        const dateStr = date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });
                        const timeStr = date.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        const gross = tx.grossAmount || Math.round(tx.amount * 1.25 * 100) / 100;
                        const comm = tx.commissionAmount || Math.round((gross - tx.amount) * 100) / 100;

                        return (
                          <div
                            key={tx.id}
                            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    isWithdrawal
                                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  }`}
                                >
                                  {isWithdrawal ? (
                                    <ArrowUpRight className="w-4 h-4" />
                                  ) : (
                                    <ArrowDownLeft className="w-4 h-4" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-white truncate">{tx.description}</p>
                                    {tx.rideId && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                        #{tx.rideId}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                    <span>{dateStr} • {timeStr}</span>
                                    {tx.paymentMethod && (
                                      <>
                                        <span>•</span>
                                        <span className="text-slate-300 font-medium">{tx.paymentMethod}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <span
                                  className={`text-sm font-black ${
                                    isWithdrawal ? 'text-rose-400' : 'text-emerald-400'
                                  }`}
                                >
                                  {isWithdrawal ? '-' : '+'}
                                  {brandSettings.currencySymbol}
                                  {tx.amount.toFixed(2)}
                                </span>
                                <p className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">
                                  Settled
                                </p>
                              </div>
                            </div>

                            {/* Detailed Breakdown Bar for Ride Earnings */}
                            {isEarning && (
                              <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800 text-[10px] flex items-center justify-between text-slate-400">
                                <span>Gross Fare: <strong className="text-white">{brandSettings.currencySymbol}{gross.toFixed(2)}</strong></span>
                                <span>RYDE Fee: <strong className="text-rose-400">-{brandSettings.currencySymbol}{comm.toFixed(2)} ({tx.commissionPercent || 20}%)</strong></span>
                                <span>Net Credited: <strong className="text-emerald-400">+{brandSettings.currencySymbol}{tx.amount.toFixed(2)}</strong></span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Incentives Tab */}
          {activeTab === 'incentives' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white mb-2">Driver Incentive Programs</h3>
              {incentives.map((inc) => {
                const isReady = inc.progressRides >= inc.targetRides;
                return (
                  <div key={inc.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-white">{inc.title}</h4>
                        <p className="text-[11px] text-slate-400">{inc.description}</p>
                      </div>
                      <span className="text-xs font-black text-emerald-400">
                        +{brandSettings.currencySymbol}
                        {inc.bonusAmount}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400"
                        style={{ width: `${Math.min(100, (inc.progressRides / inc.targetRides) * 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>
                        {inc.progressRides} / {inc.targetRides} rides
                      </span>
                      {inc.isClaimed ? (
                        <span className="text-emerald-400 font-bold">Reward Claimed</span>
                      ) : isReady ? (
                        <button
                          onClick={() => claimIncentive(inc.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-extrabold text-[10px]"
                        >
                          Claim Bonus
                        </button>
                      ) : (
                        <span>In Progress</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Help Desk */}
          {activeTab === 'support' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Driver Partner Help Desk</h3>
              <p className="text-xs text-slate-400">
                Facing an issue with toll refunds, route adjustments, or instant bank settlements?
              </p>
              <button
                onClick={() => {
                  createSupportTicket('Driver Settlement Inquiry', 'Payout', 'Requesting status on fast withdrawal batch.', 'DRIVER');
                  alert('Support request submitted! Driver support team notified.');
                }}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Submit Driver Inquiry
              </button>
            </div>
          )}
        </div>
      </div>

      <ChatModal isOpen={showChatModal} onClose={() => setShowChatModal(false)} userType="DRIVER" />

      {/* Cashout Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Instant Bank Cashout</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Available to Withdraw: {brandSettings.currencySymbol}{currentDriver.walletBalance.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawError(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg"
              >
                ×
              </button>
            </div>

            {/* Error message */}
            {withdrawError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
                {withdrawError}
              </div>
            )}

            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Cashout Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-lg font-black text-emerald-400">
                  {brandSettings.currencySymbol}
                </span>
                <input
                  type="number"
                  min="100"
                  max={currentDriver.walletBalance}
                  value={withdrawAmount}
                  onChange={(e) => {
                    setWithdrawAmount(e.target.value);
                    setWithdrawError(null);
                  }}
                  placeholder="1000"
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-xl font-black text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Quick Amount Select
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {['500', '1000', '2500'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setWithdrawAmount(amt);
                      setWithdrawError(null);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      withdrawAmount === amt
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border-slate-700/60'
                    }`}
                  >
                    {brandSettings.currencySymbol}{amt}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setWithdrawAmount(Math.floor(currentDriver.walletBalance).toString());
                    setWithdrawError(null);
                  }}
                  className="py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-cyan-400 border border-slate-700/60 transition-all"
                >
                  Max All
                </button>
              </div>
            </div>

            {/* Destination Account */}
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  HDFC Bank •••• 4921
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                  Instant IMPS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transfer Fee: <strong className="text-emerald-400">₹0.00 (Free)</strong> • Direct settlement
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={() => {
                const amt = parseFloat(withdrawAmount) || 0;
                if (amt <= 0) {
                  setWithdrawError('Please enter a valid cashout amount.');
                  return;
                }
                if (amt > currentDriver.walletBalance) {
                  setWithdrawError(
                    `Amount exceeds available balance (${brandSettings.currencySymbol}${currentDriver.walletBalance.toFixed(2)})`
                  );
                  return;
                }
                const ok = withdrawDriverFunds(amt, 'HDFC Bank •••• 4921');
                if (ok) {
                  setShowWithdrawModal(false);
                  setWithdrawSuccessNotice(
                    `Transferred ${brandSettings.currencySymbol}${amt.toFixed(2)} to HDFC Bank •••• 4921 via IMPS!`
                  );
                } else {
                  setWithdrawError('Failed to process withdrawal. Check balance.');
                }
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              Withdraw {brandSettings.currencySymbol}{withdrawAmount || '0'} to Bank
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
