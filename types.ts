
export interface School {
  id: number;
  iemisCode: string;
  logoUrl?: string;
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

export interface Subject {
  id: number;
  name: string;
  grade: 11 | 12;
  theory: {
    subCode: string;
    credit: number;
    fullMarks: number;
    passMarks: number;
  };
  internal: {
    subCode: string;
    credit: number;
    fullMarks: number;
    passMarks: number;
  };
}

export interface Student {
  id: string; // Student ID
  school_id: number;
  name: string; // Full Name
  dob: string; // Dob Ad
  gender: 'Male' | 'Female' | 'Other';
  grade: string; // Class
  roll_no: string;
  photo_url?: string;
  created_at: string;
  // New fields
  year: number;
  symbol_no: string;
  alph?: string;
  registration_id: string;
  dob_bs: string;
  father_name: string;
  mother_name: string;
  mobile_no: string;
}

export interface Mark {
  // FIX: subject_id is a string key in the maps.
  subject_id: string;
  theory_obtained: number;
  practical_obtained: number;
}

export interface StudentResult {
  student: Student;
  marks: Array<{
    subject: Subject;
    theory_obtained: number;
    practical_obtained: number;
    total_obtained: number;
    grade: string;
    grade_point: number;
  }>;
  gpa: number;
  overall_grade: string;
  remarks: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export type PagePermission = 'read-write' | 'read-only' | 'hidden';

export interface SchoolPageVisibility {
  dashboard: PagePermission;
  students: PagePermission;
  subjects: PagePermission;
  assignSubjects: PagePermission;
  marksEntry: PagePermission;
  gradeSheet: PagePermission;
  markWiseLedger: PagePermission;
  gradeWiseLedger: PagePermission;
  settings: PagePermission;
}

// User interface for frontend
export interface User {
  id: number;
  iemis_code: string;
  email: string | null;
  role: 'admin' | 'school';
  school_id: number | null;
  created_at: string;
  updated_at: string;
}
