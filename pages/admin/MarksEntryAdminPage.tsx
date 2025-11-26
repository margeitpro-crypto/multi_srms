import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { Subject, Student, School } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { usePageTitle } from '../../context/PageTitleContext';
import Loader from '../../components/Loader';
import { useData, MarksMap } from '../../context/DataContext';
import { getGradeInfoFromPercentage, calculateGradesForStudents } from '../../utils/gradeCalculator';
import dataService from '../../services/dataService';

// Define Marks type explicitly if not already defined globally or in types.ts
type Marks = {
    internal: number;
    theory: number;
};

const MarksEntryAdminPage: React.FC<{ school?: School; isReadOnly?: boolean }> = ({ school, isReadOnly = false }) => {
    const { setPageTitle } = usePageTitle();
    const { addToast } = useAppContext();
    const { schools, students, subjects, assignments, extraCreditAssignments, marks, updateStudentMarks, deleteStudentMarks, loadAssignmentsForStudents, loadMarksForStudents, academicYears, appSettings, loadSubjects } = useData();

    // State Declarations
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>(school ? school.id.toString() : '');
    const [selectedYear, setSelectedYear] = useState(appSettings.academicYear || '2082');
    const [selectedClass, setSelectedClass] = useState('11');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [headerSubjects, setHeaderSubjects] = useState<Subject[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [displayedStudents, setDisplayedStudents] = useState<Student[]>([]);
    const [unsavedMarks, setUnsavedMarks] = useState<MarksMap>({}); // New state for unsaved marks

    // Memoized Values
    const selectedSchool = useMemo(() => schools.find(s => s.id.toString() === selectedSchoolId), [selectedSchoolId, schools]);
    
    const studentResults = useMemo(() => {
        return displayedStudents.map(student => {
            // Use unsaved marks first, then fall back to context marks
            const studentMarks = unsavedMarks[student.id] || marks[student.id];
            if (!studentMarks) return { student, totalObtained: 0, gpa: 0 };
            
            const assignedSubjectIds = assignments[student.id] || [];
            let totalObtained = 0;
            let totalWGP = 0;
            let totalCreditHours = 0;

            assignedSubjectIds.forEach(subjectId => {
                const subject = subjects.find(s => s.id === subjectId);
                const mark = studentMarks[subjectId] as { internal: number; theory: number; };
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
    }, [displayedStudents, marks, unsavedMarks, subjects, assignments]);

    const isAllSelected = useMemo(() => selectedStudents.size > 0 && selectedStudents.size === displayedStudents.length, [selectedStudents, displayedStudents]);


    // Callbacks
    const handleLoad = useCallback(async () => {
        if (!selectedSchoolId) {
            addToast("Please select a school first.", "warning");
            return;
        }

        setIsLoading(true);

        try {
            await loadSubjects(); // Call to refresh subjects
            const schoolIdNum = parseInt(selectedSchoolId, 10);
            const academicYearStr = selectedYear.toString();

            const filteredStudents = students.filter(s =>
                s.school_id === schoolIdNum &&
                s.year.toString() === academicYearStr &&
                s.grade === selectedClass
            );

            // Ensure student IDs are unique to prevent React key warnings
            const uniqueFilteredStudents = filteredStudents.filter((student, index, self) => 
                index === self.findIndex(s => s.id === student.id)
            );

            if (uniqueFilteredStudents.length === 0) {
                addToast("No students found for the selected criteria.", "info");
                setDisplayedStudents([]);
                setHeaderSubjects([]);
                setSelectedStudents(new Set());
                setIsLoading(false);
                return;
            }

            const studentIdsToLoad = uniqueFilteredStudents.map(s => s.id);

            await loadAssignmentsForStudents(studentIdsToLoad, academicYearStr);
            await loadMarksForStudents(studentIdsToLoad, academicYearStr);

            const assignedSubjectIds = new Set<number>();
            filteredStudents.forEach(student => {
                const studentAssignments = assignments[student.id] || [];
                studentAssignments.forEach(id => assignedSubjectIds.add(id));
            });
            const uniqueSubjects = subjects.filter(s => assignedSubjectIds.has(s.id));
            setHeaderSubjects(uniqueSubjects.sort((a, b) => a.name.localeCompare(b.name)));

            setDisplayedStudents(uniqueFilteredStudents);
            setSelectedStudents(new Set(uniqueFilteredStudents.map(s => s.id)));

            addToast(`Loaded ${uniqueFilteredStudents.length} students with subject assignments for Grade ${selectedClass}.`, 'info');
        } catch (error: any) {
            console.error('Error loading data:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to load data. Please try again.';
            addToast(`Error: ${errorMessage}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [selectedSchoolId, selectedYear, selectedClass, students, assignments, subjects, addToast, loadAssignmentsForStudents, loadMarksForStudents]);

    // Modified handleMarkChange to only update local state
    const handleMarkChange = useCallback((studentId: string, subjectId: number, field: 'internal' | 'theory', value: string) => {
        if (isReadOnly) return;
        
        const numValue = parseInt(value) || 0;
        
        // Get current marks from unsavedMarks first, then from marks context
        const currentStudentMarks = unsavedMarks[studentId] || marks[studentId] || {};
        const currentSubjectMarkData = currentStudentMarks[subjectId];
        const currentSubjectMark = (typeof currentSubjectMarkData === 'object' && currentSubjectMarkData !== null) ? currentSubjectMarkData : { internal: 0, theory: 0 };
        
        const updatedStudentMarks = {
            ...currentStudentMarks,
            [subjectId]: {
                ...currentSubjectMark,
                [field]: numValue
            }
        };

        // Update unsaved marks state
        setUnsavedMarks(prev => ({
            ...prev,
            [studentId]: updatedStudentMarks
        }));
        
        // Removed toast notification during data entry - only show on Save Marks
    }, [isReadOnly, marks, unsavedMarks]);

    // Modified handleAbsenceChange to only update local state
    const handleAbsenceChange = useCallback((studentId: string, isAbsent: boolean) => {
        if (isReadOnly) return;
        
        // Get current marks from unsavedMarks first, then from marks context
        const currentStudentMarks = unsavedMarks[studentId] || marks[studentId] || {};
        const updatedStudentMarks = {
            ...currentStudentMarks,
            isAbsent: isAbsent,
        };

        // Update unsaved marks state
        setUnsavedMarks(prev => ({
            ...prev,
            [studentId]: updatedStudentMarks
        }));
        
        // Removed toast notification during data entry - only show on Save Marks
    }, [isReadOnly, marks, unsavedMarks]);

    // Regular Functions (not wrapped in useCallback)
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedStudents(e.target.checked ? new Set(displayedStudents.map(s => s.id)) : new Set());
    };
    
    const handleSelectStudent = (studentId: string, isChecked: boolean) => {
        setSelectedStudents(prev => {
            const newSet = new Set(prev);
            isChecked ? newSet.add(studentId) : newSet.delete(studentId);
            return newSet;
        });
    };
    
    // Modified handleSaveMarks to save all unsaved marks
    const handleSaveMarks = async () => {
        if (isReadOnly || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            // Only save if there are unsaved marks
            if (Object.keys(unsavedMarks).length > 0) {
                await updateStudentMarks(unsavedMarks);
                addToast("Marks saved successfully!", "success");
                // Clear unsaved marks after successful save
                setUnsavedMarks({});
            } else {
                addToast("No changes to save.", "info");
            }
        } catch (error) {
            console.error('Error saving marks:', error);
            addToast("Failed to save marks. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteMarks = async () => {
        if (isReadOnly) return;
        if (!selectedSchoolId) {
            addToast("Please select a school first.", "warning");
            return;
        }
        
        if (window.confirm("Are you sure you want to delete all marks for the selected students? This action cannot be undone.")) {
            try {
                for (const studentId of selectedStudents) {
                    await deleteStudentMarks(studentId, selectedYear);
                    // Clear unsaved marks for deleted students
                    setUnsavedMarks(prev => {
                        const newUnsavedMarks = { ...prev };
                        delete newUnsavedMarks[studentId];
                        return newUnsavedMarks;
                    });
                }
                addToast("Marks deleted successfully!", "success");
            } catch (error: any) {
                console.error('Error deleting marks:', error);
                const errorMessage = error.response?.data?.error || error.message || 'Failed to delete marks. Please try again.';
                addToast(`Error deleting marks: ${errorMessage}`, "error");
            }
        }
    };

    // Function to clear unsaved changes
    const handleClearUnsavedChanges = () => {
        setUnsavedMarks({});
        addToast("Unsaved changes cleared.", "info");
    };

    // Effects
    useEffect(() => {
        setPageTitle('Marks Entry');
    }, [setPageTitle]);

    useEffect(() => {
        if (school) {
            setSelectedSchoolId(school.id.toString());
        }
    }, [school]);
    
    useEffect(() => {
        if (appSettings.academicYear) {
            setSelectedYear(appSettings.academicYear);
        }
    }, [appSettings.academicYear]);

    useEffect(() => {
        if (school && selectedSchoolId && selectedYear && selectedClass && !isLoading) {
            handleLoad();
        }
    }, [school, selectedSchoolId, selectedYear, selectedClass, isLoading, handleLoad]);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    {school ? (
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Selected School*</label>
                            <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                {school.iemisCode} - {school.name}
                            </div>
                        </div>
                    ) : (
                        <Select
                            id="school-selector"
                            label="Selected School*"
                            value={selectedSchoolId}
                            onChange={(e) => {
                                setSelectedSchoolId(e.target.value);
                            }}
                            containerClassName="md:col-span-2"
                        >
                            <option value="">-- Select a School --</option>
                            {schools.map(school => (
                                <option key={school.id} value={school.id}>
                                    {school.iemisCode}-{school.name}
                                </option>
                            ))}
                        </Select>
                    )}
                    <Select id="year-selector" label="Year*" value={selectedYear} onChange={(e) => {setSelectedYear(e.target.value);}}>
                        {academicYears.filter(y => y.is_active).map(year => (
                            <option key={year.id} value={year.year}>{year.year}</option>
                        ))}
                    </Select>
                    <Select id="class-selector" label="Class*" value={selectedClass} onChange={(e) => {setSelectedClass(e.target.value);}}>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                    </Select>
                     <Button onClick={handleLoad} disabled={isLoading || !selectedSchoolId}>
                        {isLoading ? (
                            <span className="flex items-center"><Loader /> Loading...</span>
                        ) : (
                            'Load'
                        )}
                     </Button>
                </div>
            </div>

            {displayedStudents.length > 0 && !isLoading && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-fade-in">
                    <div className="overflow-x-auto p-2">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="p-2 w-10 text-center sticky left-0 z-20 bg-gray-50 dark:bg-gray-700"><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} disabled={isReadOnly} className="rounded" /></th>
                                    <th className="p-2 w-12 sticky left-10 z-20 bg-gray-50 dark:bg-gray-700">S.N</th>
                                    <th className="p-2 min-w-[150px] sticky left-24 z-20 bg-gray-50 dark:bg-gray-700">Student Name</th>
                                    <th className="p-2 min-w-[120px]">Regd. No.</th>
                                    <th className="p-2 min-w-[120px]">Symbol No.</th>
                                    <th className="p-2 text-center">IsAbsent</th>
                                    {headerSubjects.map((subject, index) => (
                                        <React.Fragment key={`header-${subject.id}-${index}`}>
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
                                    const currentStudentId = student.id; // Capture student.id here
                                    const studentMarks = unsavedMarks[student.id] || marks[student.id];
                                    if (!studentMarks) return null;
                                    const assignedSubjectIds = new Set(assignments[student.id] || []);
                                    const extraCreditSubjectId = extraCreditAssignments[student.id];
                                    const extraCreditSubject = extraCreditSubjectId ? subjects.find(s => s.id === extraCreditSubjectId) : null;
                                    const extraMark = extraCreditSubjectId ? (studentMarks[extraCreditSubjectId] as Marks) : null;

                                    return (
                                    <tr key={`student-${student.id}`} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50 ${studentMarks.isAbsent ? 'opacity-60 bg-gray-100 dark:bg-gray-700/50' : ''}`}>
                                        <td className="p-2 text-center sticky left-0 z-10 bg-white dark:bg-gray-800"><input type="checkbox" checked={selectedStudents.has(student.id)} onChange={(e) => !isReadOnly && handleSelectStudent(student.id, e.target.checked)} disabled={isReadOnly} className="rounded"/></td>
                                        <td className="p-2 sticky left-10 z-10 bg-white dark:bg-gray-800">{index + 1}</td>
                                        <td className="p-2 font-medium sticky left-24 z-10 bg-white dark:bg-gray-800">{student.name}</td>
                                        <td className="p-2">{student.registration_id}</td>
                                        <td className="p-2">{student.symbol_no}</td>
                                        <td className="p-2 text-center">
                                            <input type="checkbox" checked={!!studentMarks.isAbsent} onChange={(e) => !isReadOnly && handleAbsenceChange(student.id, e.target.checked)} disabled={isReadOnly} className="rounded" />
                                        </td>
                                        
                                        {headerSubjects.map(subject => {
                                            const isAssigned = assignedSubjectIds.has(subject.id);
                                            const mark = studentMarks[subject.id] as Marks;
                                            return (
                                                <React.Fragment key={`cell-${currentStudentId}-${subject.id}`}>
                                                    <td className={`p-1 ${!isAssigned && 'bg-gray-50 dark:bg-gray-700/50'}`}><input type="number" disabled={isReadOnly || !!studentMarks.isAbsent || !isAssigned} value={isAssigned ? mark?.theory ?? '' : ''} onChange={(e) => !isReadOnly && handleMarkChange(student.id, subject.id, 'theory', e.target.value)} className="w-full text-center bg-white dark:bg-gray-700 border rounded p-1 disabled:bg-gray-100 dark:disabled:bg-gray-600"/></td>
                                                    <td className={`p-1 ${!isAssigned && 'bg-gray-50 dark:bg-gray-700/50'}`}><input type="number" disabled={isReadOnly || !!studentMarks.isAbsent || !isAssigned} value={isAssigned ? mark?.internal ?? '' : ''} onChange={(e) => !isReadOnly && handleMarkChange(student.id, subject.id, 'internal', e.target.value)} className="w-full text-center bg-white dark:bg-gray-700 border rounded p-1 disabled:bg-gray-100 dark:disabled:bg-gray-600"/></td>
                                                </React.Fragment>
                                            );
                                        })}

                                        {extraCreditSubject ? (
                                            <>
                                                <td className="p-1 bg-yellow-50 dark:bg-yellow-900/50" title={extraCreditSubject.name}>
                                                    <input type="number" disabled={isReadOnly || !!studentMarks.isAbsent} value={extraMark?.theory ?? ''} onChange={(e) => !isReadOnly && handleMarkChange(student.id, extraCreditSubject.id, 'theory', e.target.value)} className="w-full text-center bg-white dark:bg-gray-700 border rounded p-1 disabled:bg-gray-100 dark:disabled:bg-gray-600"/>
                                                </td>
                                                <td className="p-1 bg-yellow-50 dark:bg-yellow-900/50" title={extraCreditSubject.name}>
                                                    <input type="number" disabled={isReadOnly || !!studentMarks.isAbsent} value={extraMark?.internal ?? ''} onChange={(e) => !isReadOnly && handleMarkChange(student.id, extraCreditSubject.id, 'internal', e.target.value)} className="w-full text-center bg-white dark:bg-gray-700 border rounded p-1 disabled:bg-gray-100 dark:disabled:bg-gray-600"/>
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
                        {Object.keys(unsavedMarks).length > 0 && (
                            <Button variant="secondary" onClick={handleClearUnsavedChanges}>
                                Clear Changes
                            </Button>
                        )}
                        <Button onClick={handleSaveMarks} disabled={isReadOnly || isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Marks'}
                        </Button>
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

export default MarksEntryAdminPage;