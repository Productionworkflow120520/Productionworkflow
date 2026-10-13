package com.paymatrix.operatorverification.data.api

import com.paymatrix.operatorverification.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface VerificationApiService {

    @POST("api/verify/dth")
    suspend fun verifyDth(
        @Body request: DthVerificationRequest
    ): Response<DthVerificationResponse>

    @POST("api/verify/mobile")
    suspend fun verifyMobile(
        @Body request: MobileVerificationRequest
    ): Response<MobileVerificationResponse>

    @POST("api/verify/refer")
    suspend fun referToOperator(
        @Body request: ReferToOperatorRequest
    ): Response<ReferToOperatorResponse>

    @GET("api/verify/cases")
    suspend fun getCases(
        @Query("status") status: String? = null,
        @Query("service") service: String? = null,
        @Query("search") search: String? = null
    ): Response<CasesListResponse>

    @PUT("api/verify/cases/{id}")
    suspend fun updateCaseStatus(
        @Path("id") id: String,
        @Body request: UpdateCaseStatusRequest
    ): Response<ReferToOperatorResponse>

    // ─── RECHARGE & VIEW PLANS (WAY2API) ─────────────────────

    @POST("api/mobile/lookup")
    suspend fun lookupMobile(
        @Body request: MobileLookupRequest
    ): Response<MobileLookupResponse>

    @POST("api/dth/lookup")
    suspend fun lookupDth(
        @Body request: DthLookupRequest
    ): Response<DthLookupResponse>

    @POST("api/dth/details")
    suspend fun getDthCustomerDetails(
        @Body request: DthDetailsRequest
    ): Response<DthDetailsResponse>

    @POST("api/mobile/plans")
    suspend fun getMobilePlans(
        @Body request: MobilePlansRequest
    ): Response<MobilePlansResponse>

    @POST("api/dth/plans")
    suspend fun getDthPlans(
        @Body request: DthPlansRequest
    ): Response<DthPlansResponse>

    @POST("api/recharge/submit")
    suspend fun submitRecharge(
        @Body request: RechargeSubmitRequest
    ): Response<RechargeSubmitResponse>

    @GET("api/recharge/status/{transactionId}")
    suspend fun getRechargeStatus(
        @Path("transactionId") transactionId: String
    ): Response<RechargeStatusResponse>

    @GET("api/recharge/history")
    suspend fun getRechargeHistory(
        @Query("limit") limit: Int = 50
    ): Response<RechargeHistoryResponse>
}

