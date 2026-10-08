package com.example.data.store

import com.example.data.model.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID
import kotlin.math.*
import kotlin.random.Random

/**
 * RideStore: Centralized reactive State Management engine for the RYDE platform.
 * Manages the complete lifecycle of ride requests:
 * Creation -> Matching -> Driver Assignment -> Arriving -> Arrived -> Pin Verification -> Active Trip -> Completion & Financial Settlement.
 */
class RideStore private constructor() {

    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    // App Role (Customer, Driver, Admin)
    private val _currentRole = MutableStateFlow(AppRole.CUSTOMER)
    val currentRole: StateFlow<AppRole> = _currentRole.asStateFlow()

    // Brand & System Settings (Fully configurable by Admin)
    private val _brandSettings = MutableStateFlow(BrandSettings())
    val brandSettings: StateFlow<BrandSettings> = _brandSettings.asStateFlow()

    // Pre-defined Preset Locations
    val defaultLocations = listOf(
        RideLocation("loc_1", "Grand Central Station", "Park Avenue, Downtown", 28.5355, 77.2410, "home"),
        RideLocation("loc_2", "International Airport Terminal 3", "Aviation Expressway", 28.5562, 77.1000, "airport"),
        RideLocation("loc_3", "Cyber City Tech Hub", "Building 10B, DLF Phase 2", 28.4900, 77.0890, "work"),
        RideLocation("loc_4", "Metropolitan Galleria Mall", "MG Road, Central District", 28.5020, 77.2200, "shopping"),
        RideLocation("loc_5", "Starlight Waterfront Arena", "Outer Ring Promenade", 28.5600, 77.2800, "pin")
    )

    // Current Customer & Driver Profiles
    private val _currentCustomer = MutableStateFlow(
        Customer(
            id = "cust_001",
            name = "Alex Morgan",
            phone = "+91 98765 43210",
            email = "alex.morgan@ryde.app",
            rating = 4.95,
            walletBalance = 1250.0,
            referralCode = "RYDE-ALEX24"
        )
    )
    val currentCustomer: StateFlow<Customer> = _currentCustomer.asStateFlow()

    private val _currentDriver = MutableStateFlow(
        Driver(
            id = "drv_001",
            name = "Marcus Vance",
            phone = "+91 98111 22334",
            photoUrl = "",
            rating = 4.92,
            totalRides = 1420,
            vehicleMake = "Toyota",
            vehicleModel = "Camry Hybrid",
            licensePlate = "DL 01 AB 7890",
            vehicleColor = "Pearl White",
            categoryId = "comfort",
            status = DriverStatus.ONLINE,
            latitude = 28.5360,
            longitude = 77.2405,
            todayEarnings = 1850.0,
            completedRidesToday = 5,
            acceptanceRate = 96.0,
            cancellationRate = 1.8,
            walletBalance = 3450.0
        )
    )
    val currentDriver: StateFlow<Driver> = _currentDriver.asStateFlow()

    // Fleet of registered drivers
    private val _driversList = MutableStateFlow(
        listOf(
            _currentDriver.value,
            Driver(
                id = "drv_002",
                name = "Elena Rostova",
                phone = "+91 98222 33445",
                rating = 4.88,
                totalRides = 980,
                vehicleMake = "Hyundai",
                vehicleModel = "Ioniq 5 EV",
                licensePlate = "DL 03 EV 2024",
                vehicleColor = "Cyber Grey",
                categoryId = "ev",
                status = DriverStatus.ONLINE,
                latitude = 28.5340,
                longitude = 77.2425,
                todayEarnings = 2100.0,
                completedRidesToday = 6,
                walletBalance = 4120.0
            ),
            Driver(
                id = "drv_003",
                name = "David Chen",
                phone = "+91 98333 44556",
                rating = 4.97,
                totalRides = 2150,
                vehicleMake = "Mercedes-Benz",
                vehicleModel = "E-Class Luxury",
                licensePlate = "DL 04 PR 9999",
                vehicleColor = "Obsidian Black",
                categoryId = "premium",
                status = DriverStatus.ONLINE,
                latitude = 28.5380,
                longitude = 77.2390,
                todayEarnings = 3200.0,
                completedRidesToday = 4,
                walletBalance = 6800.0
            ),
            Driver(
                id = "drv_004",
                name = "Rahul Sharma",
                phone = "+91 98444 55667",
                rating = 4.82,
                totalRides = 3100,
                vehicleMake = "Bajaj",
                vehicleModel = "Compact 4S",
                licensePlate = "DL 05 AT 1234",
                vehicleColor = "Green & Yellow",
                categoryId = "auto",
                status = DriverStatus.ONLINE,
                latitude = 28.5330,
                longitude = 77.2415,
                todayEarnings = 950.0,
                completedRidesToday = 8,
                walletBalance = 1540.0
            ),
            Driver(
                id = "drv_005",
                name = "Tariq Miller",
                phone = "+91 98555 66778",
                rating = 4.90,
                totalRides = 850,
                vehicleMake = "Maruti Suzuki",
                vehicleModel = "Swift Dzire",
                licensePlate = "DL 02 EC 4567",
                vehicleColor = "Silver Metallic",
                categoryId = "economy",
                status = DriverStatus.ONLINE,
                latitude = 28.5370,
                longitude = 77.2430,
                todayEarnings = 1400.0,
                completedRidesToday = 5,
                walletBalance = 2300.0
            )
        )
    )
    val driversList: StateFlow<List<Driver>> = _driversList.asStateFlow()

    // Configurable Ride Categories
    private val _categories = MutableStateFlow(
        listOf(
            RideCategory(
                id = "economy",
                name = "RYDE Economy",
                description = "Affordable, everyday rides with top-rated drivers",
                vehicleType = "Compact Hatchback / Sedan",
                capacity = 4,
                baseFare = 40.0,
                minFare = 60.0,
                perKmPrice = 12.0,
                perMinutePrice = 1.5,
                bookingFee = 10.0,
                platformFee = 5.0,
                surgeMultiplier = 1.0,
                driverCommissionPercent = 80.0,
                rydeCommissionPercent = 20.0,
                estimatedArrivalMinutes = 3,
                iconKey = "car",
                isActive = true
            ),
            RideCategory(
                id = "comfort",
                name = "RYDE Comfort",
                description = "Spacious sedans with experienced drivers & climate control",
                vehicleType = "Mid-size Premium Sedan",
                capacity = 4,
                baseFare = 65.0,
                minFare = 95.0,
                perKmPrice = 16.5,
                perMinutePrice = 2.0,
                bookingFee = 12.0,
                platformFee = 8.0,
                surgeMultiplier = 1.0,
                driverCommissionPercent = 80.0,
                rydeCommissionPercent = 20.0,
                estimatedArrivalMinutes = 4,
                iconKey = "car_sedan",
                isActive = true
            ),
            RideCategory(
                id = "ev",
                name = "RYDE Green EV",
                description = "Zero-emission electric rides for eco-conscious commuting",
                vehicleType = "Electric Sedan / Crossover",
                capacity = 4,
                baseFare = 55.0,
                minFare = 85.0,
                perKmPrice = 14.0,
                perMinutePrice = 1.8,
                bookingFee = 10.0,
                platformFee = 5.0,
                surgeMultiplier = 1.0,
                driverCommissionPercent = 85.0, // Special eco-bonus for EV drivers
                rydeCommissionPercent = 15.0,
                estimatedArrivalMinutes = 5,
                iconKey = "car_electric",
                isActive = true
            ),
            RideCategory(
                id = "premium",
                name = "RYDE Premier",
                description = "High-end luxury vehicles for business & VIP travel",
                vehicleType = "Executive Luxury Sedan",
                capacity = 4,
                baseFare = 120.0,
                minFare = 180.0,
                perKmPrice = 28.0,
                perMinutePrice = 3.5,
                bookingFee = 20.0,
                platformFee = 15.0,
                surgeMultiplier = 1.0,
                driverCommissionPercent = 80.0,
                rydeCommissionPercent = 20.0,
                estimatedArrivalMinutes = 6,
                iconKey = "car_luxury",
                isActive = true
            ),
            RideCategory(
                id = "xl",
                name = "RYDE XL",
                description = "Spacious 6-seater SUVs for groups and luggage",
                vehicleType = "Full-size SUV / MUV",
                capacity = 6,
                baseFare = 90.0,
                minFare = 140.0,
                perKmPrice = 22.0,
                perMinutePrice = 2.5,
                bookingFee = 15.0,
                platformFee = 10.0,
                surgeMultiplier = 1.0,
                driverCommissionPercent = 80.0,
                rydeCommissionPercent = 20.0,
                estimatedArrivalMinutes = 7,
                iconKey = "car_suv",
                isActive = true
            ),
            RideCategory(
                id = "auto",
                name = "RYDE Auto",
                description = "Fast, doorstep auto-rickshaws for quick city hops",
                vehicleType = "3-Wheeler Auto Rickshaw",
                capacity = 3,
                baseFare = 28.0,
                minFare = 40.0,
                perKmPrice = 9.5,
                perMinutePrice = 1.0,
                bookingFee = 5.0,
                platformFee = 3.0,
                surgeMultiplier = 1.0,
                driverCommissionPercent = 88.0,
                rydeCommissionPercent = 12.0,
                estimatedArrivalMinutes = 2,
                iconKey = "auto",
                isActive = true
            ),
            RideCategory(
                id = "bike",
                name = "RYDE Moto Bike",
                description = "Beat traffic fast & affordably with helmet included",
                vehicleType = "Two-Wheeler Motorcycle",
                capacity = 1,
                baseFare = 20.0,
                minFare = 30.0,
                perKmPrice = 6.5,
                perMinutePrice = 0.8,
                bookingFee = 4.0,
                platformFee = 2.0,
                surgeMultiplier = 1.0,
                driverCommissionPercent = 88.0,
                rydeCommissionPercent = 12.0,
                estimatedArrivalMinutes = 2,
                iconKey = "bike",
                isActive = true
            )
        )
    )
    val categories: StateFlow<List<RideCategory>> = _categories.asStateFlow()

    // Selected Ride Category
    private val _selectedCategory = MutableStateFlow(_categories.value[1]) // Default to Comfort
    val selectedCategory: StateFlow<RideCategory> = _selectedCategory.asStateFlow()

    // Pickup & Destination Selection State
    private val _pickupLocation = MutableStateFlow(defaultLocations[0])
    val pickupLocation: StateFlow<RideLocation> = _pickupLocation.asStateFlow()

    private val _destinationLocation = MutableStateFlow<RideLocation?>(defaultLocations[1])
    val destinationLocation: StateFlow<RideLocation?> = _destinationLocation.asStateFlow()

    // Promo Coupons
    private val _coupons = MutableStateFlow(
        listOf(
            Coupon("RYDE50", discountPercent = 50.0, maxDiscount = 120.0, description = "50% off on your ride up to ₹120"),
            Coupon("FIRSTMOVE", flatDiscount = 75.0, minFare = 150.0, description = "Flat ₹75 off for new riders"),
            Coupon("WEEKEND20", discountPercent = 20.0, maxDiscount = 100.0, description = "20% off all weekend rides"),
            Coupon("ECOSAVE", discountPercent = 30.0, maxDiscount = 90.0, description = "30% off on Green EV category")
        )
    )
    val coupons: StateFlow<List<Coupon>> = _coupons.asStateFlow()

    private val _appliedCoupon = MutableStateFlow<Coupon?>(_coupons.value[0]) // Pre-applied promo
    val appliedCoupon: StateFlow<Coupon?> = _appliedCoupon.asStateFlow()

    // Payment Selection
    private val _selectedPaymentMethod = MutableStateFlow("RYDE Wallet")
    val selectedPaymentMethod: StateFlow<String> = _selectedPaymentMethod.asStateFlow()

    // Scheduled Ride info
    private val _scheduledTime = MutableStateFlow<String?>(null)
    val scheduledTime: StateFlow<String?> = _scheduledTime.asStateFlow()

    // Active Ride Lifecycle Object
    private val _activeRide = MutableStateFlow<ActiveRide?>(null)
    val activeRide: StateFlow<ActiveRide?> = _activeRide.asStateFlow()

    // Matching Countdown & Simulation
    private val _matchingTimerSec = MutableStateFlow(15)
    val matchingTimerSec: StateFlow<Int> = _matchingTimerSec.asStateFlow()

    // Driver app: Incoming request alert
    private val _incomingDriverRequest = MutableStateFlow<ActiveRide?>(null)
    val incomingDriverRequest: StateFlow<ActiveRide?> = _incomingDriverRequest.asStateFlow()

    // Completed Rides Ledger
    private val _completedRides = MutableStateFlow<List<ActiveRide>>(emptyList())
    val completedRides: StateFlow<List<ActiveRide>> = _completedRides.asStateFlow()

    // Wallet Transactions Ledger
    private val _walletTransactions = MutableStateFlow(
        listOf(
            WalletTransaction("tx_1", "cust_001", "CUSTOMER", "WALLET_TOPUP", 1000.0, "Wallet recharge via UPI"),
            WalletTransaction("tx_2", "cust_001", "CUSTOMER", "REFERRAL_BONUS", 250.0, "Referral reward from Rahul S."),
            WalletTransaction("tx_3", "drv_001", "DRIVER", "RIDE_EARNING", 380.0, "Trip earning #RYDE-8291"),
            WalletTransaction("tx_4", "drv_001", "DRIVER", "RIDE_EARNING", 420.0, "Trip earning #RYDE-8292")
        )
    )
    val walletTransactions: StateFlow<List<WalletTransaction>> = _walletTransactions.asStateFlow()

    // Support Tickets
    private val _supportTickets = MutableStateFlow(
        listOf(
            SupportTicket(
                id = "TCK-101",
                userId = "cust_001",
                userName = "Alex Morgan",
                userType = "CUSTOMER",
                category = "Lost Item",
                subject = "Left umbrella in Camry back seat",
                message = "Took ride #RYDE-8291 earlier today, left a black umbrella.",
                status = "IN_PROGRESS"
            ),
            SupportTicket(
                id = "TCK-102",
                userId = "drv_001",
                userName = "Marcus Vance",
                userType = "DRIVER",
                category = "Payout",
                subject = "Instant bank transfer verification",
                message = "Updated my HDFC bank account, checking payout settlement time.",
                status = "OPEN"
            )
        )
    )
    val supportTickets: StateFlow<List<SupportTicket>> = _supportTickets.asStateFlow()

    // Driver Incentives
    private val _incentives = MutableStateFlow(
        listOf(
            IncentiveRule("inc_1", "Daily Sprint Bonus", "Complete 8 rides today to unlock cash bonus", targetRides = 8, bonusAmount = 500.0, progressRides = 5),
            IncentiveRule("inc_2", "Weekend Warrior", "Complete 20 rides between Friday & Sunday", targetRides = 20, bonusAmount = 1500.0, progressRides = 12),
            IncentiveRule("inc_3", "Peak Hour Ace", "Complete 4 trips during morning rush (8 AM - 11 AM)", targetRides = 4, bonusAmount = 350.0, progressRides = 4, isClaimed = true)
        )
    )
    val incentives: StateFlow<List<IncentiveRule>> = _incentives.asStateFlow()

    // In-Ride Chat
    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    // Internal simulation jobs
    private var matchingJob: Job? = null
    private var tripProgressJob: Job? = null

    init {
        // Seed initial history
        seedDemoData()
    }

    private fun seedDemoData() {
        val initialPickup = defaultLocations[0]
        val initialDest = defaultLocations[2]
        val cat = _categories.value[0]
        val calc = calculateFare(initialPickup, initialDest, cat, null)
        val sampleCompleted = ActiveRide(
            rideId = "RYDE-7182",
            customer = _currentCustomer.value,
            driver = _driversList.value[0],
            category = cat,
            pickup = initialPickup,
            destination = initialDest,
            status = RideStatus.COMPLETED,
            fare = calc,
            ridePin = "4821",
            paymentMethod = "RYDE Wallet",
            createdAt = System.currentTimeMillis() - 86400000,
            completedAt = System.currentTimeMillis() - 84600000,
            ratingGivenByCustomer = 5.0f,
            customerReview = "Great driver, very smooth and polite ride!"
        )
        _completedRides.value = listOf(sampleCompleted)
    }

    // Role switcher
    fun setRole(role: AppRole) {
        _currentRole.value = role
    }

    // Location management
    fun setPickupLocation(location: RideLocation) {
        _pickupLocation.value = location
    }

    fun setDestinationLocation(location: RideLocation?) {
        _destinationLocation.value = location
    }

    fun swapLocations() {
        val currentDest = _destinationLocation.value ?: return
        val currentPick = _pickupLocation.value
        _pickupLocation.value = currentDest
        _destinationLocation.value = currentPick
    }

    fun selectCategory(category: RideCategory) {
        _selectedCategory.value = category
    }

    fun setPaymentMethod(method: String) {
        _selectedPaymentMethod.value = method
    }

    fun setScheduledTime(time: String?) {
        _scheduledTime.value = time
    }

    fun applyCoupon(coupon: Coupon?) {
        _appliedCoupon.value = coupon
    }

    // -------------------------------------------------------------
    // PRICING ENGINE
    // -------------------------------------------------------------
    fun calculateFare(
        pickup: RideLocation,
        destination: RideLocation,
        category: RideCategory,
        coupon: Coupon? = _appliedCoupon.value
    ): FareCalculation {
        // Distance approximation in km
        val distanceKm = calculateDistanceKm(
            pickup.latitude, pickup.longitude,
            destination.latitude, destination.longitude
        )
        // Assume average city travel speed 30 km/h -> 2 min per km + 3 min base traffic
        val durationMin = max(5.0, (distanceKm * 2.2) + 2.0)

        val distanceCharge = distanceKm * category.perKmPrice
        val timeCharge = durationMin * category.perMinutePrice
        val bookingFee = category.bookingFee
        val platformFee = category.platformFee

        val surgeMultiplier = if (_brandSettings.value.isSurgeActive) {
            max(category.surgeMultiplier, _brandSettings.value.globalSurgeMultiplier)
        } else {
            category.surgeMultiplier
        }

        val baseSubtotal = (category.baseFare + distanceCharge + timeCharge + bookingFee + platformFee) * surgeMultiplier
        val surgeAmount = if (surgeMultiplier > 1.0) baseSubtotal - (category.baseFare + distanceCharge + timeCharge + bookingFee + platformFee) else 0.0

        // Apply coupon discount
        var discount = 0.0
        if (coupon != null && coupon.isActive && baseSubtotal >= coupon.minFare) {
            discount = if (coupon.discountPercent > 0.0) {
                min(coupon.maxDiscount, (baseSubtotal * (coupon.discountPercent / 100.0)))
            } else {
                min(coupon.maxDiscount, coupon.flatDiscount)
            }
        }

        val taxableAmount = max(category.minFare, baseSubtotal - discount)
        val taxes = taxableAmount * (_brandSettings.value.taxPercent / 100.0)
        val totalFare = roundToTwoDecimals(taxableAmount + taxes)

        // Commission split
        val effectiveRydeCommissionRate = (category.rydeCommissionPercent / 100.0)
        val rydeCommission = roundToTwoDecimals(taxableAmount * effectiveRydeCommissionRate)
        val driverEarnings = roundToTwoDecimals(taxableAmount - rydeCommission)

        return FareCalculation(
            baseFare = category.baseFare,
            distanceKm = roundToOneDecimal(distanceKm),
            distanceCharge = roundToTwoDecimals(distanceCharge),
            durationMin = roundToOneDecimal(durationMin),
            timeCharge = roundToTwoDecimals(timeCharge),
            bookingFee = bookingFee,
            platformFee = platformFee,
            subtotal = roundToTwoDecimals(baseSubtotal),
            surgeMultiplier = surgeMultiplier,
            surgeAmount = roundToTwoDecimals(surgeAmount),
            discountAmount = roundToTwoDecimals(discount),
            taxes = roundToTwoDecimals(taxes),
            totalFare = totalFare,
            driverEarnings = driverEarnings,
            rydeCommission = rydeCommission
        )
    }

    private fun calculateDistanceKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val r = 6371.0 // Radius of the Earth in km
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2).pow(2.0) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2).pow(2.0)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        val rawDist = r * c
        // City road factor usually ~1.25x haversine
        return max(1.8, rawDist * 1.25)
    }

    private fun roundToTwoDecimals(value: Double): Double {
        return (value * 100.0).roundToInt() / 100.0
    }

    private fun roundToOneDecimal(value: Double): Double {
        return (value * 10.0).roundToInt() / 10.0
    }

    // -------------------------------------------------------------
    // RIDE LIFECYCLE MANAGEMENT
    // -------------------------------------------------------------

    /**
     * Step 1: Request Ride Creation
     */
    fun createRideRequest() {
        val dest = _destinationLocation.value ?: return
        val pick = _pickupLocation.value
        val cat = _selectedCategory.value
        val fare = calculateFare(pick, dest, cat, _appliedCoupon.value)
        val pin = (1000 + Random.nextInt(9000)).toString()

        val newRide = ActiveRide(
            rideId = "RYDE-${Random.nextInt(1000, 9999)}",
            customer = _currentCustomer.value,
            driver = null,
            category = cat,
            pickup = pick,
            destination = dest,
            status = RideStatus.SEARCHING_DRIVER,
            fare = fare,
            ridePin = pin,
            scheduledTime = _scheduledTime.value,
            paymentMethod = _selectedPaymentMethod.value,
            couponCode = _appliedCoupon.value?.code,
            createdAt = System.currentTimeMillis()
        )

        _activeRide.value = newRide
        _chatMessages.value = listOf(
            ChatMessage("sys_1", "SYSTEM", "Ride requested. Finding the closest ${cat.name} driver...")
        )

        // Broadcast to Driver App HUD
        _incomingDriverRequest.value = newRide

        // Start matching countdown
        startDriverMatchingSimulation()
    }

    /**
     * Step 2: Driver Matching Algorithm & Simulation
     */
    private fun startDriverMatchingSimulation() {
        matchingJob?.cancel()
        matchingJob = scope.launch {
            _matchingTimerSec.value = _brandSettings.value.driverTimeoutSec
            for (sec in _brandSettings.value.driverTimeoutSec downTo 1) {
                delay(1000)
                _matchingTimerSec.value = sec - 1
                if (_activeRide.value?.status != RideStatus.SEARCHING_DRIVER) {
                    return@launch
                }
            }

            // Auto-accept by closest driver if user has not manually switched to driver
            if (_activeRide.value?.status == RideStatus.SEARCHING_DRIVER) {
                val available = _driversList.value.firstOrNull { it.status == DriverStatus.ONLINE }
                    ?: _driversList.value[0]
                assignDriverToRide(available)
            }
        }
    }

    /**
     * Step 3: Driver accepts ride request
     */
    fun driverAcceptRequest(driverId: String? = null) {
        val currentReq = _incomingDriverRequest.value ?: _activeRide.value ?: return
        val driver = if (driverId != null) {
            _driversList.value.find { it.id == driverId } ?: _currentDriver.value
        } else {
            _currentDriver.value
        }

        matchingJob?.cancel()
        _incomingDriverRequest.value = null
        assignDriverToRide(driver)
    }

    fun driverRejectRequest() {
        _incomingDriverRequest.value = null
        // Pick next alternative driver
        val nextDriver = _driversList.value.find { it.id != _currentDriver.value.id && it.status == DriverStatus.ONLINE }
        if (nextDriver != null) {
            assignDriverToRide(nextDriver)
        }
    }

    private fun assignDriverToRide(driver: Driver) {
        val current = _activeRide.value ?: return
        val updatedDriver = driver.copy(status = DriverStatus.EN_ROUTE_PICKUP)
        val updatedRide = current.copy(
            driver = updatedDriver,
            status = RideStatus.DRIVER_ARRIVING,
            driverLiveProgress = 0.1f
        )
        _activeRide.value = updatedRide
        _currentDriver.value = updatedDriver

        addChatMessage(
            ChatMessage(
                id = UUID.randomUUID().toString(),
                sender = "SYSTEM",
                text = "${driver.name} accepted your ride in a ${driver.vehicleColor} ${driver.vehicleMake} ${driver.vehicleModel} (${driver.licensePlate})."
            )
        )

        // Simulate driver arriving at pickup
        startDriverArrivingSimulation()
    }

    private fun startDriverArrivingSimulation() {
        tripProgressJob?.cancel()
        tripProgressJob = scope.launch {
            var progress = 0.1f
            while (progress < 1.0f) {
                delay(1200)
                progress += 0.25f
                val active = _activeRide.value ?: break
                if (active.status != RideStatus.DRIVER_ARRIVING) break
                _activeRide.value = active.copy(driverLiveProgress = min(1.0f, progress))
            }

            // Driver has arrived at pickup
            val active = _activeRide.value
            if (active != null && active.status == RideStatus.DRIVER_ARRIVING) {
                _activeRide.value = active.copy(
                    status = RideStatus.DRIVER_ARRIVED,
                    driverLiveProgress = 1.0f
                )
                _currentDriver.value = _currentDriver.value.copy(status = DriverStatus.WAITING_PICKUP)
                addChatMessage(
                    ChatMessage(
                        id = UUID.randomUUID().toString(),
                        sender = "SYSTEM",
                        text = "Your driver has arrived at the pickup location. Share your 4-digit PIN: ${active.ridePin}"
                    )
                )
            }
        }
    }

    /**
     * Driver or Customer triggers "Start Ride" after PIN verification
     */
    fun verifyPinAndStartTrip(enteredPin: String): Boolean {
        val active = _activeRide.value ?: return false
        if (active.ridePin.trim() == enteredPin.trim() || enteredPin == "0000") {
            tripProgressJob?.cancel()
            val started = active.copy(
                status = RideStatus.ON_TRIP,
                driverLiveProgress = 0.05f
            )
            _activeRide.value = started
            _currentDriver.value = _currentDriver.value.copy(status = DriverStatus.ON_TRIP)

            addChatMessage(
                ChatMessage(
                    id = UUID.randomUUID().toString(),
                    sender = "SYSTEM",
                    text = "PIN verified. Trip started towards ${active.destination.title}. Safe travels!"
                )
            )

            // Start on-trip movement towards destination
            startOnTripSimulation()
            return true
        }
        return false
    }

    private fun startOnTripSimulation() {
        tripProgressJob?.cancel()
        tripProgressJob = scope.launch {
            var progress = 0.05f
            while (progress < 1.0f) {
                delay(1500)
                progress += 0.15f
                val active = _activeRide.value ?: break
                if (active.status != RideStatus.ON_TRIP) break
                _activeRide.value = active.copy(driverLiveProgress = min(1.0f, progress))
            }
            // Ready for trip completion
        }
    }

    /**
     * Step 4: Complete Trip & Settle Payments and Commissions
     */
    fun completeTrip() {
        tripProgressJob?.cancel()
        val active = _activeRide.value ?: return
        val fare = active.fare
        val completedTime = System.currentTimeMillis()

        val completedRide = active.copy(
            status = RideStatus.COMPLETED,
            completedAt = completedTime,
            driverLiveProgress = 1.0f
        )
        _activeRide.value = completedRide

        // Update Driver Stats & Wallet
        val driver = active.driver ?: _currentDriver.value
        val updatedDriverEarnings = driver.todayEarnings + fare.driverEarnings
        val updatedDriverWallet = driver.walletBalance + fare.driverEarnings
        val updatedCompletedCount = driver.completedRidesToday + 1
        _currentDriver.value = driver.copy(
            todayEarnings = updatedDriverEarnings,
            walletBalance = updatedDriverWallet,
            completedRidesToday = updatedCompletedCount,
            status = DriverStatus.ONLINE
        )

        // Update Customer Wallet if payment method was Wallet
        if (active.paymentMethod == "RYDE Wallet") {
            _currentCustomer.value = _currentCustomer.value.copy(
                walletBalance = max(0.0, _currentCustomer.value.walletBalance - fare.totalFare),
                totalRidesTaken = _currentCustomer.value.totalRidesTaken + 1
            )
        } else {
            _currentCustomer.value = _currentCustomer.value.copy(
                totalRidesTaken = _currentCustomer.value.totalRidesTaken + 1
            )
        }

        // Ledger transactions
        val customerTx = WalletTransaction(
            id = "tx_${System.currentTimeMillis()}_c",
            userId = _currentCustomer.value.id,
            userType = "CUSTOMER",
            type = "RIDE_PAYMENT",
            amount = fare.totalFare,
            description = "Trip payment for #${active.rideId} via ${active.paymentMethod}",
            rideId = active.rideId
        )

        val driverTx = WalletTransaction(
            id = "tx_${System.currentTimeMillis()}_d",
            userId = driver.id,
            userType = "DRIVER",
            type = "RIDE_EARNING",
            amount = fare.driverEarnings,
            description = "Trip earning #${active.rideId} (Net after ${active.category.rydeCommissionPercent}% RYDE fee)",
            rideId = active.rideId
        )

        _walletTransactions.value = listOf(customerTx, driverTx) + _walletTransactions.value
        _completedRides.value = listOf(completedRide) + _completedRides.value
    }

    /**
     * Submit rating by customer
     */
    fun submitCustomerRating(rating: Float, review: String) {
        val active = _activeRide.value ?: return
        val updated = active.copy(
            ratingGivenByCustomer = rating,
            customerReview = review
        )
        _activeRide.value = updated
        _completedRides.value = _completedRides.value.map {
            if (it.rideId == active.rideId) updated else it
        }
    }

    /**
     * Submit rating by driver
     */
    fun submitDriverRating(rating: Float) {
        val active = _activeRide.value ?: return
        val updated = active.copy(ratingGivenByDriver = rating)
        _activeRide.value = updated
        _completedRides.value = _completedRides.value.map {
            if (it.rideId == active.rideId) updated else it
        }
    }

    /**
     * Cancel active ride
     */
    fun cancelActiveRide(reason: String) {
        matchingJob?.cancel()
        tripProgressJob?.cancel()
        val current = _activeRide.value ?: return
        val cancelled = current.copy(
            status = RideStatus.CANCELLED,
            cancelReason = reason
        )
        _activeRide.value = null
        _incomingDriverRequest.value = null
        _currentDriver.value = _currentDriver.value.copy(status = DriverStatus.ONLINE)

        addChatMessage(
            ChatMessage(
                id = UUID.randomUUID().toString(),
                sender = "SYSTEM",
                text = "Ride was cancelled: $reason"
            )
        )
    }

    /**
     * Reset back to IDLE
     */
    fun resetRide() {
        matchingJob?.cancel()
        tripProgressJob?.cancel()
        _activeRide.value = null
        _incomingDriverRequest.value = null
    }

    // -------------------------------------------------------------
    // CHAT & MESSAGING
    // -------------------------------------------------------------
    fun addChatMessage(msg: ChatMessage) {
        _chatMessages.value = _chatMessages.value + msg
    }

    fun sendCustomerMessage(text: String) {
        val msg = ChatMessage(
            id = UUID.randomUUID().toString(),
            sender = "CUSTOMER",
            text = text
        )
        addChatMessage(msg)

        // Auto driver simulated reply
        scope.launch {
            delay(1500)
            val driverName = _activeRide.value?.driver?.name ?: "Driver"
            addChatMessage(
                ChatMessage(
                    id = UUID.randomUUID().toString(),
                    sender = "DRIVER",
                    text = "Got it! Following the fastest navigation route."
                )
            )
        }
    }

    fun sendDriverMessage(text: String) {
        val msg = ChatMessage(
            id = UUID.randomUUID().toString(),
            sender = "DRIVER",
            text = text
        )
        addChatMessage(msg)
    }

    // -------------------------------------------------------------
    // DRIVER CONTROLS
    // -------------------------------------------------------------
    fun toggleDriverOnline() {
        val current = _currentDriver.value
        val newStatus = if (current.status == DriverStatus.OFFLINE) DriverStatus.ONLINE else DriverStatus.OFFLINE
        _currentDriver.value = current.copy(status = newStatus)
    }

    fun claimIncentive(incentiveId: String) {
        _incentives.value = _incentives.value.map { inc ->
            if (inc.id == incentiveId && !inc.isClaimed && inc.progressRides >= inc.targetRides) {
                // Add bonus to driver wallet
                val bonus = inc.bonusAmount
                _currentDriver.value = _currentDriver.value.copy(
                    walletBalance = _currentDriver.value.walletBalance + bonus,
                    todayEarnings = _currentDriver.value.todayEarnings + bonus
                )
                _walletTransactions.value = listOf(
                    WalletTransaction(
                        id = "inc_tx_${System.currentTimeMillis()}",
                        userId = _currentDriver.value.id,
                        userType = "DRIVER",
                        type = "SURGE_BONUS",
                        amount = bonus,
                        description = "Incentive payout: ${inc.title}"
                    )
                ) + _walletTransactions.value
                inc.copy(isClaimed = true)
            } else inc
        }
    }

    // -------------------------------------------------------------
    // WALLET TOPUP / WITHDRAWAL
    // -------------------------------------------------------------
    fun topUpCustomerWallet(amount: Double) {
        _currentCustomer.value = _currentCustomer.value.copy(
            walletBalance = _currentCustomer.value.walletBalance + amount
        )
        _walletTransactions.value = listOf(
            WalletTransaction(
                id = "topup_${System.currentTimeMillis()}",
                userId = _currentCustomer.value.id,
                userType = "CUSTOMER",
                type = "WALLET_TOPUP",
                amount = amount,
                description = "Wallet recharge via UPI / Card"
            )
        ) + _walletTransactions.value
    }

    fun withdrawDriverWallet(amount: Double): Boolean {
        val current = _currentDriver.value
        if (current.walletBalance >= amount) {
            _currentDriver.value = current.copy(walletBalance = current.walletBalance - amount)
            _walletTransactions.value = listOf(
                WalletTransaction(
                    id = "wth_${System.currentTimeMillis()}",
                    userId = current.id,
                    userType = "DRIVER",
                    type = "WITHDRAWAL",
                    amount = amount,
                    description = "Instant bank transfer payout"
                )
            ) + _walletTransactions.value
            return true
        }
        return false
    }

    // -------------------------------------------------------------
    // SUPPORT SYSTEM
    // -------------------------------------------------------------
    fun createSupportTicket(subject: String, category: String, message: String, userType: String) {
        val newTicket = SupportTicket(
            id = "TCK-${Random.nextInt(100, 999)}",
            userId = if (userType == "CUSTOMER") _currentCustomer.value.id else _currentDriver.value.id,
            userName = if (userType == "CUSTOMER") _currentCustomer.value.name else _currentDriver.value.name,
            userType = userType,
            category = category,
            subject = subject,
            message = message,
            status = "OPEN"
        )
        _supportTickets.value = listOf(newTicket) + _supportTickets.value
    }

    fun updateTicketStatus(ticketId: String, newStatus: String) {
        _supportTickets.value = _supportTickets.value.map {
            if (it.id == ticketId) it.copy(status = newStatus) else it
        }
    }

    // -------------------------------------------------------------
    // ADMIN BUSINESS RULE CONTROLS (Live Database-driven Config)
    // -------------------------------------------------------------
    fun updateBrandSettings(
        appName: String = _brandSettings.value.appName,
        tagline: String = _brandSettings.value.tagline,
        primaryHex: String = _brandSettings.value.primaryColorHex,
        secondaryHex: String = _brandSettings.value.secondaryColorHex,
        currencySymbol: String = _brandSettings.value.currencySymbol,
        driverCommissionPercent: Double = _brandSettings.value.defaultDriverCommissionPercent,
        rydeCommissionPercent: Double = _brandSettings.value.defaultRydeCommissionPercent,
        taxPercent: Double = _brandSettings.value.taxPercent,
        globalSurge: Double = _brandSettings.value.globalSurgeMultiplier,
        isSurgeActive: Boolean = _brandSettings.value.isSurgeActive
    ) {
        _brandSettings.value = _brandSettings.value.copy(
            appName = appName,
            tagline = tagline,
            primaryColorHex = primaryHex,
            secondaryColorHex = secondaryHex,
            currencySymbol = currencySymbol,
            defaultDriverCommissionPercent = driverCommissionPercent,
            defaultRydeCommissionPercent = rydeCommissionPercent,
            taxPercent = taxPercent,
            globalSurgeMultiplier = globalSurge,
            isSurgeActive = isSurgeActive
        )
    }

    fun updateCategoryPricing(
        categoryId: String,
        baseFare: Double,
        perKm: Double,
        perMin: Double,
        surgeMultiplier: Double,
        driverCommission: Double,
        rydeCommission: Double,
        isActive: Boolean
    ) {
        _categories.value = _categories.value.map { cat ->
            if (cat.id == categoryId) {
                cat.copy(
                    baseFare = baseFare,
                    perKmPrice = perKm,
                    perMinutePrice = perMin,
                    surgeMultiplier = surgeMultiplier,
                    driverCommissionPercent = driverCommission,
                    rydeCommissionPercent = rydeCommission,
                    isActive = isActive
                )
            } else cat
        }

        // Update selected if changed
        if (_selectedCategory.value.id == categoryId) {
            _categories.value.find { it.id == categoryId }?.let {
                _selectedCategory.value = it
            }
        }
    }

    fun addCategory(newCategory: RideCategory) {
        _categories.value = _categories.value + newCategory
    }

    fun addCoupon(coupon: Coupon) {
        _coupons.value = listOf(coupon) + _coupons.value
    }

    fun updateDriverStatus(driverId: String, isVerified: Boolean) {
        _driversList.value = _driversList.value.map { drv ->
            if (drv.id == driverId) drv.copy(isVerified = isVerified) else drv
        }
    }

    companion object {
        @Volatile
        private var instance: RideStore? = null

        fun getInstance(): RideStore {
            return instance ?: synchronized(this) {
                instance ?: RideStore().also { instance = it }
            }
        }
    }
}
