import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { School, Student, Subject, SchoolPageVisibility } from '../types';
import { MOCK_ASSIGNMENTS_INITIAL, MOCK_MARKS_INITIAL, MOCK_GRADES_INITIAL, MOCK_EXTRA_CREDIT_ASSIGNMENTS_INITIAL, MOCK_SCHOOL_PAGE_VISIBILITY_INITIAL } from '../data/initialData';
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
    // Loading state
    isDataLoading: boolean;
    // Modifiers
    setSchools: React.Dispatch<React.SetStateAction<School[]>>;
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
    setAssignments: React.Dispatch<React.SetStateAction<AssignmentsMap>>;
    setExtraCreditAssignments: React.Dispatch<React.SetStateAction<ExtraCreditAssignmentsMap>>;
    setMarks: React.Dispatch<React.SetStateAction<MarksMap>>;
    setSchoolPageVisibility: React.Dispatch<React.SetStateAction<SchoolPageVisibility>>;
    updateStudentMarks: (updatedMarks: MarksMap) => void;
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

    // Load initial data from API - no fallback to mock data
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch data from API
                const [schoolsData, studentsData, subjectsData] = await Promise.all([
                    dataService.schools.getAll(),
                    dataService.students.getAll(),
                    dataService.subjects.getAll()
                ]);
                
                setSchools(schoolsData);
                setStudents(studentsData);
                setSubjects(subjectsData);
                
                // For now, we'll keep using mock data for assignments, marks, etc.
                // In a real application, these would also come from the API
                setAssignments(MOCK_ASSIGNMENTS_INITIAL);
                setExtraCreditAssignments(MOCK_EXTRA_CREDIT_ASSIGNMENTS_INITIAL);
                setMarks(MOCK_MARKS_INITIAL);
                setGrades(MOCK_GRADES_INITIAL);
                setSchoolPageVisibility(MOCK_SCHOOL_PAGE_VISIBILITY_INITIAL);
            } catch (error) {
                console.error('Error loading data:', error);
                addToast('Failed to load data from the server. Please check your connection and try again.', 'error');
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
    useEffect(() => { if (!isDataLoading) console.log('Assignments updated:', assignments); }, [assignments, isDataLoading]);
    useEffect(() => { if (!isDataLoading) console.log('Extra credit assignments updated:', extraCreditAssignments); }, [extraCreditAssignments, isDataLoading]);
    useEffect(() => { if (!isDataLoading) console.log('Marks updated:', marks); }, [marks, isDataLoading]);
    useEffect(() => { if (!isDataLoading) console.log('Grades updated:', grades); }, [grades, isDataLoading]);
    useEffect(() => { if (!isDataLoading) console.log('School page visibility updated:', schoolPageVisibility); }, [schoolPageVisibility, isDataLoading]);

    const updateStudentMarks = (updatedMarks: MarksMap) => {
        const newMarksState = { ...marks, ...updatedMarks };
        setMarks(newMarksState);
        
        const studentIdsToUpdate = Object.keys(updatedMarks);

        const newGrades = calculateGradesForStudents(
            studentIdsToUpdate,
            newMarksState,
            subjects,
            assignments
        );

        setGrades(prevGrades => ({ ...prevGrades, ...newGrades }));
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
        schools, students, subjects, assignments, extraCreditAssignments, marks, grades, schoolPageVisibility,
        isDataLoading,
        setSchools, setStudents, setSubjects, setAssignments, setExtraCreditAssignments, setMarks, setSchoolPageVisibility,
        updateStudentMarks,
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