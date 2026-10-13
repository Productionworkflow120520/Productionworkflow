package com.paymatrix.operatorverification.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.paymatrix.operatorverification.data.model.DthCustomerDetails
import com.paymatrix.operatorverification.data.model.MobileLookupData
import com.paymatrix.operatorverification.ui.theme.*
import com.paymatrix.operatorverification.ui.viewmodel.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RechargeHubScreen(
    onNavigateToPlans: (serviceType: String, identifier: String, operator: String, circle: String, customerName: String?) -> Unit,
    mobileViewModel: MobileRechargeViewModel = viewModel(),
    dthViewModel: DthRechargeViewModel = viewModel()
) {
    var selectedTab by remember { mutableIntStateOf(0) } // 0 = Mobile, 1 = DTH

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
    ) {
        // Tab Selector Bar
        Surface(
            color = NavyPrimary,
            modifier = Modifier.fillMaxWidth()
        ) {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = NavyPrimary,
                contentColor = Color.White,
                indicator = { tabPositions ->
                    TabRowDefaults.Indicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = AmberGold,
                        height = 3.dp
                    )
                }
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.PhoneAndroid, contentDescription = null, modifier = Modifier.size(16.dp))
                            Text("Mobile Recharge", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.Tv, contentDescription = null, modifier = Modifier.size(16.dp))
                            Text("DTH Recharge", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                )
            }
        }

        // Tab Content
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            if (selectedTab == 0) {
                MobileRechargeTabContent(
                    viewModel = mobileViewModel,
                    onViewPlans = { data ->
                        onNavigateToPlans("MOBILE", data.mobile, data.operator, data.circle, null)
                    }
                )
            } else {
                DthRechargeTabContent(
                    viewModel = dthViewModel,
                    onViewPlans = { details ->
                        onNavigateToPlans("DTH", details.subscriberId, details.operator, "ALL_INDIA", details.customerName)
                    }
                )
            }
        }
    }
}

// ─── MOBILE RECHARGE TAB ─────────────────────────────────────

@Composable
fun MobileRechargeTabContent(
    viewModel: MobileRechargeViewModel,
    onViewPlans: (MobileLookupData) -> Unit
) {
    val mobileNumber by viewModel.mobileNumber.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        // Form Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardSurface),
            elevation = CardDefaults.cardElevation(2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Enter 10-Digit Mobile Number",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextSecondary
                )

                OutlinedTextField(
                    value = mobileNumber,
                    onValueChange = { viewModel.onMobileNumberChanged(it) },
                    placeholder = { Text("e.g. 9876543210") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    trailingIcon = {
                        if (mobileNumber.isNotEmpty()) {
                            IconButton(onClick = { viewModel.clearInput() }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    }
                )

                // Quick Test Samples
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    SuggestionChip(
                        onClick = { viewModel.onMobileNumberChanged("9876543210") },
                        label = { Text("Jio (9876543210)", fontSize = 10.sp) }
                    )
                    SuggestionChip(
                        onClick = { viewModel.onMobileNumberChanged("9811122233") },
                        label = { Text("Airtel (9811122233)", fontSize = 10.sp) }
                    )
                    SuggestionChip(
                        onClick = { viewModel.onMobileNumberChanged("9822233445") },
                        label = { Text("Vi (9822233445)", fontSize = 10.sp) }
                    )
                }
            }
        }

        // Status / Results
        when (val state = uiState) {
            is MobileLookupUiState.Loading -> {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = CardSurface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(color = NavyPrimary, modifier = Modifier.size(24.dp))
                        Spacer(Modifier.width(12.dp))
                        Text("Auto-detecting operator and circle via Way2API...", fontSize = 12.sp, color = TextSecondary)
                    }
                }
            }
            is MobileLookupUiState.Error -> {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Error, contentDescription = null, tint = RoseError)
                        Spacer(Modifier.width(8.dp))
                        Text(state.message, color = RoseError, fontSize = 12.sp)
                    }
                }
            }
            is MobileLookupUiState.Success -> {
                val data = state.data
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = CardSurface),
                    elevation = CardDefaults.cardElevation(3.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Header Box
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = data.operatorName,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "${data.circleName} • ${data.connectionType}",
                                    fontSize = 12.sp,
                                    color = TextSecondary
                                )
                            }
                            if (data.isPorted) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = Color(0xFFEFF6FF)
                                ) {
                                    Text(
                                        text = "MNP PORTED",
                                        color = BlueAccent,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }

                        // Refresh Details Button
                        OutlinedButton(
                            onClick = { viewModel.refreshDetails() },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Refresh Operator & Circle Details", fontSize = 12.sp)
                        }

                        // VIEW PLANS BUTTON (ESSENTIAL FEATURE)
                        Button(
                            onClick = { onViewPlans(data) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
                        ) {
                            Icon(Icons.Default.ListAlt, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("View Plans (${data.operatorName})", fontWeight = FontWeight.ExtraBold, fontSize = 14.sp)
                        }
                    }
                }
            }
            MobileLookupUiState.Idle -> {}
        }
    }
}

// ─── DTH RECHARGE TAB ────────────────────────────────────────

@Composable
fun DthRechargeTabContent(
    viewModel: DthRechargeViewModel,
    onViewPlans: (DthCustomerDetails) -> Unit
) {
    val subscriberId by viewModel.subscriberId.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        // Input Form
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardSurface),
            elevation = CardDefaults.cardElevation(2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Enter DTH Customer ID / VC Number",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextSecondary
                )

                OutlinedTextField(
                    value = subscriberId,
                    onValueChange = { viewModel.onSubscriberIdChanged(it) },
                    placeholder = { Text("e.g. 1002938475 (Tata Play / Airtel DTH)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    trailingIcon = {
                        if (subscriberId.isNotEmpty()) {
                            IconButton(onClick = { viewModel.clearInput() }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    }
                )

                // Quick test samples
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    SuggestionChip(
                        onClick = { viewModel.onSubscriberIdChanged("1002938475") },
                        label = { Text("Tata Play", fontSize = 10.sp) }
                    )
                    SuggestionChip(
                        onClick = { viewModel.onSubscriberIdChanged("3002948172") },
                        label = { Text("Airtel DTH", fontSize = 10.sp) }
                    )
                    SuggestionChip(
                        onClick = { viewModel.onSubscriberIdChanged("0251928374") },
                        label = { Text("Dish TV", fontSize = 10.sp) }
                    )
                }
            }
        }

        // Details Result
        when (val state = uiState) {
            is DthDetailsUiState.Loading -> {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = CardSurface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(color = NavyPrimary, modifier = Modifier.size(24.dp))
                        Spacer(Modifier.width(12.dp))
                        Text("Fetching customer details from provider API...", fontSize = 12.sp, color = TextSecondary)
                    }
                }
            }
            is DthDetailsUiState.Error -> {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Error, contentDescription = null, tint = RoseError)
                        Spacer(Modifier.width(8.dp))
                        Text(state.message, color = RoseError, fontSize = 12.sp)
                    }
                }
            }
            is DthDetailsUiState.Success -> {
                val details = state.data
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = CardSurface),
                    elevation = CardDefaults.cardElevation(3.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Customer Header
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = details.customerName,
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Black,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "${details.operatorName} • Reg Mobile: ${details.registeredMobileMasked}",
                                    fontSize = 11.sp,
                                    color = TextSecondary
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = if (details.accountStatus == "ACTIVE") EmeraldSuccess else RoseError
                            ) {
                                Text(
                                    text = details.accountStatus,
                                    color = Color.White,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                        }

                        // Financial Metric Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            MetricCard("Balance", "₹${details.balance}", Modifier.weight(1f))
                            MetricCard("Monthly Pack", "₹${details.monthlyPlanAmount}", Modifier.weight(1f))
                            MetricCard("Due Date", details.nextRechargeDate, Modifier.weight(1f))
                        }

                        // Refresh button
                        OutlinedButton(
                            onClick = { viewModel.refreshDetails() },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Refresh Customer Details", fontSize = 12.sp)
                        }

                        // VIEW DTH PLANS BUTTON
                        Button(
                            onClick = { onViewPlans(details) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
                        ) {
                            Icon(Icons.Default.ListAlt, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("View DTH Plans (${details.operatorName})", fontWeight = FontWeight.ExtraBold, fontSize = 14.sp)
                        }
                    }
                }
            }
            DthDetailsUiState.Idle -> {}
        }
    }
}
