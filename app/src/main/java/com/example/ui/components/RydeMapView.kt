package com.example.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ActiveRide
import com.example.data.model.Driver
import com.example.data.model.RideLocation
import com.example.data.model.RideStatus
import com.example.ui.theme.*
import kotlin.math.*

@OptIn(ExperimentalTextApi::class)
@Composable
fun RydeMapView(
    pickup: RideLocation,
    destination: RideLocation?,
    activeRide: ActiveRide?,
    nearbyDrivers: List<Driver>,
    modifier: Modifier = Modifier,
    onLocationSelect: ((RideLocation) -> Unit)? = null
) {
    val textMeasurer = rememberTextMeasurer()

    // Pulse animation for pickup marker and search radar
    val infiniteTransition = rememberInfiniteTransition(label = "MapPulseTransition")
    val pulseRadius by infiniteTransition.animateFloat(
        initialValue = 12f,
        targetValue = 36f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "PulseRadius"
    )
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 0.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "PulseAlpha"
    )

    // Animated vehicle progress along route
    val driverProgress = activeRide?.driverLiveProgress ?: 0f

    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(Color(0xFF0D131F))
            .testTag("ryde_map_view")
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height

            // 1. Draw Map Background & Grid
            drawMapBase(width, height)

            // Define canvas coordinates for points
            val pX = width * 0.32f
            val pY = height * 0.65f

            val dX = width * 0.72f
            val dY = height * 0.28f

            // 2. Draw Route Polyline if destination is selected
            if (destination != null) {
                val routePath = Path().apply {
                    moveTo(pX, pY)
                    // Create realistic city curve
                    cubicTo(
                        width * 0.25f, height * 0.45f,
                        width * 0.65f, height * 0.48f,
                        dX, dY
                    )
                }

                // Route glow & shadow
                drawPath(
                    path = routePath,
                    color = RydePrimaryMint.copy(alpha = 0.25f),
                    style = Stroke(width = 16f, cap = StrokeCap.Round)
                )

                // Route main line
                drawPath(
                    path = routePath,
                    brush = Brush.linearGradient(
                        colors = listOf(RydePrimaryMint, RydePrimaryCyan),
                        start = Offset(pX, pY),
                        end = Offset(dX, dY)
                    ),
                    style = Stroke(width = 8f, cap = StrokeCap.Round)
                )

                // Route direction dashes
                drawPath(
                    path = routePath,
                    color = Color.White.copy(alpha = 0.8f),
                    style = Stroke(
                        width = 3f,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(20f, 30f), 0f),
                        cap = StrokeCap.Round
                    )
                )

                // 3. Draw Destination Pin Marker
                drawCircle(
                    color = RydeCoral,
                    radius = 16f,
                    center = Offset(dX, dY)
                )
                drawCircle(
                    color = Color.White,
                    radius = 6f,
                    center = Offset(dX, dY)
                )

                // Destination label badge
                val destText = textMeasurer.measure(
                    text = destination.title.take(18),
                    style = TextStyle(color = Color.White, fontSize = 11.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                )
                drawRoundRect(
                    color = Color(0xDD111827),
                    topLeft = Offset(dX - (destText.size.width / 2f) - 12f, dY - 42f),
                    size = androidx.compose.ui.geometry.Size(destText.size.width + 24f, 26f),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(12f, 12f)
                )
                drawText(
                    textMeasurer = textMeasurer,
                    text = destination.title.take(18),
                    topLeft = Offset(dX - (destText.size.width / 2f), dY - 38f),
                    style = TextStyle(color = Color.White, fontSize = 11.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                )
            }

            // 4. Draw Nearby Fleet Cars (when not in ride or searching)
            if (activeRide == null || activeRide.status == RideStatus.SEARCHING_DRIVER) {
                val driverOffsets = listOf(
                    Offset(width * 0.22f, height * 0.60f),
                    Offset(width * 0.45f, height * 0.72f),
                    Offset(width * 0.38f, height * 0.48f),
                    Offset(width * 0.60f, height * 0.35f),
                    Offset(width * 0.78f, height * 0.62f)
                )

                driverOffsets.forEachIndexed { idx, offset ->
                    drawVehicleMarker(
                        center = offset,
                        color = if (idx % 2 == 0) RydePrimaryMint else RydePrimaryCyan,
                        angleDeg = (idx * 65f)
                    )
                }
            }

            // 5. Draw Pickup Marker with Animated Pulse Ring
            drawCircle(
                color = RydePrimaryMint.copy(alpha = pulseAlpha),
                radius = pulseRadius,
                center = Offset(pX, pY),
                style = Stroke(width = 3f)
            )
            drawCircle(
                color = RydePrimaryMint,
                radius = 14f,
                center = Offset(pX, pY)
            )
            drawCircle(
                color = Color.Black,
                radius = 5f,
                center = Offset(pX, pY)
            )

            // Pickup label badge
            val pickText = textMeasurer.measure(
                text = "PICKUP: ${pickup.title.take(14)}",
                style = TextStyle(color = RydePrimaryMint, fontSize = 10.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
            )
            drawRoundRect(
                color = Color(0xEE0B0F17),
                topLeft = Offset(pX - (pickText.size.width / 2f) - 10f, pY + 22f),
                size = androidx.compose.ui.geometry.Size(pickText.size.width + 20f, 24f),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(10f, 10f)
            )
            drawText(
                textMeasurer = textMeasurer,
                text = "PICKUP: ${pickup.title.take(14)}",
                topLeft = Offset(pX - (pickText.size.width / 2f), pY + 26f),
                style = TextStyle(color = RydePrimaryMint, fontSize = 10.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
            )

            // 6. Draw Moving Active Driver Vehicle along route
            if (activeRide != null && (activeRide.status == RideStatus.DRIVER_ARRIVING || activeRide.status == RideStatus.ON_TRIP)) {
                val currentCarPos = if (activeRide.status == RideStatus.DRIVER_ARRIVING) {
                    // Moving from away towards pickup
                    val startX = width * 0.15f
                    val startY = height * 0.85f
                    Offset(
                        lerp(startX, pX, driverProgress),
                        lerp(startY, pY, driverProgress)
                    )
                } else {
                    // Moving from pickup towards destination
                    val t = driverProgress
                    // Interpolate bezier
                    val bx = (1 - t) * (1 - t) * pX + 2 * (1 - t) * t * (width * 0.45f) + t * t * dX
                    val by = (1 - t) * (1 - t) * pY + 2 * (1 - t) * t * (height * 0.48f) + t * t * dY
                    Offset(bx, by)
                }

                // Car radar ring
                drawCircle(
                    color = RydePrimaryMint.copy(alpha = 0.3f),
                    radius = 24f,
                    center = currentCarPos
                )
                // Car body
                drawVehicleMarker(
                    center = currentCarPos,
                    color = Color.White,
                    angleDeg = if (activeRide.status == RideStatus.DRIVER_ARRIVING) 45f else 35f,
                    scale = 1.3f
                )
            }
        }

        // Map Overlay Badges: Speed / Live GPS indicator
        Row(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Surface(
                color = Color(0xCC111827),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, RydeCardBorder)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(RydeStatusActive)
                    )
                    Text(
                        text = "GPS High Accuracy",
                        color = RydeTextSecondary,
                        fontSize = 11.sp,
                        fontWeight = androidx.compose.ui.text.font.FontWeight.Medium
                    )
                }
            }
        }
    }
}

private fun DrawScope.drawVehicleMarker(
    center: Offset,
    color: Color,
    angleDeg: Float = 0f,
    scale: Float = 1.0f
) {
    // Outer shadow / glow
    drawCircle(
        color = Color(0x80000000),
        radius = 14f * scale,
        center = center.copy(y = center.y + 2f)
    )

    // Vehicle icon background
    drawCircle(
        color = Color(0xFF1E293B),
        radius = 12f * scale,
        center = center
    )
    drawCircle(
        color = color,
        radius = 10f * scale,
        center = center,
        style = Stroke(width = 3f * scale)
    )

    // Directional chevron indicator
    drawCircle(
        color = color,
        radius = 4f * scale,
        center = center
    )
}

private fun DrawScope.drawMapBase(width: Float, height: Float) {
    // Background dark city palette
    drawRect(color = Color(0xFF0B111C))

    // Waterbody / River curve
    val riverPath = Path().apply {
        moveTo(0f, height * 0.15f)
        cubicTo(
            width * 0.4f, height * 0.10f,
            width * 0.6f, height * 0.35f,
            width, height * 0.25f
        )
        lineTo(width, 0f)
        lineTo(0f, 0f)
        close()
    }
    drawPath(riverPath, color = Color(0xFF0F1B2C))

    // Green Park Area
    drawRoundRect(
        color = Color(0xFF0D231E),
        topLeft = Offset(width * 0.05f, height * 0.38f),
        size = androidx.compose.ui.geometry.Size(width * 0.22f, height * 0.18f),
        cornerRadius = androidx.compose.ui.geometry.CornerRadius(20f, 20f)
    )

    // City Major Arteries (Roads)
    val roadColor = Color(0xFF1E2838)
    val highwayColor = Color(0xFF2B3A50)

    // Highway 1
    drawLine(
        color = highwayColor,
        start = Offset(0f, height * 0.45f),
        end = Offset(width, height * 0.38f),
        strokeWidth = 22f
    )

    // Avenue 1 (Vertical)
    drawLine(
        color = roadColor,
        start = Offset(width * 0.35f, 0f),
        end = Offset(width * 0.30f, height),
        strokeWidth = 16f
    )

    // Avenue 2 (Vertical right)
    drawLine(
        color = roadColor,
        start = Offset(width * 0.70f, 0f),
        end = Offset(width * 0.75f, height),
        strokeWidth = 16f
    )

    // Cross Streets
    drawLine(
        color = roadColor,
        start = Offset(0f, height * 0.75f),
        end = Offset(width, height * 0.70f),
        strokeWidth = 14f
    )

    drawLine(
        color = roadColor,
        start = Offset(0f, height * 0.22f),
        end = Offset(width * 0.5f, height * 0.28f),
        strokeWidth = 12f
    )

    // Road center divider dashes on main highway
    drawLine(
        color = Color(0x33FFFFFF),
        start = Offset(0f, height * 0.45f),
        end = Offset(width, height * 0.38f),
        strokeWidth = 2f,
        pathEffect = PathEffect.dashPathEffect(floatArrayOf(15f, 20f), 0f)
    )
}

private fun lerp(start: Float, stop: Float, fraction: Float): Float {
    return (1 - fraction) * start + fraction * stop
}
