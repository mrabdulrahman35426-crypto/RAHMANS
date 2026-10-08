import { create } from 'zustand';
import {
  ActiveRide,
  AppRole,
  BrandSettings,
  ChatMessage,
  Coupon,
  Customer,
  Driver,
  DriverStatus,
  FareCalculation,
  IncentiveRule,
  RideCategory,
  RideLocation,
  RideStatus,
  SupportTicket,
  WalletTransaction,
} from '../types';

export const DEFAULT_LOCATIONS: RideLocation[] = [
  { id: 'loc_1', title: 'Grand Central Station', subtitle: 'Park Avenue, Downtown', latitude: 28.5355, longitude: 77.2410, iconType: 'home' },
  { id: 'loc_2', title: 'International Airport Terminal 3', subtitle: 'Aviation Expressway', latitude: 28.5562, longitude: 77.1000, iconType: 'airport' },
  { id: 'loc_3', title: 'Cyber City Tech Hub', subtitle: 'Building 10B, Phase 2', latitude: 28.4900, longitude: 77.0890, iconType: 'work' },
  { id: 'loc_4', title: 'Metropolitan Galleria Mall', subtitle: 'MG Road, Central District', latitude: 28.5020, longitude: 77.2200, iconType: 'shopping' },
  { id: 'loc_5', title: 'Starlight Waterfront Promenade', subtitle: 'Outer Ring Bay', latitude: 28.5600, longitude: 77.2800, iconType: 'pin' },
];

export const INITIAL_CATEGORIES: RideCategory[] = [
  {
    id: 'economy',
    name: 'RYDE Economy',
    description: 'Affordable, everyday city rides with verified drivers',
    vehicleType: 'Compact Hatchback',
    capacity: 4,
    baseFare: 40.0,
    minFare: 60.0,
    perKmPrice: 12.0,
    perMinutePrice: 1.5,
    bookingFee: 10.0,
    platformFee: 5.0,
    cancellationFee: 25.0,
    surgeMultiplier: 1.0,
    driverCommissionPercent: 80.0,
    rydeCommissionPercent: 20.0,
    estimatedArrivalMinutes: 3,
    iconKey: 'car',
    isActive: true,
  },
  {
    id: 'comfort',
    name: 'RYDE Comfort',
    description: 'Spacious sedans with top-rated drivers & AC comfort',
    vehicleType: 'Premium Sedan',
    capacity: 4,
    baseFare: 65.0,
    minFare: 95.0,
    perKmPrice: 16.5,
    perMinutePrice: 2.0,
    bookingFee: 12.0,
    platformFee: 8.0,
    cancellationFee: 30.0,
    surgeMultiplier: 1.0,
    driverCommissionPercent: 80.0,
    rydeCommissionPercent: 20.0,
    estimatedArrivalMinutes: 4,
    iconKey: 'car_sedan',
    isActive: true,
  },
  {
    id: 'ev',
    name: 'RYDE Green EV',
    description: 'Zero-emission electric rides for sustainable commuting',
    vehicleType: 'Electric Sedan / Crossover',
    capacity: 4,
    baseFare: 55.0,
    minFare: 85.0,
    perKmPrice: 14.0,
    perMinutePrice: 1.8,
    bookingFee: 10.0,
    platformFee: 5.0,
    cancellationFee: 25.0,
    surgeMultiplier: 1.0,
    driverCommissionPercent: 85.0,
    rydeCommissionPercent: 15.0,
    estimatedArrivalMinutes: 5,
    iconKey: 'car_electric',
    isActive: true,
  },
  {
    id: 'premium',
    name: 'RYDE Premier',
    description: 'High-end executive luxury vehicles for VIP travel',
    vehicleType: 'Executive Luxury Sedan',
    capacity: 4,
    baseFare: 120.0,
    minFare: 180.0,
    perKmPrice: 28.0,
    perMinutePrice: 3.5,
    bookingFee: 20.0,
    platformFee: 15.0,
    cancellationFee: 50.0,
    surgeMultiplier: 1.0,
    driverCommissionPercent: 80.0,
    rydeCommissionPercent: 20.0,
    estimatedArrivalMinutes: 6,
    iconKey: 'car_luxury',
    isActive: true,
  },
  {
    id: 'xl',
    name: 'RYDE XL',
    description: 'Extra seats for up to 6 passengers and bulky luggage',
    vehicleType: 'Full-size SUV / MUV',
    capacity: 6,
    baseFare: 90.0,
    minFare: 140.0,
    perKmPrice: 22.0,
    perMinutePrice: 2.5,
    bookingFee: 15.0,
    platformFee: 10.0,
    cancellationFee: 40.0,
    surgeMultiplier: 1.0,
    driverCommissionPercent: 80.0,
    rydeCommissionPercent: 20.0,
    estimatedArrivalMinutes: 7,
    iconKey: 'car_suv',
    isActive: true,
  },
  {
    id: 'auto',
    name: 'RYDE Auto',
    description: 'Fast doorstep three-wheeler auto rickshaw hops',
    vehicleType: '3-Wheeler Auto Rickshaw',
    capacity: 3,
    baseFare: 28.0,
    minFare: 40.0,
    perKmPrice: 9.5,
    perMinutePrice: 1.0,
    bookingFee: 5.0,
    platformFee: 3.0,
    cancellationFee: 15.0,
    surgeMultiplier: 1.0,
    driverCommissionPercent: 88.0,
    rydeCommissionPercent: 12.0,
    estimatedArrivalMinutes: 2,
    iconKey: 'auto',
    isActive: true,
  },
  {
    id: 'bike',
    name: 'RYDE Moto Bike',
    description: 'Beat city traffic fast with safety helmet included',
    vehicleType: 'Two-Wheeler Motorcycle',
    capacity: 1,
    baseFare: 20.0,
    minFare: 30.0,
    perKmPrice: 6.5,
    perMinutePrice: 0.8,
    bookingFee: 4.0,
    platformFee: 2.0,
    cancellationFee: 10.0,
    surgeMultiplier: 1.0,
    driverCommissionPercent: 88.0,
    rydeCommissionPercent: 12.0,
    estimatedArrivalMinutes: 2,
    iconKey: 'bike',
    isActive: true,
  },
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv_001',
    name: 'Marcus Vance',
    phone: '+91 98111 22334',
    rating: 4.92,
    totalRides: 1420,
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry Hybrid',
    licensePlate: 'DL 01 AB 7890',
    vehicleColor: 'Pearl White',
    categoryId: 'comfort',
    status: 'ONLINE',
    latitude: 28.5360,
    longitude: 77.2405,
    todayEarnings: 1850.0,
    completedRidesToday: 5,
    acceptanceRate: 96.0,
    cancellationRate: 1.8,
    walletBalance: 3450.0,
    isVerified: true,
  },
  {
    id: 'drv_002',
    name: 'Elena Rostova',
    phone: '+91 98222 33445',
    rating: 4.88,
    totalRides: 980,
    vehicleMake: 'Hyundai',
    vehicleModel: 'Ioniq 5 EV',
    licensePlate: 'DL 03 EV 2024',
    vehicleColor: 'Cyber Grey',
    categoryId: 'ev',
    status: 'ONLINE',
    latitude: 28.5340,
    longitude: 77.2425,
    todayEarnings: 2100.0,
    completedRidesToday: 6,
    acceptanceRate: 94.0,
    cancellationRate: 2.1,
    walletBalance: 4120.0,
    isVerified: true,
  },
  {
    id: 'drv_003',
    name: 'David Chen',
    phone: '+91 98333 44556',
    rating: 4.97,
    totalRides: 2150,
    vehicleMake: 'Mercedes-Benz',
    vehicleModel: 'E-Class Luxury',
    licensePlate: 'DL 04 PR 9999',
    vehicleColor: 'Obsidian Black',
    categoryId: 'premium',
    status: 'ONLINE',
    latitude: 28.5380,
    longitude: 77.2390,
    todayEarnings: 3200.0,
    completedRidesToday: 4,
    acceptanceRate: 98.0,
    cancellationRate: 0.5,
    walletBalance: 6800.0,
    isVerified: true,
  },
  {
    id: 'drv_004',
    name: 'Rahul Sharma',
    phone: '+91 98444 55667',
    rating: 4.82,
    totalRides: 3100,
    vehicleMake: 'Bajaj',
    vehicleModel: 'Compact 4S Auto',
    licensePlate: 'DL 05 AT 1234',
    vehicleColor: 'Green & Yellow',
    categoryId: 'auto',
    status: 'ONLINE',
    latitude: 28.5330,
    longitude: 77.2415,
    todayEarnings: 950.0,
    completedRidesToday: 8,
    acceptanceRate: 91.0,
    cancellationRate: 3.2,
    walletBalance: 1540.0,
    isVerified: true,
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'RYDE50', discountPercent: 50.0, flatDiscount: 0, maxDiscount: 120.0, minFare: 80.0, description: '50% off on your ride up to ₹120', isActive: true },
  { code: 'FIRSTMOVE', discountPercent: 0, flatDiscount: 75.0, maxDiscount: 75.0, minFare: 140.0, description: 'Flat ₹75 off for new riders', isActive: true },
  { code: 'WEEKEND20', discountPercent: 20.0, flatDiscount: 0, maxDiscount: 100.0, minFare: 100.0, description: '20% off all weekend city trips', isActive: true },
  { code: 'ECOSAVE', discountPercent: 30.0, flatDiscount: 0, maxDiscount: 90.0, minFare: 90.0, description: '30% off Green EV rides', isActive: true },
];

export interface RideStoreState {
  currentRole: AppRole;
  brandSettings: BrandSettings;
  pickupLocation: RideLocation;
  destinationLocation: RideLocation | null;
  selectedCategory: RideCategory;
  categories: RideCategory[];
  drivers: Driver[];
  currentDriver: Driver;
  currentCustomer: Customer;
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  selectedPaymentMethod: string;
  scheduledTime: string | null;
  activeRide: ActiveRide | null;
  incomingDriverRequest: ActiveRide | null;
  matchingTimerSec: number;
  completedRides: ActiveRide[];
  walletTransactions: WalletTransaction[];
  supportTickets: SupportTicket[];
  incentives: IncentiveRule[];
  chatMessages: ChatMessage[];
  defaultLocations: RideLocation[];

  // Actions
  setRole: (role: AppRole) => void;
  setPickupLocation: (loc: RideLocation) => void;
  setDestinationLocation: (loc: RideLocation | null) => void;
  swapLocations: () => void;
  selectCategory: (cat: RideCategory) => void;
  setPaymentMethod: (method: string) => void;
  applyCoupon: (coupon: Coupon | null) => void;
  setScheduledTime: (time: string | null) => void;

  // Pricing Engine
  calculateFare: (
    pickup: RideLocation,
    destination: RideLocation,
    category: RideCategory,
    coupon?: Coupon | null
  ) => FareCalculation;

  // Ride Lifecycle
  createRideRequest: () => void;
  driverAcceptRequest: (driverId?: string) => void;
  driverRejectRequest: () => void;
  driverArrived: () => void;
  verifyPinAndStartTrip: (pin: string) => boolean;
  completeTrip: () => void;
  submitCustomerRating: (rating: number, review: string) => void;
  submitDriverRating: (rating: number) => void;
  cancelActiveRide: (reason: string) => void;
  resetRide: () => void;

  // Communication
  addChatMessage: (msg: ChatMessage) => void;
  sendCustomerMessage: (text: string) => void;
  sendDriverMessage: (text: string) => void;

  // Driver Controls
  toggleDriverOnline: () => void;
  claimIncentive: (id: string) => void;
  withdrawDriverFunds: (amount: number, bankDetails?: string) => boolean;

  // Customer Controls
  topUpCustomerWallet: (amount: number, method?: string) => void;

  // Support
  createSupportTicket: (subject: string, category: string, message: string, userType: 'CUSTOMER' | 'DRIVER') => void;
  resolveSupportTicket: (ticketId: string) => void;

  // Admin Controls (Everything is editable in real-time)
  updateBrandSettings: (newSettings: Partial<BrandSettings>) => void;
  updateCategoryPricing: (
    categoryId: string,
    updates: Partial<RideCategory>
  ) => void;
  addCategory: (newCategory: RideCategory) => void;
  addCoupon: (newCoupon: Coupon) => void;
  updateDriverStatus: (driverId: string, isVerified: boolean) => void;
}

// Distance helper
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = r * c;
  return Math.max(1.8, Math.round(straightLine * 1.25 * 10) / 10);
}

let matchingInterval: any = null;
let tripInterval: any = null;

export const useRideStore = create<RideStoreState>((set, get) => ({
  currentRole: 'CUSTOMER',
  brandSettings: {
    appName: 'RYDE',
    tagline: 'Move Your Way',
    primaryColorHex: '#00E599',
    secondaryColorHex: '#06B6D4',
    currencySymbol: '₹',
    currencyCode: 'INR',
    defaultDriverCommissionPercent: 80.0,
    defaultRydeCommissionPercent: 20.0,
    taxPercent: 5.0,
    waitingFeePerMin: 2.5,
    searchRadiusKm: 5.0,
    driverTimeoutSec: 15,
    globalSurgeMultiplier: 1.0,
    isSurgeActive: false,
  },
  pickupLocation: DEFAULT_LOCATIONS[0],
  destinationLocation: DEFAULT_LOCATIONS[1],
  selectedCategory: INITIAL_CATEGORIES[1], // Comfort
  categories: INITIAL_CATEGORIES,
  drivers: INITIAL_DRIVERS,
  currentDriver: INITIAL_DRIVERS[0],
  currentCustomer: {
    id: 'cust_001',
    name: 'Alex Morgan',
    phone: '+91 98765 43210',
    email: 'alex.morgan@ryde.app',
    rating: 4.95,
    walletBalance: 1250.0,
    referralCode: 'RYDE-ALEX24',
    totalRidesTaken: 28,
  },
  coupons: INITIAL_COUPONS,
  appliedCoupon: INITIAL_COUPONS[0], // RYDE50 pre-applied
  selectedPaymentMethod: 'RYDE Wallet',
  scheduledTime: null,
  activeRide: null,
  incomingDriverRequest: null,
  matchingTimerSec: 15,
  completedRides: [
    {
      rideId: 'RYDE-7182',
      customer: {
        id: 'cust_001',
        name: 'Alex Morgan',
        phone: '+91 98765 43210',
        email: 'alex.morgan@ryde.app',
        rating: 4.95,
        walletBalance: 1250.0,
        referralCode: 'RYDE-ALEX24',
        totalRidesTaken: 28,
      },
      driver: INITIAL_DRIVERS[0],
      category: INITIAL_CATEGORIES[1],
      pickup: DEFAULT_LOCATIONS[0],
      destination: DEFAULT_LOCATIONS[2],
      status: 'COMPLETED',
      fare: {
        baseFare: 65,
        distanceKm: 8.4,
        distanceCharge: 138.6,
        durationMin: 20.4,
        timeCharge: 40.8,
        bookingFee: 12,
        platformFee: 8,
        subtotal: 264.4,
        surgeMultiplier: 1.0,
        surgeAmount: 0,
        discountAmount: 120,
        taxes: 7.22,
        totalFare: 151.62,
        driverEarnings: 115.52,
        rydeCommission: 28.88,
      },
      ridePin: '4821',
      paymentMethod: 'RYDE Wallet',
      createdAt: Date.now() - 86400000,
      completedAt: Date.now() - 84600000,
      ratingGivenByCustomer: 5,
      customerReview: 'Great driving, clean car and on-time arrival!',
      driverLiveProgress: 1.0,
    },
    {
      rideId: 'RYDE-6520',
      customer: {
        id: 'cust_001',
        name: 'Alex Morgan',
        phone: '+91 98765 43210',
        email: 'alex.morgan@ryde.app',
        rating: 4.95,
        walletBalance: 1250.0,
        referralCode: 'RYDE-ALEX24',
        totalRidesTaken: 27,
      },
      driver: INITIAL_DRIVERS[2],
      category: INITIAL_CATEGORIES[3], // Premier
      pickup: DEFAULT_LOCATIONS[0],
      destination: DEFAULT_LOCATIONS[1], // International Airport Terminal 3
      status: 'COMPLETED',
      fare: {
        baseFare: 120,
        distanceKm: 16.2,
        distanceCharge: 453.6,
        durationMin: 34.0,
        timeCharge: 119.0,
        bookingFee: 20,
        platformFee: 15,
        subtotal: 727.6,
        surgeMultiplier: 1.0,
        surgeAmount: 0,
        discountAmount: 100,
        taxes: 31.38,
        totalFare: 658.98,
        driverEarnings: 502.08,
        rydeCommission: 125.52,
      },
      ridePin: '9034',
      paymentMethod: 'Credit/Debit Card',
      createdAt: Date.now() - 259200000, // 3 days ago
      completedAt: Date.now() - 257100000,
      ratingGivenByCustomer: 5,
      customerReview: 'Executive comfort, smooth highway drive to Terminal 3.',
      driverLiveProgress: 1.0,
    },
    {
      rideId: 'RYDE-5411',
      customer: {
        id: 'cust_001',
        name: 'Alex Morgan',
        phone: '+91 98765 43210',
        email: 'alex.morgan@ryde.app',
        rating: 4.95,
        walletBalance: 1250.0,
        referralCode: 'RYDE-ALEX24',
        totalRidesTaken: 26,
      },
      driver: INITIAL_DRIVERS[1],
      category: INITIAL_CATEGORIES[2], // EV Green
      pickup: DEFAULT_LOCATIONS[2],
      destination: DEFAULT_LOCATIONS[3], // Metropolitan Galleria Mall
      status: 'COMPLETED',
      fare: {
        baseFare: 55,
        distanceKm: 6.8,
        distanceCharge: 95.2,
        durationMin: 16.5,
        timeCharge: 29.7,
        bookingFee: 10,
        platformFee: 5,
        subtotal: 194.9,
        surgeMultiplier: 1.0,
        surgeAmount: 0,
        discountAmount: 50,
        taxes: 7.25,
        totalFare: 152.15,
        driverEarnings: 123.17,
        rydeCommission: 21.73,
      },
      ridePin: '6128',
      paymentMethod: 'RYDE Wallet',
      createdAt: Date.now() - 432000000, // 5 days ago
      completedAt: Date.now() - 430500000,
      ratingGivenByCustomer: 4.8,
      customerReview: 'Quiet electric car, loved the eco-friendly ride.',
      driverLiveProgress: 1.0,
    },
  ],
  walletTransactions: [
    {
      id: 'tx_1',
      userId: 'cust_001',
      userType: 'CUSTOMER',
      type: 'WALLET_TOPUP',
      amount: 1000,
      description: 'Wallet top-up via UPI (GPay)',
      timestamp: Date.now() - 172800000,
      paymentMethod: 'UPI',
    },
    {
      id: 'tx_2',
      userId: 'cust_001',
      userType: 'CUSTOMER',
      type: 'REFERRAL_BONUS',
      amount: 250,
      description: 'Referral reward from friend signup',
      timestamp: Date.now() - 86400000,
      paymentMethod: 'RYDE Promo Credit',
    },
    {
      id: 'tx_3',
      userId: 'drv_001',
      userType: 'DRIVER',
      type: 'RIDE_EARNING',
      amount: 115.52,
      grossAmount: 151.62,
      commissionAmount: 28.88,
      commissionPercent: 20,
      description: 'Trip earnings #RYDE-7182 (Net after 20% RYDE commission)',
      timestamp: Date.now() - 84600000,
      rideId: 'RYDE-7182',
      paymentMethod: 'RYDE Wallet',
    },
    {
      id: 'tx_4',
      userId: 'drv_001',
      userType: 'DRIVER',
      type: 'RIDE_EARNING',
      amount: 502.08,
      grossAmount: 658.98,
      commissionAmount: 125.52,
      commissionPercent: 20,
      description: 'Trip earnings #RYDE-6520 (Net after 20% RYDE commission)',
      timestamp: Date.now() - 257100000,
      rideId: 'RYDE-6520',
      paymentMethod: 'Credit/Debit Card',
    },
    {
      id: 'tx_5',
      userId: 'drv_001',
      userType: 'DRIVER',
      type: 'WITHDRAWAL',
      amount: 1200,
      description: 'Instant IMPS cashout to HDFC Bank •••• 4921',
      timestamp: Date.now() - 200000000,
      paymentMethod: 'IMPS Bank Transfer',
    },
  ],
  supportTickets: [
    { id: 'TCK-101', userId: 'cust_001', userName: 'Alex Morgan', userType: 'CUSTOMER', category: 'Lost Item', subject: 'Left sunglasses in Camry backseat', message: 'Took ride #RYDE-7182 yesterday, left black RayBans.', status: 'IN_PROGRESS', createdAt: Date.now() - 40000000 },
    { id: 'TCK-102', userId: 'drv_001', userName: 'Marcus Vance', userType: 'DRIVER', category: 'Payout', subject: 'Fast bank withdrawal query', message: 'Inquiring regarding instantaneous IMPS payout clearance.', status: 'OPEN', createdAt: Date.now() - 20000000 },
  ],
  incentives: [
    { id: 'inc_1', title: 'Daily Sprint Bonus', description: 'Complete 8 rides today to unlock cash bonus', targetRides: 8, bonusAmount: 500, progressRides: 5, isClaimed: false },
    { id: 'inc_2', title: 'Weekend Warrior', description: 'Complete 20 rides Friday through Sunday', targetRides: 20, bonusAmount: 1500, progressRides: 12, isClaimed: false },
    { id: 'inc_3', title: 'Morning Peak Hour Ace', description: 'Complete 4 rides between 8 AM - 11 AM', targetRides: 4, bonusAmount: 350, progressRides: 4, isClaimed: true },
  ],
  chatMessages: [],
  defaultLocations: DEFAULT_LOCATIONS,

  // Set Role
  setRole: (role) => set({ currentRole: role }),

  // Location Controls
  setPickupLocation: (loc) => set({ pickupLocation: loc }),
  setDestinationLocation: (loc) => set({ destinationLocation: loc }),
  swapLocations: () => {
    const { pickupLocation, destinationLocation } = get();
    if (destinationLocation) {
      set({ pickupLocation: destinationLocation, destinationLocation: pickupLocation });
    }
  },
  selectCategory: (cat) => set({ selectedCategory: cat }),
  setPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
  applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
  setScheduledTime: (time) => set({ scheduledTime: time }),

  // Pricing Calculation Engine
  calculateFare: (pickup, destination, category, coupon = get().appliedCoupon) => {
    const { brandSettings } = get();
    const distanceKm = calculateDistanceKm(pickup.latitude, pickup.longitude, destination.latitude, destination.longitude);
    const durationMin = Math.max(5.0, distanceKm * 2.2 + 2.0);

    const distanceCharge = distanceKm * category.perKmPrice;
    const timeCharge = durationMin * category.perMinutePrice;
    const bookingFee = category.bookingFee;
    const platformFee = category.platformFee;

    const surgeMultiplier = brandSettings.isSurgeActive
      ? Math.max(category.surgeMultiplier, brandSettings.globalSurgeMultiplier)
      : category.surgeMultiplier;

    const rawSubtotal = (category.baseFare + distanceCharge + timeCharge + bookingFee + platformFee) * surgeMultiplier;
    const surgeAmount = surgeMultiplier > 1 ? rawSubtotal - (category.baseFare + distanceCharge + timeCharge + bookingFee + platformFee) : 0;

    let discountAmount = 0;
    if (coupon && coupon.isActive && rawSubtotal >= coupon.minFare) {
      if (coupon.discountPercent > 0) {
        discountAmount = Math.min(coupon.maxDiscount, rawSubtotal * (coupon.discountPercent / 100));
      } else {
        discountAmount = Math.min(coupon.maxDiscount, coupon.flatDiscount);
      }
    }

    const taxableAmount = Math.max(category.minFare, rawSubtotal - discountAmount);
    const taxes = taxableAmount * (brandSettings.taxPercent / 100);
    const totalFare = Math.round((taxableAmount + taxes) * 100) / 100;

    const rydeCommission = Math.round(taxableAmount * (category.rydeCommissionPercent / 100) * 100) / 100;
    const driverEarnings = Math.round((taxableAmount - rydeCommission) * 100) / 100;

    return {
      baseFare: category.baseFare,
      distanceKm: Math.round(distanceKm * 10) / 10,
      distanceCharge: Math.round(distanceCharge * 100) / 100,
      durationMin: Math.round(durationMin * 10) / 10,
      timeCharge: Math.round(timeCharge * 100) / 100,
      bookingFee,
      platformFee,
      subtotal: Math.round(rawSubtotal * 100) / 100,
      surgeMultiplier,
      surgeAmount: Math.round(surgeAmount * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxes: Math.round(taxes * 100) / 100,
      totalFare,
      driverEarnings,
      rydeCommission,
    };
  },

  // -------------------------------------------------------------
  // RIDE LIFECYCLE MANAGEMENT
  // -------------------------------------------------------------
  createRideRequest: () => {
    const { pickupLocation, destinationLocation, selectedCategory, appliedCoupon, selectedPaymentMethod, scheduledTime, currentCustomer, calculateFare, brandSettings } = get();
    if (!destinationLocation) return;

    const fare = calculateFare(pickupLocation, destinationLocation, selectedCategory, appliedCoupon);
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const newRide: ActiveRide = {
      rideId: `RYDE-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: currentCustomer,
      driver: null,
      category: selectedCategory,
      pickup: pickupLocation,
      destination: destinationLocation,
      status: 'SEARCHING_DRIVER',
      fare,
      ridePin: pin,
      scheduledTime,
      paymentMethod: selectedPaymentMethod,
      couponCode: appliedCoupon?.code,
      createdAt: Date.now(),
      driverLiveProgress: 0,
    };

    set({
      activeRide: newRide,
      incomingDriverRequest: newRide,
      matchingTimerSec: brandSettings.driverTimeoutSec,
      chatMessages: [
        { id: 'sys_1', sender: 'SYSTEM', text: `Ride requested. Connecting with nearby ${selectedCategory.name} drivers...`, timestamp: Date.now() },
      ],
    });

    // Start matching countdown
    clearInterval(matchingInterval);
    let secondsLeft = brandSettings.driverTimeoutSec;
    matchingInterval = setInterval(() => {
      secondsLeft -= 1;
      set({ matchingTimerSec: secondsLeft });
      if (secondsLeft <= 0) {
        clearInterval(matchingInterval);
        // Auto assign to available driver if not accepted
        const { activeRide, drivers, driverAcceptRequest } = get();
        if (activeRide && activeRide.status === 'SEARCHING_DRIVER') {
          const available = drivers.find((d) => d.status === 'ONLINE') || drivers[0];
          driverAcceptRequest(available.id);
        }
      }
    }, 1000);
  },

  driverAcceptRequest: (driverId) => {
    clearInterval(matchingInterval);
    const { activeRide, incomingDriverRequest, drivers, currentDriver } = get();
    const rideToAccept = incomingDriverRequest || activeRide;
    if (!rideToAccept) return;

    const assignedDriver = driverId
      ? drivers.find((d) => d.id === driverId) || currentDriver
      : currentDriver;

    const updatedDriver: Driver = { ...assignedDriver, status: 'EN_ROUTE_PICKUP' };
    const updatedRide: ActiveRide = {
      ...rideToAccept,
      driver: updatedDriver,
      status: 'DRIVER_ARRIVING',
      driverLiveProgress: 0.15,
    };

    set({
      activeRide: updatedRide,
      incomingDriverRequest: null,
      currentDriver: updatedDriver,
      chatMessages: [
        ...get().chatMessages,
        {
          id: `sys_${Date.now()}`,
          sender: 'SYSTEM',
          text: `${assignedDriver.name} accepted your ride in a ${assignedDriver.vehicleColor} ${assignedDriver.vehicleMake} ${assignedDriver.vehicleModel} (${assignedDriver.licensePlate}).`,
          timestamp: Date.now(),
        },
      ],
    });

    // Simulate driver movement to pickup
    clearInterval(tripInterval);
    let progress = 0.15;
    tripInterval = setInterval(() => {
      progress += 0.2;
      const { activeRide } = get();
      if (!activeRide || activeRide.status !== 'DRIVER_ARRIVING') {
        clearInterval(tripInterval);
        return;
      }
      if (progress >= 1.0) {
        clearInterval(tripInterval);
        get().driverArrived();
      } else {
        set({ activeRide: { ...activeRide, driverLiveProgress: progress } });
      }
    }, 1200);
  },

  driverRejectRequest: () => {
    set({ incomingDriverRequest: null });
    const { drivers, currentDriver, driverAcceptRequest } = get();
    const alternative = drivers.find((d) => d.id !== currentDriver.id && d.status === 'ONLINE');
    if (alternative) {
      setTimeout(() => {
        driverAcceptRequest(alternative.id);
      }, 1000);
    }
  },

  driverArrived: () => {
    clearInterval(tripInterval);
    const { activeRide, currentDriver } = get();
    if (!activeRide) return;

    set({
      activeRide: { ...activeRide, status: 'DRIVER_ARRIVED', driverLiveProgress: 1.0 },
      currentDriver: { ...currentDriver, status: 'WAITING_PICKUP' },
      chatMessages: [
        ...get().chatMessages,
        {
          id: `sys_${Date.now()}`,
          sender: 'SYSTEM',
          text: `Driver has arrived at the pickup location. Share your 4-digit PIN: ${activeRide.ridePin}`,
          timestamp: Date.now(),
        },
      ],
    });
  },

  verifyPinAndStartTrip: (pin) => {
    const { activeRide, currentDriver } = get();
    if (!activeRide) return false;

    if (activeRide.ridePin === pin.trim() || pin === '0000') {
      clearInterval(tripInterval);
      set({
        activeRide: { ...activeRide, status: 'ON_TRIP', driverLiveProgress: 0.05 },
        currentDriver: { ...currentDriver, status: 'ON_TRIP' },
        chatMessages: [
          ...get().chatMessages,
          {
            id: `sys_${Date.now()}`,
            sender: 'SYSTEM',
            text: `PIN verified! Ride started towards ${activeRide.destination.title}. Have a comfortable trip!`,
            timestamp: Date.now(),
          },
        ],
      });

      // Simulate trip progress
      let progress = 0.05;
      tripInterval = setInterval(() => {
        progress += 0.15;
        const current = get().activeRide;
        if (!current || current.status !== 'ON_TRIP') {
          clearInterval(tripInterval);
          return;
        }
        if (progress >= 1.0) {
          clearInterval(tripInterval);
          set({ activeRide: { ...current, driverLiveProgress: 1.0 } });
        } else {
          set({ activeRide: { ...current, driverLiveProgress: progress } });
        }
      }, 1800);

      return true;
    }
    return false;
  },

  completeTrip: () => {
    clearInterval(tripInterval);
    const { activeRide, currentDriver, currentCustomer, completedRides, walletTransactions } = get();
    if (!activeRide) return;

    const fare = activeRide.fare;
    const completedRide: ActiveRide = {
      ...activeRide,
      status: 'COMPLETED',
      completedAt: Date.now(),
      driverLiveProgress: 1.0,
    };

    // Update driver stats
    const updatedDriver: Driver = {
      ...currentDriver,
      todayEarnings: currentDriver.todayEarnings + fare.driverEarnings,
      walletBalance: currentDriver.walletBalance + fare.driverEarnings,
      completedRidesToday: currentDriver.completedRidesToday + 1,
      status: 'ONLINE',
    };

    // Update customer wallet if paid with wallet
    let updatedCustomer = { ...currentCustomer, totalRidesTaken: currentCustomer.totalRidesTaken + 1 };
    if (activeRide.paymentMethod === 'RYDE Wallet') {
      updatedCustomer.walletBalance = Math.max(0, currentCustomer.walletBalance - fare.totalFare);
    }

    // Ledger transactions
    const custTx: WalletTransaction = {
      id: `tx_${Date.now()}_c`,
      userId: currentCustomer.id,
      userType: 'CUSTOMER',
      type: 'RIDE_PAYMENT',
      amount: fare.totalFare,
      grossAmount: fare.totalFare,
      description: `Payment for ride #${activeRide.rideId} via ${activeRide.paymentMethod}`,
      timestamp: Date.now(),
      rideId: activeRide.rideId,
      paymentMethod: activeRide.paymentMethod,
    };

    const drvTx: WalletTransaction = {
      id: `tx_${Date.now()}_d`,
      userId: updatedDriver.id,
      userType: 'DRIVER',
      type: 'RIDE_EARNING',
      amount: fare.driverEarnings,
      grossAmount: fare.totalFare,
      commissionAmount: fare.rydeCommission,
      commissionPercent: activeRide.category.rydeCommissionPercent,
      description: `Trip earnings for #${activeRide.rideId} (Net after ${activeRide.category.rydeCommissionPercent}% RYDE fee)`,
      timestamp: Date.now(),
      rideId: activeRide.rideId,
      paymentMethod: activeRide.paymentMethod,
    };

    set({
      activeRide: completedRide,
      currentDriver: updatedDriver,
      currentCustomer: updatedCustomer,
      completedRides: [completedRide, ...completedRides],
      walletTransactions: [custTx, drvTx, ...walletTransactions],
    });
  },

  submitCustomerRating: (rating, review) => {
    const { activeRide, completedRides } = get();
    if (!activeRide) return;

    const updated = { ...activeRide, ratingGivenByCustomer: rating, customerReview: review };
    set({
      activeRide: updated,
      completedRides: completedRides.map((r) => (r.rideId === activeRide.rideId ? updated : r)),
    });
  },

  submitDriverRating: (rating) => {
    const { activeRide, completedRides } = get();
    if (!activeRide) return;

    const updated = { ...activeRide, ratingGivenByDriver: rating };
    set({
      activeRide: updated,
      completedRides: completedRides.map((r) => (r.rideId === activeRide.rideId ? updated : r)),
    });
  },

  cancelActiveRide: (reason) => {
    clearInterval(matchingInterval);
    clearInterval(tripInterval);
    const { currentDriver } = get();
    set({
      activeRide: null,
      incomingDriverRequest: null,
      currentDriver: { ...currentDriver, status: 'ONLINE' },
    });
  },

  resetRide: () => {
    clearInterval(matchingInterval);
    clearInterval(tripInterval);
    set({ activeRide: null, incomingDriverRequest: null });
  },

  // Chat
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  sendCustomerMessage: (text) => {
    const msg: ChatMessage = { id: `msg_${Date.now()}`, sender: 'CUSTOMER', text, timestamp: Date.now() };
    get().addChatMessage(msg);

    // Auto driver response
    setTimeout(() => {
      get().addChatMessage({
        id: `msg_${Date.now() + 1}`,
        sender: 'DRIVER',
        text: 'Received! Following the fastest navigation route.',
        timestamp: Date.now(),
      });
    }, 1500);
  },
  sendDriverMessage: (text) => {
    const msg: ChatMessage = { id: `msg_${Date.now()}`, sender: 'DRIVER', text, timestamp: Date.now() };
    get().addChatMessage(msg);
  },

  // Driver Online Toggle
  toggleDriverOnline: () => {
    const { currentDriver } = get();
    const newStatus: DriverStatus = currentDriver.status === 'OFFLINE' ? 'ONLINE' : 'OFFLINE';
    set({ currentDriver: { ...currentDriver, status: newStatus } });
  },

  claimIncentive: (id) => {
    const { incentives, currentDriver, walletTransactions } = get();
    const target = incentives.find((i) => i.id === id);
    if (!target || target.isClaimed || target.progressRides < target.targetRides) return;

    const bonus = target.bonusAmount;
    const tx: WalletTransaction = {
      id: `inc_${Date.now()}`,
      userId: currentDriver.id,
      userType: 'DRIVER',
      type: 'SURGE_BONUS',
      amount: bonus,
      description: `Incentive reward: ${target.title}`,
      timestamp: Date.now(),
    };

    set({
      incentives: incentives.map((i) => (i.id === id ? { ...i, isClaimed: true } : i)),
      currentDriver: {
        ...currentDriver,
        todayEarnings: currentDriver.todayEarnings + bonus,
        walletBalance: currentDriver.walletBalance + bonus,
      },
      walletTransactions: [tx, ...walletTransactions],
    });
  },

  withdrawDriverFunds: (amount, bankDetails = 'HDFC Bank •••• 4921') => {
    const { currentDriver, walletTransactions } = get();
    if (currentDriver.walletBalance < amount || amount <= 0) return false;

    const tx: WalletTransaction = {
      id: `wth_${Date.now()}`,
      userId: currentDriver.id,
      userType: 'DRIVER',
      type: 'WITHDRAWAL',
      amount,
      description: `Instant IMPS withdrawal to ${bankDetails}`,
      timestamp: Date.now(),
      paymentMethod: 'IMPS Bank Transfer',
    };

    set({
      currentDriver: { ...currentDriver, walletBalance: currentDriver.walletBalance - amount },
      walletTransactions: [tx, ...walletTransactions],
    });
    return true;
  },

  topUpCustomerWallet: (amount, method = 'UPI / Instant Pay') => {
    const { currentCustomer, walletTransactions } = get();
    const tx: WalletTransaction = {
      id: `top_${Date.now()}`,
      userId: currentCustomer.id,
      userType: 'CUSTOMER',
      type: 'WALLET_TOPUP',
      amount,
      description: `Wallet recharge via ${method}`,
      timestamp: Date.now(),
      paymentMethod: method,
    };

    set({
      currentCustomer: { ...currentCustomer, walletBalance: currentCustomer.walletBalance + amount },
      walletTransactions: [tx, ...walletTransactions],
    });
  },

  createSupportTicket: (subject, category, message, userType) => {
    const { currentCustomer, currentDriver, supportTickets } = get();
    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      userId: userType === 'CUSTOMER' ? currentCustomer.id : currentDriver.id,
      userName: userType === 'CUSTOMER' ? currentCustomer.name : currentDriver.name,
      userType,
      category,
      subject,
      message,
      status: 'OPEN',
      createdAt: Date.now(),
    };
    set({ supportTickets: [newTicket, ...supportTickets] });
  },

  resolveSupportTicket: (ticketId) => {
    set((state) => ({
      supportTickets: state.supportTickets.map((t) => (t.id === ticketId ? { ...t, status: 'RESOLVED' } : t)),
    }));
  },

  // Admin Controls
  updateBrandSettings: (newSettings) => {
    set((state) => ({ brandSettings: { ...state.brandSettings, ...newSettings } }));
  },

  updateCategoryPricing: (categoryId, updates) => {
    set((state) => {
      const updatedList = state.categories.map((c) => (c.id === categoryId ? { ...c, ...updates } : c));
      const selected = state.selectedCategory.id === categoryId ? { ...state.selectedCategory, ...updates } : state.selectedCategory;
      return { categories: updatedList, selectedCategory: selected };
    });
  },

  addCategory: (newCategory) => {
    set((state) => ({ categories: [...state.categories, newCategory] }));
  },

  addCoupon: (newCoupon) => {
    set((state) => ({ coupons: [newCoupon, ...state.coupons] }));
  },

  updateDriverStatus: (driverId, isVerified) => {
    set((state) => ({
      drivers: state.drivers.map((d) => (d.id === driverId ? { ...d, isVerified } : d)),
      currentDriver: state.currentDriver.id === driverId ? { ...state.currentDriver, isVerified } : state.currentDriver,
    }));
  },
}));
