package com.paymatrix.operatorverification.data.repository

import com.paymatrix.operatorverification.data.api.ApiClient
import com.paymatrix.operatorverification.data.api.VerificationApiService
import com.paymatrix.operatorverification.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class RechargeRepository(
    private val api: VerificationApiService = ApiClient.apiService
) {
    suspend fun lookupMobile(mobile: String): Result<MobileLookupData> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.lookupMobile(MobileLookupRequest(mobile))
                if (res.isSuccessful && res.body()?.success == true && res.body()?.data != null) {
                    Result.success(res.body()!!.data!)
                } else {
                    val msg = res.body()?.error ?: res.errorBody()?.string() ?: "Failed to detect mobile operator"
                    Result.failure(Exception(msg))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun lookupDth(subscriberId: String, hint: String? = null): Result<DthLookupData> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.lookupDth(DthLookupRequest(subscriberId, hint))
                if (res.isSuccessful && res.body()?.success == true && res.body()?.data != null) {
                    Result.success(res.body()!!.data!)
                } else {
                    val msg = res.body()?.error ?: "Failed to detect DTH operator"
                    Result.failure(Exception(msg))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun getDthCustomerDetails(subscriberId: String, operator: String): Result<DthCustomerDetails> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getDthCustomerDetails(DthDetailsRequest(subscriberId, operator))
                if (res.isSuccessful && res.body()?.success == true && res.body()?.data != null) {
                    Result.success(res.body()!!.data!)
                } else {
                    val msg = res.body()?.error ?: "Failed to fetch DTH customer account"
                    Result.failure(Exception(msg))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun getMobilePlans(operator: String, circle: String = "DELHI"): Result<List<RechargePlanItem>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getMobilePlans(MobilePlansRequest(operator, circle))
                if (res.isSuccessful && res.body()?.success == true && res.body()?.data != null) {
                    Result.success(res.body()!!.data!!.plans)
                } else {
                    val msg = res.body()?.error ?: "Failed to retrieve mobile recharge plans"
                    Result.failure(Exception(msg))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun getDthPlans(operator: String): Result<List<RechargePlanItem>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getDthPlans(DthPlansRequest(operator))
                if (res.isSuccessful && res.body()?.success == true && res.body()?.data != null) {
                    Result.success(res.body()!!.data!!.plans)
                } else {
                    val msg = res.body()?.error ?: "Failed to retrieve DTH recharge plans"
                    Result.failure(Exception(msg))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun submitRecharge(request: RechargeSubmitRequest): Result<RechargeTransactionItem> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.submitRecharge(request)
                if (res.isSuccessful && res.body()?.success == true && res.body()?.data != null) {
                    Result.success(res.body()!!.data!)
                } else {
                    val msg = res.body()?.error ?: "Recharge switch rejected submission"
                    Result.failure(Exception(msg))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun getRechargeStatus(transactionId: String): Result<RechargeTransactionItem> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getRechargeStatus(transactionId)
                if (res.isSuccessful && res.body()?.success == true && res.body()?.data != null) {
                    Result.success(res.body()!!.data!)
                } else {
                    val msg = res.body()?.error ?: "Failed to query recharge status"
                    Result.failure(Exception(msg))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun getRechargeHistory(limit: Int = 50): Result<List<RechargeTransactionItem>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getRechargeHistory(limit)
                if (res.isSuccessful && res.body()?.success == true) {
                    Result.success(res.body()!!.data)
                } else {
                    val msg = res.body()?.error ?: "Failed to retrieve recharge history"
                    Result.failure(Exception(msg))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
}
