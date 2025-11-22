import React, { useState, useEffect, useMemo, useRef } from 'react';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { School, Student, Subject } from '../../types';
import { usePageTitle } from '../../context/PageTitleContext';
import Loader from '../../components/Loader';
import { PrinterIcon } from '../../components/icons/PrinterIcon';
import { DocumentArrowDownIcon } from '../../components/icons/DocumentArrowDownIcon';
import { useData } from '../../context/DataContext';
import Modal from '../../components/Modal';
import * as XLSX from 'xlsx';

// Add CSS for print-specific styling
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-area, .print-area * {
      visibility: visible;
    }
    .print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
  }
`;

interface LedgerData {
    school: School;
    students: Student[];
    subjects: Subject[];
}

const MarkWiseLedgerPage: React.FC<{ school?: School }> = ({ school }) => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Mark Wise Ledger');
    }, [setPageTitle]);
    
    // Add print styles to document head
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = printStyles;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    
    // FIX: Get data from the central DataContext, including assignments.
    const { schools, students: allStudents, subjects: allSubjects, marks: allMarks, assignments, academicYears, marksRefreshTrigger, appSettings } = useData();

    const [selectedSchoolId, setSelectedSchoolId] = useState<string>(school?.id.toString() || '');
    const [selectedYear, setSelectedYear] = useState('2082');
    const [selectedClass, setSelectedClass] = useState('11');
    
    const [isLoading, setIsLoading] = useState(false);
    const [ledgerData, setLedgerData] = useState<LedgerData | null>(null);
    
    // State for PDF generation
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    
    // Auto-select school if only one school exists and none is selected
    useEffect(() => {
        if (!selectedSchoolId && schools.length === 1) {
            setSelectedSchoolId(schools[0].id.toString());
        } else if (school && !selectedSchoolId) {
            setSelectedSchoolId(school.id.toString());
        }
    }, [schools, school, selectedSchoolId]);
    
    // Automatically load data when component mounts and when dependencies are ready
    useEffect(() => {
        // Only auto-load when we have all required data and haven't loaded yet
        if (selectedSchoolId && selectedYear && selectedClass && !ledgerData && !isLoading) {
            handleLoad();
        }
    }, [selectedSchoolId, selectedYear, selectedClass, ledgerData, isLoading]);

    const handleLoad = () => {
        if (!selectedSchoolId) return;
        setIsLoading(true);
        setLedgerData(null);
        setTimeout(() => {
            const currentSchool = schools.find(s => s.id.toString() === selectedSchoolId);
            if (currentSchool) {
                const students = allStudents.filter(
                    s => s.school_id.toString() === selectedSchoolId && s.year.toString() === selectedYear && s.grade === selectedClass
                );
                const subjects = allSubjects; 
                setLedgerData({ school: currentSchool, students, subjects });
            }
            setIsLoading(false);
        }, 100); // Reduced delay for better UX
    };
    
    // Memoize the ledger data to prevent unnecessary re-renders
    const processedLedgerData = useMemo(() => {
        if (!ledgerData) return null;
        
        // Get all subject IDs that are assigned to at least one student in the current selection
        const assignedSubjectIdsSet = new Set<number>();
        const studentsWithMarks = ledgerData.students.map(student => {
            const studentMarks = allMarks[student.id];
            const assignedSubjectIds = new Set(assignments[student.id] || []);
            
            // Add assigned subject IDs to the overall set
            assignedSubjectIds.forEach(id => assignedSubjectIdsSet.add(id));
            
            const totalMarks = studentMarks ? Object.values(studentMarks).reduce((acc: number, subjectMark: any) => {
                if (typeof subjectMark === 'object' && subjectMark !== null && 'theory' in subjectMark) {
                    return acc + (subjectMark.theory || 0) + (subjectMark.internal || 0);
                }
                return acc;
            }, 0) : 0;
            
            return {
                ...student,
                studentMarks,
                assignedSubjectIds,
                totalMarks
            };
        });
        
        // Filter subjects to only include those assigned to at least one student
        const assignedSubjects = ledgerData.subjects.filter(subject => assignedSubjectIdsSet.has(subject.id));
        
        return {
            ...ledgerData,
            subjects: assignedSubjects,
            students: studentsWithMarks
        };
    }, [ledgerData, allMarks, assignments, marksRefreshTrigger]);

    // Create a ref for the content to be exported
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Function to export data as Excel
    const exportToExcel = () => {
        if (!processedLedgerData) return;
        
        // Create CSV content
        let csvContent = "S.No.,School Code,School Name,Student Name,Symbol Number";
        
        // Add subject headers
        processedLedgerData.subjects.forEach(subject => {
            csvContent += `,${subject.name} (IN),${subject.name} (TH)`;
        });
        
        csvContent += ",Total Marks\n";
        
        // Add data rows
        processedLedgerData.students.forEach((student, index) => {
            csvContent += `${index + 1},${processedLedgerData.school.iemisCode},"${processedLedgerData.school.name}","${student.name}",${student.symbol_no}`;
            
            // Add subject marks
            processedLedgerData.subjects.forEach(subject => {
                const isAssigned = student.assignedSubjectIds.has(subject.id);
                const subjectMark = student.studentMarks?.[subject.id];
                
                if (isAssigned && typeof subjectMark === 'object' && subjectMark) {
                    csvContent += `,${subjectMark.internal || 0},${subjectMark.theory || 0}`;
                } else {
                    csvContent += ",-,";
                }
            });
            
            csvContent += `,${student.totalMarks || 0}\n`;
        });
        
        // Convert CSV content to array of arrays for Excel
        const lines = csvContent.split('\n').filter(line => line.trim() !== '');
        const data = lines.map(line => line.split(','));
        
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Mark Wise Ledger');
        
        // Generate Excel file and download
        XLSX.writeFile(wb, `mark-wise-ledger-${selectedYear}-grade-${selectedClass}.xlsx`);
    };
    
    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg print:hidden">
                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                     <div className="md:col-span-2">
                        {school ? (
                             <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">School</label>
                                <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                    {school.name}
                                </div>
                             </div>
                        ) : (
                            <Select id="school-selector" label="Selected School*" value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)}>
                                <option value="">-- Select a School --</option>
                                {schools.map(s => (
                                    <option key={s.id} value={s.id}>{s.iemisCode}-{s.name}</option>
                                ))}
                            </Select>
                        )}
                     </div>
                     <Select id="year-selector" label="Year*" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        {academicYears.filter(y => y.is_active).map(year => (
                            <option key={year.id} value={year.year}>{year.year}</option>
                        ))}
                     </Select>
                     <Select id="class-selector" label="Class*" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                     </Select>
                     <Button onClick={handleLoad} disabled={isLoading || !selectedSchoolId} className="w-full">
                        {isLoading ? <span className="flex items-center space-x-2"><Loader /> <span>Loading...</span></span> : 'Refresh'}
                     </Button>
                </div>
            </div>

            {processedLedgerData ? (
                // Add ref to the div that will be exported and printed
                <div ref={contentRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in print-area">
                    <div className="text-center mb-6">
                        <img src={processedLedgerData.school.logoUrl} alt="School Logo" className="h-24 w-24 mx-auto mb-4 rounded-full"/>
                        <h2 className="text-xl font-bold text-red-600">{processedLedgerData.school.name}</h2>
                        <p className="text-sm font-medium text-red-600">{processedLedgerData.school.municipality}</p>
                        <p className="text-sm font-medium text-red-600">Mark Wise Ledger -  {selectedYear} GRADE {selectedClass}</p>
                    </div>
                
                    <div className="flex justify-end space-x-2 mb-4 print:hidden">
                        <Button onClick={() => window.print()} variant="secondary" leftIcon={<PrinterIcon className="w-4 h-4" />}>Print</Button>
                        <Button onClick={exportToExcel} variant="secondary" leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}>Export</Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse border dark:border-gray-700">
                           <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th rowSpan={2} className="border p-2 dark:border-gray-600">S.No.</th>
                                    
                                    <th rowSpan={2} className="border p-2 dark:border-gray-600">School Code</th>
                                    <th rowSpan={2} className="border p-2 dark:border-gray-600 min-w-32">Student Name</th>
                                    <th rowSpan={2} className="border p-2 dark:border-gray-600">Symbol Number</th>
                                    {processedLedgerData.subjects.map(subject => (
                                        <th key={subject.id} colSpan={2} className="border p-2 dark:border-gray-600 text-center min-w-24">{subject.name}</th>
                                    ))}
                                    <th rowSpan={2} className="border p-2 dark:border-gray-600 text-center">Total of final marks</th>
                                </tr>
                                <tr>
                                    {processedLedgerData.subjects.map(subject => (
                                        <React.Fragment key={subject.id}>
                                            <th className="border p-2 dark:border-gray-600 text-center">IN</th>
                                            <th className="border p-2 dark:border-gray-600 text-center">TH</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {processedLedgerData.students.length > 0 ? processedLedgerData.students.map((student, index) => {
                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                            <td className="border p-2 dark:border-gray-600">{index + 1}</td>
                                            
                                            <td className="border p-2 dark:border-gray-600">{processedLedgerData.school.iemisCode}</td>
                                            <td className="border p-2 dark:border-gray-600">{student.name}</td>
                                            <td className="border p-2 dark:border-gray-600">{student.symbol_no}</td>
                                            {processedLedgerData.subjects.map(subject => {
                                                const isAssigned = student.assignedSubjectIds.has(subject.id);
                                                const subjectMark = student.studentMarks?.[subject.id];
                                                return (
                                                    <React.Fragment key={subject.id}>
                                                        <td className="border p-2 dark:border-gray-600 text-center">{isAssigned ? (typeof subjectMark === 'object' && subjectMark ? subjectMark.internal : 'N/A') : '-'}</td>
                                                        <td className="border p-2 dark:border-gray-600 text-center">{isAssigned ? (typeof subjectMark === 'object' && subjectMark ? subjectMark.theory : 'N/A') : '-'}</td>
                                                    </React.Fragment>
                                                );
                                            })}
                                            <td className="border p-2 dark:border-gray-600 text-center font-bold">{student.totalMarks || '0'}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={5 + processedLedgerData.subjects.length * 2 + 1} className="text-center py-8">No students found for the selected criteria.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : !isLoading && (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                    <p className="text-gray-500 dark:text-gray-400">Please select criteria and click 'Refresh' to generate the ledger.</p>
                </div>
            )}
        </div>
    );
};

export default MarkWiseLedgerPage;