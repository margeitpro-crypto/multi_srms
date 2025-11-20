import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { School, Student, Subject, SchoolPageVisibility } from '../types';
import { MOCK_MARKS_INITIAL, MOCK_GRADES_INITIAL, MOCK_SCHOOL_PAGE_VISIBILITY_INITIAL } from '../data/initialData';
import { useAppContext } from './AppContext';
import { calculateGradesForStudents } from '../utils/gradeCalculator';
import dataService from '../services/dataService';

// Data types for context
export type AssignmentsMap = { [studentId: string]: number[] };
export type ExtraCreditAssignmentsMap = { [studentId: string]: number | null };
// FIX: Corrected the MarksMap type to allow 'isAbsent' alongside subject marks.
// An index signature was conflicting with the 'isAbsent' property. The value type of the index signature now includes boolean to make the type valid.
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
    // Add academic years
    academicYears: any[];
    // Loading state
    isDataLoading: boolean;
    // Add these new properties for refresh triggers
    marksRefreshTrigger: number;
    gradesRefreshTrigger: number;
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
    updateStudentMarks: (updatedMarks: MarksMap) => void;
    updateStudentGrades: (updatedGrades: GradesMap) => void;
    deleteStudentMarks: (studentId: string, academicYear: string) => Promise<void>;
    // Helper function
    resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
    // Add academic years state
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    // Add these new state variables for refresh triggers
    const [marksRefreshTrigger, setMarksRefreshTrigger] = useState(0);
    const [gradesRefreshTrigger, setGradesRefreshTrigger] = useState(0);

    // Load initial data from API - no fallback to mock data
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch data from API
                const [schoolsData, studentsData, subjectsData, academicYearsData] = await Promise.all([
                    dataService.schools.getAll(),
                    dataService.students.getAll(),
                    dataService.subjects.getAll(),
                    dataService.academicYears.getAll()
                ]);
                
                setSchools(schoolsData);
                setStudents(studentsData);
                setSubjects(subjectsData);
                setAcademicYears(academicYearsData);
                
                // For now, we'll keep using mock data for grades and school page visibility
                // In a real application, these would also come from the API
                setGrades(MOCK_GRADES_INITIAL);
                setSchoolPageVisibility(MOCK_SCHOOL_PAGE_VISIBILITY_INITIAL);
                
                // Initialize assignments and marks as empty objects, they will be loaded on demand
                setAssignments({});
                setExtraCreditAssignments({});
                setMarks({});
            } catch (error: any) {
                console.error('Error loading data:', error);
                const errorMessage = error.response?.data?.error || error.message || 'Failed to load data from the server. Please check your connection and try again.';
                addToast(`Error loading data: ${errorMessage}`, 'error');
                // No fallback to mock data - show error instead
            } finally {
                setIsDataLoading(false);
            }
        };
        
        loadData();
    }, []);

    // In a real application, we would send data updates to the API
    // For now, we'll just log the changes to the console
    useEffect(() => { if (!isDataLoading) console.log('Schools updated:', schools); }, [schools, isDataLoading]);
    useEffect(() => { if (!isDataLoading) console.log('Students updated:', students); }, [students, isDataLoading]);
    useEffect(() => { if (!isDataLoading) console.log('Subjects updated:', subjects); }, [subjects, isDataLoading]);
    useEffect(() => { if (!isDataLoading) console.log('Grades updated:', grades); }, [grades, isDataLoading]);
    useEffect(() => { if (!isDataLoading) console.log('School page visibility updated:', schoolPageVisibility); }, [schoolPageVisibility, isDataLoading]);

    const updateStudentMarks = async (updatedMarks: MarksMap) => {
        // Update local state first
        const newMarksState = { ...marks, ...updatedMarks };
        setMarks(newMarksState);
        
        const studentIdsToUpdate = Object.keys(updatedMarks);

        // Save marks to the API for each student
        try {
            for (const studentId of studentIdsToUpdate) {
                const student = students.find(s => s.id === studentId);
                if (student) {
                    // Convert marks to the format expected by the API
                    const apiMarksFormat: { [subjectId: number]: { theory: number; practical: number; isAbsent: boolean } } = {};
                    
                    const studentMarks = updatedMarks[studentId];
                    if (studentMarks) {
                        // Handle isAbsent flag
                        const isAbsent = studentMarks.isAbsent || false;
                        
                        // Handle subject marks
                        Object.keys(studentMarks).forEach(key => {
                            if (key !== 'isAbsent') {
                                const subjectId = parseInt(key);
                                const markData = studentMarks[key];
                                if (typeof markData === 'object' && markData !== null) {
                                    apiMarksFormat[subjectId] = {
                                        theory: markData.theory || 0,
                                        practical: markData.internal || 0,
                                        isAbsent: isAbsent
                                    };
                                }
                            }
                        });
                    }
                    
                    // Save to API
                    await dataService.marks.saveMarks(studentId, student.year.toString(), apiMarksFormat);
                }
            }
            
            // Update grades after saving marks
            const newGrades = calculateGradesForStudents(
                studentIdsToUpdate,
                newMarksState,
                subjects,
                assignments
            );

            setGrades(prevGrades => ({ ...prevGrades, ...newGrades }));
            
            // Trigger refresh for marks and grades
            setMarksRefreshTrigger(prev => prev + 1);
            setGradesRefreshTrigger(prev => prev + 1);
            
            addToast('Marks saved successfully!', 'success');
        } catch (error: any) {
            console.error('Error saving marks to API:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to save marks to the database. Please try again.';
            addToast(`Error saving marks: ${errorMessage}`, 'error');
        }
    };
    
    const deleteStudentMarks = async (studentId: string, academicYear: string) => {
        try {
            // Delete marks from the API
            await dataService.marks.deleteMarks(studentId, academicYear);
            
            // Update local state by removing the marks for this student and year
            setMarks(prev => {
                const newMarks = { ...prev };
                if (newMarks[studentId]) {
                    // Create a new object without the marks for this student
                    const { [studentId]: removed, ...rest } = newMarks;
                    return rest;
                }
                return newMarks;
            });
            
            addToast('Marks deleted successfully!', 'success');
        } catch (error: any) {
            console.error('Error deleting marks from API:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to delete marks from the database. Please try again.';
            addToast(`Error deleting marks: ${errorMessage}`, 'error');
            throw error;
        }
    };
    
    const updateStudentGrades = (updatedGrades: GradesMap) => {
        // Update local grades state
        setGrades(prev => ({ ...prev, ...updatedGrades }));
    };

    const resetData = () => {
        if (window.confirm("Are you sure you want to reset all data to the original state? All your changes will be lost.")) {
            // In a real application, we would reset data on the server
            // For now, we'll just reload the page to get fresh data from the API
            addToast("Application data has been reset. Reloading...", "info");
            setTimeout(() => window.location.reload(), 1500);
        }
    };

    const value = {
        schools, students, subjects, assignments, extraCreditAssignments, marks, grades, schoolPageVisibility, academicYears,
        isDataLoading,
        // Add the refresh triggers to the context value
        marksRefreshTrigger,
        gradesRefreshTrigger,
        setSchools, setStudents, setSubjects, setAssignments, setExtraCreditAssignments, setMarks, setGrades, setSchoolPageVisibility, setAcademicYears,
        updateStudentMarks,
        updateStudentGrades,
        deleteStudentMarks,
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