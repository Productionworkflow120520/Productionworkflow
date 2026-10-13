package com.paymatrix.operatorverification.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.paymatrix.operatorverification.data.model.DthCustomerData
import com.paymatrix.operatorverification.data.model.DthOperator
import com.paymatrix.operatorverification.data.repository.VerificationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class DthUiState {
    object Idle : DthUiState()
    object Loading : DthUiState()
    data class Success(val data: DthCustomerData) : DthUiState()
    data class Error(val message: String) : DthUiState()
}

class DthVerificationViewModel(
    private val repository: VerificationRepository = VerificationRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<DthUiState>(DthUiState.Idle)
    val uiState: StateFlow<DthUiState> = _uiState.asStateFlow()

    private val _selectedOperator = MutableStateFlow(DthOperator.TATA_PLAY)
    val selectedOperator: StateFlow<DthOperator> = _selectedOperator.asStateFlow()

    private val _subscriberId = MutableStateFlow("")
    val subscriberId: StateFlow<String> = _subscriberId.asStateFlow()

    private val _referralSuccess = MutableStateFlow<String?>(null)
    val referralSuccess: StateFlow<String?> = _referralSuccess.asStateFlow()

    fun onOperatorSelected(op: DthOperator) {
        _selectedOperator.value = op
    }

    fun onSubscriberIdChanged(id: String) {
        _subscriberId.value = id
    }

    fun verifySubscriber() {
        val id = _subscriberId.value.trim()
        if (id.length < 5) {
            _uiState.value = DthUiState.Error("Please enter a valid Subscriber ID / VC number (min 5 digits)")
            return
        }

        viewModelScope.launch {
            _uiState.value = DthUiState.Loading
            val result = repository.verifyDth(_selectedOperator.value.code, id)
            result.onSuccess {
                _uiState.value = DthUiState.Success(it)
            }.onFailure {
                _uiState.value = DthUiState.Error(it.localizedMessage ?: "Verification failed")
            }
        }
    }

    fun referToOperator(reason: String, priority: String) {
        val currentState = _uiState.value
        if (currentState !is DthUiState.Success) return

        viewModelScope.launch {
            val result = repository.referToOperator(
                service = "DTH",
                identifier = currentState.data.subscriberId,
                operator = currentState.data.operator,
                caseReference = currentState.data.internalCaseReference,
                customerName = currentState.data.customerName,
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

    fun clearReferralMessage() {
        _referralSuccess.value = null
    }
}
