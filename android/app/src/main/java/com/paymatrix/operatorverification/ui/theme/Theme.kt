package com.paymatrix.operatorverification.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = NavyPrimary,
    onPrimary = CardSurface,
    secondary = BlueAccent,
    onSecondary = CardSurface,
    tertiary = AmberGold,
    background = SlateBackground,
    surface = CardSurface,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    error = RoseError
)

@Composable
fun RechargeProTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}

@Composable
fun PayMatrixVerificationTheme(
    content: @Composable () -> Unit
) = RechargeProTheme(content = content)
