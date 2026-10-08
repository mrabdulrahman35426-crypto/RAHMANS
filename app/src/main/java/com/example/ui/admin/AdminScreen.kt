package com.example.ui.admin

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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.*
import com.example.data.store.RideStore
import com.example.ui.components.*
import com.example.ui.theme.*

@Composable
fun AdminScreen(
    rideStore: RideStore,
    modifier: Modifier = Modifier
) {
    val brandSettings by rideStore.brandSettings.collectAsState()
    val categories by rideStore.categories.collectAsState()
    val driversList by rideStore.driversList.collectAsState()
    val completedRides by rideStore.completedRides.collectAsState()
    val activeRide by rideStore.activeRide.collectAsState()
    val coupons by rideStore.coupons.collectAsState()
    val tickets by rideStore.supportTickets.collectAsState()

    var activeAdminTab by remember { mutableStateOf("overview") } // "overview", "pricing", "drivers", "coupons", "settings", "support"
    var editingCategory by remember { mutableStateOf<RideCategory?>(null) }
    var showAddCategoryDialog by remember { mutableStateOf(false) }
    var showAddCouponDialog by remember { mutableStateOf(false) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = RydeBlack,
        topBar = {
            AdminTopBar(
                brand = brandSettings,
                activeTab = activeAdminTab,
                onTabSelect = { activeAdminTab = it }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (activeAdminTab) {
                "overview" -> AdminOverviewView(
                    brand = brandSettings,
                    completedRides = completedRides,
                    activeRide = activeRide,
                    drivers = driversList
                )
                "pricing" -> AdminPricingCategoriesView(
                    categories = categories,
                    currency = brandSettings.currencySymbol,
                    onEditCategory = { editingCategory = it },
                    onAddNew = { showAddCategoryDialog = true }
                )
                "drivers" -> AdminDriversManagerView(
                    drivers = driversList,
                    currency = brandSettings.currencySymbol,
                    onToggleVerify = { drvId, isVer -> rideStore.updateDriverStatus(drvId, isVer) }
                )
                "coupons" -> AdminCouponsView(
                    coupons = coupons,
                    currency = brandSettings.currencySymbol,
                    onAddNew = { showAddCouponDialog = true }
                )
                "settings" -> AdminBrandSettingsView(
                    brand = brandSettings,
                    onSave = { name, tag, primHex, curr, drvComm, rydeComm, tax, surge, isSurge ->
                        rideStore.updateBrandSettings(
                            appName = name,
                            tagline = tag,
                            primaryHex = primHex,
                            currencySymbol = curr,
                            driverCommissionPercent = drvComm,
                            rydeCommissionPercent = rydeComm,
                            taxPercent = tax,
                            globalSurge = surge,
                            isSurgeActive = isSurge
                        )
                    }
                )
                "support" -> AdminSupportDeskView(
                    tickets = tickets,
                    onResolve = { rideStore.updateTicketStatus(it, "RESOLVED") }
                )
            }
        }
    }

    if (editingCategory != null) {
        EditCategoryDialog(
            category = editingCategory!!,
            currency = brandSettings.currencySymbol,
            onSave = { catId, base, km, min, surge, drvComm, rydeComm, active ->
                rideStore.updateCategoryPricing(catId, base, km, min, surge, drvComm, rydeComm, active)
                editingCategory = null
            },
            onDismiss = { editingCategory = null }
        )
    }

    if (showAddCategoryDialog) {
        AddCategoryDialog(
            currency = brandSettings.currencySymbol,
            onAdd = { newCat ->
                rideStore.addCategory(newCat)
                showAddCategoryDialog = false
            },
            onDismiss = { showAddCategoryDialog = false }
        )
    }

    if (showAddCouponDialog) {
        AddCouponDialog(
            currency = brandSettings.currencySymbol,
            onAdd = { newCp ->
                rideStore.addCoupon(newCp)
                showAddCouponDialog = false
            },
            onDismiss = { showAddCouponDialog = false }
        )
    }
}

// -------------------------------------------------------------
// ADMIN TOP BAR
// -------------------------------------------------------------
@Composable
private fun AdminTopBar(
    brand: BrandSettings,
    activeTab: String,
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
                        Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = Color.Black)
                    }
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text("${brand.appName} Admin Portal", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = RydeTextPrimary)
                    Text("Enterprise Operations & Rule Engine", fontSize = 10.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold)
                }
            }

            RydeBadge(text = "SUPER ADMIN", color = RydeAccentViolet, textColor = Color.White)
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Tabs
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            val tabs = listOf(
                "overview" to "Overview",
                "pricing" to "Categories & Fares",
                "drivers" to "Fleet Management",
                "coupons" to "Discounts & Promos",
                "settings" to "Brand & Rules",
                "support" to "Ticket Desk"
            )
            items(tabs) { (key, label) ->
                val isSelected = activeTab == key
                Surface(
                    color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent,
                    shape = RoundedCornerShape(12.dp),
                    border = if (isSelected) BorderStroke(1.dp, MaterialTheme.colorScheme.primary) else null,
                    modifier = Modifier.clickable { onTabSelect(key) }
                ) {
                    Text(
                        text = label,
                        color = if (isSelected) MaterialTheme.colorScheme.primary else RydeTextSecondary,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }
        }
    }
}

// -------------------------------------------------------------
// OVERVIEW & ANALYTICS
// -------------------------------------------------------------
@Composable
private fun AdminOverviewView(
    brand: BrandSettings,
    completedRides: List<ActiveRide>,
    activeRide: ActiveRide?,
    drivers: List<Driver>
) {
    val totalGrossVolume = completedRides.sumOf { it.fare.totalFare }
    val totalRydeRevenue = completedRides.sumOf { it.fare.rydeCommission }
    val totalDriverPayouts = completedRides.sumOf { it.fare.driverEarnings }
    val onlineDrivers = drivers.count { it.status == DriverStatus.ONLINE }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Executive Financial & Operational Metrics", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = RydeTextPrimary)
        }

        // Live Operational State
        item {
            Surface(
                color = if (activeRide != null) Color(0xFF0D2520) else RydeCardBackground,
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, if (activeRide != null) RydePrimaryMint else RydeCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                        Text("LIVE PLATFORM ACTIVITY", fontSize = 10.sp, color = RydeTextMuted, fontWeight = FontWeight.Bold)
                        Text(
                            text = if (activeRide != null) "1 Active Dispatch (${activeRide.status.name})" else "System Nominal • All Dispatches Settled",
                            color = if (activeRide != null) RydePrimaryMint else RydeTextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                    Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(if (activeRide != null) RydePrimaryMint else RydeStatusActive))
                }
            }
        }

        // Financial KPIs
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                AdminKpiCard(
                    title = "GROSS VOLUME",
                    value = "${brand.currencySymbol}${totalGrossVolume.toInt()}",
                    subtitle = "${completedRides.size} rides executed",
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.weight(1f)
                )
                AdminKpiCard(
                    title = "${brand.appName} NET REVENUE",
                    value = "${brand.currencySymbol}${totalRydeRevenue.toInt()}",
                    subtitle = "Platform cut (avg 20%)",
                    color = RydePrimaryCyan,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                AdminKpiCard(
                    title = "DRIVER PAYOUTS",
                    value = "${brand.currencySymbol}${totalDriverPayouts.toInt()}",
                    subtitle = "Net driver earnings (80%)",
                    color = RydeAmber,
                    modifier = Modifier.weight(1f)
                )
                AdminKpiCard(
                    title = "ONLINE FLEET",
                    value = "$onlineDrivers / ${drivers.size}",
                    subtitle = "Drivers actively roaming",
                    color = RydeAccentViolet,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Commission Split Demonstration
        item {
            Surface(
                color = RydeCardBackground,
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Revenue Split Breakdown Model", fontWeight = FontWeight.Bold, color = RydeTextPrimary, fontSize = 14.sp)
                    Text("For every ${brand.currencySymbol}500 gross booking: Driver receives ${brand.currencySymbol}${500 * (brand.defaultDriverCommissionPercent / 100.0)} • ${brand.appName} earns ${brand.currencySymbol}${500 * (brand.defaultRydeCommissionPercent / 100.0)}", fontSize = 12.sp, color = RydeTextSecondary)

                    LinearProgressIndicator(
                        progress = { (brand.defaultDriverCommissionPercent / 100.0).toFloat() },
                        modifier = Modifier.fillMaxWidth().height(10.dp).clip(RoundedCornerShape(5.dp)),
                        color = RydePrimaryMint,
                        trackColor = RydePrimaryCyan
                    )

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Driver: ${brand.defaultDriverCommissionPercent}%", fontSize = 11.sp, color = RydePrimaryMint, fontWeight = FontWeight.Bold)
                        Text("${brand.appName}: ${brand.defaultRydeCommissionPercent}%", fontSize = 11.sp, color = RydePrimaryCyan, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminKpiCard(title: String, value: String, subtitle: String, color: Color, modifier: Modifier = Modifier) {
    Surface(
        color = RydeCardBackground,
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, RydeCardBorder),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(title, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = RydeTextMuted)
            Text(value, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = color)
            Text(subtitle, fontSize = 10.sp, color = RydeTextSecondary)
        }
    }
}

// -------------------------------------------------------------
// PRICING & CATEGORIES EDITOR
// -------------------------------------------------------------
@Composable
private fun AdminPricingCategoriesView(
    categories: List<RideCategory>,
    currency: String,
    onEditCategory: (RideCategory) -> Unit,
    onAddNew: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Ride Categories & Pricing Rules", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = RydeTextPrimary)
                Text("Edit base fares, per-km rates, surge multipliers & commission splits", fontSize = 11.sp, color = RydeTextSecondary)
            }
            IconButton(onClick = onAddNew) {
                Icon(Icons.Default.AddCircle, contentDescription = "Add", tint = MaterialTheme.colorScheme.primary)
            }
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(categories) { cat ->
                Surface(
                    color = RydeCardBackground,
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, RydeCardBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(cat.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = RydeTextPrimary)
                                Spacer(modifier = Modifier.width(6.dp))
                                if (!cat.isActive) {
                                    RydeBadge(text = "DISABLED", color = RydeCoral, textColor = Color.White)
                                }
                            }
                            IconButton(onClick = { onEditCategory(cat) }) {
                                Icon(Icons.Default.Edit, contentDescription = "Edit", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                            }
                        }

                        Text(cat.description, fontSize = 11.sp, color = RydeTextSecondary)

                        // Rates Row
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Base: $currency${cat.baseFare}", fontSize = 11.sp, color = RydeTextPrimary)
                            Text("Per km: $currency${cat.perKmPrice}", fontSize = 11.sp, color = RydeTextPrimary)
                            Text("Per min: $currency${cat.perMinutePrice}", fontSize = 11.sp, color = RydeTextPrimary)
                            Text("Surge: ${cat.surgeMultiplier}x", fontSize = 11.sp, color = if (cat.surgeMultiplier > 1.0) RydeAmber else RydeTextSecondary)
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Driver Split: ${cat.driverCommissionPercent}%", fontSize = 11.sp, color = RydePrimaryMint, fontWeight = FontWeight.SemiBold)
                            Text("RYDE Split: ${cat.rydeCommissionPercent}%", fontSize = 11.sp, color = RydePrimaryCyan, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// FLEET MANAGEMENT VIEW
// -------------------------------------------------------------
@Composable
private fun AdminDriversManagerView(
    drivers: List<Driver>,
    currency: String,
    onToggleVerify: (String, Boolean) -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Driver Partner Fleet", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = RydeTextPrimary)
        Text("Approve, verify or audit driver credentials and performance.", fontSize = 11.sp, color = RydeTextSecondary)

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(drivers) { drv ->
                Surface(
                    color = RydeCardBackground,
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, RydeCardBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column {
                                Text(drv.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = RydeTextPrimary)
                                Text("${drv.vehicleMake} ${drv.vehicleModel} • ${drv.licensePlate}", fontSize = 11.sp, color = RydeTextSecondary)
                            }
                            RydeBadge(
                                text = if (drv.isVerified) "VERIFIED" else "PENDING",
                                color = if (drv.isVerified) RydePrimaryMint else RydeAmber,
                                textColor = Color.Black
                            )
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Rating: ★ ${drv.rating}", fontSize = 11.sp, color = RydeAmber)
                            Text("Completed: ${drv.totalRides} trips", fontSize = 11.sp, color = RydeTextSecondary)
                            Text("Wallet: $currency${drv.walletBalance.toInt()}", fontSize = 11.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                        }

                        Row(horizontalArrangement = Arrangement.End, modifier = Modifier.fillMaxWidth()) {
                            OutlinedButton(
                                onClick = { onToggleVerify(drv.id, !drv.isVerified) },
                                shape = RoundedCornerShape(10.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                            ) {
                                Text(if (drv.isVerified) "Revoke Verification" else "Approve Driver", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// COUPONS & DISCOUNTS VIEW
// -------------------------------------------------------------
@Composable
private fun AdminCouponsView(
    coupons: List<Coupon>,
    currency: String,
    onAddNew: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("Promotions & Coupons", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = RydeTextPrimary)
                Text("Manage customer discounts, referral codes & campaign limits", fontSize = 11.sp, color = RydeTextSecondary)
            }
            IconButton(onClick = onAddNew) {
                Icon(Icons.Default.AddCircle, contentDescription = "Add Coupon", tint = MaterialTheme.colorScheme.primary)
            }
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(coupons) { cp ->
                Surface(
                    color = RydeCardBackground,
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, RydeCardBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(cp.code, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = MaterialTheme.colorScheme.primary)
                            RydeBadge(text = if (cp.discountPercent > 0) "${cp.discountPercent.toInt()}% OFF" else "FLAT $currency${cp.flatDiscount.toInt()}", color = RydePrimaryCyan, textColor = Color.Black)
                        }
                        Text(cp.description, fontSize = 12.sp, color = RydeTextSecondary)
                        Text("Max Discount: $currency${cp.maxDiscount.toInt()} • Min Fare: $currency${cp.minFare.toInt()}", fontSize = 11.sp, color = RydeTextMuted)
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// BRANDING & SETTINGS VIEW (EVERYTHING IS EDITABLE)
// -------------------------------------------------------------
@Composable
private fun AdminBrandSettingsView(
    brand: BrandSettings,
    onSave: (String, String, String, String, Double, Double, Double, Double, Boolean) -> Unit
) {
    var appName by remember(brand) { mutableStateOf(brand.appName) }
    var tagline by remember(brand) { mutableStateOf(brand.tagline) }
    var currency by remember(brand) { mutableStateOf(brand.currencySymbol) }
    var driverComm by remember(brand) { mutableStateOf(brand.defaultDriverCommissionPercent.toString()) }
    var rydeComm by remember(brand) { mutableStateOf(brand.defaultRydeCommissionPercent.toString()) }
    var taxRate by remember(brand) { mutableStateOf(brand.taxPercent.toString()) }
    var surgeMultiplier by remember(brand) { mutableStateOf(brand.globalSurgeMultiplier.toString()) }
    var isSurgeActive by remember(brand) { mutableStateOf(brand.isSurgeActive) }
    var primaryColorHex by remember(brand) { mutableStateOf(brand.primaryColorHex) }
    var savedAlert by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("System & Brand Configuration", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = RydeTextPrimary)
        Text("Modify global business parameters in real-time without modifying code.", fontSize = 11.sp, color = RydeTextSecondary)

        if (savedAlert) {
            Surface(
                color = RydePrimaryMint.copy(alpha = 0.2f),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Settings saved and updated platform-wide!", color = RydePrimaryMint, fontWeight = FontWeight.Bold, modifier = Modifier.padding(12.dp))
            }
        }

        // App Branding
        OutlinedTextField(value = appName, onValueChange = { appName = it }, label = { Text("App Name") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
        OutlinedTextField(value = tagline, onValueChange = { tagline = it }, label = { Text("Brand Tagline") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
        OutlinedTextField(value = currency, onValueChange = { currency = it }, label = { Text("Currency Symbol (e.g. ₹, $, €)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))

        // Color Presets
        Text("Theme Primary Accent", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = RydeTextPrimary)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            val presets = listOf(
                "#00E599" to PresetEmerald,
                "#00D2FF" to PresetCyan,
                "#FF6B00" to PresetSunsetOrange,
                "#8B5CF6" to PresetRoyalViolet,
                "#FFD600" to PresetCyberYellow
            )
            presets.forEach { (hex, color) ->
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(color)
                        .border(if (primaryColorHex.equals(hex, ignoreCase = true)) 2.5.dp else 0.dp, Color.White, CircleShape)
                        .clickable { primaryColorHex = hex }
                )
            }
        }

        // Commissions
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = driverComm,
                onValueChange = { driverComm = it },
                label = { Text("Driver Commission %") },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp)
            )
            OutlinedTextField(
                value = rydeComm,
                onValueChange = { rydeComm = it },
                label = { Text("${brand.appName} Fee %") },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp)
            )
        }

        OutlinedTextField(value = taxRate, onValueChange = { taxRate = it }, label = { Text("Sales / Govt Tax %") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))

        // Global Surge Switch
        Surface(
            color = RydeCardBackground,
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text("Global Surge Pricing Toggle", fontWeight = FontWeight.Bold, color = RydeTextPrimary)
                    Text("Forces surge multiplier across all city zones", fontSize = 11.sp, color = RydeTextSecondary)
                }
                Switch(checked = isSurgeActive, onCheckedChange = { isSurgeActive = it })
            }
        }

        if (isSurgeActive) {
            OutlinedTextField(value = surgeMultiplier, onValueChange = { surgeMultiplier = it }, label = { Text("Global Surge Multiplier (e.g. 1.3)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
        }

        RydeButton(
            text = "Save & Apply Changes",
            onClick = {
                onSave(
                    appName,
                    tagline,
                    primaryColorHex,
                    currency,
                    driverComm.toDoubleOrNull() ?: 80.0,
                    rydeComm.toDoubleOrNull() ?: 20.0,
                    taxRate.toDoubleOrNull() ?: 5.0,
                    surgeMultiplier.toDoubleOrNull() ?: 1.0,
                    isSurgeActive
                )
                savedAlert = true
            },
            testTag = "admin_save_settings_btn"
        )
    }
}

// -------------------------------------------------------------
// SUPPORT DESK VIEW
// -------------------------------------------------------------
@Composable
private fun AdminSupportDeskView(
    tickets: List<SupportTicket>,
    onResolve: (String) -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Customer & Driver Ticket Desk", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = RydeTextPrimary)
        Text("Triage incoming support requests from riders and drivers.", fontSize = 11.sp, color = RydeTextSecondary)

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(tickets) { tck ->
                Surface(
                    color = RydeCardBackground,
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, RydeCardBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Text("${tck.id} • ${tck.category}", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MaterialTheme.colorScheme.primary)
                            RydeBadge(text = tck.status, color = if (tck.status == "RESOLVED") RydePrimaryMint else RydeAmber, textColor = Color.Black)
                        }
                        Text(tck.subject, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = RydeTextPrimary)
                        Text(tck.message, fontSize = 11.sp, color = RydeTextSecondary)
                        Text("From: ${tck.userName} (${tck.userType})", fontSize = 10.sp, color = RydeTextMuted)

                        if (tck.status != "RESOLVED") {
                            Row(horizontalArrangement = Arrangement.End, modifier = Modifier.fillMaxWidth()) {
                                Button(
                                    onClick = { onResolve(tck.id) },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = RydePrimaryMint),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                ) {
                                    Text("Mark Resolved", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
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
// DIALOGS: EDIT CATEGORY, ADD CATEGORY, ADD COUPON
// -------------------------------------------------------------
@Composable
private fun EditCategoryDialog(
    category: RideCategory,
    currency: String,
    onSave: (String, Double, Double, Double, Double, Double, Double, Boolean) -> Unit,
    onDismiss: () -> Unit
) {
    var baseFare by remember { mutableStateOf(category.baseFare.toString()) }
    var perKm by remember { mutableStateOf(category.perKmPrice.toString()) }
    var perMin by remember { mutableStateOf(category.perMinutePrice.toString()) }
    var surge by remember { mutableStateOf(category.surgeMultiplier.toString()) }
    var drvComm by remember { mutableStateOf(category.driverCommissionPercent.toString()) }
    var rydeComm by remember { mutableStateOf(category.rydeCommissionPercent.toString()) }
    var isActive by remember { mutableStateOf(category.isActive) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = RydeDarkSurface,
            border = BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier.fillMaxWidth().padding(12.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp).verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("Edit ${category.name}", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = RydeTextPrimary)

                OutlinedTextField(value = baseFare, onValueChange = { baseFare = it }, label = { Text("Base Fare ($currency)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
                OutlinedTextField(value = perKm, onValueChange = { perKm = it }, label = { Text("Per Km Price ($currency)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
                OutlinedTextField(value = perMin, onValueChange = { perMin = it }, label = { Text("Per Minute Price ($currency)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
                OutlinedTextField(value = surge, onValueChange = { surge = it }, label = { Text("Surge Multiplier") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = drvComm, onValueChange = { drvComm = it }, label = { Text("Driver %") }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp))
                    OutlinedTextField(value = rydeComm, onValueChange = { rydeComm = it }, label = { Text("RYDE %") }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp))
                }

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Category Active", color = RydeTextPrimary)
                    Switch(checked = isActive, onCheckedChange = { isActive = it })
                }

                RydeButton(
                    text = "Save Pricing Rules",
                    onClick = {
                        onSave(
                            category.id,
                            baseFare.toDoubleOrNull() ?: category.baseFare,
                            perKm.toDoubleOrNull() ?: category.perKmPrice,
                            perMin.toDoubleOrNull() ?: category.perMinutePrice,
                            surge.toDoubleOrNull() ?: category.surgeMultiplier,
                            drvComm.toDoubleOrNull() ?: category.driverCommissionPercent,
                            rydeComm.toDoubleOrNull() ?: category.rydeCommissionPercent,
                            isActive
                        )
                    }
                )
            }
        }
    }
}

@Composable
private fun AddCategoryDialog(
    currency: String,
    onAdd: (RideCategory) -> Unit,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    var vehicleType by remember { mutableStateOf("Executive Sedan") }
    var capacity by remember { mutableStateOf("4") }
    var baseFare by remember { mutableStateOf("70") }
    var perKm by remember { mutableStateOf("15") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = RydeDarkSurface,
            border = BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier.fillMaxWidth().padding(12.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Create New Category", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = RydeTextPrimary)

                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Category Name (e.g. RYDE Pet)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
                OutlinedTextField(value = desc, onValueChange = { desc = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
                OutlinedTextField(value = baseFare, onValueChange = { baseFare = it }, label = { Text("Base Fare ($currency)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
                OutlinedTextField(value = perKm, onValueChange = { perKm = it }, label = { Text("Per Km ($currency)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))

                RydeButton(
                    text = "Add Category",
                    enabled = name.isNotBlank(),
                    onClick = {
                        val newCat = RideCategory(
                            id = "cat_${System.currentTimeMillis()}",
                            name = name,
                            description = desc,
                            vehicleType = vehicleType,
                            capacity = capacity.toIntOrNull() ?: 4,
                            baseFare = baseFare.toDoubleOrNull() ?: 70.0,
                            minFare = 90.0,
                            perKmPrice = perKm.toDoubleOrNull() ?: 15.0,
                            perMinutePrice = 2.0
                        )
                        onAdd(newCat)
                    }
                )
            }
        }
    }
}

@Composable
private fun AddCouponDialog(
    currency: String,
    onAdd: (Coupon) -> Unit,
    onDismiss: () -> Unit
) {
    var code by remember { mutableStateOf("") }
    var percent by remember { mutableStateOf("25") }
    var maxCap by remember { mutableStateOf("100") }
    var desc by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = RydeDarkSurface,
            border = BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier.fillMaxWidth().padding(12.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Create Promo Coupon", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = RydeTextPrimary)

                OutlinedTextField(value = code, onValueChange = { code = it.uppercase() }, label = { Text("Code (e.g. FESTIVE30)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
                OutlinedTextField(value = percent, onValueChange = { percent = it }, label = { Text("Discount Percent %") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
                OutlinedTextField(value = maxCap, onValueChange = { maxCap = it }, label = { Text("Max Discount ($currency)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
                OutlinedTextField(value = desc, onValueChange = { desc = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))

                RydeButton(
                    text = "Create Coupon",
                    enabled = code.isNotBlank(),
                    onClick = {
                        val cp = Coupon(
                            code = code,
                            discountPercent = percent.toDoubleOrNull() ?: 20.0,
                            maxDiscount = maxCap.toDoubleOrNull() ?: 100.0,
                            description = desc
                        )
                        onAdd(cp)
                    }
                )
            }
        }
    }
}
