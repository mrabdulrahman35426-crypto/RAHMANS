package com.example.ui.customer

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.*
import com.example.data.store.RideStore
import com.example.ui.components.*
import com.example.ui.theme.*

@Composable
fun CustomerScreen(
    rideStore: RideStore,
    modifier: Modifier = Modifier
) {
    val activeRide by rideStore.activeRide.collectAsState()
    val pickup by rideStore.pickupLocation.collectAsState()
    val destination by rideStore.destinationLocation.collectAsState()
    val categories by rideStore.categories.collectAsState()
    val selectedCategory by rideStore.selectedCategory.collectAsState()
    val appliedCoupon by rideStore.appliedCoupon.collectAsState()
    val currentCustomer by rideStore.currentCustomer.collectAsState()
    val brandSettings by rideStore.brandSettings.collectAsState()
    val driversList by rideStore.driversList.collectAsState()
    val matchingSec by rideStore.matchingTimerSec.collectAsState()
    val chatMessages by rideStore.chatMessages.collectAsState()
    val paymentMethod by rideStore.selectedPaymentMethod.collectAsState()

    var activeTab by remember { mutableStateOf("home") } // "home", "history", "wallet", "safety", "support"
    var showFareDialog by remember { mutableStateOf(false) }
    var showSosDialog by remember { mutableStateOf(false) }
    var showChatDialog by remember { mutableStateOf(false) }
    var showCouponSelector by remember { mutableStateOf(false) }
    var showTopUpDialog by remember { mutableStateOf(false) }
    var showScheduleDialog by remember { mutableStateOf(false) }

    // Rating Dialog state
    var customerRatingStars by remember { mutableStateOf(5) }
    var customerReviewText by remember { mutableStateOf("") }

    val currentFare = remember(pickup, destination, selectedCategory, appliedCoupon, brandSettings) {
        if (destination != null) {
            rideStore.calculateFare(pickup, destination!!, selectedCategory, appliedCoupon)
        } else null
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = RydeBlack,
        topBar = {
            CustomerTopBar(
                customer = currentCustomer,
                brand = brandSettings,
                activeTab = activeTab,
                onTabSelect = { activeTab = it },
                onSosClick = { showSosDialog = true }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (activeTab) {
                "home" -> {
                    Column(modifier = Modifier.fillMaxSize()) {
                        // Interactive Map View
                        Box(
                            modifier = Modifier
                                .weight(1.1f)
                                .fillMaxWidth()
                        ) {
                            RydeMapView(
                                pickup = pickup,
                                destination = destination,
                                activeRide = activeRide,
                                nearbyDrivers = driversList
                            )

                            // Quick Location Preset Chips over map
                            if (activeRide == null) {
                                LazyRow(
                                    modifier = Modifier
                                        .align(Alignment.BottomStart)
                                        .padding(12.dp),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    items(rideStore.defaultLocations) { loc ->
                                        val isDest = destination?.id == loc.id
                                        Surface(
                                            color = if (isDest) MaterialTheme.colorScheme.primary else Color(0xDD111827),
                                            shape = RoundedCornerShape(16.dp),
                                            border = BorderStroke(1.dp, RydeCardBorder),
                                            modifier = Modifier.clickable { rideStore.setDestinationLocation(loc) }
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Icon(
                                                    imageVector = when (loc.iconType) {
                                                        "airport" -> Icons.Default.Flight
                                                        "work" -> Icons.Default.Work
                                                        "shopping" -> Icons.Default.ShoppingBag
                                                        else -> Icons.Default.LocationOn
                                                    },
                                                    contentDescription = null,
                                                    tint = if (isDest) Color.Black else RydePrimaryMint,
                                                    modifier = Modifier.size(14.dp)
                                                )
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text(
                                                    text = loc.title.take(16),
                                                    color = if (isDest) Color.Black else RydeTextPrimary,
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.SemiBold
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Bottom Interactive Lifecycle Panel
                        Surface(
                            modifier = Modifier
                                .weight(1.3f)
                                .fillMaxWidth(),
                            color = RydeDarkSurface,
                            shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
                            border = BorderStroke(1.dp, RydeCardBorder)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(horizontal = 16.dp, vertical = 12.dp)
                                    .verticalScroll(rememberScrollState())
                            ) {
                                when (val ride = activeRide) {
                                    null -> {
                                        // Booking Selection State
                                        BookingSelectionPanel(
                                            pickup = pickup,
                                            destination = destination,
                                            categories = categories,
                                            selectedCategory = selectedCategory,
                                            fare = currentFare,
                                            currency = brandSettings.currencySymbol,
                                            appliedCoupon = appliedCoupon,
                                            paymentMethod = paymentMethod,
                                            onCategorySelect = { rideStore.selectCategory(it) },
                                            onSwapLocations = { rideStore.swapLocations() },
                                            onOpenFareBreakdown = { showFareDialog = true },
                                            onOpenCouponSelector = { showCouponSelector = true },
                                            onScheduleClick = { showScheduleDialog = true },
                                            onRequestRide = { rideStore.createRideRequest() }
                                        )
                                    }
                                    else -> {
                                        when (ride.status) {
                                            RideStatus.SEARCHING_DRIVER -> {
                                                SearchingDriverPanel(
                                                    ride = ride,
                                                    timerSec = matchingSec,
                                                    onCancel = { rideStore.cancelActiveRide("Customer cancelled search") }
                                                )
                                            }
                                            RideStatus.DRIVER_ARRIVING, RideStatus.DRIVER_ARRIVED -> {
                                                DriverArrivingPanel(
                                                    ride = ride,
                                                    currency = brandSettings.currencySymbol,
                                                    onChat = { showChatDialog = true },
                                                    onSos = { showSosDialog = true },
                                                    onCancel = { rideStore.cancelActiveRide("Plans changed") }
                                                )
                                            }
                                            RideStatus.ON_TRIP -> {
                                                ActiveTripPanel(
                                                    ride = ride,
                                                    currency = brandSettings.currencySymbol,
                                                    onChat = { showChatDialog = true },
                                                    onSos = { showSosDialog = true }
                                                )
                                            }
                                            RideStatus.COMPLETED -> {
                                                TripCompletedPanel(
                                                    ride = ride,
                                                    currency = brandSettings.currencySymbol,
                                                    ratingStars = customerRatingStars,
                                                    onRatingChange = { customerRatingStars = it },
                                                    reviewText = customerReviewText,
                                                    onReviewChange = { customerReviewText = it },
                                                    onSubmitRating = {
                                                        rideStore.submitCustomerRating(customerRatingStars.toFloat(), customerReviewText)
                                                        rideStore.resetRide()
                                                    }
                                                )
                                            }
                                            else -> {
                                                Text("Status: ${ride.status.name}", color = RydeTextPrimary)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                "history" -> CustomerHistoryView(rideStore = rideStore, currency = brandSettings.currencySymbol)
                "wallet" -> CustomerWalletView(
                    customer = currentCustomer,
                    transactions = rideStore.walletTransactions.collectAsState().value,
                    currency = brandSettings.currencySymbol,
                    onTopUp = { showTopUpDialog = true }
                )
                "safety" -> SafetyCenterView(onTriggerSos = { showSosDialog = true })
                "support" -> CustomerSupportView(rideStore = rideStore)
            }
        }
    }

    // Dialogs
    if (showFareDialog && currentFare != null) {
        FareBreakdownDialog(
            fare = currentFare,
            categoryName = selectedCategory.name,
            currencySymbol = brandSettings.currencySymbol,
            couponCode = appliedCoupon?.code,
            onDismiss = { showFareDialog = false }
        )
    }

    if (showSosDialog) {
        SosEmergencyDialog(
            rideId = activeRide?.rideId ?: "ACTIVE",
            onDismiss = { showSosDialog = false }
        )
    }

    if (showChatDialog) {
        InRideChatDialog(
            messages = chatMessages,
            onSendMessage = { rideStore.sendCustomerMessage(it) },
            onDismiss = { showChatDialog = false }
        )
    }

    if (showCouponSelector) {
        CouponSelectorDialog(
            coupons = rideStore.coupons.collectAsState().value,
            selectedCoupon = appliedCoupon,
            onSelect = {
                rideStore.applyCoupon(it)
                showCouponSelector = false
            },
            onDismiss = { showCouponSelector = false }
        )
    }

    if (showTopUpDialog) {
        WalletTopUpDialog(
            currency = brandSettings.currencySymbol,
            onAddMoney = {
                rideStore.topUpCustomerWallet(it)
                showTopUpDialog = false
            },
            onDismiss = { showTopUpDialog = false }
        )
    }

    if (showScheduleDialog) {
        ScheduleRideDialog(
            onConfirm = { timeStr ->
                rideStore.setScheduledTime(timeStr)
                showScheduleDialog = false
            },
            onDismiss = { showScheduleDialog = false }
        )
    }
}

// -------------------------------------------------------------
// TOP BAR WITH NAVIGATION CHIPS
// -------------------------------------------------------------
@Composable
private fun CustomerTopBar(
    customer: Customer,
    brand: BrandSettings,
    activeTab: String,
    onTabSelect: (String) -> Unit,
    onSosClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(RydeDarkSurface)
            .statusBarsPadding()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Brand Logo & Tagline
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    color = MaterialTheme.colorScheme.primary,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.size(36.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = brand.appName.take(1),
                            color = Color.Black,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 20.sp
                        )
                    }
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = brand.appName,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 18.sp,
                        color = RydeTextPrimary,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = brand.tagline,
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // Wallet quick balance & SOS
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    color = RydeCardBackground,
                    shape = RoundedCornerShape(20.dp),
                    border = BorderStroke(1.dp, RydeCardBorder),
                    modifier = Modifier.clickable { onTabSelect("wallet") }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.AccountBalanceWallet,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${brand.currencySymbol}${customer.walletBalance.toInt()}",
                            color = RydeTextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // SOS Button
                IconButton(
                    onClick = onSosClick,
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(RydeCoral.copy(alpha = 0.2f))
                ) {
                    Icon(
                        Icons.Default.Shield,
                        contentDescription = "Safety Shield",
                        tint = RydeCoral,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Navigation Tabs (Home, History, Wallet, Safety, Support)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            val tabs = listOf(
                "home" to "Ride",
                "history" to "Activity",
                "wallet" to "Wallet",
                "safety" to "Safety",
                "support" to "Help"
            )
            tabs.forEach { (key, label) ->
                val isSelected = activeTab == key
                Surface(
                    color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent,
                    shape = RoundedCornerShape(12.dp),
                    border = if (isSelected) BorderStroke(1.dp, MaterialTheme.colorScheme.primary) else null,
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onTabSelect(key) }
                ) {
                    Text(
                        text = label,
                        color = if (isSelected) MaterialTheme.colorScheme.primary else RydeTextSecondary,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(vertical = 6.dp)
                    )
                }
            }
        }
    }
}

// -------------------------------------------------------------
// BOOKING SELECTION PANEL
// -------------------------------------------------------------
@Composable
private fun BookingSelectionPanel(
    pickup: RideLocation,
    destination: RideLocation?,
    categories: List<RideCategory>,
    selectedCategory: RideCategory,
    fare: FareCalculation?,
    currency: String,
    appliedCoupon: Coupon?,
    paymentMethod: String,
    onCategorySelect: (RideCategory) -> Unit,
    onSwapLocations: () -> Unit,
    onOpenFareBreakdown: () -> Unit,
    onOpenCouponSelector: () -> Unit,
    onScheduleClick: () -> Unit,
    onRequestRide: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        // Location Selector Card
        Surface(
            color = RydeCardBackground,
            shape = RoundedCornerShape(18.dp),
            border = BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                // Pickup row
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(RydePrimaryMint)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("PICKUP", fontSize = 9.sp, color = RydeTextMuted, fontWeight = FontWeight.Bold)
                        Text(pickup.title, fontSize = 13.sp, color = RydeTextPrimary, fontWeight = FontWeight.SemiBold)
                    }
                }

                Row(
                    modifier = Modifier
                        .padding(start = 4.dp, top = 2.dp, bottom = 2.dp)
                        .fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .width(2.dp)
                            .height(16.dp)
                            .background(RydeCardBorder)
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    IconButton(
                        onClick = onSwapLocations,
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(Icons.Default.SwapVert, contentDescription = "Swap", tint = RydeTextSecondary, modifier = Modifier.size(16.dp))
                    }
                }

                // Destination row
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(RydeCoral)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("WHERE TO?", fontSize = 9.sp, color = RydeTextMuted, fontWeight = FontWeight.Bold)
                        Text(destination?.title ?: "Select destination", fontSize = 13.sp, color = if (destination != null) RydeTextPrimary else RydePrimaryMint, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }

        // Category Carousel
        Text(
            text = "Select Vehicle Class",
            color = RydeTextPrimary,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold
        )

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(categories.filter { it.isActive }) { cat ->
                val isSelected = cat.id == selectedCategory.id
                val approxPrice = if (fare != null) {
                    val factor = cat.perKmPrice / selectedCategory.perKmPrice
                    ((fare.totalFare * factor) / 5).toInt() * 5
                } else (cat.minFare).toInt()

                Surface(
                    color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else RydeCardBackground,
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(if (isSelected) 1.5.dp else 1.dp, if (isSelected) MaterialTheme.colorScheme.primary else RydeCardBorder),
                    modifier = Modifier
                        .width(135.dp)
                        .clickable { onCategorySelect(cat) }
                        .testTag("cat_card_${cat.id}")
                ) {
                    Column(
                        modifier = Modifier.padding(10.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = when (cat.iconKey) {
                                    "auto" -> Icons.Default.ElectricRickshaw
                                    "bike" -> Icons.Default.TwoWheeler
                                    "car_electric" -> Icons.Default.ElectricCar
                                    "car_luxury" -> Icons.Default.Star
                                    else -> Icons.Default.DirectionsCar
                                },
                                contentDescription = null,
                                tint = if (isSelected) MaterialTheme.colorScheme.primary else RydeTextPrimary,
                                modifier = Modifier.size(22.dp)
                            )
                            Text(
                                text = "${cat.estimatedArrivalMinutes}m",
                                fontSize = 10.sp,
                                color = RydeTextSecondary,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        Text(
                            text = cat.name.replace("RYDE ", ""),
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = RydeTextPrimary
                        )

                        Text(
                            text = "${cat.capacity} seats • ${cat.vehicleType.take(12)}",
                            fontSize = 10.sp,
                            color = RydeTextMuted
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "$currency$approxPrice",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 14.sp,
                                color = if (isSelected) MaterialTheme.colorScheme.primary else RydeTextPrimary
                            )
                            if (cat.surgeMultiplier > 1.0) {
                                RydeBadge(text = "${cat.surgeMultiplier}x", color = RydeAmber, textColor = Color.Black)
                            }
                        }
                    }
                }
            }
        }

        // Coupon & Payment Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Promo coupon pill
            Surface(
                color = RydeCardBackground,
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, if (appliedCoupon != null) MaterialTheme.colorScheme.primary else RydeCardBorder),
                modifier = Modifier
                    .weight(1f)
                    .clickable { onOpenCouponSelector() }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.LocalOffer, contentDescription = null, tint = RydePrimaryMint, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = appliedCoupon?.code ?: "Add Coupon",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (appliedCoupon != null) MaterialTheme.colorScheme.primary else RydeTextSecondary
                    )
                }
            }

            // Fare breakdown pill
            if (fare != null) {
                Surface(
                    color = RydeCardBackground,
                    shape = RoundedCornerShape(14.dp),
                    border = BorderStroke(1.dp, RydeCardBorder),
                    modifier = Modifier.clickable { onOpenFareBreakdown() }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.ReceiptLong, contentDescription = null, tint = RydePrimaryCyan, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Fare Info",
                            fontSize = 12.sp,
                            color = RydeTextSecondary,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            // Schedule button
            Surface(
                color = RydeCardBackground,
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, RydeCardBorder),
                modifier = Modifier.clickable { onScheduleClick() }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.AccessTime, contentDescription = null, tint = RydeAmber, modifier = Modifier.size(14.dp))
                }
            }
        }

        // Primary Action Request Button
        RydeButton(
            text = if (fare != null) "Request ${selectedCategory.name} • $currency${fare.totalFare}" else "Select Destination to Book",
            enabled = destination != null,
            onClick = onRequestRide,
            icon = Icons.Default.DirectionsCar,
            testTag = "request_ride_button"
        )
    }
}

// -------------------------------------------------------------
// SEARCHING DRIVER PANEL
// -------------------------------------------------------------
@Composable
private fun SearchingDriverPanel(
    ride: ActiveRide,
    timerSec: Int,
    onCancel: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp)
            .testTag("searching_driver_panel"),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        CircularProgressIndicator(
            color = MaterialTheme.colorScheme.primary,
            strokeWidth = 4.dp,
            modifier = Modifier.size(56.dp)
        )

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "Connecting with nearby ${ride.category.name} drivers",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = RydeTextPrimary
            )
            Text(
                text = "Scanning matching fleet in 5km radius... ($timerSec s)",
                fontSize = 12.sp,
                color = RydeTextSecondary
            )
        }

        Surface(
            color = RydeCardBackground,
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("ROUTE", fontSize = 10.sp, color = RydeTextMuted)
                    Text("${ride.pickup.title} → ${ride.destination.title}", fontSize = 12.sp, color = RydeTextPrimary, fontWeight = FontWeight.SemiBold)
                }
                Text("PIN: ${ride.ridePin}", fontSize = 14.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.ExtraBold)
            }
        }

        OutlinedButton(
            onClick = onCancel,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            border = BorderStroke(1.dp, RydeCoral)
        ) {
            Text("Cancel Ride Request", color = RydeCoral, fontWeight = FontWeight.Bold)
        }
    }
}

// -------------------------------------------------------------
// DRIVER ARRIVING & ARRIVED PANEL
// -------------------------------------------------------------
@Composable
private fun DriverArrivingPanel(
    ride: ActiveRide,
    currency: String,
    onChat: () -> Unit,
    onSos: () -> Unit,
    onCancel: () -> Unit
) {
    val driver = ride.driver ?: return
    val isArrived = ride.status == RideStatus.DRIVER_ARRIVED

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("driver_arriving_panel"),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Status Alert
        Surface(
            color = if (isArrived) RydePrimaryMint.copy(alpha = 0.15f) else RydeCardBackground,
            shape = RoundedCornerShape(14.dp),
            border = BorderStroke(1.dp, if (isArrived) RydePrimaryMint else RydeCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        if (isArrived) Icons.Default.CheckCircle else Icons.Default.NearMe,
                        contentDescription = null,
                        tint = if (isArrived) RydePrimaryMint else RydePrimaryCyan,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isArrived) "Driver has arrived at pickup!" else "Driver is en route to you (~2 mins)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isArrived) RydePrimaryMint else RydeTextPrimary
                    )
                }

                // 4-Digit Ride PIN
                Surface(
                    color = MaterialTheme.colorScheme.primary,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "PIN: ${ride.ridePin}",
                        color = Color.Black,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }
        }

        // Driver & Vehicle Card
        Surface(
            color = RydeCardBackground,
            shape = RoundedCornerShape(20.dp),
            border = BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(RydeDarkSurface),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Person, contentDescription = null, tint = RydePrimaryMint, modifier = Modifier.size(28.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(driver.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = RydeTextPrimary)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Star, contentDescription = null, tint = RydeAmber, modifier = Modifier.size(12.dp))
                                Text(" ${driver.rating} • ${driver.totalRides} trips", fontSize = 11.sp, color = RydeTextSecondary)
                            }
                        }
                    }

                    // Vehicle Plate Badge
                    Column(horizontalAlignment = Alignment.End) {
                        Surface(
                            color = Color(0xFF0F172A),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, RydeCardBorder)
                        ) {
                            Text(
                                text = driver.licensePlate,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                        Text(
                            text = "${driver.vehicleColor} ${driver.vehicleMake} ${driver.vehicleModel}",
                            fontSize = 10.sp,
                            color = RydeTextMuted
                        )
                    }
                }

                HorizontalDivider(color = RydeCardBorder)

                // Quick Communication Actions (Call, Chat, Safety, Cancel)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    OutlinedButton(
                        onClick = onChat,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Chat, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Chat", fontSize = 12.sp)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    OutlinedButton(
                        onClick = onSos,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = RydeCoral),
                        border = BorderStroke(1.dp, RydeCoral),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Shield, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("SOS", fontSize = 12.sp)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    OutlinedButton(
                        onClick = onCancel,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = RydeTextSecondary),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// ACTIVE ON-TRIP PANEL
// -------------------------------------------------------------
@Composable
private fun ActiveTripPanel(
    ride: ActiveRide,
    currency: String,
    onChat: () -> Unit,
    onSos: () -> Unit
) {
    val driver = ride.driver ?: return

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("active_trip_panel"),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Surface(
            color = MaterialTheme.colorScheme.primaryContainer,
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "ON TRIP WITH ${driver.name.uppercase()}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Heading to ${ride.destination.title}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = RydeTextPrimary
                    )
                }
                Text(
                    text = "$currency${ride.fare.totalFare}",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        LinearProgressIndicator(
            progress = { ride.driverLiveProgress },
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp)),
            color = MaterialTheme.colorScheme.primary,
            trackColor = RydeCardBackground
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            OutlinedButton(
                onClick = onChat,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Chat, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Chat with Driver")
            }
            Spacer(modifier = Modifier.width(10.dp))
            Button(
                onClick = onSos,
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = RydeCoral),
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Shield, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Safety Shield")
            }
        }
    }
}

// -------------------------------------------------------------
// TRIP COMPLETED & RATING PANEL
// -------------------------------------------------------------
@Composable
private fun TripCompletedPanel(
    ride: ActiveRide,
    currency: String,
    ratingStars: Int,
    onRatingChange: (Int) -> Unit,
    reviewText: String,
    onReviewChange: (String) -> Unit,
    onSubmitRating: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("trip_completed_panel"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            Icons.Default.CheckCircle,
            contentDescription = null,
            tint = RydePrimaryMint,
            modifier = Modifier.size(48.dp)
        )

        Text(
            text = "You've Arrived at Your Destination!",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = RydeTextPrimary
        )

        // Receipt Summary Card
        Surface(
            color = RydeCardBackground,
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Total Paid (${ride.paymentMethod})", color = RydeTextSecondary, fontSize = 13.sp)
                    Text("$currency${ride.fare.totalFare}", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Distance & Duration", color = RydeTextMuted, fontSize = 12.sp)
                    Text("${ride.fare.distanceKm} km • ${ride.fare.durationMin.toInt()} mins", color = RydeTextPrimary, fontSize = 12.sp)
                }
                if (ride.fare.discountAmount > 0.0) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Promo Discount", color = RydePrimaryMint, fontSize = 12.sp)
                        Text("-$currency${ride.fare.discountAmount}", color = RydePrimaryMint, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Rating Stars
        Text("Rate your trip with ${ride.driver?.name ?: "driver"}", color = RydeTextSecondary, fontSize = 13.sp)

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            (1..5).forEach { star ->
                IconButton(onClick = { onRatingChange(star) }) {
                    Icon(
                        Icons.Default.Star,
                        contentDescription = "$star stars",
                        tint = if (star <= ratingStars) RydeAmber else RydeTextMuted,
                        modifier = Modifier.size(36.dp)
                    )
                }
            }
        }

        OutlinedTextField(
            value = reviewText,
            onValueChange = onReviewChange,
            placeholder = { Text("Leave compliments or feedback...", fontSize = 12.sp, color = RydeTextMuted) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            singleLine = false,
            maxLines = 2
        )

        RydeButton(
            text = "Submit Feedback & Complete",
            onClick = onSubmitRating,
            testTag = "submit_rating_btn"
        )
    }
}

// -------------------------------------------------------------
// CUSTOMER HISTORY VIEW
// -------------------------------------------------------------
@Composable
private fun CustomerHistoryView(rideStore: RideStore, currency: String) {
    val completedRides by rideStore.completedRides.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Your Activity",
            fontWeight = FontWeight.Bold,
            fontSize = 20.sp,
            color = RydeTextPrimary
        )
        Text(
            text = "Past bookings, receipts, and ratings",
            fontSize = 12.sp,
            color = RydeTextSecondary
        )
        Spacer(modifier = Modifier.height(14.dp))

        if (completedRides.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("No past rides yet. Book your first RYDE!", color = RydeTextSecondary)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(completedRides) { ride ->
                    Surface(
                        color = RydeCardBackground,
                        shape = RoundedCornerShape(16.dp),
                        border = BorderStroke(1.dp, RydeCardBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("#${ride.rideId}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 13.sp)
                                Text("$currency${ride.fare.totalFare}", fontWeight = FontWeight.ExtraBold, color = RydeTextPrimary, fontSize = 15.sp)
                            }
                            Text("${ride.pickup.title} → ${ride.destination.title}", fontSize = 13.sp, color = RydeTextPrimary)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("${ride.category.name} • ${ride.paymentMethod}", fontSize = 11.sp, color = RydeTextMuted)
                                if (ride.ratingGivenByCustomer != null) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Star, contentDescription = null, tint = RydeAmber, modifier = Modifier.size(12.dp))
                                        Text(" ${ride.ratingGivenByCustomer}", fontSize = 11.sp, color = RydeTextSecondary)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// CUSTOMER WALLET VIEW
// -------------------------------------------------------------
@Composable
private fun CustomerWalletView(
    customer: Customer,
    transactions: List<WalletTransaction>,
    currency: String,
    onTopUp: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("RYDE Cash & Wallet", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = RydeTextPrimary)

        // Wallet Card
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(22.dp),
            border = BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("AVAILABLE BALANCE", fontSize = 10.sp, color = RydeTextMuted, fontWeight = FontWeight.Bold)
                Text("$currency${customer.walletBalance}", fontSize = 32.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(
                        onClick = onTopUp,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, tint = Color.Black)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Money", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Referral Card
        Surface(
            color = RydeCardBackground,
            shape = RoundedCornerShape(16.dp),
            border = BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Refer & Earn $currency 250", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = RydeTextPrimary)
                    Text("Share code: ${customer.referralCode}", fontSize = 12.sp, color = RydePrimaryMint, fontWeight = FontWeight.Bold)
                }
                Icon(Icons.Default.Share, contentDescription = "Share", tint = RydePrimaryMint)
            }
        }

        Text("Transaction History", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = RydeTextPrimary)

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(transactions.filter { it.userType == "CUSTOMER" }) { tx ->
                Surface(
                    color = RydeCardBackground,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(tx.description, fontSize = 12.sp, color = RydeTextPrimary, fontWeight = FontWeight.Medium)
                            Text(tx.type, fontSize = 10.sp, color = RydeTextMuted)
                        }
                        val isPositive = tx.type == "WALLET_TOPUP" || tx.type == "REFERRAL_BONUS"
                        Text(
                            text = (if (isPositive) "+" else "-") + "$currency${tx.amount}",
                            color = if (isPositive) RydePrimaryMint else RydeTextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// SAFETY CENTER VIEW
// -------------------------------------------------------------
@Composable
private fun SafetyCenterView(onTriggerSos: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("RYDE Safety Shield", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = RydeTextPrimary)
        Text("Your safety is protected on every single ride.", fontSize = 12.sp, color = RydeTextSecondary)

        Surface(
            color = RydeCoral.copy(alpha = 0.15f),
            shape = RoundedCornerShape(18.dp),
            border = BorderStroke(1.dp, RydeCoral),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Emergency, contentDescription = null, tint = RydeCoral)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Emergency SOS Assistance", fontWeight = FontWeight.Bold, color = Color.White)
                }
                Text("Direct link to emergency response team & instant location sharing.", fontSize = 12.sp, color = RydeTextSecondary)
                RydeButton(
                    text = "Open Emergency Dispatch",
                    onClick = onTriggerSos,
                    containerColor = RydeCoral,
                    contentColor = Color.White
                )
            }
        }

        val safetyFeatures = listOf(
            Triple("4-Digit Ride PIN", "Always check the 4-digit PIN with your driver before getting in to verify correct car.", Icons.Default.Pin),
            Triple("Live Trip Sharing", "Share your live route coordinates with loved ones in one click.", Icons.Default.ShareLocation),
            Triple("24x7 Safety Response", "Our safety specialists monitor unusual route deviations.", Icons.Default.SupportAgent),
            Triple("Driver Screening", "Background verified drivers, vehicle inspection, and criminal record check.", Icons.Default.VerifiedUser)
        )

        safetyFeatures.forEach { (title, desc, icon) ->
            Surface(
                color = RydeCardBackground,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(icon, contentDescription = null, tint = RydePrimaryCyan, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = RydeTextPrimary)
                        Text(desc, fontSize = 11.sp, color = RydeTextSecondary)
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// CUSTOMER SUPPORT VIEW
// -------------------------------------------------------------
@Composable
private fun CustomerSupportView(rideStore: RideStore) {
    var subject by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Lost Item") }
    var submitted by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Customer Support & Tickets", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = RydeTextPrimary)
        Text("Raise issues regarding recent rides, lost items, or billing.", fontSize = 12.sp, color = RydeTextSecondary)

        if (submitted) {
            Surface(
                color = RydePrimaryMint.copy(alpha = 0.2f),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Support ticket registered! An agent will respond within 15 minutes.",
                    color = RydePrimaryMint,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }

        OutlinedTextField(
            value = subject,
            onValueChange = { subject = it },
            label = { Text("Subject") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )

        OutlinedTextField(
            value = message,
            onValueChange = { message = it },
            label = { Text("Describe the issue...") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            minLines = 3
        )

        RydeButton(
            text = "Submit Ticket",
            enabled = subject.isNotBlank() && message.isNotBlank(),
            onClick = {
                rideStore.createSupportTicket(subject, category, message, "CUSTOMER")
                subject = ""
                message = ""
                submitted = true
            }
        )
    }
}

// -------------------------------------------------------------
// DIALOGS: COUPON, TOP UP, SCHEDULE
// -------------------------------------------------------------
@Composable
private fun CouponSelectorDialog(
    coupons: List<Coupon>,
    selectedCoupon: Coupon?,
    onSelect: (Coupon?) -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = RydeDarkSurface,
            border = BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier.fillMaxWidth().padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Apply Promo Coupon", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = RydeTextPrimary)

                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.heightIn(max = 280.dp)) {
                    items(coupons) { cp ->
                        val isApplied = selectedCoupon?.code == cp.code
                        Surface(
                            color = if (isApplied) MaterialTheme.colorScheme.primaryContainer else RydeCardBackground,
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.dp, if (isApplied) MaterialTheme.colorScheme.primary else RydeCardBorder),
                            modifier = Modifier.fillMaxWidth().clickable { onSelect(if (isApplied) null else cp) }
                        ) {
                            Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Column {
                                    Text(cp.code, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 14.sp)
                                    Text(cp.description, fontSize = 11.sp, color = RydeTextSecondary)
                                }
                                if (isApplied) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                }
                            }
                        }
                    }
                }

                RydeButton(text = "Close", onClick = onDismiss)
            }
        }
    }
}

@Composable
private fun WalletTopUpDialog(
    currency: String,
    onAddMoney: (Double) -> Unit,
    onDismiss: () -> Unit
) {
    var amount by remember { mutableStateOf("500") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = RydeDarkSurface,
            border = BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier.fillMaxWidth().padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Add Funds to RYDE Wallet", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = RydeTextPrimary)

                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    label = { Text("Amount ($currency)") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("250", "500", "1000", "2000").forEach { preset ->
                        OutlinedButton(onClick = { amount = preset }, shape = RoundedCornerShape(8.dp)) {
                            Text("$currency$preset", fontSize = 11.sp)
                        }
                    }
                }

                RydeButton(
                    text = "Proceed to Pay $currency$amount",
                    onClick = {
                        val amt = amount.toDoubleOrNull() ?: 500.0
                        onAddMoney(amt)
                    }
                )
            }
        }
    }
}

@Composable
private fun ScheduleRideDialog(
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = RydeDarkSurface,
            border = BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier.fillMaxWidth().padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Schedule a Ride Ahead", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = RydeTextPrimary)
                Text("Pick date & pickup window. A driver will be reserved 15 mins prior.", fontSize = 12.sp, color = RydeTextSecondary)

                val options = listOf("Tomorrow, 08:30 AM", "Tomorrow, 06:00 PM", "Friday, 09:00 AM", "Airport Run (Weekend)")
                options.forEach { opt ->
                    Surface(
                        color = RydeCardBackground,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth().clickable { onConfirm(opt) }
                    ) {
                        Text(opt, color = RydeTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(12.dp))
                    }
                }

                OutlinedButton(onClick = onDismiss, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                    Text("Cancel")
                }
            }
        }
    }
}
