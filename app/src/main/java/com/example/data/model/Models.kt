package com.example.data.model

data class BrandSettings(
    val appName: String = "RYDE",
    val tagline: String = "Move Your Way",
    val primaryColorHex: String = "#00E599",
    val secondaryColorHex: String = "#06B6D4",
    val currencySymbol: String = "₹",
    val currencyCode: String = "INR",
    val defaultDriverCommissionPercent: Double = 80.0,
    val defaultRydeCommissionPercent: Double = 20.0,
    val taxPercent: Double = 5.0,
    val waitingFeePerMin: Double = 2.5,
    val searchRadiusKm: Double = 5.0,
    val driverTimeoutSec: Int = 15,
    val globalSurgeMultiplier: Double = 1.0,
    val isSurgeActive: Boolean = false
)

enum class RideStatus {
    IDLE,
    SELECTING_DESTINATION,
    SELECTING_CATEGORY,
    SEARCHING_DRIVER,
    DRIVER_ASSIGNED,
    DRIVER_ARRIVING,
    DRIVER_ARRIVED,
    ON_TRIP,
    COMPLETED,
    CANCELLED
}

enum class DriverStatus {
    OFFLINE,
    ONLINE,
    REQUEST_RECEIVED,
    EN_ROUTE_PICKUP,
    WAITING_PICKUP,
    ON_TRIP,
    SUSPENDED
}

data class RideLocation(
    val id: String,
    val title: String,
    val subtitle: String,
    val latitude: Double,
    val longitude: Double,
    val iconType: String = "pin"
)

data class RideCategory(
    val id: String,
    val name: String,
    val description: String,
    val vehicleType: String,
    val capacity: Int,
    val baseFare: Double,
    val minFare: Double,
    val perKmPrice: Double,
    val perMinutePrice: Double,
    val bookingFee: Double = 10.0,
    val platformFee: Double = 5.0,
    val cancellationFee: Double = 25.0,
    val surgeMultiplier: Double = 1.0,
    val driverCommissionPercent: Double = 80.0,
    val rydeCommissionPercent: Double = 20.0,
    val estimatedArrivalMinutes: Int = 4,
    val iconKey: String = "car",
    val isActive: Boolean = true
)

data class Driver(
    val id: String,
    val name: String,
    val phone: String,
    val photoUrl: String = "",
    val rating: Double = 4.9,
    val totalRides: Int = 1420,
    val vehicleMake: String = "Toyota",
    val vehicleModel: String = "Camry Hybrid",
    val licensePlate: String = "DL 01 AB 7890",
    val vehicleColor: String = "Pearl White",
    val categoryId: String = "comfort",
    val status: DriverStatus = DriverStatus.ONLINE,
    val latitude: Double = 28.5355,
    val longitude: Double = 77.2410,
    val todayEarnings: Double = 1850.0,
    val completedRidesToday: Int = 5,
    val acceptanceRate: Double = 96.0,
    val cancellationRate: Double = 1.8,
    val walletBalance: Double = 3450.0,
    val isVerified: Boolean = true
)

data class Customer(
    val id: String = "cust_001",
    val name: String = "Alex Morgan",
    val phone: String = "+91 98765 43210",
    val email: String = "alex.morgan@ryde.app",
    val rating: Double = 4.95,
    val walletBalance: Double = 850.0,
    val referralCode: String = "RYDE-ALEX24",
    val totalRidesTaken: Int = 28
)

data class Coupon(
    val code: String,
    val discountPercent: Double = 0.0,
    val flatDiscount: Double = 0.0,
    val maxDiscount: Double = 150.0,
    val minFare: Double = 100.0,
    val description: String,
    val isActive: Boolean = true
)

data class FareCalculation(
    val baseFare: Double,
    val distanceKm: Double,
    val distanceCharge: Double,
    val durationMin: Double,
    val timeCharge: Double,
    val bookingFee: Double,
    val platformFee: Double,
    val subtotal: Double,
    val surgeMultiplier: Double,
    val surgeAmount: Double,
    val discountAmount: Double,
    val taxes: Double,
    val totalFare: Double,
    val driverEarnings: Double,
    val rydeCommission: Double
)

data class ActiveRide(
    val rideId: String,
    val customer: Customer,
    val driver: Driver?,
    val category: RideCategory,
    val pickup: RideLocation,
    val destination: RideLocation,
    val status: RideStatus,
    val fare: FareCalculation,
    val ridePin: String,
    val scheduledTime: String? = null,
    val paymentMethod: String = "RYDE Wallet",
    val couponCode: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val completedAt: Long? = null,
    val ratingGivenByCustomer: Float? = null,
    val customerReview: String? = null,
    val ratingGivenByDriver: Float? = null,
    val driverLiveProgress: Float = 0.0f, // 0.0 to 1.0 along the route
    val cancelReason: String? = null
)

data class WalletTransaction(
    val id: String,
    val userId: String,
    val userType: String, // "CUSTOMER" or "DRIVER"
    val type: String, // "RIDE_PAYMENT", "RIDE_EARNING", "WALLET_TOPUP", "WITHDRAWAL", "REFERRAL_BONUS"
    val amount: Double,
    val description: String,
    val timestamp: Long = System.currentTimeMillis(),
    val rideId: String? = null
)

data class SupportTicket(
    val id: String,
    val userId: String,
    val userName: String,
    val userType: String,
    val category: String,
    val subject: String,
    val message: String,
    val status: String = "OPEN", // "OPEN", "IN_PROGRESS", "RESOLVED"
    val createdAt: Long = System.currentTimeMillis()
)

data class IncentiveRule(
    val id: String,
    val title: String,
    val description: String,
    val targetRides: Int,
    val bonusAmount: Double,
    val progressRides: Int = 3,
    val isClaimed: Boolean = false
)

data class ChatMessage(
    val id: String,
    val sender: String, // "CUSTOMER", "DRIVER", "SYSTEM"
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
)

enum class AppRole {
    CUSTOMER,
    DRIVER,
    ADMIN
}
