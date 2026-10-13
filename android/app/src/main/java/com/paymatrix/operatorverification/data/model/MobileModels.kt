package com.paymatrix.operatorverification.data.model

import com.google.gson.annotations.SerializedName

data class MobileVerificationRequest(
    @SerializedName("mobile") val mobile: String,
    @SerializedName("operator") val operator: String? = null,
    @SerializedName("transactionId") val transactionId: String? = null
)

data class MobileVerificationResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: MobileVerificationData?,
    @SerializedName("error") val error: String?
)

data class MobileVerificationData(
    @SerializedName("mobile") val mobile: String,
    @SerializedName("operator") val operator: String,
    @SerializedName("operatorName") val operatorName: String,
    @SerializedName("circle") val circle: String,
    @SerializedName("isPorted") val isPorted: Boolean,
    @SerializedName("transactionId") val transactionId: String?,
    @SerializedName("rechargeStatus") val rechargeStatus: String, // SUCCESS, PENDING, FAILED, NOT_FOUND
    @SerializedName("amount") val amount: Double?,
    @SerializedName("providerReference") val providerReference: String,
    @SerializedName("internalCaseReference") val internalCaseReference: String,
    @SerializedName("verificationStatus") val verificationStatus: String,
    @SerializedName("disclaimer") val disclaimer: String,
    @SerializedName("verifiedAt") val verifiedAt: String
)

enum class MobileOperator(val code: String, val displayName: String) {
    JIO("JIO", "Reliance Jio"),
    AIRTEL("AIRTEL", "Bharti Airtel"),
    VI("VI", "Vodafone Idea"),
    BSNL("BSNL", "BSNL Mobile")
}
