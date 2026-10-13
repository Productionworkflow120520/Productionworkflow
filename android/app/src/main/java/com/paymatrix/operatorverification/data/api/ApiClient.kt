package com.paymatrix.operatorverification.data.api

import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class AuthInterceptor(private val tokenProvider: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val builder = original.newBuilder()

        tokenProvider()?.let { token ->
            builder.header("Authorization", "Bearer $token")
            builder.header("Cookie", "rechargepro_session=$token; paymatrix_session=$token")
        }

        builder.header("Accept", "application/json")
        builder.header("User-Agent", "RechargePro-Android-App/1.0")

        return chain.proceed(builder.build())
    }
}

object ApiClient {
    private const val DEFAULT_BASE_URL = "http://10.0.2.2:3000/" // Android emulator localhost alias

    private var authToken: String? = null

    fun setAuthToken(token: String?) {
        authToken = token
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(AuthInterceptor { authToken })
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    val apiService: VerificationApiService by lazy {
        Retrofit.Builder()
            .baseUrl(DEFAULT_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(VerificationApiService::class.java)
    }
}
