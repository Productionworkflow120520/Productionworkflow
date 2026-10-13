package com.paymatrix.operatorverification.data.repository

import com.paymatrix.operatorverification.data.api.ApiClient
import com.paymatrix.operatorverification.data.api.VerificationApiService
import com.paymatrix.operatorverification.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class VerificationRepository(
    private val api: VerificationApiService = ApiClient.apiService
) {
    suspend fun verifyDth(operator: String, subscriberId: String): Result<DthCustomerData> =
        withContext(Dispatchers.IO) {
            try {
                val response = api.verifyDth(DthVerificationRequest(operator, subscriberId))
                if (response.isSuccessful && response.body()?.success == true && response.body()?.data != null) {
                    Result.success(response.body()!!.data!)
                } else {
                    val errorMsg = response.body()?.error ?: response.errorBody()?.string() ?: "DTH verification failed"
                    Result.failure(Exception(errorMsg))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun verifyMobile(mobile: String, operator: String? = null, transactionId: String? = null): Result<MobileVerificationData> =
        withContext(Dispatchers.IO) {
            try {
                val response = api.verifyMobile(MobileVerificationRequest(mobile, operator, transactionId))
                if (response.isSuccessful && response.body()?.success == true && response.body()?.data != null) {
                    Result.success(response.body()!!.data!)
                } else {
                    val errorMsg = response.body()?.error ?: response.errorBody()?.string() ?: "Mobile verification failed"
                    Result.failure(Exception(errorMsg))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun referToOperator(
        service: String,
        identifier: String,
        operator: String,
        caseReference: String?,
        customerName: String?,
        providerReference: String?,
        reason: String,
        priority: String = "NORMAL"
    ): Result<OperatorCaseItem> =
        withContext(Dispatchers.IO) {
            try {
                val req = ReferToOperatorRequest(
                    service = service,
                    identifier = identifier,
                    operator = operator,
                    caseReference = caseReference,
                    customerName = customerName,
                    providerReference = providerReference,
                    reason = reason,
                    priority = priority
                )
                val response = api.referToOperator(req)
                if (response.isSuccessful && response.body()?.success == true && response.body()?.caseItem != null) {
                    Result.success(response.body()!!.caseItem!)
                } else {
                    val errorMsg = response.body()?.error ?: "Failed to refer account to operator"
                    Result.failure(Exception(errorMsg))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun getCases(status: String? = null, service: String? = null, search: String? = null): Result<List<OperatorCaseItem>> =
        withContext(Dispatchers.IO) {
            try {
                val response = api.getCases(status, service, search)
                if (response.isSuccessful && response.body()?.success == true) {
                    Result.success(response.body()!!.cases)
                } else {
                    Result.failure(Exception(response.body()?.error ?: "Failed to fetch operator queue"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun updateCaseStatus(caseId: String, status: String, notes: String? = null): Result<OperatorCaseItem> =
        withContext(Dispatchers.IO) {
            try {
                val response = api.updateCaseStatus(caseId, UpdateCaseStatusRequest(status, notes))
                if (response.isSuccessful && response.body()?.success == true && response.body()?.caseItem != null) {
                    Result.success(response.body()!!.caseItem!)
                } else {
                    Result.failure(Exception(response.body()?.error ?: "Failed to update case"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
}
