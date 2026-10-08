package com.example
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import com.example.data.model.AppRole
import com.example.data.store.RideStore
import com.example.ui.admin.AdminScreen
import com.example.ui.components.RoleSwitchBar
import com.example.ui.customer.CustomerScreen
import com.example.ui.driver.DriverScreen
import com.example.ui.theme.RydeBlack
import com.example.ui.theme.RydePrimaryMint
import com.example.ui.theme.RydeTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val rideStore = RideStore.getInstance()

        setContent {
            val brandSettings by rideStore.brandSettings.collectAsState()
            val currentRole by rideStore.currentRole.collectAsState()

            val primaryColor = remember(brandSettings.primaryColorHex) {
                try {
                    Color(android.graphics.Color.parseColor(brandSettings.primaryColorHex))
                } catch (e: Exception) {
                    RydePrimaryMint
                }
            }

            RydeTheme(customPrimaryColor = primaryColor) {
                Scaffold(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(RydeBlack)
                        .testTag("ryde_root_scaffold"),
                    bottomBar = {
                        // Global Persona / Role switcher for seamless testing of Customer, Driver, and Admin systems
                        RoleSwitchBar(
                            currentRole = currentRole,
                            onRoleSelected = { rideStore.setRole(it) },
                            appName = brandSettings.appName,
                            modifier = Modifier.navigationBarsPadding()
                        )
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(bottom = innerPadding.calculateBottomPadding())
                    ) {
                        BackHandler(enabled = currentRole != AppRole.CUSTOMER) {
                            rideStore.setRole(AppRole.CUSTOMER)
                        }

                        AnimatedContent(
                            targetState = currentRole,
                            label = "RoleTransitionAnimation"
                        ) { role ->
                            when (role) {
                                AppRole.CUSTOMER -> {
                                    CustomerScreen(
                                        rideStore = rideStore,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }
                                AppRole.DRIVER -> {
                                    DriverScreen(
                                        rideStore = rideStore,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }
                                AppRole.ADMIN -> {
                                    AdminScreen(
                                        rideStore = rideStore,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
