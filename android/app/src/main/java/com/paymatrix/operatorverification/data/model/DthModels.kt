package com.paymatrix.operatorverification.data.model

import com.google.gson.annotations.SerializedName

data class DthVerificationRequest(
    @SerializedName("operator") val operator: String,
    @SerializedName("subscriberId") val subscriberId: String
)

data class DthVerificationResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: DthCustomerData?,
    @SerializedName("error") val error: String?
)

data class DthCustomerData(
    @SerializedName("subscriberId") val subscriberId: String,
    @SerializedName("operator") val operator: String,
    @SerializedName("operatorName") val operatorName: String,
    @SerializedName("customerName") val customerName: String,
    @SerializedName("status") val status: String, // ACTIVE, DEACTIVE, SUSPENDED
    @SerializedName("balance") val balance: Double,
    @SerializedName("monthlyRecharge") val monthlyRecharge: Double,
    @SerializedName("nextRechargeDate") val nextRechargeDate: String,
    @SerializedName("planName") val planName: String,
    @SerializedName("registeredMobile") val registeredMobile: String,
    @SerializedName("providerReference") val providerReference: String,
    @SerializedName("internalCaseReference") val internalCaseReference: String,
    @SerializedName("verificationStatus") val verificationStatus: String, // VERIFIED, INCONCLUSIVE, FAILED
    @SerializedName("isRegisteredNameAuthorized") val isRegisteredNameAuthorized: Boolean,
    @SerializedName("disclaimer") val disclaimer: String,
    @SerializedName("verifiedAt") val verifiedAt: String
)

enum class DthOperator(val code: String, val displayName: String) {
    TATA_PLAY("TATA_PLAY", "Tata Play"),
    AIRTEL_DTH("AIRTEL_DTH", "Airtel Digital TV"),
    DISH_TV("DISH_TV", "Dish TV"),
    SUN_DIRECT("SUN_DIRECT", "Sun Direct"),
    D2H("D2H", "D2H")
}
