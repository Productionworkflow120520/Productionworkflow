package com.paymatrix.operatorverification.data.model

import com.google.gson.annotations.SerializedName

// ─── 1. MOBILE LOOKUP MODELS ─────────────────────────────────

data class MobileLookupRequest(
    @SerializedName("mobile") val mobile: String
)

data class MobileLookupResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: MobileLookupData?,
    @SerializedName("error") val error: String?
)

data class MobileLookupData(
    @SerializedName("mobile") val mobile: String,
    @SerializedName("operator") val operator: String,
    @SerializedName("operatorName") val operatorName: String,
    @SerializedName("circle") val circle: String,
    @SerializedName("circleName") val circleName: String,
    @SerializedName("connectionType") val connectionType: String, // PREPAID, POSTPAID
    @SerializedName("isPorted") val isPorted: Boolean,
    @SerializedName("portedFrom") val portedFrom: String?,
    @SerializedName("providerReference") val providerReference: String,
    @SerializedName("verifiedAt") val verifiedAt: String
)

// ─── 2. DTH LOOKUP & CUSTOMER DETAILS MODELS ─────────────────

data class DthLookupRequest(
    @SerializedName("subscriberId") val subscriberId: String,
    @SerializedName("operatorHint") val operatorHint: String? = null
)

data class DthLookupResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: DthLookupData?,
    @SerializedName("error") val error: String?
)

data class DthLookupData(
    @SerializedName("operator") val operator: String,
    @SerializedName("operatorName") val operatorName: String
)

data class DthDetailsRequest(
    @SerializedName("subscriberId") val subscriberId: String,
    @SerializedName("operator") val operator: String
)

data class DthDetailsResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: DthCustomerDetails?,
    @SerializedName("error") val error: String?
)

data class DthCustomerDetails(
    @SerializedName("subscriberId") val subscriberId: String,
    @SerializedName("operator") val operator: String,
    @SerializedName("operatorName") val operatorName: String,
    @SerializedName("customerName") val customerName: String,
    @SerializedName("registeredMobileMasked") val registeredMobileMasked: String,
    @SerializedName("balance") val balance: Double,
    @SerializedName("monthlyPlanAmount") val monthlyPlanAmount: Double,
    @SerializedName("currentPlanName") val currentPlanName: String,
    @SerializedName("accountStatus") val accountStatus: String, // ACTIVE, SUSPENDED
    @SerializedName("nextRechargeDate") val nextRechargeDate: String,
    @SerializedName("providerReference") val providerReference: String,
    @SerializedName("verifiedAt") val verifiedAt: String
)

// ─── 3. RECHARGE PLANS MODELS ────────────────────────────────

data class RechargePlanItem(
    @SerializedName("planId") val planId: String,
    @SerializedName("operator") val operator: String,
    @SerializedName("circle") val circle: String,
    @SerializedName("category") val category: String, // POPULAR, UNLIMITED, DATA, TALKTIME, SMS, VALIDITY, MONTHLY, LONG_TERM
    @SerializedName("amount") val amount: Double,
    @SerializedName("validity") val validity: String,
    @SerializedName("validityDays") val validityDays: Int = 28,
    @SerializedName("dataAllowance") val dataAllowance: String? = null,
    @SerializedName("callingDetails") val callingDetails: String? = null,
    @SerializedName("smsAllowance") val smsAllowance: String? = null,
    @SerializedName("description") val description: String,
    @SerializedName("talktime") val talktime: Double? = null,
    @SerializedName("benefits") val benefits: List<String> = emptyList()
)

data class MobilePlansRequest(
    @SerializedName("operator") val operator: String,
    @SerializedName("circle") val circle: String? = "DELHI"
)

data class MobilePlansResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: MobilePlansData?,
    @SerializedName("error") val error: String?
)

data class MobilePlansData(
    @SerializedName("operator") val operator: String,
    @SerializedName("circle") val circle: String,
    @SerializedName("plans") val plans: List<RechargePlanItem>
)

data class DthPlansRequest(
    @SerializedName("operator") val operator: String
)

data class DthPlansResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: DthPlansData?,
    @SerializedName("error") val error: String?
)

data class DthPlansData(
    @SerializedName("operator") val operator: String,
    @SerializedName("plans") val plans: List<RechargePlanItem>
)

// ─── 4. RECHARGE SUBMIT & TRANSACTION MODELS ─────────────────

data class RechargeSubmitRequest(
    @SerializedName("serviceType") val serviceType: String, // MOBILE or DTH
    @SerializedName("identifier") val identifier: String, // mobile number or subscriber ID
    @SerializedName("operator") val operator: String,
    @SerializedName("operatorName") val operatorName: String? = null,
    @SerializedName("circle") val circle: String? = null,
    @SerializedName("amount") val amount: Double,
    @SerializedName("planDescription") val planDescription: String,
    @SerializedName("idempotencyKey") val idempotencyKey: String,
    @SerializedName("customerName") val customerName: String? = null
)

data class RechargeSubmitResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: RechargeTransactionItem?,
    @SerializedName("error") val error: String?
)

data class RechargeTransactionItem(
    @SerializedName("transactionId") val transactionId: String,
    @SerializedName("idempotencyKey") val idempotencyKey: String,
    @SerializedName("serviceType") val serviceType: String,
    @SerializedName("identifier") val identifier: String,
    @SerializedName("operator") val operator: String,
    @SerializedName("operatorName") val operatorName: String,
    @SerializedName("circle") val circle: String?,
    @SerializedName("amount") val amount: Double,
    @SerializedName("planDescription") val planDescription: String,
    @SerializedName("status") val status: String, // SUCCESS, PENDING, FAILED
    @SerializedName("operatorReference") val operatorReference: String,
    @SerializedName("providerReference") val providerReference: String,
    @SerializedName("submittedAt") val submittedAt: String,
    @SerializedName("completedAt") val completedAt: String?,
    @SerializedName("customerName") val customerName: String?,
    @SerializedName("errorMessage") val errorMessage: String? = null
)

data class RechargeStatusResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: RechargeTransactionItem?,
    @SerializedName("error") val error: String?
)

data class RechargeHistoryResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("count") val count: Int,
    @SerializedName("data") val data: List<RechargeTransactionItem>,
    @SerializedName("error") val error: String?
)
