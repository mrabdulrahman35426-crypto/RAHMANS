package com.example.ui.driver

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
fun DriverScreen(
    rideStore: RideStore,
    modifier: Modifier = Modifier
) {
    val currentDriver by rideStore.currentDriver.collectAsState()
    val activeRide by rideStore.activeRide.collectAsState()
    val incomingRequest by rideStore.incomingDriverRequest.collectAsState()
    val brandSettings by rideStore.brandSettings.collectAsState()
    val incentives by rideStore.incentives.collectAsState()
    val transactions by rideStore.walletTransactions.collectAsState()
    val chatMessages by rideStore.chatMessages.collectAsState()
    val timerSec by rideStore.matchingTimerSec.collectAsState()

    var activeTab by remember { mutableStateOf("console") } // "console", "wallet", "incentives", "support"
    var showChatDialog by remember { mutableStateOf(false) }
    var showSosDialog by remember { mutableStateOf(false) }
    var pinInput by remember { mutableStateOf("") }
    var pinError by remember { mutableStateOf(false) }
    var driverRatingStars by remember { mutableStateOf(5) }
    var showWithdrawDialog by remember { mutableStateOf(false) }

    val isOnline = currentDriver.status != DriverStatus.OFFLINE

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = RydeBlack,
        topBar = {
            DriverTopBar(
                driver = currentDriver,
                brand = brandSettings,
                activeTab = activeTab,
                isOnline = isOnline,
                onToggleOnline = { rideStore.toggleDriverOnline() },
                onTabSelect = { activeTab = it }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (activeTab) {
                "console" -> {
                    Column(modifier = Modifier.fillMaxSize()) {
                        // Map View
                        Box(
                            modifier = Modifier
                                .weight(1.1f)
                                .fillMaxWidth()
                        ) {
                            RydeMapView(
                                pickup = activeRide?.pickup ?: rideStore.defaultLocations[0],
                                destination = activeRide?.destination,
                                activeRide = activeRide,
                                nearbyDrivers = emptyList()
                            )

                            // Online/Offline floating status indicator
                            Surface(
                                color = if (isOnline) Color(0xDD0D2A20) else Color(0xDD2A1515),
                                shape = RoundedCornerShape(20.dp),
                                border = BorderStroke(1.dp, if (isOnline) RydePrimaryMint else RydeCoral),
                                modifier = Modifier
                                    .align(Alignment.TopCenter)
                                    .padding(top = 12.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(if (isOnline) RydePrimaryMint else RydeCoral)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = if (isOnline) "ONLINE • RECEIVING REQUESTS" else "OFFLINE • RESTING",
                                        color = if (isOnline) RydePrimaryMint else RydeCoral,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.ExtraBold
                                    )
                                }
                            }
                        }

                        // Bottom Driver Console Sheet
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
                                    .padding(16.dp)
                                    .verticalScroll(rememberScrollState()),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // 1. Incoming Request Alert HUD
                                if (incomingRequest != null && isOnline) {
                                    DriverIncomingRequestCard(
                                        ride = incomingRequest!!,
                                        timerSec = timerSec,
                                        currency = brandSettings.currencySymbol,
                                        onAccept = { rideStore.driverAcceptRequest() },
                                        onReject = { rideStore.driverRejectRequest() }
                                    )
                                } else if (activeRide != null && activeRide!!.status != RideStatus.SEARCHING_DRIVER) {
                                    // 2. Active Ride Management States
                                    val currentRide = activeRide!!
                                    when (currentRide.status) {
                                        RideStatus.DRIVER_ARRIVING -> {
                                            DriverEnRoutePickupCard(
                                                ride = currentRide,
                                                onArrived = {
                                                    // Driver signals arrival
                                                    rideStore.verifyPinAndStartTrip("dummy_wait") // will wait at pickup
                                                },
                                                onChat = { showChatDialog = true },
                                                onSos = { showSosDialog = true }
                                            )
                                        }
                                        RideStatus.DRIVER_ARRIVED -> {
                                            DriverAtPickupPinCard(
                                                ride = currentRide,
                                                pinInput = pinInput,
                                                pinError = pinError,
                                                onPinChange = {
                                                    pinInput = it
                                                    pinError = false
                                                },
                                                onVerifyStart = {
                                                    val success = rideStore.verifyPinAndStartTrip(pinInput)
                                                    if (!success) pinError = true
                                                },
                                                onChat = { showChatDialog = true },
                                                onSos = { showSosDialog = true }
                                            )
                                        }
                                        RideStatus.ON_TRIP -> {
                                            DriverOnTripCard(
                                                ride = currentRide,
                                                currency = brandSettings.currencySymbol,
                                                onCompleteTrip = { rideStore.completeTrip() },
                                                onChat = { showChatDialog = true },
                                                onSos = { showSosDialog = true }
                                            )
                                        }
                                        RideStatus.COMPLETED -> {
                                            DriverTripCompletedCard(
                                                ride = currentRide,
                                                currency = brandSettings.currencySymbol,
                                                ratingStars = driverRatingStars,
                                                onRatingChange = { driverRatingStars = it },
                                                onDone = {
                                                    rideStore.submitDriverRating(driverRatingStars.toFloat())
                                                    rideStore.resetRide()
                                                }
                                            )
                                        }
                                        else -> Unit
                                    }
                                } else {
                                    // 3. Idle Dashboard State
                                    DriverIdleDashboard(
                                        driver = currentDriver,
                                        brand = brandSettings,
                                        isOnline = isOnline,
                                        onGoOnline = { rideStore.toggleDriverOnline() }
                                    )
                                }
                            }
                        }
                    }
                }
                "wallet" -> DriverWalletView(
                    driver = currentDriver,
                    transactions = transactions,
                    currency = brandSettings.currencySymbol,
                    onWithdraw = { showWithdrawDialog = true }
                )
                "incentives" -> DriverIncentivesView(
                    incentives = incentives,
                    currency = brandSettings.currencySymbol,
                    onClaim = { rideStore.claimIncentive(it) }
                )
                "support" -> DriverSupportView(rideStore = rideStore)
            }
        }
    }

    if (showChatDialog) {
        InRideChatDialog(
            messages = chatMessages,
            onSendMessage = { rideStore.sendDriverMessage(it) },
            onDismiss = { showChatDialog = false }
        )
    }

    if (showSosDialog) {
        SosEmergencyDialog(
            rideId = activeRide?.rideId ?: "DRIVER-DISPATCH",
            onDismiss = { showSosDialog = false }
        )
    }

    if (showWithdrawDialog) {
        DriverWithdrawDialog(
            currentBalance = currentDriver.walletBalance,
            currency = brandSettings.currencySymbol,
            onWithdraw = {
                rideStore.withdrawDriverWallet(it)
                showWithdrawDialog = false
            },
            onDismiss = { showWithdrawDialog = false }
        )
    }
}

// -------------------------------------------------------------
// DRIVER TOP BAR
// -------------------------------------------------------------
@Composable
private fun DriverTopBar(
    driver: Driver,
    brand: BrandSettings,
    activeTab: String,
    isOnline: Boolean,
    onToggleOnline: () -> Unit,
    onTabSelect: (String) -> Unit
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
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    color = MaterialTheme.colorScheme.primary,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.size(36.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.LocalTaxi, contentDescription = null, tint = Color.Black, modifier = Modifier.size(20.dp))
                    }
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(driver.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = RydeTextPrimary)
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Default.Verified, contentDescription = "Verified", tint = RydePrimaryMint, modifier = Modifier.size(14.dp))
                    }
                    Text(
                        "${driver.vehicleMake} ${driver.vehicleModel} • ${driver.licensePlate}",
                        fontSize = 10.sp,
                        color = RydeTextSecondary
                    )
                }
            }

            // Online / Offline Switch
            Surface(
                color = if (isOnline) MaterialTheme.colorScheme.primary else RydeCardBackground,
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(1.dp, if (isOnline) MaterialTheme.colorScheme.primary else RydeCardBorder),
                modifier = Modifier
                    .clickable { onToggleOnline() }
                    .testTag("driver_online_toggle")
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(if (isOnline) Color.Black else RydeCoral)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (isOnline) "GO OFFLINE" else "GO ONLINE",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (isOnline) Color.Black else RydeTextPrimary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Navigation Tabs (Console, Wallet, Incentives, Support)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            val tabs = listOf(
                "console" to "Console",
                "wallet" to "Earnings",
                "incentives" to "Bonuses",
                "support" to "Help Desk"
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
// INCOMING REQUEST ALERT CARD
// -------------------------------------------------------------
@Composable
private fun DriverIncomingRequestCard(
    ride: ActiveRide,
    timerSec: Int,
    currency: String,
    onAccept: () -> Unit,
    onReject: () -> Unit
) {
    Surface(
        color = Color(0xFF0F1E24),
        shape = RoundedCornerShape(22.dp),
        border = BorderStroke(2.dp, RydePrimaryMint),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("driver_incoming_request_card")
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            // Header with Timer
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                RydeBadge(text = "NEW RIDE REQUEST", color = RydePrimaryMint, textColor = Color.Black)
                Text(
                    text = "${timerSec}s to respond",
                    color = RydeAmber,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 13.sp
                )
            }

            // Route & Distance
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(RydePrimaryMint))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("PICKUP: ${ride.pickup.title}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = RydeTextPrimary)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(RydeCoral))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("DROP: ${ride.destination.title}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = RydeTextPrimary)
                }
            }

            // Earnings calculation
            Surface(
                color = RydeCardBackground,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("ESTIMATED NET EARNINGS", fontSize = 10.sp, color = RydeTextMuted, fontWeight = FontWeight.Bold)
                        Text("$currency${ride.fare.driverEarnings}", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text("${ride.fare.distanceKm} km • ~${ride.fare.durationMin.toInt()} min", fontSize = 12.sp, color = RydeTextPrimary, fontWeight = FontWeight.SemiBold)
                        Text("Gross: $currency${ride.fare.totalFare}", fontSize = 11.sp, color = RydeTextMuted)
                    }
                }
            }

            // Accept & Reject Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onReject,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Decline", color = RydeCoral, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = onAccept,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                    modifier = Modifier.weight(1.5f).testTag("driver_accept_ride_btn")
                ) {
                    Text("Accept Ride", color = Color.Black, fontWeight = FontWeight.ExtraBold)
                }
            }
        }
    }
}

// -------------------------------------------------------------
// EN ROUTE TO PICKUP CARD
// -------------------------------------------------------------
@Composable
private fun DriverEnRoutePickupCard(
    ride: ActiveRide,
    onArrived: () -> Unit,
    onChat: () -> Unit,
    onSos: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Surface(
            color = RydeCardBackground,
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                RydeBadge(text = "EN ROUTE TO PICKUP", color = RydePrimaryCyan, textColor = Color.Black)
                Text(ride.pickup.title, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = RydeTextPrimary)
                Text(ride.pickup.subtitle, fontSize = 12.sp, color = RydeTextSecondary)
                Text("Rider: ${ride.customer.name} (★ ${ride.customer.rating})", fontSize = 12.sp, color = RydePrimaryMint)
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            OutlinedButton(onClick = onChat, shape = RoundedCornerShape(12.dp), modifier = Modifier.weight(1f)) {
                Icon(Icons.Default.Chat, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Chat")
            }
            OutlinedButton(onClick = onSos, shape = RoundedCornerShape(12.dp), modifier = Modifier.weight(1f), colors = ButtonDefaults.outlinedButtonColors(contentColor = RydeCoral)) {
                Text("SOS")
            }
        }

        RydeButton(
            text = "I Have Arrived at Pickup Location",
            onClick = onArrived,
            icon = Icons.Default.LocationOn,
            testTag = "driver_arrived_btn"
        )
    }
}

// -------------------------------------------------------------
// AT PICKUP PIN VERIFICATION CARD
// -------------------------------------------------------------
@Composable
private fun DriverAtPickupPinCard(
    ride: ActiveRide,
    pinInput: String,
    pinError: Boolean,
    onPinChange: (String) -> Unit,
    onVerifyStart: () -> Unit,
    onChat: () -> Unit,
    onSos: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Surface(
            color = RydePrimaryMint.copy(alpha = 0.15f),
            shape = RoundedCornerShape(18.dp),
            border = BorderStroke(1.dp, RydePrimaryMint),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("WAITING AT PICKUP", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = RydePrimaryMint)
                Text("Ask rider ${ride.customer.name} for the 4-digit PIN to start trip.", fontSize = 12.sp, color = RydeTextSecondary)
            }
        }

        OutlinedTextField(
            value = pinInput,
            onValueChange = onPinChange,
            label = { Text("Enter 4-Digit Rider PIN") },
            isError = pinError,
            modifier = Modifier.fillMaxWidth().testTag("driver_pin_input"),
            shape = RoundedCornerShape(14.dp),
            supportingText = {
                if (pinError) Text("Incorrect PIN. Please re-check with customer.", color = RydeCoral)
            }
        )

        RydeButton(
            text = "Verify PIN & Start Trip",
            onClick = onVerifyStart,
            icon = Icons.Default.PlayArrow,
            testTag = "driver_start_trip_btn"
        )
    }
}

// -------------------------------------------------------------
// ON TRIP CARD
// -------------------------------------------------------------
@Composable
private fun DriverOnTripCard(
    ride: ActiveRide,
    currency: String,
    onCompleteTrip: () -> Unit,
    onChat: () -> Unit,
    onSos: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Surface(
            color = RydeCardBackground,
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                RydeBadge(text = "TRIP IN PROGRESS", color = RydePrimaryMint, textColor = Color.Black)
                Text(ride.destination.title, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = RydeTextPrimary)
                Text("Distance remaining: ~${ride.fare.distanceKm} km", fontSize = 12.sp, color = RydeTextSecondary)
                Text("Net payout: $currency${ride.fare.driverEarnings}", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
            }
        }

        RydeButton(
            text = "Complete Trip & Collect Fare",
            onClick = onCompleteTrip,
            icon = Icons.Default.CheckCircle,
            testTag = "driver_complete_trip_btn"
        )
    }
}

// -------------------------------------------------------------
// TRIP COMPLETED CARD
// -------------------------------------------------------------
@Composable
private fun DriverTripCompletedCard(
    ride: ActiveRide,
    currency: String,
    ratingStars: Int,
    onRatingChange: (Int) -> Unit,
    onDone: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(Icons.Default.Celebration, contentDescription = null, tint = RydePrimaryMint, modifier = Modifier.size(48.dp))
        Text("Trip Finished Successfully!", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = RydeTextPrimary)

        Surface(
            color = RydeCardBackground,
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Your Net Earning", color = RydeTextSecondary, fontSize = 13.sp)
                    Text("$currency${ride.fare.driverEarnings}", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Gross Fare Paid by Rider", color = RydeTextMuted, fontSize = 12.sp)
                    Text("$currency${ride.fare.totalFare}", color = RydeTextPrimary, fontSize = 12.sp)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("RYDE Platform Fee (${ride.category.rydeCommissionPercent}%)", color = RydeTextMuted, fontSize = 12.sp)
                    Text("-$currency${ride.fare.rydeCommission}", color = RydeTextMuted, fontSize = 12.sp)
                }
            }
        }

        Text("Rate rider ${ride.customer.name}", fontSize = 13.sp, color = RydeTextSecondary)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            (1..5).forEach { star ->
                IconButton(onClick = { onRatingChange(star) }) {
                    Icon(Icons.Default.Star, contentDescription = null, tint = if (star <= ratingStars) RydeAmber else RydeTextMuted, modifier = Modifier.size(32.dp))
                }
            }
        }

        RydeButton(text = "Back Online for Next Ride", onClick = onDone)
    }
}

// -------------------------------------------------------------
// IDLE DASHBOARD
// -------------------------------------------------------------
@Composable
private fun DriverIdleDashboard(
    driver: Driver,
    brand: BrandSettings,
    isOnline: Boolean,
    onGoOnline: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        // Today's Performance Grid
        Text("Today's Performance", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = RydeTextPrimary)

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            MetricStatCard(
                title = "TODAY'S EARNINGS",
                value = "${brand.currencySymbol}${driver.todayEarnings.toInt()}",
                subtitle = "5 trips completed",
                modifier = Modifier.weight(1f)
            )
            MetricStatCard(
                title = "ACCEPTANCE RATE",
                value = "${driver.acceptanceRate.toInt()}%",
                subtitle = "★ ${driver.rating} rating",
                modifier = Modifier.weight(1f)
            )
        }

        if (!isOnline) {
            Surface(
                color = RydeCardBackground,
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("You're Currently Offline", fontWeight = FontWeight.Bold, color = RydeTextPrimary)
                    Text("Switch online to start receiving ride requests in your area.", fontSize = 12.sp, color = RydeTextSecondary)
                    RydeButton(text = "Go Online Now", onClick = onGoOnline)
                }
            }
        } else {
            Surface(
                color = Color(0xFF0F1E24),
                shape = RoundedCornerShape(18.dp),
                border = BorderStroke(1.dp, RydePrimaryMint.copy(alpha = 0.5f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.5.dp, color = RydePrimaryMint)
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("Looking for nearby rides...", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = RydeTextPrimary)
                        Text("High demand detected near Downtown Station.", fontSize = 11.sp, color = RydeTextSecondary)
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricStatCard(title: String, value: String, subtitle: String, modifier: Modifier = Modifier) {
    Surface(
        color = RydeCardBackground,
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, RydeCardBorder),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(title, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = RydeTextMuted)
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
            Text(subtitle, fontSize = 10.sp, color = RydeTextSecondary)
        }
    }
}

// -------------------------------------------------------------
// DRIVER WALLET VIEW
// -------------------------------------------------------------
@Composable
private fun DriverWalletView(
    driver: Driver,
    transactions: List<WalletTransaction>,
    currency: String,
    onWithdraw: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("Driver Payouts & Wallet", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = RydeTextPrimary)

        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(22.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("PAYOUT BALANCE", fontSize = 10.sp, color = RydeTextMuted, fontWeight = FontWeight.Bold)
                Text("$currency${driver.walletBalance}", fontSize = 32.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                RydeButton(text = "Instant Bank Cashout", onClick = onWithdraw)
            }
        }

        Text("Trip Earnings Ledger", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = RydeTextPrimary)

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(transactions.filter { it.userType == "DRIVER" }) { tx ->
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
                        Text(
                            text = (if (tx.type == "WITHDRAWAL") "-" else "+") + "$currency${tx.amount}",
                            color = if (tx.type == "WITHDRAWAL") RydeCoral else RydePrimaryMint,
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
// DRIVER INCENTIVES VIEW
// -------------------------------------------------------------
@Composable
private fun DriverIncentivesView(
    incentives: List<IncentiveRule>,
    currency: String,
    onClaim: (String) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("Driver Incentive Programs", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = RydeTextPrimary)
        Text("Complete ride targets to unlock instant cash rewards.", fontSize = 12.sp, color = RydeTextSecondary)

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(incentives) { inc ->
                val isCompleted = inc.progressRides >= inc.targetRides
                Surface(
                    color = RydeCardBackground,
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, if (isCompleted && !inc.isClaimed) RydePrimaryMint else RydeCardBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(inc.title, fontWeight = FontWeight.Bold, color = RydeTextPrimary, fontSize = 14.sp)
                            Text("+$currency${inc.bonusAmount}", fontWeight = FontWeight.ExtraBold, color = RydePrimaryMint, fontSize = 14.sp)
                        }
                        Text(inc.description, fontSize = 11.sp, color = RydeTextSecondary)

                        LinearProgressIndicator(
                            progress = { inc.progressRides.toFloat() / inc.targetRides.toFloat() },
                            modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                            color = MaterialTheme.colorScheme.primary,
                            trackColor = RydeDarkSurface
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Text("${inc.progressRides} / ${inc.targetRides} rides", fontSize = 11.sp, color = RydeTextMuted)
                            if (inc.isClaimed) {
                                Text("Claimed", fontSize = 11.sp, color = RydePrimaryMint, fontWeight = FontWeight.Bold)
                            } else if (isCompleted) {
                                Button(
                                    onClick = { onClaim(inc.id) },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = RydePrimaryMint),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                ) {
                                    Text("Claim Bonus", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
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
// DRIVER SUPPORT VIEW
// -------------------------------------------------------------
@Composable
private fun DriverSupportView(rideStore: RideStore) {
    var subject by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var submitted by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Driver Partner Support", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = RydeTextPrimary)
        Text("Get fast assistance for payout queries, document updates, or toll issues.", fontSize = 12.sp, color = RydeTextSecondary)

        if (submitted) {
            Surface(
                color = RydePrimaryMint.copy(alpha = 0.2f),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Ticket submitted! A partner manager will review shortly.", color = RydePrimaryMint, fontWeight = FontWeight.Bold, modifier = Modifier.padding(14.dp))
            }
        }

        OutlinedTextField(value = subject, onValueChange = { subject = it }, label = { Text("Topic / Reason") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
        OutlinedTextField(value = message, onValueChange = { message = it }, label = { Text("Details...") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), minLines = 3)

        RydeButton(
            text = "Submit Driver Inquiry",
            enabled = subject.isNotBlank() && message.isNotBlank(),
            onClick = {
                rideStore.createSupportTicket(subject, "Driver Query", message, "DRIVER")
                subject = ""
                message = ""
                submitted = true
            }
        )
    }
}

@Composable
private fun DriverWithdrawDialog(
    currentBalance: Double,
    currency: String,
    onWithdraw: (Double) -> Unit,
    onDismiss: () -> Unit
) {
    var amount by remember { mutableStateOf("1000") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = RydeDarkSurface,
            border = BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier.fillMaxWidth().padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Instant Payout to Bank", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = RydeTextPrimary)
                Text("Available balance: $currency$currentBalance", fontSize = 12.sp, color = RydeTextSecondary)

                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    label = { Text("Withdraw Amount ($currency)") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                RydeButton(
                    text = "Transfer $currency$amount to Bank",
                    onClick = {
                        val amt = amount.toDoubleOrNull() ?: 500.0
                        onWithdraw(amt)
                    }
                )
            }
        }
    }
}
