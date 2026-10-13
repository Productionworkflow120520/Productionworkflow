package com.paymatrix.operatorverification.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.paymatrix.operatorverification.data.model.RechargePlanItem
import com.paymatrix.operatorverification.data.repository.RechargeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class PlansUiState {
    object Loading : PlansUiState()
    data class Success(val plans: List<RechargePlanItem>) : PlansUiState()
    data class Error(val message: String) : PlansUiState()
}

class ViewPlansViewModel(
    private val repository: RechargeRepository = RechargeRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<PlansUiState>(PlansUiState.Loading)
    val uiState: StateFlow<PlansUiState> = _uiState.asStateFlow()

    private val _rawPlans = MutableStateFlow<List<RechargePlanItem>>(emptyList())

    private val _selectedCategory = MutableStateFlow("ALL")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedPlan = MutableStateFlow<RechargePlanItem?>(null)
    val selectedPlan: StateFlow<RechargePlanItem?> = _selectedPlan.asStateFlow()

    fun loadMobilePlans(operator: String, circle: String = "DELHI") {
        viewModelScope.launch {
            _uiState.value = PlansUiState.Loading
            val result = repository.getMobilePlans(operator, circle)
            result.onSuccess {
                _rawPlans.value = it
                applyFilters()
            }.onFailure {
                _uiState.value = PlansUiState.Error(it.localizedMessage ?: "Failed to retrieve plans")
            }
        }
    }

    fun loadDthPlans(operator: String) {
        viewModelScope.launch {
            _uiState.value = PlansUiState.Loading
            val result = repository.getDthPlans(operator)
            result.onSuccess {
                _rawPlans.value = it
                applyFilters()
            }.onFailure {
                _uiState.value = PlansUiState.Error(it.localizedMessage ?: "Failed to retrieve DTH plans")
            }
        }
    }

    fun onCategorySelected(category: String) {
        _selectedCategory.value = category
        applyFilters()
    }

    fun onSearchChanged(query: String) {
        _searchQuery.value = query
        applyFilters()
    }

    fun onPlanSelected(plan: RechargePlanItem) {
        _selectedPlan.value = plan
    }

    private fun applyFilters() {
        val cat = _selectedCategory.value
        val query = _searchQuery.value.trim().lowercase()

        val filtered = _rawPlans.value.filter { plan ->
            val matchCategory = if (cat == "ALL") true else plan.category.equals(cat, ignoreCase = true)
            val matchQuery = if (query.isEmpty()) {
                true
            } else {
                plan.amount.toString().contains(query) ||
                plan.description.lowercase().contains(query) ||
                (plan.dataAllowance?.lowercase()?.contains(query) == true) ||
                plan.validity.lowercase().contains(query)
            }
            matchCategory && matchQuery
        }

        _uiState.value = PlansUiState.Success(filtered)
    }
}
