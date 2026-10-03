import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdmitCardData } from "@/lib/admit-card-data";

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
  const enrollment_no = (body.enrollment_no || body.registration_no || "").trim();
  const { date_of_birth, year } = body;

  if (!enrollment_no || !date_of_birth) {
    return NextResponse.json(
      { error: "Enrollment Number and Date of Birth are both required" },
      { status: 400 }
    );
  }

  const normalizedDob = normalizeDob(date_of_birth);
  const isYear2 = year && (year.includes("2") || year.toLowerCase().includes("2nd"));
  const yrNum = isYear2 ? 2 : 1;

  const { data: reg, error: regError } = await supabaseAdmin
    .from("student_registrations")
    .select("id, exam_session_id, exam_session_id_2nd_year, roll_no, roll_no_2nd_year, admit_card_generated_at, admit_card_2nd_year_generated_at")
    .eq("enrollment_no", enrollment_no)
    .eq("dob", normalizedDob)
    .maybeSingle();

  if (regError || !reg) {
    return NextResponse.json(
      { error: "Invalid enrollment number or date of birth" },
      { status: 404 }
    );
  }

  if (yrNum === 2) {
    if (!reg.exam_session_id_2nd_year || !reg.roll_no_2nd_year || !reg.admit_card_2nd_year_generated_at) {
      return NextResponse.json(
        { error: "Admit card for 2nd Year is not available yet. Please contact your college or examination center." },
        { status: 400 }
      );
    }
  } else {
    if (!reg.exam_session_id || !reg.roll_no || !reg.admit_card_generated_at) {
      return NextResponse.json(
        { error: "Admit card for 1st Year is not available yet. Please contact your college or examination center." },
        { status: 400 }
      );
    }
  }

  const { data, error } = await getAdmitCardData(reg.id, yrNum);

  if (error || !data) {
    return NextResponse.json(
      { error: error || "Admit card is not available yet. Please contact your college." },
      { status: 400 }
    );
  }

  return NextResponse.json({ admitCard: data });
}

