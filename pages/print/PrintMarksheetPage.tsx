import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Button from '../../components/Button';
import { PrinterIcon } from '../../components/icons/PrinterIcon';
import { NebLogo } from '../../components/icons/NebLogo';
import { getFinalGradeFromWGPA, getGradeInfoFromPercentage, getSubjectRemarks } from '../../utils/gradeCalculator';
import { formatToYYMMDD } from '../../utils/nepaliDateConverter';

// Utility function to convert BS year to approximate AD year
const convertBsYearToAdYear = (bsYear: string): number => {
    // Based on the reference data: 2056 BS ≈ 2000 AD
    // So the difference is approximately 56 years
    const bsYearNum = parseInt(bsYear, 10);
    if (isNaN(bsYearNum)) return new Date().getFullYear();
    return bsYearNum - 56; // Approximate conversion
};

// Utility function to convert AD date to approximate BS date
const convertAdDateToBsDate = (adDate: Date): string => {
    // Reference: 2000-01-01 AD is 2056-09-15 BS
    const referenceAd = new Date(2000, 0, 1); // January 1, 2000
    const referenceBsYear = 2056;
    const referenceBsMonth = 9; // Poush (9th month)
    const referenceBsDay = 15;
    
    // Calculate the difference in days between the given date and reference date
    const timeDiff = adDate.getTime() - referenceAd.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    // Approximate conversion:
    // Add the days difference to the reference BS date
    // This is a simplified approximation and may not be perfectly accurate
    let bsYear = referenceBsYear;
    let bsMonth = referenceBsMonth;
    let bsDay = referenceBsDay + daysDiff;
    
    // Adjust for month overflow/underflow (simplified)
    // This is a rough approximation - in a real implementation, 
    // we would need the exact days in each BS month
    while (bsDay > 30) {
        bsDay -= 30;
        bsMonth++;
        if (bsMonth > 12) {
            bsMonth = 1;
            bsYear++;
        }
    }
    
    while (bsDay <= 0) {
        bsMonth--;
        if (bsMonth < 1) {
            bsMonth = 12;
            bsYear--;
        }
        bsDay += 30; // Approximation
    }
    
    return `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`;
};

// Utility function to format Nepali date from MM/DD/YYYY to YYYY-MM-DD
const formatNepaliDate = (dateStr: string): string => {
    if (!dateStr) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
    }
    
    // If it's in MM/DD/YYYY format, convert to YYYY-MM-DD
    if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [month, day, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateStr;
};

// Utility function to format A.D. date from ISO string to YY-MM-DD
const formatADDate = (isoDateStr: string): string => {
    if (!isoDateStr) return '';
    return formatToYYMMDD(isoDateStr);
};

// Utility function to format A.D. date from ISO string to YYYY-MM-DD
const formatADDateFull = (isoDateStr: string): string => {
    if (!isoDateStr) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (isoDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return isoDateStr;
    }
    
    // If it's in YY-MM-DD format, convert to YYYY-MM-DD
    if (isoDateStr.match(/^\d{2}-\d{2}-\d{2}$/)) {
        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100) * 100;
        const year = parseInt(isoDateStr.substring(0, 2), 10);
        // Assume dates are in the current century
        const fullYear = currentCentury + year;
        return `${fullYear}${isoDateStr.substring(2)}`;
    }
    
    // If it's an ISO string, extract the date part
    if (isoDateStr.includes('T')) {
        return isoDateStr.split('T')[0];
    }
    
    // Otherwise, try to parse as date and format
    try {
        const date = new Date(isoDateStr);
        if (!isNaN(date.getTime())) {
            const isoString = date.toISOString().split('T')[0];
            return isoString;
        }
    } catch (e) {
        // If parsing fails, return original string
    }
    
    return isoDateStr;
};

const PrintMarksheetPage: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { students: MOCK_ADMIN_STUDENTS, schools: MOCK_SCHOOLS, subjects: MOCK_SUBJECTS, assignments: MOCK_STUDENT_SUBJECT_ASSIGNMENTS, grades: MOCK_GRADES, extraCreditAssignments, marks: allMarks } = useData();

  const student = MOCK_ADMIN_STUDENTS.find(s => s.id === studentId);
  const school = student ? MOCK_SCHOOLS.find(s => s.id === student.school_id) : null;
  const assignedSubjectIds = student ? MOCK_STUDENT_SUBJECT_ASSIGNMENTS[student.id] || [] : [];
  const assignedSubjects = MOCK_SUBJECTS.filter(s => assignedSubjectIds.includes(s.id));
  const studentGrades = student ? MOCK_GRADES[student.id] : null;
  const extraCreditSubjectId = student ? extraCreditAssignments[student.id] : null;
  const extraCreditSubject = extraCreditSubjectId ? MOCK_SUBJECTS.find(s => s.id === extraCreditSubjectId) : null;

  if (!student || !school) {
    return <div className="p-8 text-center text-red-500">Student or School not found. Please check the student ID.</div>;
  }
  
  const results = assignedSubjects.map(subject => {
      const gradeInfo = studentGrades?.subjects[subject.id];
      let finalGrade = 'NG';
      let subject_wgpa = 0;
      if (gradeInfo && subject) {
          const th_wgp = gradeInfo.th_gp * subject.theory.credit;
          const in_wgp = gradeInfo.in_gp * subject.internal.credit;
          const total_credit = subject.theory.credit + subject.internal.credit;
          if (total_credit > 0) {
              subject_wgpa = (th_wgp + in_wgp) / total_credit;
              finalGrade = getFinalGradeFromWGPA(subject_wgpa);
          }
      }
      return { subject, gradeInfo, finalGrade };
  });

  let extraCreditFinalGrade = 'N/A';
  let extraCreditTheoryGrade = 'N/A';
  let extraCreditInternalGrade = 'N/A';
  let extraCreditTheoryGP: string | number = 'N/A';
  let extraCreditInternalGP: string | number = 'N/A';
  let extraCreditRemarks = '';

  if (extraCreditSubject && student) {
      const studentMarks = allMarks[student.id];
      const markData = studentMarks ? studentMarks[extraCreditSubject.id.toString()] : null;
      if (typeof markData === 'object' && markData !== null) {
          const markInfo = markData as { internal: number; theory: number };
          const theoryPercentage = extraCreditSubject.theory.fullMarks > 0 ? (markInfo.theory / extraCreditSubject.theory.fullMarks) * 100 : 0;
          const internalPercentage = extraCreditSubject.internal.fullMarks > 0 ? (markInfo.internal / extraCreditSubject.internal.fullMarks) * 100 : 0;

          const { point: th_gp, grade: th_grade } = getGradeInfoFromPercentage(theoryPercentage);
          const { point: in_gp, grade: in_grade } = getGradeInfoFromPercentage(internalPercentage);

          extraCreditTheoryGrade = th_grade;
          extraCreditInternalGrade = in_grade;
          extraCreditTheoryGP = th_gp;
          extraCreditInternalGP = in_gp;

          const totalCredit = extraCreditSubject.theory.credit + extraCreditSubject.internal.credit;
          if (totalCredit > 0) {
              const wgpa = (th_gp * extraCreditSubject.theory.credit + in_gp * extraCreditSubject.internal.credit) / totalCredit;
              extraCreditFinalGrade = getFinalGradeFromWGPA(wgpa);
              extraCreditRemarks = getSubjectRemarks(extraCreditFinalGrade);
          }
      }
  }

  const gradingSystem = [
    { sn: 1, achievement: '90 to 100', grade: 'A+', description: 'Outstanding', gpa: '4.0' },
    { sn: 2, achievement: '80 to below 90', grade: 'A', description: 'Excellent', gpa: '3.6' },
    { sn: 3, achievement: '70 to below 80', grade: 'B+', description: 'Very Good', gpa: '3.2' },
    { sn: 4, achievement: '60 to below 70', grade: 'B', description: 'Good', gpa: '2.8' },
    { sn: 5, achievement: '50 to below 60', grade: 'C+', description: 'Satisfactory', gpa: '2.4' },
    { sn: 6, achievement: '40 to below 50', grade: 'C', description: 'Acceptable', gpa: '2.0' },
    { sn: 7, achievement: '35 to below 40', grade: 'D', description: 'Basic', gpa: '1.6' },
    { sn: 8, achievement: '0 to below 35', grade: 'NG', description: 'Not Graded', gpa: '—' },
  ];

  return (
    <div className="bg-gray-200 dark:bg-gray-900 min-h-screen p-4 sm:p-8 font-serif">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center print:hidden">
            <Button variant="secondary" onClick={() => navigate(-1)}>&larr; Back</Button>
            <Button onClick={() => window.print()} leftIcon={<PrinterIcon className="w-5 h-5" />}>
                Print Grade Sheet
            </Button>
        </div>

        {/* Printable Area */}
        <div className="bg-white p-2 relative shadow-2xl print:shadow-none" id="marksheet">
            <div className="border-8 border-gray-800 p-4 relative overflow-hidden" style={{borderStyle: 'double'}}>
                {/* Watermark */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
                    <div
                        className="p-0 text-gray-600 font-bold uppercase"
                        style={{
                            fontSize: '0.7rem',
                            lineHeight: 1.5,
                            wordBreak: 'break-all',
                            opacity: 0.15,
                            filter: 'blur(0.5px)',
                        }}
                    >
                        {`${school.name.toUpperCase()} `.repeat(300)}
                    </div>
                </div>
              
                {/* Header */}
                <div className="text-center pb-4 relative z-10 border-b-2 border-gray-400">
                    <div className="flex justify-between items-center">
                        <NebLogo src="https://upload.wikimedia.org/wikipedia/commons/2/23/Emblem_of_Nepal.svg" className="h-20 w-20" />
                        <div className="flex-grow">
                            <p className="font-bold text-sm">Government of Nepal</p>
                            <p className="font-bold text-lg text-blue-800">SCHOOL EXAMINATION BOARD</p>
                            <h1 className="text-2xl font-bold text-red-700 uppercase">{school.name}</h1>
                            <p className="text-xs font-semibold">{school.municipality}, <span className="font-bold">ESTD :</span> {school.estd} </p>
                        </div>
                        <img src={school.logoUrl} alt="School Logo" className="h-20 w-20 rounded-full object-cover"/>
                    </div>                
                     <p className="inline-block bg-green-800 text-white font-bold tracking-widest px-6 py-1 text-xl mt-2 rounded-full">GRADE-SHEET</p>
                </div>
                
                {/* Student Info */}
                <div className="mt-4 text-xs font-semibold relative z-10">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                        <div className="flex"><span className="w-28">Name:</span><span className="border-b border-dotted border-black flex-grow px-2">{student.name}</span></div>
                        <div className="flex"><span className="w-28">Symbol No.:</span><span className="border-b border-dotted border-black flex-grow px-2">{student.symbol_no}</span></div>
                        <div className="flex"><span className="w-28">Date of Birth:</span><span className="border-b border-dotted border-black flex-grow px-2"> {formatNepaliDate(student.dob_bs)} B.S. ({formatADDateFull(student.dob)} A.D.)</span></div>
                        <div className="flex"><span className="w-28">Registration No.:</span><span className="border-b border-dotted border-black flex-grow px-2">{student.registration_id}</span></div>
                    </div>
                     <p className="mt-2 text-justify">
                        This is to certify that the grades secured by the above student in the annual examination of <strong>Grade {student.grade}</strong> conducted in <strong>{student.year} B.S.</strong> (<strong>{convertBsYearToAdYear(student.year.toString()).toString()} A.D.</strong>) are given below.
                     </p>
                </div>
              
                {/* Marks Table */}
                <div className="mt-4 relative z-10">
                    <table className="w-full border-collapse border-2 border-black text-xs">
                        <thead className="font-bold bg-gray-100">
                            <tr className="text-center">
                                <th className="border-2 border-black p-1">SUBJECT CODE</th>
                                <th className="border-2 border-black p-1 w-2/5">SUBJECTS</th>
                                <th className="border-2 border-black p-1">CREDIT HOUR</th>
                                <th className="border-2 border-black p-1">GRADE POINT</th>
                                <th className="border-2 border-black p-1">GRADE</th>
                                <th className="border-2 border-black p-1">FINAL GRADE</th>
                                <th className="border-2 border-black p-1">REMARKS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(({ subject, gradeInfo, finalGrade }) => (
                                <React.Fragment key={subject.id}>
                                    <tr>
                                        <td className="border-2 border-black p-1 text-center">{subject.theory.subCode}</td>
                                        <td className="border-2 border-black p-1">{subject.name.toUpperCase()} (TH)</td>
                                        <td className="border-2 border-black p-1 text-center">{subject.theory.credit.toFixed(2)}</td>
                                        <td className="border-2 border-black p-1 text-center">{gradeInfo?.th_gp?.toFixed(1) ?? 'N/A'}</td>
                                        <td className="border-2 border-black p-1 text-center">{gradeInfo?.th ?? 'NG'}</td>
                                        <td className="border-2 border-black p-1 text-center font-bold align-middle" rowSpan={2}>{finalGrade}</td>
                                        <td className="border-2 border-black p-1 text-center align-middle" rowSpan={2}>{getSubjectRemarks(finalGrade)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-2 border-black p-1 text-center">{subject.internal.subCode}</td>
                                        <td className="border-2 border-black p-1">{subject.name.toUpperCase()} (IN)</td>
                                        <td className="border-2 border-black p-1 text-center">{subject.internal.credit.toFixed(2)}</td>
                                        <td className="border-2 border-black p-1 text-center">{gradeInfo?.in_gp?.toFixed(1) ?? 'N/A'}</td>
                                        <td className="border-2 border-black p-1 text-center">{gradeInfo?.in ?? 'NG'}</td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                        <tfoot className="font-bold bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <td colSpan={7} className="border-2 border-black p-1 text-center">
                                    Grade Point Average (GPA) = {studentGrades?.gpa.toFixed(2) || 'N/A'}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Extra Credit & Overall Result */}
                <div className="mt-4 relative z-10">
                    <table className="w-full border-collapse border-2 border-black text-xs">
                        <thead>
                            <tr>
                                <th colSpan={7} className="border-2 border-black p-1 text-left font-bold text-blue-800">
                                    (EXTRA CREDIT SUBJECT)
                                </th>
                            </tr>
                        </thead>
                        {extraCreditSubject ? (
                            <tbody>
                                <tr>
                                    <td className="border-2 border-black p-1 text-center">{extraCreditSubject.theory.subCode}</td>
                                    <td className="border-2 border-black p-1">{extraCreditSubject.name.toUpperCase()} (TH)</td>
                                    <td className="border-2 border-black p-1 text-center">{extraCreditSubject.theory.credit.toFixed(2)}</td>
                                    <td className="border-2 border-black p-1 text-center">{typeof extraCreditTheoryGP === 'number' ? extraCreditTheoryGP.toFixed(1) : extraCreditTheoryGP}</td>
                                    <td className="border-2 border-black p-1 text-center">{extraCreditTheoryGrade}</td>
                                    <td className="border-2 border-black p-1 text-center font-bold align-middle" rowSpan={2}>
                                        {extraCreditFinalGrade}
                                    </td>
                                    <td className="border-2 border-black p-1 text-center align-middle" rowSpan={2}>
                                        {extraCreditRemarks}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-2 border-black p-1 text-center">{extraCreditSubject.internal.subCode}</td>
                                    <td className="border-2 border-black p-1">{extraCreditSubject.name.toUpperCase()} (IN)</td>
                                    <td className="border-2 border-black p-1 text-center">{extraCreditSubject.internal.credit.toFixed(2)}</td>
                                    <td className="border-2 border-black p-1 text-center">{typeof extraCreditInternalGP === 'number' ? extraCreditInternalGP.toFixed(1) : extraCreditInternalGP}</td>
                                    <td className="border-2 border-black p-1 text-center">{extraCreditInternalGrade}</td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                <tr>
                                    <td className="border-2 border-black p-2 text-center" colSpan={7}>
                                        No Extra Credit Subject.
                                    </td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
                <div className="mt-4 text-xs font-semibold relative z-10">
                    
                     <p className="mt-1 text-justify" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        NOTE: ONE CREDIT HOUR EQUALS 32 CLOCK HOURS.                      
                     </p>

                     <p className="mt-1 text-justify">
                        INTERNAL (IN) :THIS COVERS THE PARTICIPATION, PRACTICAL/PROJECT WORKS, COMMUNITY WORKS,INTERNSHIP, PRESENTATIONS TERMINAL EXAMINATIONS.
                     </p>
                     <p className="mt-1 text-justify">
                        THEORY (TH) :THIS COVERS WRITTEN EXTERNAL EXAMINATION.
                     </p>
                </div>

                {/* Grading System Legend */}
                <div className="mt-4 text-xs relative z-10">
                    <table className="w-full border-collapse border-2 border-black text-xs">
                        <thead className="font-bold bg-gray-100">
                            <tr><th colSpan={5} className="border-2 border-black p-1 text-center">Grading System</th></tr>
                            <tr>
                                <th className="border-2 border-black p-1">S.N.</th>
                                <th className="border-2 border-black p-1">Achievement in Percent</th>
                                <th className="border-2 border-black p-1">Grade</th>
                                <th className="border-2 border-black p-1">Description</th>
                                <th className="border-2 border-black p-1">Grade Point</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradingSystem.map(g => (
                                <tr key={g.sn}>
                                    <td className="border-2 border-black p-1 text-center">{g.sn}</td>
                                    <td className="border-2 border-black p-1 text-center">{g.achievement}</td>
                                    <td className="border-2 border-black p-1 text-center font-bold">{g.grade}</td>
                                    <td className="border-2 border-black p-1">{g.description}</td>
                                    <td className="border-2 border-black p-1 text-center font-bold">{g.gpa}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-10 flex justify-between items-end text-xs relative z-10">
                    <div className="text-center">
                        <p className="border-t border-black w-32 pt-1 mt-8">{school.preparedBy}</p>
                    </div>
                     <div className="text-center">
                        <p className="border-t border-black w-32 pt-1 mt-8">{school.checkedBy}</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold">Date of Issue: {convertAdDateToBsDate(new Date())} B.S. ({new Date().toLocaleDateString('en-CA')} A.D.)</p>
                        <p className="border-t border-black w-40 pt-1 mt-8">{school.headTeacherName}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrintMarksheetPage;