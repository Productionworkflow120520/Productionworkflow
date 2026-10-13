package com.paymatrix.operatorverification

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.paymatrix.operatorverification.data.model.RechargePlanItem
import com.paymatrix.operatorverification.data.model.RechargeTransactionItem
import com.paymatrix.operatorverification.ui.screens.*
import com.paymatrix.operatorverification.ui.theme.EmeraldSuccess
import com.paymatrix.operatorverification.ui.theme.NavyPrimary
import com.paymatrix.operatorverification.ui.theme.RechargeProTheme
import com.paymatrix.operatorverification.ui.theme.SlateBackground
import com.paymatrix.operatorverification.ui.viewmodel.RechargeFlowViewModel

data class PlanNavParams(
    val serviceType: String,
    val identifier: String,
    val operator: String,
    val circle: String,
    val customerName: String?
)

data class OrderParams(
    val serviceType: String,
    val identifier: String,
    val operator: String,
    val operatorName: String,
    val circle: String?,
    val plan: RechargePlanItem,
    val customerName: String?
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RechargeProTheme {
                MainAppScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen(
    rechargeFlowViewModel: RechargeFlowViewModel = viewModel()
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val dynamicAppName by remember { mutableStateOf("Recharge Pro") }

    // Navigation Stack States
    var activePlanParams by remember { mutableStateOf<PlanNavParams?>(null) }
    var activeOrderParams by remember { mutableStateOf<OrderParams?>(null) }
    var activeCompletedTx by remember { mutableStateOf<RechargeTransactionItem?>(null) }

    // Handle Back Press when on sub-screens
    BackHandler(enabled = activeCompletedTx != null || activeOrderParams != null || activePlanParams != null) {
        if (activeCompletedTx != null) {
            activeCompletedTx = null
            activeOrderParams = null
            activePlanParams = null
        } else if (activeOrderParams != null) {
            activeOrderParams = null
        } else if (activePlanParams != null) {
            activePlanParams = null
        }
    }

    // 1. Transaction Status Screen Overlay
    if (activeCompletedTx != null) {
        TransactionStatusScreen(
            transaction = activeCompletedTx!!,
            onHomeClicked = {
                activeCompletedTx = null
                activeOrderParams = null
                activePlanParams = null
                selectedTab = 0
            },
            onHistoryClicked = {
                activeCompletedTx = null
                activeOrderParams = null
                activePlanParams = null
                selectedTab = 1 // Switch to History Tab
            }
        )
        return
    }

    // 2. Recharge Confirmation Screen Overlay
    if (activeOrderParams != null) {
        val order = activeOrderParams!!
        RechargeConfirmationScreen(
            serviceType = order.serviceType,
            identifier = order.identifier,
            operator = order.operator,
            operatorName = order.operatorName,
            circle = order.circle,
            plan = order.plan,
            customerName = order.customerName,
            onBack = { activeOrderParams = null },
            onSuccess = { tx ->
                activeCompletedTx = tx
            },
            viewModel = rechargeFlowViewModel
        )
        return
    }

    // 3. View Plans Screen Overlay
    if (activePlanParams != null) {
        val params = activePlanParams!!
        ViewPlansScreen(
            serviceType = params.serviceType,
            operator = params.operator,
            circle = params.circle,
            onPlanSelected = { selectedPlan ->
                activeOrderParams = OrderParams(
                    serviceType = params.serviceType,
                    identifier = params.identifier,
                    operator = params.operator,
                    operatorName = params.operator.replace("_", " "),
                    circle = params.circle,
                    plan = selectedPlan,
                    customerName = params.customerName
                )
            },
            onBack = { activePlanParams = null }
        )
        return
    }

    // Main App Scaffold with Tabs
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = dynamicAppName,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            fontSize = 18.sp
                        )
                        Surface(
                            shape = MaterialTheme.shapes.extraSmall,
                            color = Color(0xFF1E293B)
                        ) {
                            Text(
                                text = "WAY2API GATEWAY",
                                color = Color(0xFF94A3B8),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                },
                actions = {
                    Row(
                        modifier = Modifier.padding(end = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(EmeraldSuccess, shape = MaterialTheme.shapes.extraSmall)
                        )
                        Text(
                            text = "LIVE SWITCH",
                            color = EmeraldSuccess,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = NavyPrimary)
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Bolt, contentDescription = "Recharge Hub") },
                    label = { Text("Recharge", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.History, contentDescription = "History") },
                    label = { Text("History", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.Tv, contentDescription = "DTH Name") },
                    label = { Text("DTH Name", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.Assignment, contentDescription = "Review Queue") },
                    label = { Text("Queue", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(SlateBackground)
        ) {
            when (selectedTab) {
                0 -> RechargeHubScreen(
                    onNavigateToPlans = { sType, id, op, circle, cName ->
                        activePlanParams = PlanNavParams(sType, id, op, circle, cName)
                    }
                )
                1 -> TransactionHistoryScreen(
                    viewModel = rechargeFlowViewModel,
                    onBack = { selectedTab = 0 }
                )
                2 -> DthVerificationScreen()
                3 -> OperatorQueueScreen()
            }
        }
    }
}
