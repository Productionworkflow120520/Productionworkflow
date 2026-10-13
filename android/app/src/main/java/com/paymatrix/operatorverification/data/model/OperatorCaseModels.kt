package com.paymatrix.operatorverification.data.model

import com.google.gson.annotations.SerializedName

data class ReferToOperatorRequest(
    @SerializedName("service") val service: String, // DTH or MOBILE
    @SerializedName("identifier") val identifier: String,
    @SerializedName("operator") val operator: String,
    @SerializedName("caseReference") val caseReference: String? = null,
    @SerializedName("customerName") val customerName: String? = null,
    @SerializedName("providerReference") val providerReference: String? = null,
    @SerializedName("reason") val reason: String,
    @SerializedName("priority") val priority: String = "NORMAL" // NORMAL, HIGH, URGENT
)

data class ReferToOperatorResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("case") val caseItem: OperatorCaseItem?,
    @SerializedName("error") val error: String?
)

data class OperatorCaseItem(
    @SerializedName("id") val id: String,
    @SerializedName("caseReference") val caseReference: String,
    @SerializedName("service") val service: String,
    @SerializedName("identifier") val identifier: String,
    @SerializedName("operator") val operator: String,
    @SerializedName("customerName") val customerName: String?,
    @SerializedName("status") val status: String, // PENDING_OPERATOR_REVIEW, IN_PROGRESS, RESOLVED, REJECTED
    @SerializedName("priority") val priority: String,
    @SerializedName("referredReason") val referredReason: String,
    @SerializedName("providerReference") val providerReference: String?,
    @SerializedName("assignedOperator") val assignedOperator: String?,
    @SerializedName("operatorNotes") val operatorNotes: String?,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String?
)

data class CasesListResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("cases") val cases: List<OperatorCaseItem>,
    @SerializedName("total") val total: Int,
    @SerializedName("error") val error: String?
)

data class UpdateCaseStatusRequest(
    @SerializedName("status") val status: String,
    @SerializedName("operatorNotes") val operatorNotes: String? = null,
    @SerializedName("assignedOperator") val assignedOperator: String? = null
)
