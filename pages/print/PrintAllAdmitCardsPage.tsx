import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Button from '../../components/Button';
import { PrinterIcon } from '../../components/icons/PrinterIcon';
import { ArrowLeftIcon } from '../../components/icons/ArrowLeftIcon';
import { NebLogo } from '../../components/icons/NebLogo';
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

const SingleAdmitCard: React.FC<{ studentId: string }> = ({ studentId }) => {
    const { students: MOCK_ADMIN_STUDENTS, schools: MOCK_SCHOOLS, subjects: MOCK_SUBJECTS, assignments: MOCK_STUDENT_SUBJECT_ASSIGNMENTS } = useData();

    const student = MOCK_ADMIN_STUDENTS.find(s => s.id === studentId);
    const school = student ? MOCK_SCHOOLS.find(s => s.id === student.school_id) : null;
    const assignedSubjectIds = student ? MOCK_STUDENT_SUBJECT_ASSIGNMENTS[student.id] || [] : [];
    const assignedSubjects = MOCK_SUBJECTS.filter(s => assignedSubjectIds.includes(s.id));

    if (!student || !school) {
        return (
            <div className="admit-card-container bg-white p-4 my-8 text-center text-red-500 border-2 border-dashed border-red-400">
                Student or School not found for ID: {studentId}.
            </div>
        );
    }

    return (
        <div className="admit-card-container bg-white p-2 relative shadow-2xl print:shadow-none" id={`admit-card-${student.id}`}>
            <div className="border-8 border-gray-800 p-4 relative overflow-hidden" style={{borderStyle: 'double'}}>
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
                        <img src={school.logoUrl || "https://placehold.co/80x80?text=Logo"} alt="School Logo" className="h-20 w-20 rounded-full object-cover"/>
                    </div>                
                     <p className="inline-block bg-green-800 text-white font-bold tracking-widest px-6 py-1 text-xl mt-2 rounded-full">ADMIT CARD</p>
                </div>
                
                {/* Exam Details */}
                <div className="mt-4 text-xs font-semibold relative z-10">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                        <div className="flex"><span className="w-32">Examination:</span><span className="border-b border-dotted border-black flex-grow px-2 font-bold">ANNUAL EXAMINATION</span></div>
                        <div className="flex"><span className="w-32">Academic Year:</span><span className="border-b border-dotted border-black flex-grow px-2">{student.year} B.S. ({convertBsYearToAdYear(student.year.toString()).toString()} A.D.)</span></div>
                        <div className="flex"><span className="w-32">Class/Grade:</span><span className="border-b border-dotted border-black flex-grow px-2">Grade {student.grade}</span></div>
                        <div className="flex"><span className="w-32">Center:</span><span className="border-b border-dotted border-black flex-grow px-2">{school.municipality}</span></div>
                    </div>
                </div>
                
                {/* Student Info */}
                <div className="mt-6 text-xs font-semibold relative z-10">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        <div className="flex"><span className="w-32">Student's Name:</span><span className="border-b border-dotted border-black flex-grow px-2 font-bold">{student.name}</span></div>
                        <div className="flex"><span className="w-32">Symbol No.:</span><span className="border-b border-dotted border-black flex-grow px-2 font-bold">{student.symbol_no}</span></div>
                        <div className="flex"><span className="w-32">Father's Name:</span><span className="border-b border-dotted border-black flex-grow px-2">{student.father_name}</span></div>
                        <div className="flex"><span className="w-32">Registration No.:</span><span className="border-b border-dotted border-black flex-grow px-2">{student.registration_id}</span></div>
                        <div className="flex"><span className="w-32">Mother's Name:</span><span className="border-b border-dotted border-black flex-grow px-2">{student.mother_name}</span></div>
                        <div className="flex"><span className="w-32">Roll No.:</span><span className="border-b border-dotted border-black flex-grow px-2 font-bold">{student.roll_no}</span></div>
                        <div className="flex"><span className="w-32">Date of Birth:</span><span className="border-b border-dotted border-black flex-grow px-2"> {formatNepaliDate(student.dob_bs)} B.S. ({formatADDate(student.dob)} A.D.)</span></div>
                        <div className="flex"><span className="w-32">Gender:</span><span className="border-b border-dotted border-black flex-grow px-2">{student.gender}</span></div>
                    </div>
                </div>
              
                {/* Assigned Subjects Section */}
                <div className="mt-6 relative z-10">
                    <h3 className="text-center font-bold text-sm underline mb-2">ASSIGNED SUBJECTS</h3>
                    {assignedSubjects.length > 0 ? (
                        <table className="w-full border-collapse border-2 border-black text-xs">
                            <thead className="font-bold bg-gray-100">
                                <tr>
                                    <th className="border-2 border-black p-1">S.N.</th>
                                    <th className="border-2 border-black p-1">Subject Code</th>
                                    <th className="border-2 border-black p-1">Subject Name</th>
                                    <th className="border-2 border-black p-1">TH Credit</th>
                                    <th className="border-2 border-black p-1">IN Credit</th>
                                    <th className="border-2 border-black p-1">Total Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedSubjects.map((subject, index) => (
                                    <tr key={subject.id}>
                                        <td className="border-2 border-black p-1 text-center">{index + 1}</td>
                                        <td className="border-2 border-black p-1 text-center">{subject.theory.subCode}/{subject.internal.subCode}</td>
                                        <td className="border-2 border-black p-1">{subject.name}</td>
                                        <td className="border-2 border-black p-1 text-center">{subject.theory.credit.toFixed(2)}</td>
                                        <td className="border-2 border-black p-1 text-center">{subject.internal.credit.toFixed(2)}</td>
                                        <td className="border-2 border-black p-1 text-center">{(subject.theory.credit + subject.internal.credit).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-red-500 font-bold">No subjects assigned for this student.</p>
                        </div>
                    )}
                </div>
              
                {/* Instructions */}
                <div className="mt-6 relative z-10">
                    <h3 className="text-center font-bold text-sm underline mb-2">IMPORTANT INSTRUCTIONS</h3>
                    <ol className="list-decimal pl-5 text-xs space-y-1">
                        <li>This admit card is issued for appearing in the Annual Examination.</li>
                        <li>Students must bring this admit card along with valid identification proof to the examination hall.</li>
                        <li>No student will be allowed to enter the examination hall after 30 minutes of the commencement of the examination.</li>
                        <li>Students must occupy their seats 15 minutes before the commencement of the examination.</li>
                        <li>Use of unfair means in the examination is strictly prohibited and may lead to serious disciplinary action.</li>
                        <li>Students are advised to carefully go through the question paper before attempting to answer.</li>
                        <li>In case of any discrepancy in the admit card, the student should immediately contact the school authorities.</li>
                    </ol>
                </div>

                {/* Signature Section */}
                <div className="mt-8 flex justify-between items-end text-xs relative z-10">
                    <div className="text-center">
                        <p className="font-bold">Signature of Student</p>
                        <div className="h-12 w-32 border-b border-black mx-auto mt-8"></div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold">Signature of Guardian</p>
                        <div className="h-12 w-32 border-b border-black mx-auto mt-8"></div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold">Principal's Signature & Seal</p>
                        <div className="h-12 w-32 border-b border-black mx-auto mt-8"></div>
                        <p className="mt-1">Date: {convertAdDateToBsDate(new Date())} B.S. ({new Date().toLocaleDateString('en-CA')} A.D.)</p>
                    </div>
                </div>
                
                {/* Footer Note */}
                <div className="mt-6 text-center text-xs italic relative z-10">
                    <p>This is a computer-generated document. No signature is required.</p>
                </div>
            </div>
        </div>
    );
}

const PrintAllAdmitCardsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { studentIds } = (location.state as { studentIds: string[] }) || { studentIds: [] };

    if (!studentIds || studentIds.length === 0) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500">No students were selected for printing.</p>
                <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>
                    &larr; Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-gray-200 dark:bg-gray-900 min-h-screen p-4 sm:p-8 font-serif">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex justify-between items-center print:hidden">
                    <Button variant="secondary" size="sm" leftIcon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => navigate(-1)}>
                        Back
                    </Button>
                    <Button onClick={() => window.print()} leftIcon={<PrinterIcon className="w-5 h-5" />}>
                        Print All ({studentIds.length}) Admit Cards
                    </Button>
                </div>

                <div className="space-y-8">
                    {studentIds.map(id => <SingleAdmitCard key={id} studentId={id} />)}
                </div>
            </div>
        </div>
    );
};

export default PrintAllAdmitCardsPage;