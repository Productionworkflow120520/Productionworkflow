package com.paymatrix.operatorverification.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.paymatrix.operatorverification.data.model.RechargeSubmitRequest
import com.paymatrix.operatorverification.data.model.RechargeTransactionItem
import com.paymatrix.operatorverification.data.repository.RechargeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

sealed class RechargeSubmitUiState {
    object Idle : RechargeSubmitUiState()
    object Submitting : RechargeSubmitUiState()
    data class Success(val transaction: RechargeTransactionItem) : RechargeSubmitUiState()
    data class Error(val message: String) : RechargeSubmitUiState()
}

class RechargeFlowViewModel(
    private val repository: RechargeRepository = RechargeRepository()
) : ViewModel() {

    private val _submitState = MutableStateFlow<RechargeSubmitUiState>(RechargeSubmitUiState.Idle)
    val submitState: StateFlow<RechargeSubmitUiState> = _submitState.asStateFlow()

    private val _historyList = MutableStateFlow<List<RechargeTransactionItem>>(emptyList())
    val historyList: StateFlow<List<RechargeTransactionItem>> = _historyList.asStateFlow()

    private val _isLoadingHistory = MutableStateFlow(false)
    val isLoadingHistory: StateFlow<Boolean> = _isLoadingHistory.asStateFlow()

    init {
        loadHistory()
    }

    fun submitRecharge(
        serviceType: String,
        identifier: String,
        operator: String,
        operatorName: String,
        circle: String?,
        amount: Double,
        planDescription: String,
        customerName: String? = null
    ) {
        viewModelScope.launch {
            _submitState.value = RechargeSubmitUiState.Submitting
            val idempotencyKey = "IDEM-${UUID.randomUUID().toString().take(12)}"

            val request = RechargeSubmitRequest(
                serviceType = serviceType,
                identifier = identifier,
                operator = operator,
                operatorName = operatorName,
                circle = circle,
                amount = amount,
                planDescription = planDescription,
                idempotencyKey = idempotencyKey,
                customerName = customerName
            )

            val result = repository.submitRecharge(request)
            result.onSuccess { tx ->
                _submitState.value = RechargeSubmitUiState.Success(tx)
                loadHistory()
            }.onFailure { err ->
                _submitState.value = RechargeSubmitUiState.Error(err.localizedMessage ?: "Recharge submission failed")
            }
        }
    }

    fun resetSubmitState() {
        _submitState.value = RechargeSubmitUiState.Idle
    }

    fun loadHistory() {
        viewModelScope.launch {
            _isLoadingHistory.value = true
            val result = repository.getRechargeHistory(50)
            result.onSuccess {
                _historyList.value = it
            }
            _isLoadingHistory.value = false
        }
    }

    fun refreshTransactionStatus(txId: String) {
        viewModelScope.launch {
            val result = repository.getRechargeStatus(txId)
            result.onSuccess { updatedTx ->
                val current = _historyList.value.toMutableList()
                val idx = current.indexOfFirst { it.transactionId == txId }
                if (idx != -1) {
                    current[idx] = updatedTx
                    _historyList.value = current
                }
            }
        }
    }
}
