package com.example.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.*
import com.example.ui.theme.*

@Composable
fun RydeButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    enabled: Boolean = true,
    containerColor: Color = MaterialTheme.colorScheme.primary,
    contentColor: Color = MaterialTheme.colorScheme.onPrimary,
    testTag: String = "ryde_button"
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier
            .height(54.dp)
            .fillMaxWidth()
            .testTag(testTag),
        colors = ButtonDefaults.buttonColors(
            containerColor = containerColor,
            contentColor = contentColor,
            disabledContainerColor = containerColor.copy(alpha = 0.4f),
            disabledContentColor = contentColor.copy(alpha = 0.5f)
        ),
        shape = RoundedCornerShape(16.dp),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (icon != null) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(
                text = text,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
        }
    }
}

@Composable
fun RydeBadge(
    text: String,
    modifier: Modifier = Modifier,
    color: Color = RydePrimaryMint,
    textColor: Color = Color.Black
) {
    Surface(
        color = color,
        shape = RoundedCornerShape(8.dp),
        modifier = modifier
    ) {
        Text(
            text = text,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.ExtraBold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun RoleSwitchBar(
    currentRole: AppRole,
    onRoleSelected: (AppRole) -> Unit,
    modifier: Modifier = Modifier,
    appName: String = "RYDE"
) {
    Surface(
        color = RydeDarkSurface,
        shape = RoundedCornerShape(20.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, RydeCardBorder),
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .testTag("role_switch_bar")
    ) {
        Row(
            modifier = Modifier
                .padding(4.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            AppRole.values().forEach { role ->
                val isSelected = role == currentRole
                val label = when (role) {
                    AppRole.CUSTOMER -> "Customer"
                    AppRole.DRIVER -> "Driver Partner"
                    AppRole.ADMIN -> "Admin Desk"
                }
                val icon = when (role) {
                    AppRole.CUSTOMER -> Icons.Default.DirectionsCar
                    AppRole.DRIVER -> Icons.Default.LocalTaxi
                    AppRole.ADMIN -> Icons.Default.AdminPanelSettings
                }

                Surface(
                    color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onRoleSelected(role) }
                        .testTag("role_tab_${role.name.lowercase()}")
                ) {
                    Row(
                        modifier = Modifier.padding(vertical = 10.dp, horizontal = 6.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = icon,
                            contentDescription = label,
                            tint = if (isSelected) Color.Black else RydeTextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = label,
                            color = if (isSelected) Color.Black else RydeTextSecondary,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun FareBreakdownDialog(
    fare: FareCalculation,
    categoryName: String,
    currencySymbol: String,
    couponCode: String?,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = RydeDarkSurface,
            border = androidx.compose.foundation.BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .testTag("fare_breakdown_dialog")
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Fare Breakdown",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = RydeTextPrimary
                        )
                        Text(
                            text = categoryName,
                            fontSize = 13.sp,
                            color = RydeTextSecondary
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = RydeTextSecondary)
                    }
                }

                HorizontalDivider(color = RydeCardBorder)

                // Itemized fees
                FareLineItem("Base Fare", "$currencySymbol${fare.baseFare}")
                FareLineItem("Distance (${fare.distanceKm} km)", "$currencySymbol${fare.distanceCharge}")
                FareLineItem("Estimated Time (${fare.durationMin.toInt()} min)", "$currencySymbol${fare.timeCharge}")
                FareLineItem("Booking Fee", "$currencySymbol${fare.bookingFee}")
                FareLineItem("Platform Fee", "$currencySymbol${fare.platformFee}")

                if (fare.surgeMultiplier > 1.0) {
                    FareLineItem(
                        "Surge Pricing (${fare.surgeMultiplier}x)",
                        "+$currencySymbol${fare.surgeAmount}",
                        valueColor = RydeAmber
                    )
                }

                if (fare.discountAmount > 0.0) {
                    FareLineItem(
                        "Promo Discount (${couponCode ?: "COUPON"})",
                        "-$currencySymbol${fare.discountAmount}",
                        valueColor = RydePrimaryMint
                    )
                }

                FareLineItem("Taxes & Tolls", "$currencySymbol${fare.taxes}")

                HorizontalDivider(color = RydeCardBorder)

                // Total
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Total Estimated Fare",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = RydeTextPrimary
                    )
                    Text(
                        text = "$currencySymbol${fare.totalFare}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 20.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                // Transparency note
                Surface(
                    color = RydeCardBackground,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = "RYDE Fairness Guarantee",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 12.sp,
                            color = RydePrimaryCyan
                        )
                        Text(
                            text = "Driver receives ~$currencySymbol${fare.driverEarnings} (80%+). Price is locked upfront barring detour.",
                            fontSize = 11.sp,
                            color = RydeTextSecondary
                        )
                    }
                }

                RydeButton(
                    text = "Got It",
                    onClick = onDismiss,
                    testTag = "fare_breakdown_confirm_btn"
                )
            }
        }
    }
}

@Composable
private fun FareLineItem(label: String, value: String, valueColor: Color = RydeTextPrimary) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, color = RydeTextSecondary, fontSize = 13.sp)
        Text(text = value, color = valueColor, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
    }
}

@Composable
fun SosEmergencyDialog(
    rideId: String,
    onDismiss: () -> Unit
) {
    var sosSent by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = RydeDarkSurface,
            border = androidx.compose.foundation.BorderStroke(1.5.dp, RydeCoral),
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .testTag("sos_emergency_dialog")
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(RydeCoral.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Warning,
                        contentDescription = "SOS",
                        tint = RydeCoral,
                        modifier = Modifier.size(36.dp)
                    )
                }

                Text(
                    text = "RYDE Safety Shield - SOS",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = Color.White
                )

                Text(
                    text = if (sosSent)
                        "Emergency alert broadcasted! Police dispatch notified with live GPS coordinates for ride #$rideId."
                    else
                        "Pressing this will instantly share your live trip tracking with police dispatch & your registered emergency contacts.",
                    fontSize = 13.sp,
                    color = RydeTextSecondary,
                    textAlign = TextAlign.Center
                )

                if (!sosSent) {
                    RydeButton(
                        text = "Trigger Emergency Alert",
                        onClick = { sosSent = true },
                        containerColor = RydeCoral,
                        contentColor = Color.White,
                        icon = Icons.Default.Call,
                        testTag = "trigger_sos_btn"
                    )

                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text("Cancel", color = RydeTextSecondary)
                    }
                } else {
                    Button(
                        onClick = onDismiss,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = RydeStatusActive)
                    ) {
                        Text("Close", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun InRideChatDialog(
    messages: List<ChatMessage>,
    onSendMessage: (String) -> Unit,
    onDismiss: () -> Unit
) {
    var textInput by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = RydeDarkSurface,
            border = androidx.compose.foundation.BorderStroke(1.dp, RydeCardBorder),
            modifier = Modifier
                .fillMaxWidth()
                .height(480.dp)
                .padding(8.dp)
                .testTag("in_ride_chat_dialog")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Chat, contentDescription = null, tint = RydePrimaryMint)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "In-Ride Messenger",
                            fontWeight = FontWeight.Bold,
                            color = RydeTextPrimary,
                            fontSize = 16.sp
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = RydeTextSecondary)
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = RydeCardBorder)

                // Message list
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(messages) { msg ->
                        val isUser = msg.sender == "CUSTOMER" || msg.sender == "DRIVER"
                        val isSystem = msg.sender == "SYSTEM"

                        if (isSystem) {
                            Text(
                                text = msg.text,
                                fontSize = 11.sp,
                                color = RydeTextMuted,
                                textAlign = TextAlign.Center,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                            )
                        } else {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = if (msg.sender == "CUSTOMER") Arrangement.End else Arrangement.Start
                            ) {
                                Surface(
                                    color = if (msg.sender == "CUSTOMER") MaterialTheme.colorScheme.primaryContainer else RydeCardBackground,
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
                                        Text(
                                            text = msg.sender,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = RydeTextMuted
                                        )
                                        Text(
                                            text = msg.text,
                                            fontSize = 13.sp,
                                            color = RydeTextPrimary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Quick chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf("I'm here!", "Be right there", "At the corner").forEach { quickText ->
                        Surface(
                            color = RydeCardBackground,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.clickable { onSendMessage(quickText) }
                        ) {
                            Text(
                                text = quickText,
                                fontSize = 11.sp,
                                color = RydeTextSecondary,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }

                // Input bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = textInput,
                        onValueChange = { textInput = it },
                        placeholder = { Text("Message...", fontSize = 13.sp, color = RydeTextMuted) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MaterialTheme.colorScheme.primary,
                            unfocusedBorderColor = RydeCardBorder
                        )
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(
                        onClick = {
                            if (textInput.isNotBlank()) {
                                onSendMessage(textInput.trim())
                                textInput = ""
                            }
                        },
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primary)
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.Black)
                    }
                }
            }
        }
    }
}
