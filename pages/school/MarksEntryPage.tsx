


import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { Subject, Student, School } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { usePageTitle } from '../../context/PageTitleContext';
import Loader from '../../components/Loader';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { getGradeInfoFromPercentage } from '../../utils/gradeCalculator';

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
    const { students: MOCK_ADMIN_STUDENTS, subjects: MOCK_SUBJECTS, assignments: MOCK_STUDENT_SUBJECT_ASSIGNMENTS, marks: allMarks, updateStudentMarks, extraCreditAssignments, schoolPageVisibility } = useData();
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
                s.grade === selectedClass && 
                MOCK_STUDENT_SUBJECT_ASSIGNMENTS[s.id]
            );
            setStudents(filteredStudents);

            const subjectIds = new Set<number>();
            filteredStudents.forEach(student => {
                MOCK_STUDENT_SUBJECT_ASSIGNMENTS[student.id]?.forEach(id => subjectIds.add(id));
            });
            const uniqueSubjects = MOCK_SUBJECTS.filter(s => subjectIds.has(s.id));
            setHeaderSubjects(uniqueSubjects);
            
            const initialMarks: MarksState = {};
            filteredStudents.forEach(student => {
                // Initialize from global state if available, otherwise create new.
                initialMarks[student.id] = { isAbsent: allMarks[student.id]?.isAbsent || false };
                MOCK_STUDENT_SUBJECT_ASSIGNMENTS[student.id]?.forEach(subjectId => {
                    const existingMarkData = allMarks[student.id]?.[subjectId.toString()];
                    const existingMark = typeof existingMarkData === 'object' ? existingMarkData : null;
                    initialMarks[student.id][subjectId] = {
                        internal: existingMark?.internal || 0,
                        theory: existingMark?.theory || 0,
                    };
                });

                // Also initialize marks for extra credit subject
                const extraId = extraCreditAssignments[student.id];
                if (extraId) {
                    const existingExtraMarkData = allMarks[student.id]?.[extraId.toString()];
                    const existingExtraMark = typeof existingExtraMarkData === 'object' ? existingExtraMarkData : null;
                    initialMarks[student.id][extraId] = {
                        internal: existingExtraMark?.internal || 0,
                        theory: existingExtraMark?.theory || 0,
                    };
                }
            });
            setMarks(initialMarks);
            setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
            
            setIsLoading(false);
            setDataLoaded(true);
            addToast(`Loaded ${filteredStudents.length} students for Grade ${selectedClass}.`, 'info');
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
    };

    const handleAbsenceChange = (studentId: string, isAbsent: boolean) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                isAbsent: isAbsent,
            }
        }));
    };

    const handleSaveMarks = () => {
        updateStudentMarks(marks);
        addToast("Marks submitted successfully!", "success");
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarksEntryPage;
