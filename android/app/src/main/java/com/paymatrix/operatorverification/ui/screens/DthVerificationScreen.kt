package com.paymatrix.operatorverification.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.paymatrix.operatorverification.data.model.DthCustomerData
import com.paymatrix.operatorverification.data.model.DthOperator
import com.paymatrix.operatorverification.ui.theme.*
import com.paymatrix.operatorverification.ui.viewmodel.DthUiState
import com.paymatrix.operatorverification.ui.viewmodel.DthVerificationViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DthVerificationScreen(
    viewModel: DthVerificationViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val selectedOperator by viewModel.selectedOperator.collectAsState()
    val subscriberId by viewModel.subscriberId.collectAsState()
    val referralMsg by viewModel.referralSuccess.collectAsState()

    var showReferDialog by remember { mutableStateOf(false) }
    var operatorDropdownExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    )
    {
        // Top Card Header
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = NavyPrimary),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "DTH CUSTOMER VERIFICATION",
                    color = AmberGold,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Operator Account Lookup",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Live registered name, monthly recharge, and provider reference verification.",
                    color = Color(0xFF94A3B8),
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }

        // Input Form
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardSurface),
            elevation = CardDefaults.cardElevation(2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text("Select DTH Operator", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)

                ExposedDropdownMenuBox(
                    expanded = operatorDropdownExpanded,
                    onExpandedChange = { operatorDropdownExpanded = !operatorDropdownExpanded }
                ) {
                    OutlinedTextField(
                        value = selectedOperator.displayName,
                        onValueChange = {},
                        readOnly = true,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = operatorDropdownExpanded) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                    ExposedDropdownMenu(
                        expanded = operatorDropdownExpanded,
                        onDismissRequest = { operatorDropdownExpanded = false }
                    ) {
                        DthOperator.values().forEach { op ->
                            DropdownMenuItem(
                                text = { Text(op.displayName) },
                                onClick = {
                                    viewModel.onOperatorSelected(op)
                                    operatorDropdownExpanded = false
                                }
                            )
                        }
                    }
                }

                Text("Subscriber ID / VC Number", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                OutlinedTextField(
                    value = subscriberId,
                    onValueChange = { viewModel.onSubscriberIdChanged(it) },
                    placeholder = { Text("e.g. 1002938475") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    trailingIcon = {
                        if (subscriberId.isNotEmpty()) {
                            IconButton(onClick = { viewModel.onSubscriberIdChanged("") }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    }
                )

                // Quick test sample accounts
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    SuggestionChip(
                        onClick = {
                            viewModel.onOperatorSelected(DthOperator.TATA_PLAY)
                            viewModel.onSubscriberIdChanged("1002938475")
                        },
                        label = { Text("Tata Play", fontSize = 11.sp) }
                    )
                    SuggestionChip(
                        onClick = {
                            viewModel.onOperatorSelected(DthOperator.AIRTEL_DTH)
                            viewModel.onSubscriberIdChanged("3002948172")
                        },
                        label = { Text("Airtel DTH", fontSize = 11.sp) }
                    )
                    SuggestionChip(
                        onClick = {
                            viewModel.onOperatorSelected(DthOperator.DISH_TV)
                            viewModel.onSubscriberIdChanged("0251928374")
                        },
                        label = { Text("Dish TV", fontSize = 11.sp) }
                    )
                }

                Button(
                    onClick = { viewModel.verifySubscriber() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
                ) {
                    Icon(Icons.Default.Search, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Verify with Provider API", fontWeight = FontWeight.Bold)
                }
            }
        }

        // Referral status alert
        referralMsg?.let { msg ->
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5)),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldSuccess)
                    Spacer(Modifier.width(8.dp))
                    Text(msg, color = Color(0xFF065F46), fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }
            }
        }

        // Results Section
        when (val state = uiState) {
            is DthUiState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = NavyPrimary)
                }
            }
            is DthUiState.Error -> {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(modifier = Modifier.padding(16.dp)) {
                        Icon(Icons.Default.Error, contentDescription = null, tint = RoseError)
                        Spacer(Modifier.width(8.dp))
                        Text(state.message, color = RoseError, fontSize = 12.sp)
                    }
                }
            }
            is DthUiState.Success -> {
                DthResultCard(
                    data = state.data,
                    onReferClicked = { showReferDialog = true }
                )
            }
            DthUiState.Idle -> {}
        }
    }

    // Refer to Operator Dialog
    if (showReferDialog) {
        ReferOperatorDialog(
            onDismiss = { showReferDialog = false },
            onConfirm = { reason, priority ->
                viewModel.referToOperator(reason, priority)
                showReferDialog = false
            }
        )
    }
}

@Composable
fun DthResultCard(
    data: DthCustomerData,
    onReferClicked: () -> Unit
) {
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
            // Customer Hero Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(NavyPrimary)
                    .padding(14.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "REGISTERED CUSTOMER NAME",
                            color = Color(0xFF94A3B8),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = if (data.status == "ACTIVE") EmeraldSuccess else RoseError
                        ) {
                            Text(
                                text = data.status,
                                color = Color.White,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Text(
                        text = data.customerName,
                        color = AmberGold,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                    Text(
                        text = "${data.operatorName} • VC: ${data.subscriberId}",
                        color = Color.White,
                        fontSize = 11.sp
                    )
                }
            }

            // Key Financial Metrics
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                MetricCard("Balance", "₹${data.balance}", Modifier.weight(1f))
                MetricCard("Monthly Pack", "₹${data.monthlyRecharge}", Modifier.weight(1f))
                MetricCard("Due Date", data.nextRechargeDate, Modifier.weight(1f))
            }

            // Plan Info
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = SlateBackground,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text("ACTIVE BASE PACK", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                    Text(data.planName, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                }
            }

            // Reference Handling Section (Critical System Requirement)
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFFFFBEB),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = "📑 Account Reference Handling",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = Color(0xFF92400E)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Provider API Reference:", fontSize = 11.sp, color = TextSecondary)
                        Text(
                            text = data.providerReference,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = NavyPrimary
                        )
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Internal Case ID:", fontSize = 11.sp, color = TextSecondary)
                        Text(
                            text = data.internalCaseReference,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = BlueAccent
                        )
                    }
                    Divider(color = Color(0xFFFDE68A))
                    Text(
                        text = "⚠️ ${data.disclaimer}",
                        fontSize = 10.sp,
                        color = Color(0xFF92400E),
                        lineHeight = 14.sp
                    )
                }
            }

            // Action Buttons
            OutlinedButton(
                onClick = onReferClicked,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFB45309)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Inconclusive Check? Refer to Operator Desk", fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun MetricCard(label: String, value: String, modifier: Modifier = Modifier) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = SlateBackground,
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(8.dp)) {
            Text(label, fontSize = 9.sp, color = TextSecondary, fontWeight = FontWeight.Bold)
            Text(value, fontSize = 13.sp, color = TextPrimary, fontWeight = FontWeight.ExtraBold)
        }
    }
}

@Composable
fun ReferOperatorDialog(
    onDismiss: () -> Unit,
    onConfirm: (reason: String, priority: String) -> Unit
) {
    var reason by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf("HIGH") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Escalate to Operator Desk", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    "Route account to an authorized verification operator for manual callback and discrepancy resolution.",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
                OutlinedTextField(
                    value = reason,
                    onValueChange = { reason = it },
                    label = { Text("Escalation Reason") },
                    placeholder = { Text("e.g. Registered name does not match subscriber KYC") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { if (reason.isNotBlank()) onConfirm(reason, priority) },
                colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
            ) {
                Text("Confirm Referral")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
