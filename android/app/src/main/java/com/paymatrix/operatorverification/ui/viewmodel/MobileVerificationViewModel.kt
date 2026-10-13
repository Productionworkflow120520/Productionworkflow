package com.paymatrix.operatorverification.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.paymatrix.operatorverification.data.model.MobileOperator
import com.paymatrix.operatorverification.data.model.MobileVerificationData
import com.paymatrix.operatorverification.data.repository.VerificationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class MobileUiState {
    object Idle : MobileUiState()
    object Loading : MobileUiState()
    data class Success(val data: MobileVerificationData) : MobileUiState()
    data class Error(val message: String) : MobileUiState()
}

class MobileVerificationViewModel(
    private val repository: VerificationRepository = VerificationRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<MobileUiState>(MobileUiState.Idle)
    val uiState: StateFlow<MobileUiState> = _uiState.asStateFlow()

    private val _mobileNumber = MutableStateFlow("")
    val mobileNumber: StateFlow<String> = _mobileNumber.asStateFlow()

    private val _transactionId = MutableStateFlow("")
    val transactionId: StateFlow<String> = _transactionId.asStateFlow()

    private val _selectedOperator = MutableStateFlow<MobileOperator?>(null)
    val selectedOperator: StateFlow<MobileOperator?> = _selectedOperator.asStateFlow()

    private val _referralSuccess = MutableStateFlow<String?>(null)
    val referralSuccess: StateFlow<String?> = _referralSuccess.asStateFlow()

    fun onMobileNumberChanged(number: String) {
        _mobileNumber.value = number
    }

    fun onTransactionIdChanged(txn: String) {
        _transactionId.value = txn
    }

    fun onOperatorSelected(op: MobileOperator?) {
        _selectedOperator.value = op
    }

    fun clearReferralMessage() {
        _referralSuccess.value = null
    }

    fun verifyMobile() {
        val num = _mobileNumber.value.trim()
        if (!Regex("^[6-9]\\d{9}$").matches(num)) {
            _uiState.value = MobileUiState.Error("Please enter a valid 10-digit Indian mobile number")
            return
        }

        viewModelScope.launch {
            _uiState.value = MobileUiState.Loading
            val result = repository.verifyMobile(
                mobile = num,
                operator = _selectedOperator.value?.code,
                transactionId = _transactionId.value.trim().takeIf { it.isNotEmpty() }
            )
            result.onSuccess {
                _uiState.value = MobileUiState.Success(it)
            }.onFailure {
                _uiState.value = MobileUiState.Error(it.localizedMessage ?: "Mobile verification failed")
            }
        }
    }

    fun referToOperator(reason: String, priority: String) {
        val currentState = _uiState.value
        if (currentState !is MobileUiState.Success) return

        viewModelScope.launch {
            val result = repository.referToOperator(
                service = "MOBILE",
                identifier = currentState.data.mobile,
                operator = currentState.data.operator,
                caseReference = currentState.data.internalCaseReference,
                customerName = null,
                providerReference = currentState.data.providerReference,
                reason = reason,
                priority = priority
            )
            result.onSuccess {
                _referralSuccess.value = "Case ${it.caseReference} escalated to Operator Desk"
            }.onFailure {
                _referralSuccess.value = "Referral failed: ${it.localizedMessage}"
            }
        }
    }
}

