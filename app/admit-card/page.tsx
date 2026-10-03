"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdmitCardLayout from "@/components/AdmitCardLayout";
import PrintButton from "@/components/PrintButton";
import DobSelectPicker from "@/components/common/DobSelectPicker";
import { AdmitCardData } from "@/lib/admit-card-data";

export default function PublicAdmitCardLookupPage() {
  const [registrationNo, setRegistrationNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [year, setYear] = useState("1st Year");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [admitCard, setAdmitCard] = useState<AdmitCardData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedReg = registrationNo.trim();
    const trimmedDob = dateOfBirth.trim();

    if (!trimmedReg || !trimmedDob) {
      setError("Please provide both Enrollment Number and Date of Birth.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/public/admit-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollment_no: trimmedReg,
          registration_no: trimmedReg,
          date_of_birth: trimmedDob,
          year,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Admit card could not be found. Please check your details."
        );
        return;
      }

      if (result.admitCard) {
        setAdmitCard(result.admitCard);
      } else {
        setError("Unexpected response received. Please try again.");
      }
    } catch (err) {
      console.error("Admit card lookup error:", err);
      setError("Network connection issue. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAgain = () => {
    setAdmitCard(null);
    setError(null);
    setRegistrationNo("");
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
        {admitCard ? (
          /* Success View: Admit Card Rendered */
          <div className="w-full max-w-[794px] mx-auto relative">
            {/* Floating Print Button for student */}
            <div className="fixed top-20 right-6 z-50 no-print print:hidden">
              <PrintButton label="Print / Download PDF" />
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
                <span>Search Another Admit Card</span>
              </button>

              <span className="text-xs text-slate-500 font-medium">
                Candidate: <strong className="text-slate-800 uppercase">{admitCard.candidate_name}</strong>
              </span>
            </div>

            {/* The Rendered Admit Card */}
            <AdmitCardLayout admitCard={admitCard} />

            {/* Bottom Reset Button for mobile */}
            <div className="mt-6 text-center no-print print:hidden">
              <button
                type="button"
                onClick={handleSearchAgain}
                className="text-xs font-semibold text-[#143E66] hover:underline"
              >
                ← Look up another registration
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
                  Admit Card Download
                </h1>
                <p className="text-xs text-slate-200 mt-1">
                  प्रवेश पत्र डाउनलोड • Paramedical Examinations
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

                {/* Enrollment Number Field */}
                <div>
                  <label
                    htmlFor="enrollment_no"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Enrollment Number / नामांकन संख्या <span className="text-red-500">*</span>
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
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                        />
                      </svg>
                    </div>
                    <input
                      id="enrollment_no"
                      type="text"
                      required
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                      placeholder="e.g. IPMB012401"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#143E66] focus:border-transparent transition-all uppercase"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter your enrollment number (e.g. IPMB...).
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
                    idPrefix="admit_card_dob"
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
                      <span>Searching Admit Card...</span>
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
                      <span>Find My Admit Card</span>
                    </>
                  )}
                </button>
              </form>

              {/* Help & Support Note */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center text-xs text-slate-500">
                Facing issues with your admit card? Contact your affiliated college or institute administration.
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
