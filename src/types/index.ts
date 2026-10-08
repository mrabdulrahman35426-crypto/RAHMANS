export type AppRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export type RideStatus =
  | 'IDLE'
  | 'SEARCHING_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'ON_TRIP'
  | 'COMPLETED'
  | 'CANCELLED';

export type DriverStatus =
  | 'OFFLINE'
  | 'ONLINE'
  | 'REQUEST_RECEIVED'
  | 'EN_ROUTE_PICKUP'
  | 'WAITING_PICKUP'
  | 'ON_TRIP'
  | 'SUSPENDED';

export interface BrandSettings {
  appName: string;
  tagline: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  currencySymbol: string;
  currencyCode: string;
  defaultDriverCommissionPercent: number;
  defaultRydeCommissionPercent: number;
  taxPercent: number;
  waitingFeePerMin: number;
  searchRadiusKm: number;
  driverTimeoutSec: number;
  globalSurgeMultiplier: number;
  isSurgeActive: boolean;
}

export interface RideLocation {
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  iconType: 'home' | 'work' | 'airport' | 'shopping' | 'pin';
}

export interface RideCategory {
  id: string;
  name: string;
  description: string;
  vehicleType: string;
  capacity: number;
  baseFare: number;
  minFare: number;
  perKmPrice: number;
  perMinutePrice: number;
  bookingFee: number;
  platformFee: number;
  cancellationFee: number;
  surgeMultiplier: number;
  driverCommissionPercent: number;
  rydeCommissionPercent: number;
  estimatedArrivalMinutes: number;
  iconKey: string;
  isActive: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  totalRides: number;
  vehicleMake: string;
  vehicleModel: string;
  licensePlate: string;
  vehicleColor: string;
  categoryId: string;
  status: DriverStatus;
  latitude: number;
  longitude: number;
  todayEarnings: number;
  completedRidesToday: number;
  acceptanceRate: number;
  cancellationRate: number;
  walletBalance: number;
  isVerified: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  walletBalance: number;
  referralCode: string;
  totalRidesTaken: number;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  flatDiscount: number;
  maxDiscount: number;
  minFare: number;
  description: string;
  isActive: boolean;
}

export interface FareCalculation {
  baseFare: number;
  distanceKm: number;
  distanceCharge: number;
  durationMin: number;
  timeCharge: number;
  bookingFee: number;
  platformFee: number;
  subtotal: number;
  surgeMultiplier: number;
  surgeAmount: number;
  discountAmount: number;
  taxes: number;
  totalFare: number;
  driverEarnings: number;
  rydeCommission: number;
}

export interface ActiveRide {
  rideId: string;
  customer: Customer;
  driver: Driver | null;
  category: RideCategory;
  pickup: RideLocation;
  destination: RideLocation;
  status: RideStatus;
  fare: FareCalculation;
  ridePin: string;
  scheduledTime?: string | null;
  paymentMethod: string;
  couponCode?: string | null;
  createdAt: number;
  completedAt?: number | null;
  ratingGivenByCustomer?: number | null;
  customerReview?: string | null;
  ratingGivenByDriver?: number | null;
  driverLiveProgress: number; // 0.0 to 1.0 along route
  cancelReason?: string | null;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  userType: 'CUSTOMER' | 'DRIVER';
  type: 'RIDE_PAYMENT' | 'RIDE_EARNING' | 'WALLET_TOPUP' | 'WITHDRAWAL' | 'REFERRAL_BONUS' | 'SURGE_BONUS';
  amount: number;
  description: string;
  timestamp: number;
  rideId?: string | null;
  grossAmount?: number;
  commissionAmount?: number;
  commissionPercent?: number;
  paymentMethod?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userType: 'CUSTOMER' | 'DRIVER';
  category: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: number;
}

export interface IncentiveRule {
  id: string;
  title: string;
  description: string;
  targetRides: number;
  bonusAmount: number;
  progressRides: number;
  isClaimed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'CUSTOMER' | 'DRIVER' | 'SYSTEM';
  text: string;
  timestamp: number;
}
