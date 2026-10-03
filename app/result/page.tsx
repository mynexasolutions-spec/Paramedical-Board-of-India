"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ResultLayout from "@/components/ResultLayout";
import PrintButton from "@/components/PrintButton";
import DobSelectPicker from "@/components/common/DobSelectPicker";
import { ResultData } from "@/lib/result-data";

export default function PublicResultLookupPage() {
  const [rollNo, setRollNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [year, setYear] = useState("1st Year");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedRoll = rollNo.trim().toUpperCase();
    const trimmedDob = dateOfBirth.trim();

    if (!trimmedRoll || !trimmedDob) {
      setError("Please provide both Roll Number and Date of Birth.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/public/result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roll_no: trimmedRoll,
          date_of_birth: trimmedDob,
          year,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Result not available. Please check your Roll Number and Date of Birth."
        );
        return;
      }

      if (data.result) {
        setResult(data.result);
      } else {
        setError("Unexpected response received. Please try again.");
      }
    } catch (err) {
      console.error("Result lookup error:", err);
      setError("Network connection issue. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAgain = () => {
    setResult(null);
    setError(null);
    setRollNo("");
    setDateOfBirth("");
    setYear("1st Year");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Public Navbar (Hidden when printing) */}
      <div className="no-print print:hidden">
        <Navbar />
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 print:p-0 print:m-0 print:bg-white print:justify-start print:pt-0">
        {result ? (
          /* Success View: Result Marksheet Rendered */
          <div className="w-full max-w-[794px] mx-auto relative">
            {/* Floating Print Button for student */}
            <div className="fixed top-20 right-6 z-50 no-print print:hidden">
              <PrintButton label="Print / Download Marksheet" />
            </div>

            {/* Top Bar with Reset / Search Again */}
            <div className="mb-4 flex items-center justify-between no-print print:hidden">
              <button
                type="button"
                onClick={handleSearchAgain}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-[#143E66] border border-slate-300 rounded-md text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Search Another Result / दूसरा परिणाम देखें</span>
              </button>

              <span className="text-xs text-slate-500 font-medium">
                Candidate: <strong className="text-slate-800 uppercase">{result.candidate_name}</strong>
              </span>
            </div>

            {/* The Rendered Marksheet */}
            <ResultLayout result={result} />

            {/* Bottom Reset Button for mobile */}
            <div className="mt-6 text-center no-print print:hidden">
              <button
                type="button"
                onClick={handleSearchAgain}
                className="text-xs font-semibold text-[#143E66] hover:underline cursor-pointer"
              >
                ← Look up another result / नया परिणाम खोजें
              </button>
            </div>
          </div>
        ) : (
          /* Lookup Form View */
          <div className="w-full max-w-md mx-auto no-print">
            {/* Card Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header Banner */}
              <div className="bg-[#143E66] text-white px-6 py-6 border-b-4 border-[#D4AF37] text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#F1E4C3] mb-2 border border-white/15">
                  <span className="w-2 h-2 rounded-full bg-[#E5C158] animate-pulse" />
                  Examination Division
                </div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Student Result Portal
                </h1>
                <p className="text-xs text-slate-200 mt-1">
                  परीक्षा परिणाम • Statement of Marks
                </p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                {/* Inline Error Alert */}
                {error && (
                  <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r text-xs text-red-800 font-medium flex items-start gap-2.5 animate-fadeIn">
                    <svg
                      className="w-4 h-4 text-red-600 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                {/* Roll Number Field */}
                <div>
                  <label
                    htmlFor="roll_no"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Roll Number / रोल नंबर <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <input
                      id="roll_no"
                      type="text"
                      required
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                      placeholder="e.g. 24001 or IPB202401"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#143E66] focus:border-transparent transition-all uppercase"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter the Roll Number mentioned on your Admit Card.
                  </p>
                </div>

                {/* Date of Birth Field */}
                <div>
                  <label
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Date of Birth / जन्म तिथि <span className="text-red-500">*</span>
                  </label>
                  <DobSelectPicker
                    idPrefix="result_dob"
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select your exact Day, Month and Year of birth as registered.
                  </p>
                </div>

                {/* Examination Year / Part Field */}
                <div>
                  <label
                    htmlFor="examination_year"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Examination Year / परीक्षा वर्ष <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                        />
                      </svg>
                    </div>
                    <select
                      id="examination_year"
                      required
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#143E66] focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="1st Year">1st Year / प्रथम वर्ष</option>
                      <option value="2nd Year">2nd Year / द्वितीय वर्ष</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select your examination year (1st Year or 2nd Year).
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#143E66] hover:bg-[#0c2a47] active:bg-[#081f34] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Searching Result...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 text-[#D4AF37]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <span>Check Result / परिणाम देखें</span>
                    </>
                  )}
                </button>
              </form>

              {/* Help & Support Note */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center text-xs text-slate-500">
                Facing issues finding your result? Contact your affiliated examination center or college administration.
              </div>
            </div>

            {/* Back to Home Link */}
            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-[#143E66] font-medium transition-colors"
              >
                ← Back to Homepage
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Public Footer (Hidden when printing) */}
      <div className="no-print print:hidden">
        <Footer />
      </div>
    </div>
  );
}
