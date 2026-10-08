import React, { useState } from 'react';
import { useRideStore } from '../store/useRideStore';
import { MapCanvas } from '../components/MapCanvas';
import { FareModal } from '../components/FareModal';
import { ChatModal } from '../components/ChatModal';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  MapPin,
  ArrowUpDown,
  Car,
  Tag,
  Clock,
  Wallet,
  Star,
  Phone,
  MessageSquare,
  Shield,
  CheckCircle,
  Share2,
  AlertCircle,
  HelpCircle,
  History,
  Gift,
  Plus,
  Compass,
  Receipt,
  Calendar,
  ChevronRight,
  RotateCcw,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Smartphone,
  Building,
  Check,
  Zap,
} from 'lucide-react';
import { RideCategory, ActiveRide } from '../types';

interface CustomerViewProps {
  onOpenSos: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ onOpenSos }) => {
  const {
    pickupLocation,
    destinationLocation,
    selectedCategory,
    categories,
    appliedCoupon,
    coupons,
    selectedPaymentMethod,
    activeRide,
    matchingTimerSec,
    currentCustomer,
    brandSettings,
    completedRides,
    walletTransactions,
    defaultLocations,
    setPickupLocation,
    setDestinationLocation,
    swapLocations,
    selectCategory,
    applyCoupon,
    setPaymentMethod,
    calculateFare,
    createRideRequest,
    cancelActiveRide,
    submitCustomerRating,
    resetRide,
    topUpCustomerWallet,
    createSupportTicket,
  } = useRideStore();

  const [activeTab, setActiveTab] = useState<'ride' | 'history' | 'wallet' | 'referrals' | 'safety' | 'help'>('ride');
  const [showFareModal, setShowFareModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showCouponSelector, setShowCouponSelector] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [walletFilter, setWalletFilter] = useState<'ALL' | 'TOPUP' | 'PAYMENT' | 'BONUS'>('ALL');
  const [selectedTopUpMethod, setSelectedTopUpMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [topUpSuccessNotice, setTopUpSuccessNotice] = useState<string | null>(null);

  // Trip History state
  const [tripSearch, setTripSearch] = useState('');
  const [tripCategoryFilter, setTripCategoryFilter] = useState('ALL');
  const [selectedReceiptRide, setSelectedReceiptRide] = useState<ActiveRide | null>(null);

  // Rating state
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewNote, setReviewNote] = useState('');

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const currentFare = destinationLocation
    ? calculateFare(pickupLocation, destinationLocation, selectedCategory, appliedCoupon)
    : null;

  const totalSpent = completedRides.reduce((sum, r) => sum + r.fare.totalFare, 0);
  const avgSpent = completedRides.length > 0 ? totalSpent / completedRides.length : 0;

  const filteredTrips = completedRides.filter((ride) => {
    const query = tripSearch.toLowerCase();
    const matchesSearch =
      ride.destination.title.toLowerCase().includes(query) ||
      ride.destination.subtitle.toLowerCase().includes(query) ||
      ride.pickup.title.toLowerCase().includes(query) ||
      ride.pickup.subtitle.toLowerCase().includes(query) ||
      ride.rideId.toLowerCase().includes(query) ||
      (ride.driver?.name && ride.driver.name.toLowerCase().includes(query));

    const matchesCategory =
      tripCategoryFilter === 'ALL' || ride.category.id.toLowerCase() === tripCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleRebookTrip = (ride: ActiveRide) => {
    setPickupLocation(ride.pickup);
    setDestinationLocation(ride.destination);
    selectCategory(ride.category);
    setActiveTab('ride');
  };

  const formatTripDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diffDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
    let relative = '';
    if (diffDays === 0) relative = 'Today';
    else if (diffDays === 1) relative = 'Yesterday';
    else if (diffDays < 7) relative = `${diffDays} days ago`;
    else relative = `${Math.floor(diffDays / 7)}w ago`;

    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { dateStr, timeStr, relative };
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-68px)]">
      {/* Left / Top: Interactive Map Stage */}
      <div className="w-full lg:w-7/12 h-[340px] sm:h-[420px] lg:h-auto flex flex-col relative border-b lg:border-b-0 lg:border-r border-slate-800">
        <MapCanvas />
      </div>

      {/* Right / Bottom: Customer Command Panel */}
      <div className="w-full lg:w-5/12 flex flex-col bg-[#0B0F17] overflow-y-auto">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-900/60 border-b border-slate-800 text-xs overflow-x-auto scrollbar-none">
          {[
            { id: 'ride', label: 'Book Ride', icon: Car },
            { id: 'history', label: 'Trip History', icon: History, count: completedRides.length },
            { id: 'wallet', label: 'Wallet', icon: Wallet },
            { id: 'referrals', label: 'Refer & Earn', icon: Gift },
            { id: 'safety', label: 'Safety Hub', icon: Shield },
            { id: 'help', label: 'Support', icon: HelpCircle },
          ].map(({ id, label, icon: Icon, count }: any) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold flex-shrink-0 transition-all ${
                activeTab === id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={activeTab === id ? { borderLeft: `3px solid ${brandSettings.primaryColorHex}` } : {}}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              {typeof count === 'number' && count > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 font-extrabold border border-emerald-500/30">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content based on sub-tab */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          {activeTab === 'ride' && (
            <>
              {/* State 1: IDLE / Planning Ride */}
              {!activeRide && (
                <div className="space-y-4">
                  {/* Origin & Destination Card */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
                    {/* Pickup Row */}
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Pickup Location</p>
                        <select
                          value={pickupLocation.id}
                          onChange={(e) => {
                            const found = defaultLocations.find((l) => l.id === e.target.value);
                            if (found) setPickupLocation(found);
                          }}
                          className="w-full bg-transparent text-sm font-bold text-white border-none focus:outline-none truncate cursor-pointer"
                        >
                          {defaultLocations.map((loc) => (
                            <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                              {loc.title} ({loc.subtitle})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Divider with swap button */}
                    <div className="flex items-center gap-2 pl-1.5">
                      <div className="w-0.5 h-4 bg-slate-800" />
                      <button
                        onClick={swapLocations}
                        className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1 h-px bg-slate-800" />
                    </div>

                    {/* Destination Row */}
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Destination</p>
                        <select
                          value={destinationLocation?.id || ''}
                          onChange={(e) => {
                            const found = defaultLocations.find((l) => l.id === e.target.value);
                            if (found) setDestinationLocation(found);
                          }}
                          className="w-full bg-transparent text-sm font-bold text-white border-none focus:outline-none truncate cursor-pointer"
                        >
                          {defaultLocations.map((loc) => (
                            <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                              {loc.title} ({loc.subtitle})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Class Selector Carousel */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Select Vehicle Category
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {categories.filter((c) => c.isActive).length} options available
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {categories
                        .filter((c) => c.isActive)
                        .map((cat) => {
                          const isSelected = selectedCategory.id === cat.id;
                          const estFare = destinationLocation
                            ? calculateFare(pickupLocation, destinationLocation, cat, appliedCoupon)
                            : null;

                          return (
                            <button
                              key={cat.id}
                              onClick={() => selectCategory(cat)}
                              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-slate-800/90 border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <Car
                                  className={`w-5 h-5 ${
                                    isSelected ? 'text-emerald-400' : 'text-slate-300'
                                  }`}
                                />
                                <span className="text-[10px] font-semibold text-slate-400">
                                  {cat.estimatedArrivalMinutes}m
                                </span>
                              </div>
                              <p className="font-bold text-xs text-white truncate">{cat.name.replace('RYDE ', '')}</p>
                              <p className="text-[10px] text-slate-400 truncate">{cat.capacity} seats</p>

                              <div className="mt-2 flex items-center justify-between">
                                <span className="font-black text-xs text-white">
                                  {brandSettings.currencySymbol}
                                  {estFare ? estFare.totalFare.toFixed(0) : cat.minFare}
                                </span>
                                {cat.surgeMultiplier > 1.0 && (
                                  <span className="text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-400">
                                    {cat.surgeMultiplier}x
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Promo & Payment Quick Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowCouponSelector(true)}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 hover:bg-slate-800 transition-colors text-left"
                    >
                      <Tag className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Promo</p>
                        <p className="text-xs font-bold text-emerald-400 truncate">
                          {appliedCoupon ? appliedCoupon.code : 'Apply Coupon'}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowFareModal(true)}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 hover:bg-slate-800 transition-colors text-left"
                    >
                      <Wallet className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Fare Breakdown</p>
                        <p className="text-xs font-bold text-slate-200 truncate">
                          {currentFare ? `${brandSettings.currencySymbol}${currentFare.totalFare.toFixed(2)}` : 'View Info'}
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Primary Request Action Button */}
                  <button
                    onClick={createRideRequest}
                    disabled={!destinationLocation}
                    className="w-full py-4 rounded-2xl font-black text-sm text-black flex items-center justify-center gap-2 shadow-xl transition-all transform active:scale-95 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: brandSettings.primaryColorHex }}
                  >
                    <Car className="w-4 h-4" />
                    <span>
                      {currentFare
                        ? `Book ${selectedCategory.name} • ${brandSettings.currencySymbol}${currentFare.totalFare.toFixed(0)}`
                        : 'Select Destination'}
                    </span>
                  </button>

                  {/* Quick Shortcut to Trip History */}
                  {completedRides.length > 0 && (
                    <button
                      onClick={() => setActiveTab('history')}
                      className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs text-slate-300 transition-all hover:bg-slate-850 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                          <History className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                            Trip History ({completedRides.length} completed)
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Last trip: {completedRides[0].destination.title} • {brandSettings.currencySymbol}{completedRides[0].fare.totalFare.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <span>View All</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* State 2: SEARCHING_DRIVER */}
              {activeRide && activeRide.status === 'SEARCHING_DRIVER' && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-black font-black text-2xl shadow-2xl"
                      style={{ backgroundColor: brandSettings.primaryColorHex }}
                    >
                      <Car className="w-10 h-10 animate-bounce" />
                    </div>
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-30"
                      style={{ backgroundColor: brandSettings.primaryColorHex }}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Connecting with {activeRide.category.name} Drivers
                    </h3>
                    <p className="text-xs text-slate-400">
                      Scanning radius ({brandSettings.searchRadiusKm} km)... Dispatching in {matchingTimerSec}s
                    </p>
                  </div>

                  <div className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Pickup</span>
                      <span className="font-bold text-white">{activeRide.pickup.title}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Destination</span>
                      <span className="font-bold text-white">{activeRide.destination.title}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Estimated Fare</span>
                      <span className="font-bold text-emerald-400">
                        {brandSettings.currencySymbol}
                        {activeRide.fare.totalFare.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => cancelActiveRide('Customer cancelled request')}
                    className="w-full py-3 rounded-xl border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-colors"
                  >
                    Cancel Ride Request
                  </button>
                </div>
              )}

              {/* State 3: DRIVER_ARRIVING & DRIVER_ARRIVED */}
              {activeRide && (activeRide.status === 'DRIVER_ARRIVING' || activeRide.status === 'DRIVER_ARRIVED') && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Status Banner */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      activeRide.status === 'DRIVER_ARRIVED'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-xs font-bold">
                        {activeRide.status === 'DRIVER_ARRIVED'
                          ? 'Driver has arrived outside!'
                          : 'Driver is en route to your pickup (~2 mins)'}
                      </span>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-black/60 text-white font-mono font-black text-xs border border-white/20">
                      PIN: {activeRide.ridePin}
                    </div>
                  </div>

                  {/* Driver Profile Card */}
                  {activeRide.driver && (
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-base">
                            {activeRide.driver.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{activeRide.driver.name}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="font-semibold text-white">{activeRide.driver.rating}</span>
                              <span>• {activeRide.driver.totalRides} trips</span>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Plate Badge */}
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-black tracking-wider text-white">
                            {activeRide.driver.licensePlate}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {activeRide.driver.vehicleColor} {activeRide.driver.vehicleMake} {activeRide.driver.vehicleModel}
                          </p>
                        </div>
                      </div>

                      {/* Communications */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => setShowChatModal(true)}
                          className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </button>
                        <a
                          href={`tel:${activeRide.driver.phone}`}
                          className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>
                        <button
                          onClick={onOpenSos}
                          className="py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          SOS
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => cancelActiveRide('Plans changed')}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Cancel Ride
                  </button>
                </div>
              )}

              {/* State 4: ON_TRIP */}
              {activeRide && activeRide.status === 'ON_TRIP' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Active Ride In Progress
                      </span>
                      <span className="text-sm font-black text-white">
                        {brandSettings.currencySymbol}
                        {activeRide.fare.totalFare.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400">Heading towards</p>
                      <h4 className="text-base font-bold text-white">{activeRide.destination.title}</h4>
                    </div>

                    {/* Live Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${Math.round(activeRide.driverLiveProgress * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowChatModal(true)}
                      className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat with Driver
                    </button>
                    <button
                      onClick={onOpenSos}
                      className="py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Safety Shield
                    </button>
                  </div>
                </div>
              )}

              {/* State 5: COMPLETED / Rating */}
              {activeRide && activeRide.status === 'COMPLETED' && (
                <div className="space-y-4 text-center py-2 animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">You've Reached Your Destination!</h3>
                    <p className="text-xs text-slate-400">Receipt finalized for ride #{activeRide.rideId}</p>
                  </div>

                  {/* Receipt breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Paid ({activeRide.paymentMethod})</span>
                      <span className="font-extrabold text-emerald-400 text-sm">
                        {brandSettings.currencySymbol}
                        {activeRide.fare.totalFare.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Distance & Duration</span>
                      <span>
                        {activeRide.fare.distanceKm} km • {Math.round(activeRide.fare.durationMin)} mins
                      </span>
                    </div>
                  </div>

                  {/* Rating 1 to 5 stars */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">
                      Rate your experience with {activeRide.driver?.name || 'Driver'}
                    </p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRatingStars(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= ratingStars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Leave optional notes or compliments..."
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  />

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => {
                        submitCustomerRating(ratingStars, reviewNote);
                        resetRide();
                      }}
                      className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all shadow-lg"
                    >
                      Submit Feedback & Complete
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedReceiptRide(activeRide)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                        <span>View Receipt</span>
                      </button>

                      <button
                        onClick={() => {
                          submitCustomerRating(ratingStars, reviewNote);
                          resetRide();
                          setActiveTab('history');
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <History className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Trip History</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Trip History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-400" />
                    <span>Trip History</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review your completed rides, dates, costs, and route receipts
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 self-start sm:self-auto">
                  {completedRides.length} Total Trips
                </span>
              </div>

              {/* Trip History Summary Stats */}
              {completedRides.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed</p>
                    <p className="text-base font-black text-white mt-0.5">{completedRides.length} rides</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Spent</p>
                    <p className="text-base font-black text-emerald-400 mt-0.5">
                      {brandSettings.currencySymbol}{totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Cost</p>
                    <p className="text-base font-black text-cyan-400 mt-0.5">
                      {brandSettings.currencySymbol}{avgSpent.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Search & Filter Bar */}
              {completedRides.length > 0 && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={tripSearch}
                      onChange={(e) => setTripSearch(e.target.value)}
                      placeholder="Search destination, pickup, or ride ID..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    {tripSearch && (
                      <button
                        onClick={() => setTripSearch('')}
                        className="absolute right-3 top-2 text-xs text-slate-400 hover:text-white"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                    {[
                      { id: 'ALL', label: 'All Trips' },
                      { id: 'comfort', label: 'Comfort' },
                      { id: 'premier', label: 'Premier' },
                      { id: 'ev', label: 'Green EV' },
                      { id: 'economy', label: 'Economy' },
                      { id: 'xl', label: 'XL SUV' },
                      { id: 'auto', label: 'Auto' },
                      { id: 'bike', label: 'Bike' },
                    ].map(({ id, label }) => {
                      const isSel = tripCategoryFilter === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setTripCategoryFilter(id)}
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
                </div>
              )}

              {/* Trip Cards List */}
              {filteredTrips.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">No Trips Found</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {tripSearch || tripCategoryFilter !== 'ALL'
                        ? 'Try adjusting your search query or category filter.'
                        : 'You haven\'t completed any rides yet. Book your first journey!'}
                    </p>
                  </div>
                  {tripSearch || tripCategoryFilter !== 'ALL' ? (
                    <button
                      onClick={() => {
                        setTripSearch('');
                        setTripCategoryFilter('ALL');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('ride')}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md"
                    >
                      Book a Ride Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTrips.map((ride) => {
                    const { dateStr, timeStr, relative } = formatTripDateTime(ride.completedAt || ride.createdAt);

                    return (
                      <div
                        key={ride.rideId}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all shadow-lg space-y-3.5"
                      >
                        {/* Header: Date, Time & Cost */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-400">
                                #{ride.rideId}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                                {relative}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mt-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{dateStr}</span>
                              <span className="text-slate-500">•</span>
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{timeStr}</span>
                            </div>
                          </div>

                          {/* Cost Badge */}
                          <div className="text-right">
                            <span className="text-xl font-black text-emerald-400 tracking-tight">
                              {brandSettings.currencySymbol}
                              {ride.fare.totalFare.toFixed(2)}
                            </span>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Paid via {ride.paymentMethod}
                            </div>
                          </div>
                        </div>

                        {/* Route: Pickup & Destination */}
                        <div className="space-y-2.5 text-xs">
                          {/* Pickup */}
                          <div className="flex items-start gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] uppercase font-bold text-slate-400">Pickup</p>
                              <p className="font-bold text-white truncate">{ride.pickup.title}</p>
                              <p className="text-[11px] text-slate-400 truncate">{ride.pickup.subtitle}</p>
                            </div>
                          </div>

                          {/* Connector */}
                          <div className="ml-1 pl-2 border-l border-dashed border-slate-700 py-0.5" />

                          {/* Destination */}
                          <div className="flex items-start gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] uppercase font-bold text-slate-400">Destination</p>
                              <p className="font-bold text-white truncate">{ride.destination.title}</p>
                              <p className="text-[11px] text-slate-400 truncate">{ride.destination.subtitle}</p>
                            </div>
                          </div>
                        </div>

                        {/* Category & Driver Meta */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 font-bold text-slate-200 text-[11px] flex items-center gap-1">
                              <Car className="w-3 h-3 text-emerald-400" />
                              {ride.category.name}
                            </span>
                            <span>
                              {ride.fare.distanceKm} km • {Math.round(ride.fare.durationMin)} mins
                            </span>
                          </div>

                          {ride.driver && (
                            <div className="text-[11px] text-slate-300">
                              Driver: <strong className="text-white">{ride.driver.name}</strong> ({ride.driver.vehicleModel})
                            </div>
                          )}
                        </div>

                        {/* Customer Rating if present */}
                        {ride.ratingGivenByCustomer && (
                          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>Your Rating: {ride.ratingGivenByCustomer}/5</span>
                            </div>
                            {ride.customerReview && (
                              <span className="text-slate-400 italic text-[11px] truncate max-w-[220px]">
                                "{ride.customerReview}"
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons: Rebook & View Receipt */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleRebookTrip(ride)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Rebook Ride</span>
                          </button>

                          <button
                            onClick={() => setSelectedReceiptRide(ride)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                            <span>View Receipt</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Toast / Notice banner */}
              {topUpSuccessNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in zoom-in-95">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{topUpSuccessNotice}</span>
                  </div>
                  <button
                    onClick={() => setTopUpSuccessNotice(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Main RYDE Cash Balance Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 border border-slate-700/80 shadow-2xl relative overflow-hidden space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      RYDE Digital Wallet
                    </span>
                    <p className="text-xs text-slate-400 font-medium mt-1.5">Available Cash Balance</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                      <span className="text-emerald-400">{brandSettings.currencySymbol}</span>
                      {currentCustomer.walletBalance.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h2>
                  </div>

                  <button
                    onClick={() => setShowTopUpModal(true)}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4" /> Add Money
                  </button>
                </div>

                {/* Quick Add Preset Chips */}
                <div className="pt-2 border-t border-slate-800/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Quick One-Tap Recharges
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {['250', '500', '1000', '2000'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          setTopUpAmount(amt);
                          setShowTopUpModal(true);
                        }}
                        className="py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all text-center"
                      >
                        +{brandSettings.currencySymbol}{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Ledger Metrics */}
                {(() => {
                  const custTxs = walletTransactions.filter((t) => t.userType === 'CUSTOMER');
                  const totalAdded = custTxs
                    .filter((t) => t.type === 'WALLET_TOPUP')
                    .reduce((sum, t) => sum + t.amount, 0);
                  const totalSpentWallet = custTxs
                    .filter((t) => t.type === 'RIDE_PAYMENT')
                    .reduce((sum, t) => sum + t.amount, 0);
                  const totalRewards = custTxs
                    .filter((t) => t.type === 'REFERRAL_BONUS')
                    .reduce((sum, t) => sum + t.amount, 0);

                  return (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                      <div className="p-2 rounded-xl bg-slate-800/40">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Total Added</p>
                        <p className="text-xs font-black text-emerald-400 mt-0.5">
                          {brandSettings.currencySymbol}{totalAdded.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800/40">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Total Spent</p>
                        <p className="text-xs font-black text-rose-400 mt-0.5">
                          {brandSettings.currencySymbol}{totalSpentWallet.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800/40">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Rewards</p>
                        <p className="text-xs font-black text-cyan-400 mt-0.5">
                          {brandSettings.currencySymbol}{totalRewards.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Wallet Perks Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Why Ride with RYDE Wallet?</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Instant ride dispatch with zero payment delays</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Auto-pay for frictionless arrival drop-offs</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>100% refund protection on cancelled rides</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Earn 5% cashback on weekend city trips</span>
                  </div>
                </div>
              </div>

              {/* Transaction History Section */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>Wallet Transaction Activity</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Synchronized record of recharges, trip deductions, and promotions
                    </p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {[
                    { id: 'ALL', label: 'All Activity' },
                    { id: 'TOPUP', label: 'Money Added' },
                    { id: 'PAYMENT', label: 'Ride Payments' },
                    { id: 'BONUS', label: 'Promotions' },
                  ].map(({ id, label }) => {
                    const isSel = walletFilter === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setWalletFilter(id as any)}
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
                    .filter((t) => t.userType === 'CUSTOMER')
                    .filter((t) => {
                      if (walletFilter === 'ALL') return true;
                      if (walletFilter === 'TOPUP') return t.type === 'WALLET_TOPUP';
                      if (walletFilter === 'PAYMENT') return t.type === 'RIDE_PAYMENT';
                      if (walletFilter === 'BONUS') return t.type === 'REFERRAL_BONUS';
                      return true;
                    });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                        No transactions recorded under this filter.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {filtered.map((tx) => {
                        const isCredit = tx.type === 'WALLET_TOPUP' || tx.type === 'REFERRAL_BONUS';
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

                        return (
                          <div
                            key={tx.id}
                            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  isCredit
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-800 text-rose-400 border border-slate-700'
                                }`}
                              >
                                {tx.type === 'WALLET_TOPUP' && <ArrowDownLeft className="w-4 h-4" />}
                                {tx.type === 'RIDE_PAYMENT' && <ArrowUpRight className="w-4 h-4" />}
                                {tx.type === 'REFERRAL_BONUS' && <Gift className="w-4 h-4 text-cyan-400" />}
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
                                  isCredit ? 'text-emerald-400' : 'text-slate-300'
                                }`}
                              >
                                {isCredit ? '+' : '-'}
                                {brandSettings.currencySymbol}
                                {tx.amount.toFixed(2)}
                              </span>
                              <p className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">
                                Success
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Gift className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Invite Friends, Get Free Rides</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Earn {brandSettings.currencySymbol}250 credits for every friend who takes their first RYDE.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-xs mx-auto">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Your Referral Code</p>
                <p className="text-lg font-mono font-black text-emerald-400 tracking-wider">
                  {currentCustomer.referralCode}
                </p>
              </div>

              <button
                onClick={() => alert(`Copied code ${currentCustomer.referralCode} to clipboard!`)}
                className="w-full max-w-xs mx-auto py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Share Code
              </button>
            </div>
          )}

          {/* Safety Hub */}
          {activeTab === 'safety' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white mb-2">RYDE Safety Center</h3>
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <Shield className="w-4 h-4" />
                  <span>24/7 Safety Shield & SOS Response</span>
                </div>
                <p>
                  Press the Emergency SOS button anytime to link directly with local emergency response.
                </p>
                <button
                  onClick={onOpenSos}
                  className="w-full py-2.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                >
                  Open Emergency SOS
                </button>
              </div>

              {[
                { title: '4-Digit Ride PIN Verification', desc: 'Verify the 4-digit PIN with driver before vehicle departure.' },
                { title: 'Screened Fleet Partners', desc: 'Every driver is background-verified with vehicle fitness checks.' },
                { title: 'Real-Time Route Telemetry', desc: 'All routes are tracked 24x7 for route deviations and stoppage.' },
              ].map((feat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <p className="font-bold text-white mb-0.5">{feat.title}</p>
                  <p className="text-slate-400 text-[11px]">{feat.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Help & Support Tab */}
          {activeTab === 'help' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Customer Support Desk</h3>

              {ticketSent ? (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  Support ticket created! A specialist will review and respond shortly.
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Subject (e.g. Lost item, fare inquiry)"
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  />
                  <textarea
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Explain the issue in detail..."
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={() => {
                      if (ticketSubject && ticketMessage) {
                        createSupportTicket(ticketSubject, 'General Inquiry', ticketMessage, 'CUSTOMER');
                        setTicketSent(true);
                      }
                    }}
                    disabled={!ticketSubject || !ticketMessage}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs"
                  >
                    Submit Support Ticket
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {currentFare && (
        <FareModal
          isOpen={showFareModal}
          onClose={() => setShowFareModal(false)}
          fare={currentFare}
          category={selectedCategory}
          currency={brandSettings.currencySymbol}
          couponCode={appliedCoupon?.code}
        />
      )}

      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        userType="CUSTOMER"
      />

      {/* Coupon Selector Modal */}
      {showCouponSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-bold text-white">Apply Promo Coupon</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {coupons.map((cp) => {
                const isSelected = appliedCoupon?.code === cp.code;
                return (
                  <button
                    key={cp.code}
                    onClick={() => {
                      applyCoupon(isSelected ? null : cp);
                      setShowCouponSelector(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-400 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div>
                      <p className="font-black text-xs">{cp.code}</p>
                      <p className="text-[11px] text-slate-400">{cp.description}</p>
                    </div>
                    {isSelected && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowCouponSelector(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  <span>Recharge RYDE Cash</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Current Balance: {brandSettings.currencySymbol}{currentCustomer.walletBalance.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg"
              >
                ×
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Enter Recharge Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-lg font-black text-emerald-400">
                  {brandSettings.currencySymbol}
                </span>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="500"
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-xl font-black text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Popular Recharge Amounts
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {['100', '250', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      topUpAmount === amt
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border-slate-700/60'
                    }`}
                  >
                    +{brandSettings.currencySymbol}{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Select Payment Mode
              </p>
              <div className="space-y-1.5">
                {[
                  {
                    id: 'UPI',
                    name: 'UPI / Instant Pay',
                    desc: 'Google Pay, PhonePe, Paytm, BHIM',
                    icon: Smartphone,
                  },
                  {
                    id: 'Card',
                    name: 'Credit or Debit Card',
                    desc: 'Visa, Mastercard, RuPay & Amex',
                    icon: CreditCard,
                  },
                  {
                    id: 'NetBanking',
                    name: 'Net Banking',
                    desc: 'HDFC, ICICI, SBI, Axis & 50+ Banks',
                    icon: Building,
                  },
                ].map(({ id, name, desc, icon: Icon }) => {
                  const isSel = selectedTopUpMethod === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedTopUpMethod(id as any)}
                      className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSel
                          ? 'bg-emerald-500/15 border-emerald-400 text-white'
                          : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSel ? 'bg-emerald-400 text-black' : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{name}</p>
                          <p className="text-[10px] text-slate-400">{desc}</p>
                        </div>
                      </div>
                      {isSel && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zero fee note */}
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Convenience Fee:</span>
              <span className="font-bold text-emerald-400">FREE (₹0.00)</span>
            </div>

            {/* Proceed CTA */}
            <button
              onClick={() => {
                const val = parseFloat(topUpAmount) || 500;
                topUpCustomerWallet(val, selectedTopUpMethod);
                setShowTopUpModal(false);
                setTopUpSuccessNotice(
                  `Successfully added ${brandSettings.currencySymbol}${val.toFixed(2)} to your RYDE Wallet via ${selectedTopUpMethod}!`
                );
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              Confirm & Recharge {brandSettings.currencySymbol}{topUpAmount || '500'}
            </button>
          </div>
        </div>
      )}

      {/* Trip Receipt Invoice Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptRide}
        onClose={() => setSelectedReceiptRide(null)}
        ride={selectedReceiptRide}
        brandSettings={brandSettings}
      />
    </div>
  );
};
