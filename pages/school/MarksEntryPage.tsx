import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { Subject, Student, School } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { usePageTitle } from '../../context/PageTitleContext';
import Loader from '../../components/Loader';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { getGradeInfoFromPercentage, calculateGradesForStudents } from '../../utils/gradeCalculator';
import dataService from '../../services/dataService';

// A marks structure for this page
interface Marks {
    internal: number;
    theory: number;
}

// State to hold all marks for all loaded students
// FIX: Corrected type to avoid conflict between `isAbsent` and subject marks.
interface StudentMarksEntry {
    isAbsent: boolean;
    // FIX: Changed index signature from number to string to match MarksMap type in DataContext.
    [subjectId: string]: Marks | boolean;
}
interface MarksState {
    [studentId: string]: StudentMarksEntry;
}

const MarksEntryPage: React.FC<{ school?: School }> = ({ school }) => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Marks Entry');
    }, [setPageTitle]);

    const { addToast } = useAppContext();
    // FIX: Get global marks state and setter from DataContext
    const { students: MOCK_ADMIN_STUDENTS, subjects: MOCK_SUBJECTS, assignments: MOCK_STUDENT_SUBJECT_ASSIGNMENTS, marks: allMarks, updateStudentMarks, extraCreditAssignments, schoolPageVisibility, setAssignments, setExtraCreditAssignments, updateStudentGrades } = useData();
    const { loggedInSchool } = useAuth();

    const isReadOnly = schoolPageVisibility?.marksEntry === 'read-only';
    const schoolToDisplay = school || loggedInSchool;

    const [selectedYear, setSelectedYear] = useState('2082');
    const [selectedClass, setSelectedClass] = useState('11');
    const [isLoading, setIsLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    
    const [students, setStudents] = useState<Student[]>([]);
    const [headerSubjects, setHeaderSubjects] = useState<Subject[]>([]);
    const [marks, setMarks] = useState<MarksState>({});
    
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

    const handleLoad = () => {
        if (!schoolToDisplay) return;
        setIsLoading(true);
        setDataLoaded(false);
        setTimeout(() => {
            const filteredStudents = MOCK_ADMIN_STUDENTS.filter(s => 
                s.school_id === schoolToDisplay.id &&
                s.year.toString() === selectedYear &&
                s.grade === selectedClass
                // Removed the assignment check since we'll load assignments for all students
            );
            setStudents(filteredStudents);

            // Load assignments for all filtered students
            const loadAssignments = async () => {
                try {
                    const assignmentsData: any = {};
                    const extraCreditData: any = {};
                    const marksData: any = {};
                    
                    for (const student of filteredStudents) {
                        if (!assignmentsData[student.id]) {
                            // Load assignments if not already loaded
                            const assignmentData = await dataService.subjectAssignments.getAssignments(student.id, selectedYear);
                            assignmentsData[student.id] = assignmentData.subjectIds;
                            extraCreditData[student.id] = assignmentData.extraCreditSubjectId;
                            
                            // Update context with loaded assignments
                            setAssignments(prev => ({ ...prev, [student.id]: assignmentData.subjectIds }));
                            setExtraCreditAssignments(prev => ({ ...prev, [student.id]: assignmentData.extraCreditSubjectId }));
                            
                            // Load marks for this student
                            try {
                                const studentMarks = await dataService.marks.getMarks(student.id, selectedYear);
                                marksData[student.id] = studentMarks;
                            } catch (error) {
                                console.warn(`No marks found for student ${student.id}`, error);
                                marksData[student.id] = {};
                            }
                        }
                    }
                    
                    // Now filter students who actually have assignments
                    const studentsWithAssignments = filteredStudents.filter(student => 
                        assignmentsData[student.id] && assignmentsData[student.id].length > 0
                    );
                    setStudents(studentsWithAssignments);
                    
                    const subjectIds = new Set<number>();
                    studentsWithAssignments.forEach(student => {
                        assignmentsData[student.id]?.forEach((id: number) => subjectIds.add(id));
                    });
                    const uniqueSubjects = MOCK_SUBJECTS.filter(s => subjectIds.has(s.id));
                    setHeaderSubjects(uniqueSubjects);
                    
                    const initialMarks: MarksState = {};
                    studentsWithAssignments.forEach(student => {
                        // Initialize from loaded marks data if available, otherwise create new.
                        initialMarks[student.id] = { isAbsent: marksData[student.id]?.isAbsent || false };
                        
                        // Process loaded marks for each subject
                        Object.keys(marksData[student.id] || {}).forEach(key => {
                            if (key !== 'isAbsent') {
                                const subjectId = parseInt(key);
                                const markData = marksData[student.id][key];
                                if (typeof markData === 'object' && markData !== null) {
                                    initialMarks[student.id][subjectId] = {
                                        internal: markData.practical || 0,
                                        theory: markData.theory || 0,
                                    };
                                }
                            }
                        });
                        
                        // Also initialize marks for extra credit subject
                        const extraId = extraCreditData[student.id];
                        if (extraId) {
                            const existingExtraMarkData = marksData[student.id]?.[extraId];
                            const existingExtraMark = typeof existingExtraMarkData === 'object' ? existingExtraMarkData : null;
                            if (existingExtraMark) {
                                initialMarks[student.id][extraId] = {
                                    internal: existingExtraMark.practical || 0,
                                    theory: existingExtraMark.theory || 0,
                                };
                            } else {
                                initialMarks[student.id][extraId] = {
                                    internal: 0,
                                    theory: 0,
                                };
                            }
                        }
                    });
                    setMarks(initialMarks);
                    setSelectedStudents(new Set(studentsWithAssignments.map(s => s.id)));
                    
                    setIsLoading(false);
                    setDataLoaded(true);
                    addToast(`Loaded ${studentsWithAssignments.length} students with subject assignments for Grade ${selectedClass}.`, 'info');
                } catch (error: any) {
                    console.error('Error loading student assignments:', error);
                    const errorMessage = error.response?.data?.error || error.message || 'Failed to load student assignments. Please try again.';
                    addToast(`Error loading assignments: ${errorMessage}`, 'error');
                    setIsLoading(false);
                }
            };
            
            loadAssignments();
        }, 1000);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedStudents(e.target.checked ? new Set(students.map(s => s.id)) : new Set());
    };
    
    const handleSelectStudent = (studentId: string, isChecked: boolean) => {
        setSelectedStudents(prev => {
            const newSet = new Set(prev);
            isChecked ? newSet.add(studentId) : newSet.delete(studentId);
            return newSet;
        });
    };
    
    const handleMarkChange = (studentId: string, subjectId: number, field: keyof Marks, value: string) => {
        const numValue = parseInt(value) || 0;
        setMarks(prev => {
            const studentMarks = prev[studentId];
            const currentSubjectMarkData = studentMarks?.[subjectId];
            const currentSubjectMark = (typeof currentSubjectMarkData === 'object' && currentSubjectMarkData !== null) ? currentSubjectMarkData : { internal: 0, theory: 0 };

            return ({
                ...prev,
                [studentId]: {
                    ...studentMarks,
                    isAbsent: studentMarks.isAbsent,
                    [subjectId]: {
                        ...currentSubjectMark,
                        [field]: numValue
                    }
                }
            })
        });
        
        // Update grades in real-time as marks change
        updateGradesInRealTime(studentId);
    };

    const handleAbsenceChange = (studentId: string, isAbsent: boolean) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                isAbsent: isAbsent,
            }
        }));
        
        // Update grades in real-time as absence status changes
        updateGradesInRealTime(studentId);
    };
    
    const updateGradesInRealTime = useCallback((studentId: string) => {
        // Create a temporary marks object with just the changed student's marks
        const updatedMarks = { [studentId]: marks[studentId] };
        
        // Calculate new grades for this student
        const newGrades = calculateGradesForStudents(
            [studentId],
            { ...allMarks, ...updatedMarks }, // Merge existing marks with updated marks
            MOCK_SUBJECTS,
            MOCK_STUDENT_SUBJECT_ASSIGNMENTS
        );
        
        // Update grades in the DataContext
        updateStudentGrades(newGrades);
    }, [marks, allMarks, MOCK_SUBJECTS, MOCK_STUDENT_SUBJECT_ASSIGNMENTS, updateStudentGrades]);
    
    const handleSaveMarks = () => {
        updateStudentMarks(marks);
        addToast("Marks submitted successfully!", "success");
    };
    
    const handleDeleteMarks = async () => {
        if (!schoolToDisplay) return;
        
        if (window.confirm("Are you sure you want to delete all marks for the selected students? This action cannot be undone.")) {
            try {
                // Delete marks for all selected students
                for (const studentId of selectedStudents) {
                    const student = students.find(s => s.id === studentId);
                    if (student) {
                        await dataService.marks.deleteMarks(studentId, selectedYear);
                    }
                }
                
                // Clear marks from local state
                const clearedMarks = { ...marks };
                selectedStudents.forEach(studentId => {
                    if (clearedMarks[studentId]) {
                        Object.keys(clearedMarks[studentId]).forEach(key => {
                            if (key !== 'isAbsent') {
                                const subjectId = parseInt(key);
                                clearedMarks[studentId][subjectId] = { internal: 0, theory: 0 };
                            }
                        });
                        clearedMarks[studentId].isAbsent = false;
                    }
                });
                
                setMarks(clearedMarks);
                addToast("Marks deleted successfully!", "success");
            } catch (error: any) {
                console.error('Error deleting marks:', error);
                const errorMessage = error.response?.data?.error || error.message || 'Failed to delete marks. Please try again.';
                addToast(`Error deleting marks: ${errorMessage}`, "error");
            }
        }
    };
    
    const studentResults = useMemo(() => {
        return students.map(student => {
            const studentMarks = marks[student.id];
            if (!studentMarks) return { student, totalObtained: 0, gpa: 0 };
            
            const assignedSubjectIds = MOCK_STUDENT_SUBJECT_ASSIGNMENTS[student.id] || [];
            let totalObtained = 0;
            let totalWGP = 0;
            let totalCreditHours = 0;

            assignedSubjectIds.forEach(subjectId => {
                const subject = MOCK_SUBJECTS.find(s => s.id === subjectId);
                const mark = studentMarks[subjectId] as Marks;
                if (subject && mark) {
                    totalObtained += (mark.theory || 0) + (mark.internal || 0);

                    const theoryPercentage = subject.theory.fullMarks > 0 ? ((mark.theory || 0) / subject.theory.fullMarks) * 100 : 0;
                    const internalPercentage = subject.internal.fullMarks > 0 ? ((mark.internal || 0) / subject.internal.fullMarks) * 100 : 0;

                    const { point: th_gp } = getGradeInfoFromPercentage(theoryPercentage);
                    const { point: in_gp } = getGradeInfoFromPercentage(internalPercentage);

                    const theoryWGP = subject.theory.credit * th_gp;
                    const internalWGP = subject.internal.credit * in_gp;

                    totalWGP += theoryWGP + internalWGP;
                    totalCreditHours += subject.theory.credit + subject.internal.credit;
                }
            });

            const gpa = (studentMarks.isAbsent || totalCreditHours === 0) ? 0 : totalWGP / totalCreditHours;
            
            return { student, totalObtained, gpa };
        });
    }, [students, marks, MOCK_SUBJECTS, MOCK_STUDENT_SUBJECT_ASSIGNMENTS]);


    const isAllSelected = selectedStudents.size > 0 && selectedStudents.size === students.length;

    if (!schoolToDisplay) {
        return <div className="flex justify-center items-center h-64"><Loader /></div>;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="selectedSchool" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Selected School<span className="text-red-500">*</span></label>
                        <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-400">
                            {schoolToDisplay.iemisCode} | {schoolToDisplay.name}
                        </div>
                    </div>
                    <Select id="year-selector" label="Year*" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}><option>2082</option><option>2081</option><option>2080</option></Select>
                    <Select id="class-selector" label="Class*" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}><option value="11">11</option><option value="12">12</option></Select>
                    <Button onClick={handleLoad} disabled={isLoading}>{isLoading ? <span className="flex items-center"><Loader /> Loading...</span> : 'Load'}</Button>
                </div>
            </div>

            {dataLoaded && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-fade-in">
                    <div className="overflow-x-auto p-2">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="p-2 w-10 text-center sticky left-0 z-20 bg-gray-50 dark:bg-gray-700"><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="rounded" disabled={isReadOnly} /></th>
                                    <th className="p-2 w-12 sticky left-10 z-20 bg-gray-50 dark:bg-gray-700">S.N</th>
                                    <th className="p-2 min-w-[150px] sticky left-24 z-20 bg-gray-50 dark:bg-gray-700">Student Name</th>
                                    <th className="p-2 min-w-[120px]">Regd. No.</th>
                                    <th className="p-2 min-w-[120px]">Symbol No.</th>
                                    <th className="p-2 text-center">IsAbsent</th>
                                    {headerSubjects.map(subject => (
                                        <React.Fragment key={subject.id}>
                                            <th className="p-2 text-center min-w-[100px]">{subject.name} (TH)</th>
                                            <th className="p-2 text-center min-w-[100px]">{subject.name} (IN)</th>
                                        </React.Fragment>
                                    ))}
                                    <th className="p-2 text-center min-w-[100px] bg-yellow-50 dark:bg-yellow-900/50">Extra Credit (TH)</th>
                                    <th className="p-2 text-center min-w-[100px] bg-yellow-50 dark:bg-yellow-900/50">Extra Credit (IN)</th>
                                    <th className="p-2 text-center font-bold">Total Obtained</th>
                                    <th className="p-2 text-center font-bold">GPA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentResults.map(({ student, totalObtained, gpa }, index) => {
                                    const studentMarks = marks[student.id];
                                    if (!studentMarks) return null;
                                    const assignedSubjectIds = new Set(MOCK_STUDENT_SUBJECT_ASSIGNMENTS[student.id] || []);
                                    const extraCreditSubjectId = extraCreditAssignments[student.id];
                                    const extraCreditSubject = extraCreditSubjectId ? MOCK_SUBJECTS.find(s => s.id === extraCreditSubjectId) : null;
                                    const extraMark = extraCreditSubjectId ? (studentMarks[extraCreditSubjectId] as Marks) : null;

                                    return (
                                    <tr key={student.id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50 ${studentMarks.isAbsent ? 'opacity-60 bg-gray-100 dark:bg-gray-700/50' : ''}`}>
                                        <td className="p-2 text-center sticky left-0 z-10 bg-white dark:bg-gray-800"><input type="checkbox" checked={selectedStudents.has(student.id)} onChange={(e) => handleSelectStudent(student.id, e.target.checked)} className="rounded" disabled={isReadOnly}/></td>
                                        <td className="p-2 sticky left-10 z-10 bg-white dark:bg-gray-800">{index + 1}</td>
                                        <td className="p-2 font-medium sticky left-24 z-10 bg-white dark:bg-gray-800">{student.name}</td>
                                        <td className="p-2">{student.registration_id}</td>
                                        <td className="p-2">{student.symbol_no}</td>
                                        <td className="p-2 text-center">
                                            <input type="checkbox" checked={!!studentMarks.isAbsent} onChange={(e) => handleAbsenceChange(student.id, e.target.checked)} className="rounded" disabled={isReadOnly} />
                                        </td>
                                        
                                        {headerSubjects.map(subject => {
                                            const isAssigned = assignedSubjectIds.has(subject.id);
                                            const mark = studentMarks[subject.id] as Marks;
                                            return (
                                                <React.Fragment key={subject.id}>
                                                    <td className={`p-1 ${!isAssigned && 'bg-gray-50 dark:bg-gray-700/50'}`}><input type="number" disabled={!!studentMarks.isAbsent || !isAssigned || isReadOnly} value={isAssigned ? mark?.theory ?? '' : ''} onChange={(e) => handleMarkChange(student.id, subject.id, 'theory', e.target.value)} className="w-full text-center bg-white dark:bg-gray-700 border rounded p-1 disabled:bg-gray-100 dark:disabled:bg-gray-600"/></td>
                                                    <td className={`p-1 ${!isAssigned && 'bg-gray-50 dark:bg-gray-700/50'}`}><input type="number" disabled={!!studentMarks.isAbsent || !isAssigned || isReadOnly} value={isAssigned ? mark?.internal ?? '' : ''} onChange={(e) => handleMarkChange(student.id, subject.id, 'internal', e.target.value)} className="w-full text-center bg-white dark:bg-gray-700 border rounded p-1 disabled:bg-gray-100 dark:disabled:bg-gray-600"/></td>
                                                </React.Fragment>
                                            );
                                        })}

                                        {extraCreditSubject ? (
                                            <>
                                                <td className="p-1 bg-yellow-50 dark:bg-yellow-900/50" title={extraCreditSubject.name}>
                                                    <input type="number" disabled={!!studentMarks.isAbsent || isReadOnly} value={extraMark?.theory ?? ''} onChange={(e) => handleMarkChange(student.id, extraCreditSubject.id, 'theory', e.target.value)} className="w-full text-center bg-white dark:bg-gray-700 border rounded p-1 disabled:bg-gray-100 dark:disabled:bg-gray-600"/>
                                                </td>
                                                <td className="p-1 bg-yellow-50 dark:bg-yellow-900/50" title={extraCreditSubject.name}>
                                                    <input type="number" disabled={!!studentMarks.isAbsent || isReadOnly} value={extraMark?.internal ?? ''} onChange={(e) => handleMarkChange(student.id, extraCreditSubject.id, 'internal', e.target.value)} className="w-full text-center bg-white dark:bg-gray-700 border rounded p-1 disabled:bg-gray-100 dark:disabled:bg-gray-600"/>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-1 bg-gray-50 dark:bg-gray-700/50"></td>
                                                <td className="p-1 bg-gray-50 dark:bg-gray-700/50"></td>
                                            </>
                                        )}

                                        <td className="p-2 text-center font-semibold">{studentMarks.isAbsent ? 'ABS' : totalObtained}</td>
                                        <td className="p-2 text-center font-semibold">
                                            {studentMarks.isAbsent ? 'N/A' : (gpa === 0 ? 'NG' : gpa.toFixed(2))}
                                        </td>
                                    </tr>
                                );
                                })}
                            </tbody>
                        </table>
                    </div>
                     <div className="p-4 flex justify-end space-x-2 border-t dark:border-gray-700">
                        <Button variant="secondary" disabled={isReadOnly}>Save as Draft</Button>
                        <Button onClick={handleSaveMarks} disabled={isReadOnly}>Submit Marks</Button>
                        {selectedStudents.size > 0 && (
                            <Button variant="danger" onClick={handleDeleteMarks} disabled={isReadOnly}>
                                Delete Marks for Selected ({selectedStudents.size})
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarksEntryPage;
