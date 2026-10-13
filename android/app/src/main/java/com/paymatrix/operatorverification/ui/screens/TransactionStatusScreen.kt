package com.paymatrix.operatorverification.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.paymatrix.operatorverification.data.model.RechargeTransactionItem
import com.paymatrix.operatorverification.ui.theme.*

@Composable
fun TransactionStatusScreen(
    transaction: RechargeTransactionItem,
    onHomeClicked: () -> Unit,
    onHistoryClicked: () -> Unit
) {
    val isSuccess = transaction.status == "SUCCESS"
    val isPending = transaction.status == "PENDING"

    val statusColor = if (isSuccess) EmeraldSuccess else if (isPending) AmberGold else RoseError

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = CardSurface),
            elevation = CardDefaults.cardElevation(4.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Status Icon Ring
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CircleShape)
                        .background(statusColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isSuccess) Icons.Default.Check else if (isPending) Icons.Default.HourglassTop else Icons.Default.Close,
                        contentDescription = null,
                        tint = statusColor,
                        modifier = Modifier.size(36.dp)
                    )
                }

                Text(
                    text = if (isSuccess) "Recharge Successful!" else if (isPending) "Recharge In Progress" else "Recharge Failed",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary
                )

                Text(
                    text = "₹${transaction.amount.toInt()}",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = statusColor
                )

                Divider(color = Color(0xFFE2E8F0))

                // Detail Rows
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    DetailRow("Recipient ID", transaction.identifier)
                    DetailRow("Operator", transaction.operatorName)
                    if (transaction.customerName != null) {
                        DetailRow("Customer Name", transaction.customerName)
                    }
                    DetailRow("Txn Reference", transaction.transactionId, isMonospace = true)
                    DetailRow("Operator Ref", transaction.operatorReference, isMonospace = true)
                    DetailRow("Submitted At", transaction.submittedAt.take(19).replace("T", " "), isMonospace = true)
                }
            }
        }

        Spacer(Modifier.height(24.dp))

        Button(
            onClick = onHomeClicked,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
        ) {
            Text("Done / Recharge Another", fontWeight = FontWeight.Bold)
        }

        Spacer(Modifier.height(8.dp))

        OutlinedButton(
            onClick = onHistoryClicked,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("View Transaction History", fontWeight = FontWeight.SemiBold, color = NavyPrimary)
        }
    }
}

@Composable
fun DetailRow(label: String, value: String, isMonospace: Boolean = false) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, fontSize = 12.sp, color = TextSecondary)
        Text(
            text = value,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            fontFamily = if (isMonospace) FontFamily.Monospace else FontFamily.Default
        )
    }
}
