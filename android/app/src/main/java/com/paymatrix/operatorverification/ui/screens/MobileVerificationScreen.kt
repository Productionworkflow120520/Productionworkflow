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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.paymatrix.operatorverification.data.model.MobileOperator
import com.paymatrix.operatorverification.data.model.MobileVerificationData
import com.paymatrix.operatorverification.ui.theme.*
import com.paymatrix.operatorverification.ui.viewmodel.MobileUiState
import com.paymatrix.operatorverification.ui.viewmodel.MobileVerificationViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MobileVerificationScreen(
    viewModel: MobileVerificationViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val mobileNumber by viewModel.mobileNumber.collectAsState()
    val transactionId by viewModel.transactionId.collectAsState()
    val selectedOperator by viewModel.selectedOperator.collectAsState()
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
    ) {
        // Top Card Header
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = NavyPrimary),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "MOBILE RECHARGE VERIFICATION",
                    color = AmberGold,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "HLR & Recharge Switch Lookup",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Live telecom circle, MNP port status, recharge transaction status & upstream provider reference.",
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
                Text(
                    "Mobile Number (10 digits)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextSecondary
                )
                OutlinedTextField(
                    value = mobileNumber,
                    onValueChange = { if (it.length <= 10 && it.all { char -> char.isDigit() }) viewModel.onMobileNumberChanged(it) },
                    placeholder = { Text("e.g. 9876543210") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    trailingIcon = {
                        if (mobileNumber.isNotEmpty()) {
                            IconButton(onClick = { viewModel.onMobileNumberChanged("") }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    }
                )

                Text(
                    "Operator (Optional - Auto-detected via HLR)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextSecondary
                )

                ExposedDropdownMenuBox(
                    expanded = operatorDropdownExpanded,
                    onExpandedChange = { operatorDropdownExpanded = !operatorDropdownExpanded }
                ) {
                    OutlinedTextField(
                        value = selectedOperator?.displayName ?: "Auto-Detect Operator (HLR)",
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
                        DropdownMenuItem(
                            text = { Text("Auto-Detect Operator (HLR)") },
                            onClick = {
                                viewModel.onOperatorSelected(null)
                                operatorDropdownExpanded = false
                            }
                        )
                        MobileOperator.values().forEach { op ->
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

                Text(
                    "Recharge Transaction ID (Optional)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextSecondary
                )
                OutlinedTextField(
                    value = transactionId,
                    onValueChange = { viewModel.onTransactionIdChanged(it) },
                    placeholder = { Text("e.g. TXN9876543210") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    trailingIcon = {
                        if (transactionId.isNotEmpty()) {
                            IconButton(onClick = { viewModel.onTransactionIdChanged("") }) {
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
                            viewModel.onMobileNumberChanged("9876543210")
                            viewModel.onOperatorSelected(MobileOperator.JIO)
                            viewModel.onTransactionIdChanged("TXN-JIO-88192")
                        },
                        label = { Text("Jio Sample", fontSize = 11.sp) }
                    )
                    SuggestionChip(
                        onClick = {
                            viewModel.onMobileNumberChanged("9811122233")
                            viewModel.onOperatorSelected(MobileOperator.AIRTEL)
                            viewModel.onTransactionIdChanged("TXN-AIR-44102")
                        },
                        label = { Text("Airtel Sample", fontSize = 11.sp) }
                    )
                    SuggestionChip(
                        onClick = {
                            viewModel.onMobileNumberChanged("9822233445")
                            viewModel.onOperatorSelected(MobileOperator.VI)
                            viewModel.onTransactionIdChanged("TXN-VI-11928")
                        },
                        label = { Text("Vi Sample", fontSize = 11.sp) }
                    )
                }

                Button(
                    onClick = { viewModel.verifyMobile() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
                ) {
                    Icon(Icons.Default.Search, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Verify Mobile & Recharge", fontWeight = FontWeight.Bold)
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
            is MobileUiState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = NavyPrimary)
                }
            }
            is MobileUiState.Error -> {
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
            is MobileUiState.Success -> {
                MobileResultCard(
                    data = state.data,
                    onReferClicked = { showReferDialog = true }
                )
            }
            MobileUiState.Idle -> {}
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
fun MobileResultCard(
    data: MobileVerificationData,
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
            // Operator & Mobile Hero Box
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
                            text = "HLR NETWORK STATUS",
                            color = Color(0xFF94A3B8),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = when (data.rechargeStatus) {
                                "SUCCESS" -> EmeraldSuccess
                                "PENDING" -> AmberGold
                                else -> RoseError
                            }
                        ) {
                            Text(
                                text = data.rechargeStatus,
                                color = Color.White,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Text(
                        text = "+91 ${data.mobile}",
                        color = AmberGold,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                    Text(
                        text = "${data.operatorName} • Circle: ${data.circle}" + if (data.isPorted) " (MNP Ported)" else "",
                        color = Color.White,
                        fontSize = 11.sp
                    )
                }
            }

            // Metrics Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                MetricCard("Recharge Amount", if (data.amount != null) "₹${data.amount}" else "N/A", Modifier.weight(1f))
                MetricCard("HLR Circle", data.circle, Modifier.weight(1f))
                MetricCard("Ported (MNP)", if (data.isPorted) "YES" else "NO", Modifier.weight(1f))
            }

            // Transaction Detail Box
            data.transactionId?.let { txnId ->
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = SlateBackground,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text("RECHARGE TRANSACTION ID", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                        Text(txnId, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                    }
                }
            }

            // Reference Handling Section
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
                        Text("Provider Reference:", fontSize = 11.sp, color = TextSecondary)
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
                Text("Dispute or Pending? Refer to Operator Desk", fontSize = 12.sp)
            }
        }
    }
}
