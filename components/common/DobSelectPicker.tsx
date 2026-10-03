"use client";

import React, { useState, useEffect, useMemo } from "react";

interface DobSelectPickerProps {
  value: string; // ISO format "YYYY-MM-DD" or ""
  onChange: (isoDate: string) => void;
  disabled?: boolean;
  required?: boolean;
  idPrefix?: string;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  { value: "01", label: "Jan (01)" },
  { value: "02", label: "Feb (02)" },
  { value: "03", label: "Mar (03)" },
  { value: "04", label: "Apr (04)" },
  { value: "05", label: "May (05)" },
  { value: "06", label: "Jun (06)" },
  { value: "07", label: "Jul (07)" },
  { value: "08", label: "Aug (08)" },
  { value: "09", label: "Sep (09)" },
  { value: "10", label: "Oct (10)" },
  { value: "11", label: "Nov (11)" },
  { value: "12", label: "Dec (12)" },
];

export default function DobSelectPicker({
  value,
  onChange,
  disabled = false,
  required = false,
  idPrefix = "dob",
  minYear = 1950,
  maxYear,
}: DobSelectPickerProps) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Sync state if external value is reset (e.g. on search reset) or initialized
  useEffect(() => {
    if (!value) {
      setDay("");
      setMonth("");
      setYear("");
    } else {
      const parts = value.split("-");
      if (parts.length === 3 && parts[0].length === 4) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    }
  }, [value]);

  // Generate Year list dynamically from current year down to minYear (1950)
  const years = useMemo(() => {
    const list: string[] = [];
    const currentMax = maxYear ?? new Date().getFullYear();
    const currentMin = minYear ?? 1950;
    for (let y = currentMax; y >= currentMin; y--) {
      list.push(y.toString());
    }
    return list;
  }, [maxYear, minYear]);

  // Compute number of days in selected month & year
  const daysInMonth = useMemo(() => {
    if (!month) return 31;
    const m = parseInt(month, 10);
    if ([4, 6, 9, 11].includes(m)) return 30;
    if (m === 2) {
      if (year) {
        const y = parseInt(year, 10);
        const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
        return isLeap ? 29 : 28;
      }
      return 29;
    }
    return 31;
  }, [month, year]);

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      return (i + 1).toString().padStart(2, "0");
    });
  }, [daysInMonth]);

  const updateParent = (d: string, m: string, y: string) => {
    if (d && m && y) {
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange("");
    }
  };

  const handleDayChange = (newDay: string) => {
    setDay(newDay);
    updateParent(newDay, month, year);
  };

  const handleMonthChange = (newMonth: string) => {
    let adjustedDay = day;
    if (adjustedDay && newMonth) {
      const m = parseInt(newMonth, 10);
      let maxD = 31;
      if ([4, 6, 9, 11].includes(m)) maxD = 30;
      else if (m === 2) {
        const y = year ? parseInt(year, 10) : 2000;
        const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
        maxD = isLeap ? 29 : 28;
      }
      if (parseInt(adjustedDay, 10) > maxD) {
        adjustedDay = maxD.toString().padStart(2, "0");
        setDay(adjustedDay);
      }
    }
    setMonth(newMonth);
    updateParent(adjustedDay, newMonth, year);
  };

  const handleYearChange = (newYear: string) => {
    let adjustedDay = day;
    if (adjustedDay && month === "02" && newYear) {
      const y = parseInt(newYear, 10);
      const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      if (!isLeap && adjustedDay === "29") {
        adjustedDay = "28";
        setDay("28");
      }
    }
    setYear(newYear);
    updateParent(adjustedDay, month, newYear);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* 1. Day Dropdown */}
      <div className="relative">
        <select
          id={`${idPrefix}_day`}
          aria-label="Birth Day"
          required={required}
          disabled={disabled}
          value={day}
          onChange={(e) => handleDayChange(e.target.value)}
          className="w-full pl-2.5 pr-6 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#143E66] focus:border-transparent transition-all cursor-pointer appearance-none"
        >
          <option value="">Day / दिन</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 2. Month Dropdown */}
      <div className="relative">
        <select
          id={`${idPrefix}_month`}
          aria-label="Birth Month"
          required={required}
          disabled={disabled}
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="w-full pl-2.5 pr-6 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#143E66] focus:border-transparent transition-all cursor-pointer appearance-none"
        >
          <option value="">Month / माह</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 3. Year Dropdown */}
      <div className="relative">
        <select
          id={`${idPrefix}_year`}
          aria-label="Birth Year"
          required={required}
          disabled={disabled}
          value={year}
          onChange={(e) => handleYearChange(e.target.value)}
          className="w-full pl-2.5 pr-6 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#143E66] focus:border-transparent transition-all cursor-pointer appearance-none"
        >
          <option value="">Year / वर्ष</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
