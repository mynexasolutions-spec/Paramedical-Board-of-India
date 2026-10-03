import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getResultData, isCourseResultsReleased } from "@/lib/result-data";

function normalizeDob(dobInput: string): string {
  if (!dobInput) return "";
  const trimmed = dobInput.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const matchDmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (matchDmy) {
    const day = matchDmy[1].padStart(2, "0");
    const month = matchDmy[2].padStart(2, "0");
    const year = matchDmy[3];
    return `${year}-${month}-${day}`;
  }
  const matchYmd = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (matchYmd) {
    const year = matchYmd[1];
    const month = matchYmd[2].padStart(2, "0");
    const day = matchYmd[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roll_no, date_of_birth, year } = body;

  if (!roll_no || !date_of_birth) {
    return NextResponse.json(
      { error: "Roll Number and Date of Birth are both required" },
      { status: 400 }
    );
  }

  const normalizedDob = normalizeDob(date_of_birth);

  const { data: regList, error: regError } = await supabaseAdmin
    .from("student_registrations")
    .select("id, course, roll_no, roll_no_2nd_year, exam_session_id, exam_session_id_2nd_year, result_published_at, result_published_2nd_year_at")
    .or(`roll_no.eq.${roll_no},roll_no_2nd_year.eq.${roll_no}`)
    .eq("dob", normalizedDob);

  if (regError || !regList || regList.length === 0) {
    return NextResponse.json(
      { error: "Result not available. Please check your Roll Number and Date of Birth." },
      { status: 404 }
    );
  }

  const reg = regList[0];

  // Determine which field the roll number actually matched
  let matchedYear = null;
  if (reg.roll_no && reg.roll_no.trim() === roll_no.trim()) {
    matchedYear = 1;
  } else if (reg.roll_no_2nd_year && reg.roll_no_2nd_year.trim() === roll_no.trim()) {
    matchedYear = 2;
  }

  // Determine which year the student selected in the form
  const requestedYear =
    year && (year.includes("2") || year.toLowerCase().includes("2nd")) ? 2 : 1;

  // Reject if the roll number doesn't belong to the selected examination year
  if (matchedYear === null || matchedYear !== requestedYear) {
    return NextResponse.json(
      {
        error:
          "Result not available. Please check your Roll Number, Date of Birth, and selected Examination Year.",
      },
      { status: 404 }
    );
  }

  const yrNum = matchedYear;

  const targetSessionId = yrNum === 2 ? (reg.exam_session_id_2nd_year || reg.exam_session_id) : reg.exam_session_id;

  const manuallyPublished = yrNum === 2
    ? !!(reg as any).result_published_2nd_year_at
    : !!(reg as any).result_published_at;

  if (!manuallyPublished) {
    const released = await isCourseResultsReleased(reg.course, targetSessionId ?? undefined);
    if (!released) {
      return NextResponse.json(
        { error: "Result for this course has not been published yet. Please check back later or contact your institution." },
        { status: 400 }
      );
    }
  }

  const { data, error } = await getResultData(reg.id, yrNum);

  if (error || !data) {
    return NextResponse.json(
      { error: error || "Result not available. Please check your Roll Number and Date of Birth." },
      { status: 400 }
    );
  }

  return NextResponse.json({ result: data });
}
