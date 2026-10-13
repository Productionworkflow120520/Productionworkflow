package com.paymatrix.operatorverification.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.paymatrix.operatorverification.data.model.MobileLookupData
import com.paymatrix.operatorverification.data.repository.RechargeRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class MobileLookupUiState {
    object Idle : MobileLookupUiState()
    object Loading : MobileLookupUiState()
    data class Success(val data: MobileLookupData) : MobileLookupUiState()
    data class Error(val message: String) : MobileLookupUiState()
}

class MobileRechargeViewModel(
    private val repository: RechargeRepository = RechargeRepository()
) : ViewModel() {

    private val _mobileNumber = MutableStateFlow("")
    val mobileNumber: StateFlow<String> = _mobileNumber.asStateFlow()

    private val _uiState = MutableStateFlow<MobileLookupUiState>(MobileLookupUiState.Idle)
    val uiState: StateFlow<MobileLookupUiState> = _uiState.asStateFlow()

    private var debounceJob: Job? = null

    fun onMobileNumberChanged(num: String) {
        val filtered = num.filter { it.isDigit() }.take(10)
        _mobileNumber.value = filtered

        debounceJob?.cancel()

        if (filtered.length == 10) {
            debounceJob = viewModelScope.launch {
                delay(400) // 400ms debounce
                lookupMobileNumber(filtered)
            }
        } else {
            _uiState.value = MobileLookupUiState.Idle
        }
    }

    fun refreshDetails() {
        val current = _mobileNumber.value.trim()
        if (current.length == 10) {
            viewModelScope.launch {
                lookupMobileNumber(current)
            }
        }
    }

    private suspend fun lookupMobileNumber(number: String) {
        _uiState.value = MobileLookupUiState.Loading
        val result = repository.lookupMobile(number)
        result.onSuccess {
            _uiState.value = MobileLookupUiState.Success(it)
        }.onFailure {
            _uiState.value = MobileLookupUiState.Error(it.localizedMessage ?: "Auto operator detection failed")
        }
    }

    fun clearInput() {
        _mobileNumber.value = ""
        _uiState.value = MobileLookupUiState.Idle
    }
}
