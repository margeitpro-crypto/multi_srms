import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Loader from '../../components/Loader';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import { ArrowLeftIcon } from '../../components/icons/ArrowLeftIcon';
import { PrinterIcon } from '../../components/icons/PrinterIcon';
import Button from '../../components/Button';
import { formatToYYMMDD } from '../../utils/nepaliDateConverter';

// Utility function to format A.D. date from ISO string to YY-MM-DD
const formatADDate = (isoDateStr: string): string => {
    if (!isoDateStr) return '';
    return formatToYYMMDD(isoDateStr);
};

const DetailItem: React.FC<{ label: string, value?: string | number | null }> = ({ label, value }) => (
    <div className="py-1 print:py-0.5">
        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 print:text-[10px]">{label}</dt>
        <dd className="mt-0.5 text-sm text-gray-900 dark:text-white print:text-xs">{value || '-'}</dd>
    </div>
);

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { students: MOCK_ADMIN_STUDENTS, schools: MOCK_SCHOOLS, subjects: MOCK_SUBJECTS, assignments: MOCK_STUDENT_SUBJECT_ASSIGNMENTS } = useData();

  const student = MOCK_ADMIN_STUDENTS.find(s => s.id === studentId);
  const school = student ? MOCK_SCHOOLS.find(s => s.id === student.school_id) : null;
  const assignedSubjectIds = student ? MOCK_STUDENT_SUBJECT_ASSIGNMENTS[student.id] || [] : [];
  const assignedSubjects = MOCK_SUBJECTS.filter(s => assignedSubjectIds.includes(s.id));
  
  if (!student) {
    return (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-4">
                <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Student Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">The requested student profile could not be found.</p>
        </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
        {/* Action Buttons - Hidden when printing */}
        <div className="flex justify-between items-center mb-4 print:hidden">
            <Button variant="secondary" size="sm" onClick={handleBack} leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
                Back
            </Button>
            <div className="flex space-x-2">
                <Button variant="primary" size="sm" onClick={handlePrint} leftIcon={<PrinterIcon className="w-4 h-4" />}>
                    Print Profile
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/print-admit-card/${studentId}`)} leftIcon={<PrinterIcon className="w-4 h-4" />}>
                    Admit Card
                </Button>
            </div>
        </div>

        {/* Resume-style profile card optimized for A4 printing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl print:shadow-none print:rounded-none print:border-0 print:p-0">
            {/* Header Section with Student Info */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-4 print:p-3">
                <div className="flex flex-col md:flex-row items-center md:items-end space-y-3 md:space-y-0 md:space-x-4">
                    <div className="relative">
                        {student.photo_url ? (
                            <img 
                                className="h-20 w-20 rounded-lg object-cover border-2 border-white/30 shadow print:h-16 print:w-16 print:rounded print:border print:border-white" 
                                src={student.photo_url} 
                                alt={`${student.name}'s profile`}
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-lg bg-white/20 flex items-center justify-center border-2 border-white/30 shadow print:h-16 print:w-16 print:rounded print:border print:border-white">
                                <UserCircleIcon className="w-12 h-12 text-white/80 print:w-10 print:h-10" />
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1 shadow-md print:hidden">
                            <div className="bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center md:text-left text-white flex-1">
                        <h1 className="text-xl md:text-2xl font-bold mb-1 print:text-xl print:mb-0 print:text-white">{student.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
                            <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 print:bg-white/30 print:px-1.5 print:py-0.5">
                                <p className="text-[10px] text-white/80 uppercase tracking-wide print:text-white">Sym: {student.symbol_no}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 print:bg-white/30 print:px-1.5 print:py-0.5">
                                <p className="text-[10px] text-white/80 uppercase tracking-wide print:text-white">Reg: {student.registration_id}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 print:bg-white/30 print:px-1.5 print:py-0.5">
                                <p className="text-[10px] text-white/80 uppercase tracking-wide print:text-white">Grade: {student.grade}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 print:bg-white/30 print:p-1.5">
                        <div className="text-center">
                            <p className="text-[10px] text-white/80 uppercase tracking-wide mb-0.5 print:text-white">Year</p>
                            <p className="text-lg font-bold print:text-base print:text-white">{student.year}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Content Sections - Compact Resume Style */}
            <div className="p-4 print:p-3">
                <div className="grid grid-cols-1 gap-3 print:gap-2">
                    {/* Personal Information Section */}
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 pb-1 border-b border-gray-200 dark:border-gray-700 print:text-xs print:border-gray-300 print:mb-1 print:pb-0.5 print:text-gray-900">Personal Information</h2>
                        <div className="grid grid-cols-2 gap-2 print:gap-1">
                            <DetailItem label="Name" value={student.name} />
                            <DetailItem label="Gender" value={student.gender} />
                            <DetailItem label="DOB (AD)" value={formatADDate(student.dob)} />
                            <DetailItem label="DOB (BS)" value={student.dob_bs} />
                            <DetailItem label="Mobile" value={student.mobile_no} />
                        </div>
                    </div>
                    
                    {/* Parent Information Section */}
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 pb-1 border-b border-gray-200 dark:border-gray-700 print:text-xs print:border-gray-300 print:mb-1 print:pb-0.5 print:text-gray-900">Parent Information</h2>
                        <div className="grid grid-cols-2 gap-2 print:gap-1">
                            <DetailItem label="Father" value={student.father_name} />
                            <DetailItem label="Mother" value={student.mother_name} />
                        </div>
                    </div>
                    
                    {/* Academic Information Section */}
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 pb-1 border-b border-gray-200 dark:border-gray-700 print:text-xs print:border-gray-300 print:mb-1 print:pb-0.5 print:text-gray-900">Academic Information</h2>
                        <div className="grid grid-cols-2 gap-2 print:gap-1">
                            <DetailItem label="School" value={school?.name} />
                            <DetailItem label="IEMIS" value={school?.iemisCode} />
                            <DetailItem label="Year" value={student.year} />
                            <DetailItem label="Grade" value={student.grade} />
                            <DetailItem label="Roll No" value={student.roll_no} />
                        </div>
                    </div>
                    
                    {/* Assigned Subjects Section */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 pb-1 border-b border-gray-200 dark:border-gray-700 print:border-gray-300 print:mb-1 print:pb-0.5">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white print:text-xs print:text-gray-900">Assigned Subjects (Grade {student.grade})</h2>
                            <div className="mt-1 sm:mt-0">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 print:bg-primary-200 print:text-primary-900 print:px-1.5 print:py-0">
                                    {assignedSubjects.length} Subjects
                                </span>
                            </div>
                        </div>
                        
                        {assignedSubjects.length > 0 ? (
                            <div className="overflow-x-auto print:overflow-visible">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 print:divide-gray-400 print:text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-700 print:bg-gray-200">
                                        <tr>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-gray-800 print:px-2 print:py-1">Subject Name</th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-gray-800 print:px-2 print:py-1">TH Code</th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-gray-800 print:px-2 print:py-1">TH Credit</th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-gray-800 print:px-2 print:py-1">TH Marks</th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-gray-800 print:px-2 print:py-1">IN Code</th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-gray-800 print:px-2 print:py-1">IN Credit</th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider print:text-gray-800 print:px-2 print:py-1">IN Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 print:divide-gray-400 print:bg-gray-100">
                                        {assignedSubjects.map((subject) => (
                                            <tr key={subject.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 print:hover:bg-gray-200">
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white print:text-gray-900 print:px-2 print:py-1">{subject.name}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 print:text-gray-800 print:px-2 print:py-1">{subject.theory.subCode}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 print:text-gray-800 print:px-2 print:py-1">{subject.theory.credit.toFixed(2)}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 print:text-gray-800 print:px-2 print:py-1">{subject.theory.fullMarks}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 print:text-gray-800 print:px-2 print:py-1">{subject.internal.subCode}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 print:text-gray-800 print:px-2 print:py-1">{subject.internal.credit.toFixed(2)}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 print:text-gray-800 print:px-2 print:py-1">{subject.internal.fullMarks}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4 print:py-2">
                                <div className="bg-gray-200 dark:bg-gray-700 border border-dashed rounded-lg w-8 h-8 mx-auto mb-2 flex items-center justify-center print:bg-gray-300 print:w-6 print:h-6">
                                    <svg className="w-4 h-4 text-gray-400 print:w-3 print:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5 print:text-xs">No Subjects Assigned</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-[10px]">No subjects for current grade/year.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Print-specific styles for A4 paper with border and preserved colors */}
        <style>{`
            @media print {
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 0;
                    font-size: 12px;
                    background: white !important;
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                .print\\:hidden {
                    display: none !important;
                }
                .max-w-4xl {
                    max-width: 100% !important;
                }
                .animate-fade-in {
                    animation: none !important;
                }
                /* Full page border */
                .print-border {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 2px solid #000;
                    box-sizing: border-box;
                    z-index: -1;
                    pointer-events: none;
                }
                /* Ensure all content fits within A4 */
                .print-container {
                    width: 210mm;
                    height: 297mm;
                    padding: 10mm;
                    box-sizing: border-box;
                    overflow: hidden;
                }
                /* Preserve background colors */
                .bg-gradient-to-r {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                .bg-white\\/20, .bg-primary-100, .bg-gray-50, .bg-gray-100, .bg-gray-200 {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                /* Text colors */
                .text-white, .text-white\\/80 {
                    color: white !important;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                .text-primary-800, .text-gray-500, .text-gray-700, .text-gray-900 {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                /* Table styles for print */
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 2px 4px !important;
                    text-align: left;
                }
                thead {
                    display: table-header-group;
                }
                tbody {
                    display: table-row-group;
                }
                /* Reduce spacing for print */
                .gap-3 {
                    gap: 0.5rem;
                }
                .gap-2 {
                    gap: 0.4rem;
                }
                .gap-1 {
                    gap: 0.25rem;
                }
                .mb-4 {
                    margin-bottom: 0.75rem;
                }
                .mb-2 {
                    margin-bottom: 0.5rem;
                }
                .mb-1 {
                    margin-bottom: 0.25rem;
                }
                .p-4 {
                    padding: 0.75rem;
                }
                .p-3 {
                    padding: 0.75rem;
                }
                .p-2 {
                    padding: 0.5rem;
                }
                .p-1\\.5 {
                    padding: 0.375rem;
                }
                .p-1 {
                    padding: 0.25rem;
                }
                /* Ensure images print with background */
                img {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
            }
        `}</style>
    </div>
  );
};

export default StudentProfilePage;