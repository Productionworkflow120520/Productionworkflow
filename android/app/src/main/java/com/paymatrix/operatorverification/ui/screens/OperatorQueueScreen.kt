package com.paymatrix.operatorverification.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.paymatrix.operatorverification.data.model.OperatorCaseItem
import com.paymatrix.operatorverification.ui.theme.*
import com.paymatrix.operatorverification.ui.viewmodel.OperatorQueueViewModel
import com.paymatrix.operatorverification.ui.viewmodel.QueueUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OperatorQueueScreen(
    viewModel: OperatorQueueViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val filterStatus by viewModel.filterStatus.collectAsState()

    var activeDialogCase by remember { mutableStateOf<OperatorCaseItem?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Header Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = NavyPrimary),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "OPERATOR REVIEW QUEUE",
                    color = AmberGold,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Manual Verification Desk",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Review disputed accounts, HLR discrepancies, and pending recharge validations.",
                    color = Color(0xFF94A3B8),
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }

        // Search & Filter controls
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = CardSurface),
            elevation = CardDefaults.cardElevation(2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { viewModel.onSearchChanged(it) },
                    placeholder = { Text("Search by ID, name, or case ref...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondary) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.onSearchChanged("") }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )

                // Status Filter Chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val filterOptions = listOf(
                        "ALL" to "All Cases",
                        "PENDING_OPERATOR_REVIEW" to "Pending Review",
                        "IN_PROGRESS" to "In Progress",
                        "RESOLVED" to "Resolved",
                        "REJECTED" to "Rejected"
                    )

                    filterOptions.forEach { (statusKey, label) ->
                        FilterChip(
                            selected = filterStatus == statusKey,
                            onClick = { viewModel.onStatusFilterChanged(statusKey) },
                            label = { Text(label, fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = NavyPrimary,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }
            }
        }

        // Cases List
        when (val state = uiState) {
            is QueueUiState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = NavyPrimary)
                }
            }
            is QueueUiState.Error -> {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Error, contentDescription = null, tint = RoseError)
                        Spacer(Modifier.width(8.dp))
                        Text(state.message, color = RoseError, fontSize = 12.sp)
                    }
                }
            }
            is QueueUiState.Success -> {
                if (state.cases.isEmpty()) {
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = CardSurface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = EmeraldSuccess,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(Modifier.height(8.dp))
                            Text(
                                "Queue Clear",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = TextPrimary
                            )
                            Text(
                                "No cases matching selected filter.",
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(state.cases, key = { it.id }) { caseItem ->
                            OperatorCaseCard(
                                caseItem = caseItem,
                                onActionClicked = { activeDialogCase = caseItem }
                            )
                        }
                    }
                }
            }
        }
    }

    // Status Action Dialog
    activeDialogCase?.let { c ->
        UpdateCaseDialog(
            caseItem = c,
            onDismiss = { activeDialogCase = null },
            onConfirm = { newStatus, notes ->
                viewModel.updateCaseStatus(c.id, newStatus, notes)
                activeDialogCase = null
            }
        )
    }
}

@Composable
fun OperatorCaseCard(
    caseItem: OperatorCaseItem,
    onActionClicked: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = CardSurface),
        elevation = CardDefaults.cardElevation(2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Header Row: Service Badge, Case Ref, Priority
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = if (caseItem.service == "DTH") BlueAccent else Color(0xFF7C3AED)
                    ) {
                        Text(
                            text = caseItem.service,
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    Text(
                        text = caseItem.caseReference,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = NavyPrimary
                    )
                }

                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = when (caseItem.priority) {
                        "URGENT" -> RoseError
                        "HIGH" -> AmberGold
                        else -> Color(0xFF64748B)
                    }
                ) {
                    Text(
                        text = caseItem.priority,
                        color = Color.White,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            // Customer / Target Details
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(SlateBackground)
                    .padding(10.dp)
            ) {
                if (caseItem.customerName != null) {
                    Text(
                        text = caseItem.customerName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = TextPrimary
                    )
                }
                Text(
                    text = "${caseItem.operator} • ID: ${caseItem.identifier}",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
                if (caseItem.providerReference != null) {
                    Text(
                        text = "Provider Ref: ${caseItem.providerReference}",
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFF475569)
                    )
                }
            }

            // Reason & Notes
            Text(
                text = "Reason: ${caseItem.referredReason}",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF991B1B)
            )

            caseItem.operatorNotes?.let { notes ->
                Text(
                    text = "Operator Notes: $notes",
                    fontSize = 11.sp,
                    color = TextSecondary
                )
            }

            // Footer: Status and Action Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = when (caseItem.status) {
                        "RESOLVED" -> EmeraldSuccess
                        "IN_PROGRESS" -> BlueAccent
                        "REJECTED" -> RoseError
                        else -> AmberGold
                    }
                ) {
                    Text(
                        text = caseItem.status.replace("_", " "),
                        color = Color.White,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }

                FilledTonalButton(
                    onClick = onActionClicked,
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Action", fontSize = 11.sp)
                }
            }
        }
    }
}

@Composable
fun UpdateCaseDialog(
    caseItem: OperatorCaseItem,
    onDismiss: () -> Unit,
    onConfirm: (status: String, notes: String?) -> Unit
) {
    var selectedStatus by remember { mutableStateOf(caseItem.status) }
    var notes by remember { mutableStateOf(caseItem.operatorNotes ?: "") }

    val statusOptions = listOf(
        "PENDING_OPERATOR_REVIEW" to "Pending Review",
        "IN_PROGRESS" to "In Progress",
        "RESOLVED" to "Resolved / Cleared",
        "REJECTED" to "Rejected / Fraud"
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Update Case: ${caseItem.caseReference}", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Select Resolution Status:", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)

                statusOptions.forEach { (key, label) ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = selectedStatus == key,
                            onClick = { selectedStatus = key }
                        )
                        Spacer(Modifier.width(6.dp))
                        Text(label, fontSize = 13.sp)
                    }
                }

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Operator Audit Notes") },
                    placeholder = { Text("e.g. Verified with circle HLR switch manually") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(selectedStatus, notes.takeIf { it.isNotBlank() }) },
                colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
            ) {
                Text("Save Status")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
