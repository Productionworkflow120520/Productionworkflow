"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type DatePreset = "today" | "yesterday" | "last7" | "last30" | "custom";

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  preset?: DatePreset;
}

export interface DateFilterProps {
  value?: DateRange | string;
  onChange: ((range: DateRange) => void) | ((value: string) => void);
  className?: string;
}

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const resolvedPreset: DatePreset =
    typeof value === "string"
      ? (value as DatePreset) || "today"
      : value?.preset || "today";
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>(resolvedPreset);
  const [startDate, setStartDate] = useState(
    typeof value === "object" ? value?.startDate || getTodayDate() : getTodayDate()
  );
  const [endDate, setEndDate] = useState(
    typeof value === "object" ? value?.endDate || getTodayDate() : getTodayDate()
  );

  function formatDateStr(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getTodayDate(): string {
    return formatDateStr(new Date());
  }

  const handlePresetClick = (preset: DatePreset) => {
    setSelectedPreset(preset);
    const now = new Date();

    let start = "";
    let end = formatDateStr(now);

    if (preset === "today") {
      start = end;
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      start = formatDateStr(y);
      end = start;
    } else if (preset === "last7") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      start = formatDateStr(d);
    } else if (preset === "last30") {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      start = formatDateStr(d);
    } else if (preset === "custom") {
      return;
    }

    setStartDate(start);
    setEndDate(end);
    (onChange as (range: DateRange) => void)({ startDate: start, endDate: end, preset });
  };

  const handleCustomApply = () => {
    if (startDate && endDate) {
      (onChange as (range: DateRange) => void)({ startDate, endDate, preset: "custom" });
    }
  };

  const presets: { id: DatePreset; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "last7", label: "Last 7 Days" },
    { id: "last30", label: "Last 30 Days" },
    { id: "custom", label: "Custom" },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Preset Pills */}
      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetClick(preset.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              selectedPreset === preset.id
                ? "bg-navy-500 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Pickers */}
      {selectedPreset === "custom" && (
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm animate-in fade-in">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-navy-500 text-gray-700"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-navy-500 text-gray-700"
          />
          <button
            type="button"
            onClick={handleCustomApply}
            className="text-xs bg-navy-500 hover:bg-navy-600 text-white px-2.5 py-1 rounded font-medium transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

export default DateFilter;
