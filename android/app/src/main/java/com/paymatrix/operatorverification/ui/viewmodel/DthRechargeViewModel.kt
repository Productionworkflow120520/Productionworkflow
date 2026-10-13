package com.paymatrix.operatorverification.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.paymatrix.operatorverification.data.model.DthCustomerDetails
import com.paymatrix.operatorverification.data.repository.RechargeRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class DthDetailsUiState {
    object Idle : DthDetailsUiState()
    object Loading : DthDetailsUiState()
    data class Success(val data: DthCustomerDetails) : DthDetailsUiState()
    data class Error(val message: String) : DthDetailsUiState()
}

class DthRechargeViewModel(
    private val repository: RechargeRepository = RechargeRepository()
) : ViewModel() {

    private val _subscriberId = MutableStateFlow("")
    val subscriberId: StateFlow<String> = _subscriberId.asStateFlow()

    private val _selectedOperator = MutableStateFlow<String?>(null)
    val selectedOperator: StateFlow<String?> = _selectedOperator.asStateFlow()

    private val _uiState = MutableStateFlow<DthDetailsUiState>(DthDetailsUiState.Idle)
    val uiState: StateFlow<DthDetailsUiState> = _uiState.asStateFlow()

    private var debounceJob: Job? = null

    fun onSubscriberIdChanged(id: String) {
        val clean = id.filter { it.isDigit() || it.isLetter() }.take(15)
        _subscriberId.value = clean

        debounceJob?.cancel()

        if (clean.length >= 8) {
            debounceJob = viewModelScope.launch {
                delay(500)
                autoDetectAndFetchDetails(clean)
            }
        } else {
            _uiState.value = DthDetailsUiState.Idle
        }
    }

    fun onOperatorChanged(op: String) {
        _selectedOperator.value = op
        val currentId = _subscriberId.value.trim()
        if (currentId.length >= 5) {
            viewModelScope.launch {
                fetchCustomerDetails(currentId, op)
            }
        }
    }

    fun refreshDetails() {
        val currentId = _subscriberId.value.trim()
        if (currentId.length >= 5) {
            viewModelScope.launch {
                autoDetectAndFetchDetails(currentId)
            }
        }
    }

    private suspend fun autoDetectAndFetchDetails(id: String) {
        _uiState.value = DthDetailsUiState.Loading

        // 1. Auto-detect operator if not manually set
        var op = _selectedOperator.value
        if (op == null) {
            val opRes = repository.lookupDth(id)
            if (opRes.isSuccess) {
                op = opRes.getOrNull()?.operator ?: "TATA_PLAY"
                _selectedOperator.value = op
            } else {
                op = "TATA_PLAY"
            }
        }

        // 2. Fetch customer details
        fetchCustomerDetails(id, op)
    }

    private suspend fun fetchCustomerDetails(id: String, op: String) {
        val result = repository.getDthCustomerDetails(id, op)
        result.onSuccess {
            _uiState.value = DthDetailsUiState.Success(it)
        }.onFailure {
            _uiState.value = DthDetailsUiState.Error(it.localizedMessage ?: "Failed to fetch subscriber account")
        }
    }

    fun clearInput() {
        _subscriberId.value = ""
        _selectedOperator.value = null
        _uiState.value = DthDetailsUiState.Idle
    }
}
