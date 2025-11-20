import React, { useState, useMemo, useEffect } from 'react';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { School, Subject, Student } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { usePageTitle } from '../../context/PageTitleContext';
import IconButton from '../../components/IconButton';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { useData } from '../../context/DataContext';
import ConfirmModal from '../../components/ConfirmModal';
import dataService from '../../services/dataService';

const SubjectAssignPage: React.FC<{ school?: School, isReadOnly?: boolean }> = ({ school, isReadOnly = false }) => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Assign Subjects to Student');
    }, [setPageTitle]);

    const { schools, subjects: allSubjects, students: allStudents, assignments, extraCreditAssignments, setAssignments, setExtraCreditAssignments, academicYears } = useData();
    const { addToast } = useAppContext();

    const [selectedSchoolId, setSelectedSchoolId] = useState<string>(school?.id.toString() || '');
    const [selectedYear, setSelectedYear] = useState<string>('2082');
    const [selectedClass, setSelectedClass] = useState<string>('11');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [showAssigner, setShowAssigner] = useState<boolean>(false);
    
    const [subjectToAddId, setSubjectToAddId] = useState<string>('');
    const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
    const [selectedExtraCreditSubjectId, setSelectedExtraCreditSubjectId] = useState<string>('');
    
    const [isLoadingAssignments, setIsLoadingAssignments] = useState<boolean>(false);

    const studentsInSchool = useMemo(() => {
        if (!selectedSchoolId || !allStudents || !selectedYear || !selectedClass) return [];
        return allStudents.filter(student => 
            student.school_id.toString() === selectedSchoolId &&
            student.year.toString() === selectedYear &&
            student.grade === selectedClass
        );
    }, [allStudents, selectedSchoolId, selectedYear, selectedClass]);
    
    useEffect(() => {
        if (showAssigner && selectedStudentId && allSubjects) {
            // Load assignments for the selected student
            loadStudentAssignments();
        } else {
            setAssignedSubjects([]);
            setSelectedExtraCreditSubjectId('');
        }
    }, [showAssigner, selectedStudentId, allSubjects]);

    const loadStudentAssignments = async () => {
        if (!selectedStudentId || !allSubjects) return;
        
        setIsLoadingAssignments(true);
        try {
            // Check if we already have the assignments in context
            if (assignments[selectedStudentId] && extraCreditAssignments[selectedStudentId] !== undefined) {
                const assignedIds = new Set(assignments[selectedStudentId] || []);
                setAssignedSubjects(allSubjects.filter(s => assignedIds.has(s.id)));
                const extraCreditId = extraCreditAssignments[selectedStudentId];
                // Convert null to empty string for the select component
                setSelectedExtraCreditSubjectId(extraCreditId ? String(extraCreditId) : '');
            } else {
                // Load from API
                const assignmentData = await dataService.subjectAssignments.getAssignments(selectedStudentId, selectedYear);
                
                // Update context with loaded assignments
                setAssignments(prev => ({ ...prev, [selectedStudentId]: assignmentData.subjectIds }));
                setExtraCreditAssignments(prev => ({ ...prev, [selectedStudentId]: assignmentData.extraCreditSubjectId }));
                
                // Update local state
                const assignedIds = new Set(assignmentData.subjectIds);
                setAssignedSubjects(allSubjects.filter(s => assignedIds.has(s.id)));
                // Convert null to empty string for the select component
                setSelectedExtraCreditSubjectId(assignmentData.extraCreditSubjectId ? String(assignmentData.extraCreditSubjectId) : '');
            }
        } catch (error: any) {
            console.error('Error loading student assignments:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to load student assignments. Please try again.';
            addToast(`Error loading assignments: ${errorMessage}`, 'error');
        } finally {
            setIsLoadingAssignments(false);
        }
    };

    const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSchoolId(e.target.value);
        setSelectedStudentId('');
        setShowAssigner(false);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(e.target.value);
        setSelectedStudentId('');
        setShowAssigner(false);
    };
    
    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClass(e.target.value);
        setSelectedStudentId('');
        setShowAssigner(false);
    };
    
    const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStudentId(e.target.value);
        setShowAssigner(false);
    };

    const handleLoad = () => {
        if (!selectedStudentId) {
            addToast('Please select a student first.', 'warning');
            return;
        }
        setShowAssigner(true);
    };

    const handleAddSubject = () => {
        if (!subjectToAddId) {
            addToast('Please select a subject to add.', 'warning');
            return;
        }
        const subject = allSubjects?.find(s => s.id.toString() === subjectToAddId);
        if (subject && !assignedSubjects.find(s => s.id === subject.id)) {
            setAssignedSubjects(prev => [...prev, subject]);
        }
        setSubjectToAddId('');
    };

    const handleRemoveSubject = (subjectId: number) => {
        const subject = assignedSubjects.find(s => s.id === subjectId);
        if (subject) {
          setSubjectToRemove({id: subjectId, name: subject.name});
          setIsConfirmModalOpen(true);
        }
    };

    const confirmRemoveSubject = () => {
      if (subjectToRemove) {
        setAssignedSubjects(prev => prev.filter(s => s.id !== subjectToRemove.id));
        setSubjectToRemove(null);
      }
    };

    const handleSubmit = async () => {
        if (!selectedStudentId) {
            addToast('No student selected.', 'error');
            return;
        }
        
        try {
            // Save to API
            const subjectIds = assignedSubjects.map(s => s.id);
            // Convert empty string to null for extra credit subject
            const extraCreditId = selectedExtraCreditSubjectId && selectedExtraCreditSubjectId !== '' ? parseInt(selectedExtraCreditSubjectId, 10) : null;
            
            await dataService.subjectAssignments.saveAssignments(
                selectedStudentId,
                selectedYear,
                subjectIds,
                extraCreditId
            );
            
            // Update context
            setAssignments(prev => ({ ...prev, [selectedStudentId]: subjectIds }));
            setExtraCreditAssignments(prev => ({ ...prev, [selectedStudentId]: extraCreditId }));
            
            addToast(`Subject registration for student has been submitted and saved successfully.`, 'success');
        } catch (error: any) {
            console.error('Error saving subject assignments:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to save subject assignments. Please try again.';
            addToast(`Error saving assignments: ${errorMessage}`, 'error');
        }
    };
    
    const availableMainSubjects = useMemo(() => {
        if (!allSubjects) return [];
        const assignedIds = new Set(assignedSubjects.map(s => s.id));
        // Convert empty string to null for the current extra credit subject ID
        if (selectedExtraCreditSubjectId && selectedExtraCreditSubjectId !== '') {
            assignedIds.add(parseInt(selectedExtraCreditSubjectId, 10));
        }
        return allSubjects.filter(s => !assignedIds.has(s.id));
    }, [allSubjects, assignedSubjects, selectedExtraCreditSubjectId]);
    
    const availableExtraCreditSubjects = useMemo(() => {
        if (!allSubjects) return [];
        const assignedMainIds = new Set(assignedSubjects.map(s => s.id));
        // Convert empty string to null for the current extra credit subject ID
        const currentExtraId = selectedExtraCreditSubjectId && selectedExtraCreditSubjectId !== '' ? parseInt(selectedExtraCreditSubjectId, 10) : null;
        return allSubjects.filter(s => !assignedMainIds.has(s.id) || s.id === currentExtraId);
    }, [allSubjects, assignedSubjects, selectedExtraCreditSubjectId]);
    
    const extraCreditSubject = useMemo(() => {
        if (!selectedExtraCreditSubjectId || !allSubjects) return null;
        return allSubjects.find(s => s.id.toString() === selectedExtraCreditSubjectId);
    }, [selectedExtraCreditSubjectId, allSubjects]);

    const handleRemoveExtraCreditSubject = () => {
        setSelectedExtraCreditSubjectId('');
    };

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [subjectToRemove, setSubjectToRemove] = useState<{id: number, name: string} | null>(null);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                    <div className="md:col-span-2">
                        {school ? (
                             <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">School</label>
                                <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                    {school.name}
                                </div>
                             </div>
                        ) : (
                            <Select id="school-selector" label="Select a School*" value={selectedSchoolId} onChange={handleSchoolChange}>
                                <option value="">-- Select a School --</option>
                                {schools?.map(school => (
                                    <option key={school.id} value={school.id}>{school.iemisCode}-{school.name}</option>
                                ))}
                            </Select>
                        )}
                    </div>
                     <Select id="year-selector" label="Year*" value={selectedYear} onChange={handleYearChange}>
                        {academicYears.filter(y => y.is_active).map(year => (
                            <option key={year.id} value={year.year}>{year.year}</option>
                        ))}
                     </Select>
                     <Select id="class-selector" label="Class*" value={selectedClass} onChange={handleClassChange}>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                     </Select>
                     <Select containerClassName="md:col-span-2" id="student-selector" label="Select a Student*" value={selectedStudentId} onChange={handleStudentChange} disabled={!selectedSchoolId}>
                        <option value="">-- Select a Student --</option>
                        {studentsInSchool.map(student => (
                            <option key={student.id} value={student.id}>{student.name} ({student.id})</option>
                        ))}
                    </Select>
                    <Button onClick={handleLoad} disabled={!selectedStudentId}>Load</Button>
                </div>
            </div>

            {showAssigner && selectedStudentId ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
                    {isLoadingAssignments ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading assignments...</span>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Subject Registration (for GPA Calculation)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6 p-4 border dark:border-gray-700 rounded-lg">
                               <Select id="subject-to-add" label="Available Subjects" containerClassName="md:col-span-3" value={subjectToAddId} onChange={e => setSubjectToAddId(e.target.value)} disabled={isReadOnly}>
                                   <option value="">-- Select Subject to Add --</option>
                                   {availableMainSubjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                               </Select>
                                <Button onClick={handleAddSubject} className="w-full" disabled={isReadOnly}>Add Subject</Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                        <tr>
                                            {['S.N.', 'Code', 'Name', 'TCH', 'TRM', 'ICH', 'IRM', 'Total CH', 'Total Marks', 'Action'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignedSubjects.map((subject, index) => (
                                            <tr key={subject.id} className="border-b dark:border-gray-700">
                                                <td className="px-4 py-2">{index + 1}</td>
                                                <td className="px-4 py-2"><input type="text" value={subject.theory.subCode} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                <td className="px-4 py-2"><input type="text" value={subject.name} readOnly className="w-full bg-gray-100 dark:bg-gray-700 p-1 rounded border-none min-w-48"/></td>
                                                <td className="px-4 py-2"><input type="text" value={subject.theory.credit.toFixed(2)} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                <td className="px-4 py-2"><input type="text" value={subject.theory.fullMarks} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                <td className="px-4 py-2"><input type="text" value={subject.internal.credit.toFixed(2)} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                <td className="px-4 py-2"><input type="text" value={subject.internal.fullMarks} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                <td className="px-4 py-2"><input type="text" value={(subject.theory.credit + subject.internal.credit).toFixed(2)} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                <td className="px-4 py-2"><input type="text" value={subject.theory.fullMarks + subject.internal.fullMarks} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                <td className="px-4 py-2">
                                                    <IconButton size="sm" onClick={() => handleRemoveSubject(subject.id)} title="Remove Subject" className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50" disabled={isReadOnly}>
                                                        <TrashIcon className="w-5 h-5" />
                                                    </IconButton>
                                                </td>
                                            </tr>
                                        ))}
                                        {assignedSubjects.length === 0 && (
                                            <tr><td colSpan={10} className="text-center py-8 text-gray-500">No subjects have been assigned/registered for this student.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-8 pt-6 border-t dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Extra Credit Subject (Optional)</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Select one optional subject. This subject will not be included in the GPA calculation.</p>
                                <Select 
                                    id="extra-credit-subject" 
                                    label="Available Extra Credit Subjects" 
                                    containerClassName="max-w-md" 
                                    value={selectedExtraCreditSubjectId} 
                                    onChange={e => setSelectedExtraCreditSubjectId(e.target.value)}
                                    disabled={isReadOnly}
                                >
                                    <option value="">-- No Extra Credit Subject --</option>
                                    {availableExtraCreditSubjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                                </Select>

                                {extraCreditSubject && (
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full text-xs text-left">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                                <tr>
                                                    {['S.N.', 'Code', 'Name', 'TCH', 'TRM', 'ICH', 'IRM', 'Total CH', 'Total Marks', 'Action'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b dark:border-gray-700">
                                                    <td className="px-4 py-2">1</td>
                                                    <td className="px-4 py-2"><input type="text" value={extraCreditSubject.theory.subCode} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                    <td className="px-4 py-2"><input type="text" value={extraCreditSubject.name} readOnly className="w-full bg-gray-100 dark:bg-gray-700 p-1 rounded border-none min-w-48"/></td>
                                                    <td className="px-4 py-2"><input type="text" value={extraCreditSubject.theory.credit.toFixed(2)} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                    <td className="px-4 py-2"><input type="text" value={extraCreditSubject.theory.fullMarks} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                    <td className="px-4 py-2"><input type="text" value={extraCreditSubject.internal.credit.toFixed(2)} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                    <td className="px-4 py-2"><input type="text" value={extraCreditSubject.internal.fullMarks} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                    <td className="px-4 py-2"><input type="text" value={(extraCreditSubject.theory.credit + extraCreditSubject.internal.credit).toFixed(2)} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                    <td className="px-4 py-2"><input type="text" value={extraCreditSubject.theory.fullMarks + extraCreditSubject.internal.fullMarks} readOnly className="w-20 bg-gray-100 dark:bg-gray-700 p-1 rounded border-none"/></td>
                                                    <td className="px-4 py-2">
                                                        <IconButton size="sm" onClick={handleRemoveExtraCreditSubject} title="Remove Subject" className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50" disabled={isReadOnly}>
                                                            <TrashIcon className="w-5 h-5" />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button onClick={handleSubmit} disabled={isReadOnly}>Submit</Button>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                    <p className="text-gray-500 dark:text-gray-400">Please select all criteria and click 'Load' to assign subjects.</p>
                </div>
            )}
            <ConfirmModal
              isOpen={isConfirmModalOpen}
              onClose={() => {
                setIsConfirmModalOpen(false);
                setSubjectToRemove(null);
              }}
              onConfirm={confirmRemoveSubject}
              title="Confirm Remove Subject"
              message={`Are you sure you want to remove ${subjectToRemove?.name} from the assigned subjects?`}
              confirmText="Remove"
              confirmVariant="danger"
            />
        </div>
    );
};

export default SubjectAssignPage;