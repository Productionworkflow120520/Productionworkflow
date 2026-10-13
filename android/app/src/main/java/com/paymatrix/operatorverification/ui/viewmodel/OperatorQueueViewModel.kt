package com.paymatrix.operatorverification.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.paymatrix.operatorverification.data.model.OperatorCaseItem
import com.paymatrix.operatorverification.data.repository.VerificationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class QueueUiState {
    object Loading : QueueUiState()
    data class Success(val cases: List<OperatorCaseItem>) : QueueUiState()
    data class Error(val message: String) : QueueUiState()
}

class OperatorQueueViewModel(
    private val repository: VerificationRepository = VerificationRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<QueueUiState>(QueueUiState.Loading)
    val uiState: StateFlow<QueueUiState> = _uiState.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _filterStatus = MutableStateFlow("ALL")
    val filterStatus: StateFlow<String> = _filterStatus.asStateFlow()

    init {
        loadCases()
    }

    fun onSearchChanged(query: String) {
        _searchQuery.value = query
        loadCases()
    }

    fun onStatusFilterChanged(status: String) {
        _filterStatus.value = status
        loadCases()
    }

    fun loadCases() {
        viewModelScope.launch {
            _uiState.value = QueueUiState.Loading
            val status = if (_filterStatus.value == "ALL") null else _filterStatus.value
            val search = _searchQuery.value.takeIf { it.isNotEmpty() }
            val result = repository.getCases(status = status, search = search)
            result.onSuccess {
                _uiState.value = QueueUiState.Success(it)
            }.onFailure {
                _uiState.value = QueueUiState.Error(it.localizedMessage ?: "Failed to load queue")
            }
        }
    }

    fun updateCaseStatus(caseId: String, status: String, notes: String? = null) {
        viewModelScope.launch {
            repository.updateCaseStatus(caseId, status, notes)
            loadCases()
        }
    }
}
