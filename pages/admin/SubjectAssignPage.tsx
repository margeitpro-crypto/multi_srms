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
import Loader from '../../components/Loader';

const SubjectAssignPage: React.FC<{ school?: School, isReadOnly?: boolean }> = ({ school, isReadOnly = false }) => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Assign Subjects to Student');
    }, [setPageTitle]);

    const { schools, subjects: allSubjects, students: allStudents, assignments, extraCreditAssignments, academicYears, appSettings, updateStudentAssignments, loadAssignmentsForStudents } = useData();
    const { addToast } = useAppContext();

    const [selectedSchoolId, setSelectedSchoolId] = useState<string>(school?.id.toString() || '');
    const [selectedYear, setSelectedYear] = useState<string>(appSettings.academicYear || '2082');
    const [selectedClass, setSelectedClass] = useState<string>('11');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [showAssigner, setShowAssigner] = useState<boolean>(false);
    const [subjectToAddId, setSubjectToAddId] = useState<string>('');
    const [subjectIdPendingRemoval, setSubjectIdPendingRemoval] = useState<number | null>(null);
    const [localSelectedExtraCreditSubjectId, setLocalSelectedExtraCreditSubjectId] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false); // Declare isLoading here
    
    // Add search state for available subjects
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // Add state for tracking unsaved changes
    const [unsavedMainSubjects, setUnsavedMainSubjects] = useState<number[]>([]);
    const [unsavedExtraCreditSubjectId, setUnsavedExtraCreditSubjectId] = useState<number | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

    const studentsInSchool = useMemo(() => {
        if (!selectedSchoolId || !allStudents || !selectedYear || !selectedClass) return [];
        return allStudents.filter(student =>
            student.school_id.toString() === selectedSchoolId &&
            student.year.toString() === selectedYear &&
            student.grade === selectedClass
        );
    }, [allStudents, selectedSchoolId, selectedYear, selectedClass]);

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

    const handleLoad = async () => {
        if (!selectedStudentId) {
            addToast('Please select a student first.', 'warning');
            return;
        }
        setShowAssigner(false); // Hide assigner while loading
        setIsLoading(true); // Set loading true

        try {
            await loadAssignmentsForStudents([selectedStudentId], selectedYear); // Load into DataContext
            
            // Initialize unsaved changes with current assignments
            const currentAssignedSubjects = assignments[selectedStudentId] || [];
            const currentExtraCreditSubjectId = extraCreditAssignments[selectedStudentId] || null;
            setUnsavedMainSubjects([...currentAssignedSubjects]);
            setUnsavedExtraCreditSubjectId(currentExtraCreditSubjectId);
            setHasUnsavedChanges(false);
            
            setShowAssigner(true); // Show assigner only after loading
            addToast('Assignments loaded successfully!', 'success');
        } catch (error: any) {
            console.error('Error loading assignments:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to load assignments. Please try again.';
            addToast(`Error: ${errorMessage}`, 'error');
            setShowAssigner(false);
        } finally {
            setIsLoading(false); // Set loading false
        }
    };

    useEffect(() => {
        if (selectedStudentId && extraCreditAssignments[selectedStudentId] !== undefined) {
            const extraCreditId = extraCreditAssignments[selectedStudentId];
            setLocalSelectedExtraCreditSubjectId(extraCreditId ? String(extraCreditId) : '');
        } else {
            setLocalSelectedExtraCreditSubjectId('');
        }
    }, [extraCreditAssignments, selectedStudentId]);

    const handleAddSubject = () => {
        if (!subjectToAddId) {
            addToast('Please select a subject to add.', 'warning');
            return;
        }
        if (!selectedStudentId) {
            addToast('No student selected.', 'error');
            return;
        }

        const subjectIdNum = parseInt(subjectToAddId, 10);
        const currentAssignedSubjects = [...unsavedMainSubjects];

        if (currentAssignedSubjects.includes(subjectIdNum)) {
            addToast('Subject already assigned.', 'info');
            return;
        }

        const newAssignedSubjects = [...currentAssignedSubjects, subjectIdNum];
        setUnsavedMainSubjects(newAssignedSubjects);
        setHasUnsavedChanges(true);
        setSubjectToAddId(''); // Clear selection
        addToast('Subject added to pending changes!', 'success');
    };

    const handleRemoveSubject = (subjectId: number) => {
        setSubjectIdPendingRemoval(subjectId);
        setIsConfirmModalOpen(true);
    };

    const performRemoveSubject = () => {
        if (!subjectIdPendingRemoval || !selectedStudentId) {
            addToast('Error: No subject selected for removal or no student selected.', 'error');
            setIsConfirmModalOpen(false); // Close modal if there's an error
            return;
        }

        const newAssignedSubjects = unsavedMainSubjects.filter(id => id !== subjectIdPendingRemoval);
        setUnsavedMainSubjects(newAssignedSubjects);
        setHasUnsavedChanges(true);
        setIsConfirmModalOpen(false);
        setSubjectIdPendingRemoval(null);
        addToast('Subject removed from pending changes!', 'success');
    };

    const availableMainSubjects = useMemo(() => {
        if (!allSubjects) return [];
        const currentAssignedSubjectIds = [...unsavedMainSubjects]; // Use unsaved changes
        const assignedIds = new Set(currentAssignedSubjectIds);
        
        // Add the currently selected extra credit subject (from context) to assignedIds if it's a number
        const currentExtraCreditFromContext = extraCreditAssignments[selectedStudentId];
        if (currentExtraCreditFromContext && typeof currentExtraCreditFromContext === 'number') {
            assignedIds.add(currentExtraCreditFromContext);
        }

        let filteredSubjects = allSubjects.filter(s => !assignedIds.has(s.id));
        
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filteredSubjects = filteredSubjects.filter(s => 
                s.theory.subCode.toLowerCase().includes(lowerSearchTerm) ||
                s.name.toLowerCase().includes(lowerSearchTerm)
            );
        }
        
        return filteredSubjects;
    }, [allSubjects, unsavedMainSubjects, selectedStudentId, extraCreditAssignments, searchTerm]);
    
    const availableExtraCreditSubjects = useMemo(() => {
        if (!allSubjects) return [];
        const currentAssignedSubjectIds = [...unsavedMainSubjects]; // Use unsaved changes
        const assignedMainIds = new Set(currentAssignedSubjectIds);
        
        // The currently selected extra credit subject (from context) should always be available
        const currentExtraCreditFromContext = extraCreditAssignments[selectedStudentId];
        
        let filteredSubjects = allSubjects.filter(s => 
            !assignedMainIds.has(s.id) || (currentExtraCreditFromContext !== null && s.id === currentExtraCreditFromContext)
        );
        
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filteredSubjects = filteredSubjects.filter(s => 
                s.theory.subCode.toLowerCase().includes(lowerSearchTerm) ||
                s.name.toLowerCase().includes(lowerSearchTerm)
            );
        }
        
        return filteredSubjects;
    }, [allSubjects, unsavedMainSubjects, selectedStudentId, extraCreditAssignments, searchTerm]);
    
    const extraCreditSubject = useMemo(() => {
        if (!unsavedExtraCreditSubjectId || !allSubjects) return null;
        return allSubjects.find(s => s.id === unsavedExtraCreditSubjectId);
    }, [unsavedExtraCreditSubjectId, allSubjects]);

    const assignedSubjects = useMemo(() => {
        if (!selectedStudentId || !allSubjects) return [];
        const assignedIds = [...unsavedMainSubjects]; // Use unsaved changes
        return allSubjects.filter(subject => assignedIds.includes(subject.id));
    }, [selectedStudentId, allSubjects, unsavedMainSubjects]);

    const handleRemoveExtraCreditSubject = () => {
        if (!selectedStudentId) {
            addToast('No student selected.', 'error');
            return;
        }

        setUnsavedExtraCreditSubjectId(null);
        setLocalSelectedExtraCreditSubjectId('');
        setHasUnsavedChanges(true);
        addToast('Extra Credit subject removed from pending changes!', 'success');
    };

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // New function to save all assignments at once
    const handleSaveAllAssignments = async () => {
        if (!selectedStudentId) {
            addToast('No student selected.', 'error');
            return;
        }

        const currentAssignedSubjects = [...unsavedMainSubjects];
        const currentExtraCreditSubjectId = unsavedExtraCreditSubjectId;

        try {
            await updateStudentAssignments(
                selectedStudentId,
                selectedYear,
                currentAssignedSubjects,
                currentExtraCreditSubjectId
            );
            setHasUnsavedChanges(false);
            addToast('All subject assignments saved successfully!', 'success');
        } catch (error: any) {
            console.error('Error saving assignments:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to save subject assignments.';
            addToast(`Error: ${errorMessage}`, 'error');
        }
    };

    // Function to discard unsaved changes
    const handleDiscardChanges = () => {
        if (!selectedStudentId) return;
        
        // Revert to the last saved assignments
        const currentAssignedSubjects = assignments[selectedStudentId] || [];
        const currentExtraCreditSubjectId = extraCreditAssignments[selectedStudentId] || null;
        setUnsavedMainSubjects([...currentAssignedSubjects]);
        setUnsavedExtraCreditSubjectId(currentExtraCreditSubjectId);
        setHasUnsavedChanges(false);
        addToast('Changes discarded.', 'info');
    };

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
                    <Button onClick={handleLoad} disabled={!selectedStudentId || isLoading}>
                        {isLoading ? (
                            <span className="flex items-center"><Loader /> Loading...</span>
                        ) : (
                            'Load'
                        )}
                    </Button>
                </div>
            </div>

            {showAssigner && selectedStudentId ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
                    <>
                        {hasUnsavedChanges && (
                            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md">
                                <div className="flex justify-between items-center">
                                    <p className="text-yellow-800 dark:text-yellow-200">
                                        You have unsaved changes. Don't forget to save before leaving!
                                    </p>
                                    <div className="flex space-x-2">
                                        <Button variant="secondary" onClick={handleDiscardChanges} size="sm">
                                            Discard
                                        </Button>
                                        <Button onClick={handleSaveAllAssignments} size="sm">
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Subject Registration (for GPA Calculation)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6 p-4 border dark:border-gray-700 rounded-lg">
                           <div className="md:col-span-1">
                               <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Subjects Code</label>
                               <input
                                   type="text"
                                   placeholder="Enter subject code or name..."
                                   value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value)}
                                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                               />
                           </div>
                           
                           <Select id="subject-to-add" label="Available Subjects" containerClassName="md:col-span-2" value={subjectToAddId} onChange={e => setSubjectToAddId(e.target.value)} disabled={isReadOnly}>
                               <option value="">-- Select Subject to Add --</option>
                               {availableMainSubjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                           </Select>
                            <Button onClick={handleAddSubject} className="w-full md:col-span-1" disabled={isReadOnly}>Add Subject</Button>
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
                                value={localSelectedExtraCreditSubjectId}
                                onChange={(e) => {
                                    setLocalSelectedExtraCreditSubjectId(e.target.value); // Optimistic UI update
                                    const newExtraCreditId = e.target.value ? parseInt(e.target.value, 10) : null;
                                    
                                    setUnsavedExtraCreditSubjectId(newExtraCreditId);
                                    setHasUnsavedChanges(true);
                                    addToast('Extra Credit subject updated in pending changes!', 'success');
                                }}
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

                        <div className="mt-6 flex justify-end space-x-3">
                            {hasUnsavedChanges && (
                                <Button variant="secondary" onClick={handleDiscardChanges}>
                                    Discard Changes
                                </Button>
                            )}
                            <Button onClick={handleSaveAllAssignments} disabled={isReadOnly || !hasUnsavedChanges}>
                                Save All Assignments
                            </Button>
                        </div>
                    </>
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
                setSubjectIdPendingRemoval(null);
              }}
              onConfirm={performRemoveSubject}
              title="Confirm Remove Subject"
              message={
                  subjectIdPendingRemoval 
                  ? `Are you sure you want to remove ${allSubjects.find(s => s.id === subjectIdPendingRemoval)?.name} from the assigned subjects?` 
                  : "Are you sure you want to remove this subject from the assigned subjects?"
              }
              confirmText="Remove"
              confirmVariant="danger"
            />
        </div>
    );
};

export default SubjectAssignPage;