"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SearchFilterOption {
  label: string;
  value: string;
}

export interface SearchBarFilter {
  key: string;
  label: string;
  options: SearchFilterOption[];
}

export interface SearchBarProps {
  value?: string;
  placeholder?: string;
  debounceMs?: number;
  onSearch?: (query: string) => void;
  onChange?: (query: string) => void; // Alias for onSearch
  filters?: SearchBarFilter[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (filterKey: string, value: string) => void;
  className?: string;
}

export function SearchBar({
  value: initialValue = "",
  placeholder = "Search by ID, name, mobile, reference...",
  debounceMs = 400,
  onSearch,
  onChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  className,
}: SearchBarProps) {
  const handleSearch = onSearch || onChange || (() => {});
  const handleSearchRef = useRef(handleSearch);
  const [query, setQuery] = useState(initialValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    handleSearchRef.current = handleSearch;
  });

  // Sync state if external initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounced effect for search query with stable callback ref
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      handleSearchRef.current(query);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, debounceMs]);

  const handleClear = () => {
    setQuery("");
    handleSearchRef.current("");
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full",
        className
      )}
    >
      <div className="relative flex-1">
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="input-field pl-9 pr-9 text-sm"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <div key={filter.key} className="relative min-w-[130px]">
              <select
                value={activeFilters[filter.key] || ""}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className="select-field text-xs py-2 pr-7 pl-3 h-[42px]"
              >
                <option value="">All {filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const SearchBarMemo = React.memo(SearchBar);
export default SearchBarMemo;
