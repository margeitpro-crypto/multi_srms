import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { School, Student, Subject, SchoolPageVisibility } from '../types';
import { MOCK_GRADES_INITIAL, MOCK_SCHOOL_PAGE_VISIBILITY_INITIAL } from '../data/initialData';
import { useAppContext } from './AppContext';
import { calculateGradesForStudents } from '../utils/gradeCalculator';
import dataService from '../services/dataService';

// Data types for context
export type AssignmentsMap = { [studentId: string]: number[] };
export type ExtraCreditAssignmentsMap = { [studentId: string]: number | null };
export type MarksMap = {
    [studentId: string]: {
        isAbsent?: boolean;
        [key: string]: { internal: number; theory: number } | boolean | undefined;
    };
};
export type GradesMap = {
  [studentId: string]: {
    gpa: number;
    subjects: {
      [subjectId: number]: { in: string; th: string; in_gp: number; th_gp: number; };
    };
  };
};

interface DataContextType {
    // Data
    schools: School[];
    students: Student[];
    subjects: Subject[];
    assignments: AssignmentsMap;
    extraCreditAssignments: ExtraCreditAssignmentsMap;
    marks: MarksMap;
    grades: GradesMap;
    schoolPageVisibility: SchoolPageVisibility;
    academicYears: any[];
    appSettings: {
        appName: string;
        academicYear: string;
        appLogo: string;
    };
    // Loading state
    isDataLoading: boolean;
    // Refresh triggers
    marksRefreshTrigger: number;
    gradesRefreshTrigger: number;
    assignmentsRefreshTrigger: number;
    // Modifiers
    setSchools: React.Dispatch<React.SetStateAction<School[]>>;
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
    setAssignments: React.Dispatch<React.SetStateAction<AssignmentsMap>>;
    setExtraCreditAssignments: React.Dispatch<React.SetStateAction<ExtraCreditAssignmentsMap>>;
    setMarks: React.Dispatch<React.SetStateAction<MarksMap>>;
    setGrades: React.Dispatch<React.SetStateAction<GradesMap>>;
    setSchoolPageVisibility: React.Dispatch<React.SetStateAction<SchoolPageVisibility>>;
    setAcademicYears: React.Dispatch<React.SetStateAction<any[]>>;
    setAppSettings: React.Dispatch<React.SetStateAction<{
        appName: string;
        academicYear: string;
        appLogo: string;
    }>>;
    updateStudentMarks: (updatedMarks: MarksMap) => Promise<void>;
    updateStudentGrades: (updatedGrades: GradesMap) => void;
    deleteStudentMarks: (studentId: string, academicYear: string) => Promise<void>;
    updateStudentAssignments: (studentId: string, year: string, subjectIds: number[], extraCreditSubjectId: number | null) => Promise<void>;
    loadAssignmentsForStudents: (studentIds: string[], year: string) => Promise<void>;
    loadMarksForStudents: (studentIds: string[], year: string) => Promise<void>;
    loadSubjects: () => Promise<void>;
    loadStudents: () => Promise<void>;
    // Helper function
    resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
    userRole?: 'admin' | 'school' | null;
    userSchoolId?: number | null;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children, userRole, userSchoolId }) => {
    const { addToast } = useAppContext();
    const [isDataLoading, setIsDataLoading] = useState(true);

    const [schools, setSchools] = useState<School[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [assignments, setAssignments] = useState<AssignmentsMap>({});
    const [extraCreditAssignments, setExtraCreditAssignments] = useState<ExtraCreditAssignmentsMap>({});
    const [marks, setMarks] = useState<MarksMap>({});
    const [grades, setGrades] = useState<GradesMap>({});
    const [schoolPageVisibility, setSchoolPageVisibility] = useState<SchoolPageVisibility>({} as SchoolPageVisibility);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [appSettings, setAppSettings] = useState({
        appName: 'ResultSys',
        academicYear: '2082',
        appLogo: ''
    });
    
    const [marksRefreshTrigger, setMarksRefreshTrigger] = useState(0);
    const [gradesRefreshTrigger, setGradesRefreshTrigger] = useState(0);
    const [assignmentsRefreshTrigger, setAssignmentsRefreshTrigger] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            if (!userRole) return; // Wait until user role is determined
            setIsDataLoading(true);
            try {
                const [schoolsData, studentsData, subjectsData, academicYearsData, appSettingsData] = await Promise.all([
                    dataService.schools.getAll(),
                    dataService.students.getAll(),
                    dataService.subjects.getAll(),
                    dataService.academicYears.getAll(),
                    dataService.applicationSettings.getAll()
                ]);
                
                setSchools(schoolsData);
                setStudents(studentsData);
                setSubjects(subjectsData);
                setAcademicYears(academicYearsData);
                
                const settingsMap: { [key: string]: any } = {};
                appSettingsData.forEach((setting: any) => {
                    settingsMap[setting.key] = setting.value;
                });
                setAppSettings({
                    appName: settingsMap['app_name'] || 'ResultSys',
                    academicYear: settingsMap['academic_year'] || '2082',
                    appLogo: settingsMap['app_logo'] || ''
                });
                
                setGrades(MOCK_GRADES_INITIAL);
                setSchoolPageVisibility(MOCK_SCHOOL_PAGE_VISIBILITY_INITIAL);
                setAssignments({});
                setExtraCreditAssignments({});
                setMarks({});
            } catch (error: any) {
                console.error('Error loading data:', error);
                if (error.response?.status !== 401) {
                    addToast(`Error loading data: ${error.message || 'Server error'}`, 'error');
                }
            } finally {
                setIsDataLoading(false);
            }
        };
        loadData();
    }, [userRole, userSchoolId]);

    const loadAssignmentsForStudents = async (studentIds: string[], year: string) => {
        try {
            const newAssignments: AssignmentsMap = {};
            const newExtraCredit: ExtraCreditAssignmentsMap = {};
    
            const promises = studentIds.map(async (studentId) => {
                // Fetch assignments regardless of whether they are already loaded
                const data = await dataService.subjectAssignments.getAssignments(studentId, year);
                newAssignments[studentId] = data.subjectIds || [];
                newExtraCredit[studentId] = data.extraCreditSubjectId || null;
            });
    
            await Promise.all(promises);
    
            if (Object.keys(newAssignments).length > 0) {
                setAssignments(prev => ({ ...prev, ...newAssignments }));
            }
            if (Object.keys(newExtraCredit).length > 0) {
                setExtraCreditAssignments(prev => ({ ...prev, ...newExtraCredit }));
            }
        } catch (error) {
            console.error("Error loading assignments on demand:", error);
            addToast("Failed to load some assignment data.", "error");
        }
    };

    const loadMarksForStudents = async (studentIds: string[], year: string) => {
        try {
            const newMarks: MarksMap = {};
            const promises = studentIds.map(async (studentId) => {
                if (!marks[studentId]) { // Fetch only if not already loaded
                    const data = await dataService.marks.getMarks(studentId, year);
                    // Convert backend format (practical) to frontend format (internal)
                    const convertedData: any = {};
                    if (data) {
                        Object.keys(data).forEach(key => {
                            if (key === 'isAbsent') {
                                convertedData[key] = data[key];
                            } else {
                                const subjectId = key;
                                const markData = data[key];
                                if (typeof markData === 'object' && markData !== null) {
                                    convertedData[subjectId] = {
                                        theory: markData.theory || 0,
                                        internal: markData.practical || 0,  // Convert practical to internal
                                    };
                                }
                            }
                        });
                    }
                    newMarks[studentId] = convertedData || {};
                }
            });

            await Promise.all(promises);

            if (Object.keys(newMarks).length > 0) {
                setMarks(prev => ({ ...prev, ...newMarks }));
            }
        } catch (error) {
            console.error("Error loading marks on demand:", error);
            addToast("Failed to load some marks data.", "error");
        }
    };

    const updateStudentAssignments = async (studentId: string, year: string, subjectIds: number[], extraCreditSubjectId: number | null) => {
        try {
            await dataService.subjectAssignments.saveAssignments(studentId, year, subjectIds, extraCreditSubjectId);
            
            // Update local state immediately for responsiveness
            setAssignments(prev => ({ ...prev, [studentId]: subjectIds }));
            setExtraCreditAssignments(prev => ({ ...prev, [studentId]: extraCreditSubjectId }));
    
            // Trigger a refresh for components that depend on assignments
            setAssignmentsRefreshTrigger(prev => prev + 1);

            // Re-fetch assignments for the updated student to ensure data consistency from backend
            await loadAssignmentsForStudents([studentId], year);
            
            addToast('Assignments saved successfully!', 'success');
        } catch (error: any) {
            console.error('Error saving assignments:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to save assignments.';
            addToast(`Error: ${errorMessage}`, 'error');
            throw error;
        }
    };

    const updateStudentMarks = async (updatedMarks: MarksMap) => {
        const studentIdsToUpdate = Object.keys(updatedMarks);
        try {
            for (const studentId of studentIdsToUpdate) {
                const student = students.find(s => s.id === studentId);
                if (student) {
                    const apiMarksFormat: { [subjectId: number]: { theory: number; practical: number; isAbsent: boolean } } = {};
                    const studentMarks = updatedMarks[studentId];
                    if (studentMarks) {
                        const isAbsent = studentMarks.isAbsent || false;
                        Object.keys(studentMarks).forEach(key => {
                            if (key !== 'isAbsent') {
                                const subjectId = parseInt(key);
                                const markData = studentMarks[key];
                                if (typeof markData === 'object' && markData !== null) {
                                    apiMarksFormat[subjectId] = {
                                        theory: markData.theory || 0,
                                        practical: markData.internal || 0,  // Fixed: map 'internal' to 'practical'
                                        isAbsent: isAbsent
                                    };
                                }
                            }
                        });
                    }
                    await dataService.marks.saveMarks(studentId, student.year.toString(), apiMarksFormat);
                }
            }

            // After successful save, update the context state
            setMarks(prevMarks => ({ ...prevMarks, ...updatedMarks }));
            
            const newGrades = calculateGradesForStudents(studentIdsToUpdate, { ...marks, ...updatedMarks }, subjects, assignments);
            setGrades(prevGrades => ({ ...prevGrades, ...newGrades }));
            
            setMarksRefreshTrigger(prev => prev + 1);
            setGradesRefreshTrigger(prev => prev + 1);

            // Re-fetch marks for the updated students to ensure data consistency from backend
            await loadMarksForStudents(studentIdsToUpdate, appSettings.academicYear);
            
            addToast('Marks saved successfully!', 'success');
        } catch (error: any) {
            console.error('Error saving marks to API:', error);
            addToast(`Error saving marks: ${error.message || 'Server error'}`, 'error');
            throw error;
        }
    };
    
    const deleteStudentMarks = async (studentId: string, academicYear: string) => {
        try {
            await dataService.marks.deleteMarks(studentId, academicYear);
            setMarks(prev => {
                const newMarks = { ...prev };
                if (newMarks[studentId]) {
                    const { [studentId]: removed, ...rest } = newMarks;
                    return rest;
                }
                return newMarks;
            });
            addToast('Marks deleted successfully!', 'success');
        } catch (error: any) {
            console.error('Error deleting marks from API:', error);
            addToast(`Error deleting marks: ${error.message || 'Server error'}`, 'error');
            throw error;
        }
    };
    
    const updateStudentGrades = (updatedGrades: GradesMap) => {
        setGrades(prev => ({ ...prev, ...updatedGrades }));
    };

    const resetData = () => {
        if (window.confirm("Are you sure you want to reset all data? This will reload the application.")) {
            addToast("Application data has been reset. Reloading...", "info");
            setTimeout(() => window.location.reload(), 1500);
        }
    };

    const loadStudents = async () => {
        try {
            const studentsData = await dataService.students.getAll();
            setStudents(studentsData);
        } catch (error) {
            console.error("Error loading students:", error);
            addToast("Failed to load students data.", "error");
        }
    };

    const loadSubjects = async () => {
        try {
            const subjectsData = await dataService.subjects.getAll();
            setSubjects(subjectsData);
        } catch (error) {
            console.error("Error loading subjects:", error);
            addToast("Failed to load subjects data.", "error");
        }
    };

    const value = {
        schools, students, subjects, assignments, extraCreditAssignments, marks, grades, schoolPageVisibility, academicYears, appSettings,
        isDataLoading,
        marksRefreshTrigger,
        gradesRefreshTrigger,
        assignmentsRefreshTrigger,
        setSchools, setStudents, setSubjects, setAssignments, setExtraCreditAssignments, setMarks, setGrades, setSchoolPageVisibility, setAcademicYears, setAppSettings,
        updateStudentMarks,
        updateStudentGrades,
        deleteStudentMarks,
        updateStudentAssignments,
        loadAssignmentsForStudents,
        loadMarksForStudents,
        loadSubjects,
        resetData
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};