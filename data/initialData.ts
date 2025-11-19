import { School, Student, Subject, SchoolPageVisibility } from '../types';
import { MarksMap } from '../context/DataContext';

export const MOCK_SCHOOLS_INITIAL: School[] = [
  {
    id: 1, iemisCode: `720160001`, logoUrl: `https://picsum.photos/seed/1/100`, name: 'SHREE GANESH SECONDARY SCHOOL BHURSA',
    municipality: 'BELDANDI RURAL MUNICIPALITY - 5, KANCHANPUR', estd: `2017 BS`, preparedBy: 'Man Singh Rana',
    checkedBy: 'Narayan Rana', headTeacherName: 'JANAK BAHADUR THAPA', headTeacherContact: '9827792360',
    email: 'ganesh.secondary@email.com', status: 'Active', subscriptionPlan: 'Pro',
  },
  {
    id: 2, iemisCode: `720160002`, logoUrl: `https://picsum.photos/seed/2/100`, name: 'SHREE SIDDHANATH SECONDARY SCHOOL',
    municipality: 'BHIMDATTA MUNICIPALITY - 4, KANCHANPUR', estd: `2025 BS`, preparedBy: 'Kamal Adhikari',
    checkedBy: 'Bimala Shrestha', headTeacherName: 'HARI PRASAD JOSHI', headTeacherContact: '9848512345',
    email: 'siddhanath.school@email.com', status: 'Active', subscriptionPlan: 'Pro',
  },
  {
    id: 3, iemisCode: `720160003`, logoUrl: `https://picsum.photos/seed/3/100`, name: 'RADIANT SECONDARY SCHOOL',
    municipality: 'DHANGADHI - 5, KAILALI', estd: `2055 BS`, preparedBy: 'Sunita Chaudhary',
    checkedBy: 'Rajesh Singh', headTeacherName: 'DURGA DEVI POUDEL', headTeacherContact: '9858754321',
    email: 'radiant.school@email.com', status: 'Inactive', subscriptionPlan: 'Basic',
  },
  {
    id: 4, iemisCode: `720160004`, logoUrl: `https://picsum.photos/seed/4/100`, name: 'AISHWARYA VIDYA NIKETAN',
    municipality: 'DHANGADHI - 1, KAILALI', estd: `2045 BS`, preparedBy: 'Gita Pandey',
    checkedBy: 'Ramesh Singh', headTeacherName: 'GOPAL BAHADUR CHAND', headTeacherContact: '9868411223',
    email: 'aishwarya.vidya@email.com', status: 'Active', subscriptionPlan: 'Enterprise',
  },
  {
    id: 5, iemisCode: `720160005`, logoUrl: `https://picsum.photos/seed/5/100`, name: 'FLORIDA INTERNATIONAL BOARDING SCHOOL',
    municipality: 'ATTARIYA, KAILALI', estd: `2060 BS`, preparedBy: 'Sanjay Thapa',
    checkedBy: 'Pooja Bhatta', headTeacherName: 'BIKASH SHARMA', headTeacherContact: '9812345678',
    email: 'florida.international@email.com', status: 'Active', subscriptionPlan: 'Pro',
  },
  {
    id: 6, iemisCode: `720160006`, logoUrl: `https://picsum.photos/seed/6/100`, name: 'NAVODAYA PUBLIC SCHOOL',
    municipality: 'MAHENDRANAGAR, KANCHANPUR', estd: `2052 BS`, preparedBy: 'Anjali Karki',
    checkedBy: 'Prabin Joshi', headTeacherName: 'SURESH BOHARA', headTeacherContact: '9806412345',
    email: 'navodaya.public@email.com', status: 'Active', subscriptionPlan: 'Basic',
  },
  {
    id: 7, iemisCode: `720160007`, logoUrl: `https://picsum.photos/seed/7/100`, name: 'LITTLE BUDDHA ACADEMY',
    municipality: 'MAHENDRANAGAR, KANCHANPUR', estd: `2058 BS`, preparedBy: 'Rita Saud',
    checkedBy: 'Manish Adhikari', headTeacherName: 'SABINA KC', headTeacherContact: '9848765432',
    email: 'little.buddha@email.com', status: 'Inactive', subscriptionPlan: 'Basic',
  },
];

const firstNamesMale = ['Bikash', 'Suresh', 'Anish', 'Dipesh', 'Sagar', 'Prabin', 'Manish', 'Ramesh', 'Hari', 'Santosh'];
const firstNamesFemale = ['Anjali', 'Sabina', 'Pooja', 'Manisha', 'Sunita', 'Kopila', 'Bimala', 'Rita', 'Gita', 'Sarita'];
const lastNames = ['Thapa', 'Rana', 'Karki', 'Shrestha', 'Adhikari', 'Bhatta', 'Joshi', 'Bohara', 'Chand', 'Saud', 'KC', 'Poudel', 'Chaudhary', 'Singh', 'Sharma'];

export const MOCK_STUDENTS_INITIAL: Student[] = Array.from({ length: 50 }, (_, i) => {
    const gender = i % 2 === 0 ? 'Male' : 'Female';
    const firstName = gender === 'Male' ? firstNamesMale[i % firstNamesMale.length] : firstNamesFemale[i % firstNamesFemale.length];
    const lastName = lastNames[i % lastNames.length];
    const fatherFirstName = firstNamesMale[(i + 3) % firstNamesMale.length];
    const motherFirstName = firstNamesFemale[(i + 5) % firstNamesFemale.length];
    
    return {
        id: `S${1001 + i}`,
        school_id: (i % 5) + 1,
        name: `${firstName} ${lastName}`,
        dob: `2005-05-${(i % 28) + 1}`,
        gender,
        grade: `11`,
        roll_no: `${100 + i}`,
        photo_url: `https://picsum.photos/seed/student${i}/100`,
        created_at: new Date().toISOString(),
        year: 2080 + (i % 3),
        symbol_no: `016000${i+1}A`,
        alph: String.fromCharCode(65 + (i % 26)),
        registration_id: `7703500${i+1}`,
        dob_bs: `2062-02-${(i % 28) + 1}`,
        father_name: `${fatherFirstName} ${lastName}`,
        mother_name: `${motherFirstName} ${lastName}`,
        mobile_no: `98000000${i.toString().padStart(2, '0')}`,
    };
});

const MOCK_SUBJECTS_G11_INITIAL: Omit<Subject, 'grade'>[] = [
    { 
    id: 1, name: 'Com.Nepali', 
    theory: { subCode: '11', credit: 2.25, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '12', credit: 0.75, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 2, name: 'Com.English', 
    theory: { subCode: '31', credit: 3, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '32', credit: 1, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 3, name: 'Com.Social Studies & Life Skill', 
    theory: { subCode: '51', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '52', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 4, name: 'ACCOUNTIONG', 
    theory: { subCode: '1031', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '1032', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 5, name: 'CHILD DEV. & LEARNING', 
    theory: { subCode: '1151', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '1152', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 6, name: 'BUSINESS STUDIES', 
    theory: { subCode: '2151', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '2152', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 7, name: 'EDUCATION & DEVELOPMENT', 
    theory: { subCode: '2031', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '2032', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 8, name: 'POPULATION', 
    theory: { subCode: '2231', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '2232', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 9, name: 'ECONOMICS', 
    theory: { subCode: '3031', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '3032', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 10, name: 'NEPALI', 
    theory: { subCode: '3311', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '3312', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 11, name: 'HEALTH & PHYSICAL EDUCATION', 
    theory: { subCode: '4431', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '4432', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 12, name: 'English', 
    theory: { subCode: '3331', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '3332', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 13, name: 'Psychology', 
    theory: { subCode: '1191', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '1192', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 14, name: 'Vocal/Instrument', 
    theory: { subCode: '3131', credit: 2.5, fullMarks: 50, passMarks: 18 },
    internal: { subCode: '3132', credit: 2.5, fullMarks: 50, passMarks: 20 }
  },
  { 
    id: 15, name: 'Singing', 
    theory: { subCode: '4251', credit: 2.5, fullMarks: 50, passMarks: 18 },
    internal: { subCode: '4252', credit: 2.5, fullMarks: 50, passMarks: 20 }
  },
  { 
    id: 16, name: 'Film and Dacumentry', 
    theory: { subCode: '3271', credit: 2.5, fullMarks: 50, passMarks: 18 },
    internal: { subCode: '3272', credit: 2.5, fullMarks: 50, passMarks: 20 }
  },
];

const MOCK_SUBJECTS_G12_INITIAL: Omit<Subject, 'grade'>[] = [
  { 
    id: 101, name: 'Com.Nepali II', 
    theory: { subCode: '11-2', credit: 2.25, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '12-2', credit: 0.75, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 102, name: 'Com.English II', 
    theory: { subCode: '31-2', credit: 3, fullMarks: 75, passMarks: 27 },
    internal: { subCode: '32-2', credit: 1, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 103, name: 'Physics II', 
    theory: { subCode: 'PHY201', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: 'PHY202', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 104, name: 'Chemistry II', 
    theory: { subCode: 'CHM201', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: 'CHM202', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
  { 
    id: 105, name: 'Mathematics II', 
    theory: { subCode: 'MTH201', credit: 3.75, fullMarks: 75, passMarks: 27 },
    internal: { subCode: 'MTH202', credit: 1.25, fullMarks: 25, passMarks: 10 }
  },
];

export const MOCK_SUBJECTS_INITIAL: Subject[] = [
    ...MOCK_SUBJECTS_G11_INITIAL.map(s => ({ ...s, grade: 11 as const })),
    ...MOCK_SUBJECTS_G12_INITIAL.map(s => ({ ...s, grade: 12 as const }))
];

export const MOCK_ASSIGNMENTS_INITIAL: { [studentId: string]: number[] } = {
    'S1001': [1, 2, 3, 10, 13, 9],
    'S1002': [1, 2, 3, 4, 6, 11],
    'S1003': [1, 2, 3, 12, 14, 15],
    'S1006': [1, 2, 3, 8, 9, 10],
    'S1004': [1, 2, 3, 5, 7, 11],
    'S1005': [1, 2, 3, 4, 9, 12],
    'S1026': [1, 2, 3, 5, 8, 11],
};

export const MOCK_EXTRA_CREDIT_ASSIGNMENTS_INITIAL: { [studentId: string]: number | null } = {
    'S1001': 16, // Film and Dacumentry
    'S1026': 15, // Singing
};

export const MOCK_MARKS_INITIAL: MarksMap = {
    'S1001': {
        '1': { internal: 22, theory: 65 },
        '2': { internal: 20, theory: 58 },
    },
    'S1026': {
        '1': { internal: 24, theory: 70 },
        '3': { internal: 21, theory: 62 },
        isAbsent: false,
    }
};

export const MOCK_GRADES_INITIAL: {
  [studentId: string]: {
    gpa: number;
    subjects: {
      [subjectId: number]: { in: string; th: string; in_gp: number; th_gp: number; };
    };
  };
} = {
  'S1026': {
    gpa: 2.28,
    subjects: { 
        1: { th: 'C', th_gp: 2.0, in: 'A', in_gp: 3.6 },
        2: { th: 'D', th_gp: 1.6, in: 'B', in_gp: 2.8 },
        3: { th: 'D', th_gp: 1.6, in: 'A', in_gp: 3.6 },
        5: { th: 'D', th_gp: 1.6, in: 'B', in_gp: 2.8 },
        8: { th: 'B', th_gp: 2.8, in: 'B+', in_gp: 3.2 },
        11: { th: 'C+', th_gp: 2.4, in: 'B', in_gp: 2.8 },
    }
  },
  'S1001': { 
    gpa: 3.15,
    subjects: { 1: { th: 'B+', th_gp: 3.2, in: 'A+', in_gp: 4.0 }, 2: { th: 'B', th_gp: 2.8, in: 'A', in_gp: 3.6 }, 3: { th: 'A', th_gp: 3.6, in: 'A', in_gp: 3.6 } }
  },
};

export const MOCK_SCHOOL_PAGE_VISIBILITY_INITIAL: SchoolPageVisibility = {
  dashboard: 'read-write',
  students: 'read-write',
  subjects: 'read-write',
  assignSubjects: 'read-write',
  marksEntry: 'read-write',
  gradeSheet: 'read-write',
  markWiseLedger: 'read-write',
  gradeWiseLedger: 'read-write',
  settings: 'read-write',
};