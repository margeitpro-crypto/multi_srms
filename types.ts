// Type definitions for the Multi-School Result Management System

// Student interface for frontend
export interface Student {
  id: string; // student_system_id from backend
  school_id: number;
  name: string;
  dob: string; // Date of Birth (AD) in YYYY-MM-DD format
  gender: 'Male' | 'Female' | 'Other';
  grade: string;
  roll_no: string;
  photo_url: string;
  created_at: string;
  year: number; // academic_year
  symbol_no: string;
  alph: string;
  registration_id: string;
  dob_bs: string; // Date of Birth (BS)
  father_name: string;
  mother_name: string;
  mobile_no: string;
}

// Subject interface for frontend
export interface Subject {
  id: number;
  name: string;
  grade: number;
  theory_sub_code: string;
  theory_credit: number;
  theory_full_marks: number;
  theory_pass_marks: number;
  internal_sub_code: string;
  internal_credit: number;
  internal_full_marks: number;
  internal_pass_marks: number;
  created_at: string;
  updated_at: string;
}

// StudentSubjectAssignment interface for frontend
export interface StudentSubjectAssignment {
  student_id: number;
  subject_id: number;
  academic_year: number;
  created_at: string;
}

// StudentMark interface for frontend
export interface StudentMark {
  id: number;
  student_id: number;
  subject_id: number;
  academic_year: number;
  theory_obtained: number;
  practical_obtained: number;
  is_absent: boolean;
  created_at: string;
  updated_at: string;
}

// School interface for frontend
export interface School {
  id: number;
  iemisCode: string;
  logoUrl: string;
  name: string;
  municipality: string;
  estd: string;
  preparedBy: string;
  checkedBy: string;
  headTeacherName: string;
  headTeacherContact: string;
  email: string;
  status: 'Active' | 'Inactive';
  subscriptionPlan: 'Basic' | 'Pro' | 'Enterprise';
}

// User interface for frontend
export interface User {
  id: number;
  email: string | null;
  role: 'admin' | 'school';
  school_id: number | null;
  created_at: string;
  updated_at: string;
}