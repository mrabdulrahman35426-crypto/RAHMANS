package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DefaultDarkColorScheme = darkColorScheme(
    primary = RydePrimaryMint,
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF003822),
    onPrimaryContainer = RydePrimaryMint,
    secondary = RydePrimaryCyan,
    onSecondary = Color.Black,
    secondaryContainer = Color(0xFF083344),
    onSecondaryContainer = RydePrimaryCyan,
    tertiary = RydeAccentViolet,
    background = RydeBlack,
    onBackground = RydeTextPrimary,
    surface = RydeDarkSurface,
    onSurface = RydeTextPrimary,
    surfaceVariant = RydeCardBackground,
    onSurfaceVariant = RydeTextSecondary,
    outline = RydeCardBorder,
    error = RydeStatusError,
    onError = Color.White
)

@Composable
fun RydeTheme(
    customPrimaryColor: Color? = null,
    customSecondaryColor: Color? = null,
    content: @Composable () -> Unit
) {
    val dynamicScheme = if (customPrimaryColor != null || customSecondaryColor != null) {
        val primary = customPrimaryColor ?: RydePrimaryMint
        val secondary = customSecondaryColor ?: RydePrimaryCyan
        DefaultDarkColorScheme.copy(
            primary = primary,
            onPrimary = if (primary.luminance() > 0.5f) Color.Black else Color.White,
            primaryContainer = primary.copy(alpha = 0.2f),
            secondary = secondary,
            secondaryContainer = secondary.copy(alpha = 0.2f)
        )
    } else {
        DefaultDarkColorScheme
    }

    MaterialTheme(
        colorScheme = dynamicScheme,
        typography = Typography,
        content = content
    )
}

// Helper extension for color brightness check
private fun Color.luminance(): Float {
    return (0.299f * red + 0.587f * green + 0.114f * blue)
}
