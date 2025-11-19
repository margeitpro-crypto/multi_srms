
import { MarksMap, GradesMap, AssignmentsMap } from '../context/DataContext';
import { Subject } from '../types';

// Based on AdminSettingsPage
const gradeInfoScale = [
    { min: 90, point: 4.0, grade: 'A+' },
    { min: 80, point: 3.6, grade: 'A' },
    { min: 70, point: 3.2, grade: 'B+' },
    { min: 60, point: 2.8, grade: 'B' },
    { min: 50, point: 2.4, grade: 'C+' },
    { min: 40, point: 2.0, grade: 'C' },
    { min: 35, point: 1.6, grade: 'D' },
    { min: 0,  point: 0.0, grade: 'NG' },
];

export const wgpaToFinalGradeScale = [
    { min: 3.61, grade: 'A+' },
    { min: 3.21, grade: 'A' },
    { min: 2.81, grade: 'B+' },
    { min: 2.41, grade: 'B' },
    { min: 2.01, grade: 'C+' },
    { min: 1.61, grade: 'C' },
    { min: 1.21, grade: 'D' },
    { min: 0, grade: 'NG' },
];

export function getGradeInfoFromPercentage(percentage: number): { point: number; grade: string } {
    const scale = gradeInfoScale.find(s => percentage >= s.min);
    return scale ? { point: scale.point, grade: scale.grade } : { point: 0.0, grade: 'NG' };
}

export function getFinalGradeFromWGPA(wgpa: number): string {
    const scale = wgpaToFinalGradeScale.find(s => wgpa >= s.min);
    return scale ? scale.grade : 'NG';
}

export function getOverallFinalGrade(gpa: number): string {
    // This uses the same scale as WGPA to final grade, as is standard for NEB.
    const scale = wgpaToFinalGradeScale.find(s => gpa >= s.min);
    return scale ? scale.grade : 'NG';
}

export function getSubjectRemarks(finalGrade: string): string {
    return finalGrade === 'NG' ? 'Non-Graded' : '';
}

export function calculateGradesForStudents(
    studentIds: string[],
    allMarks: MarksMap,
    allSubjects: Subject[],
    allAssignments: AssignmentsMap
): GradesMap {
    const newGrades: GradesMap = {};

    for (const studentId of studentIds) {
        const studentMarks = allMarks[studentId];
        if (!studentMarks || studentMarks.isAbsent) {
            newGrades[studentId] = { gpa: 0, subjects: {} };
            continue;
        }

        const assignedSubjectIds = allAssignments[studentId] || [];
        let totalWGP = 0;
        let totalCreditHours = 0;
        const subjectGradeDetails: GradesMap[string]['subjects'] = {};

        for (const subjectId of assignedSubjectIds) {
            const subjectInfo = allSubjects.find(s => s.id === subjectId);
            const markData = studentMarks[subjectId.toString()];
            
            if (!subjectInfo || typeof markData !== 'object' || markData === null) {
                continue;
            }
            const markInfo = markData as { internal: number; theory: number };


            const theoryPercentage = subjectInfo.theory.fullMarks > 0 ? (markInfo.theory / subjectInfo.theory.fullMarks) * 100 : 0;
            const internalPercentage = subjectInfo.internal.fullMarks > 0 ? (markInfo.internal / subjectInfo.internal.fullMarks) * 100 : 0;

            const { point: th_gp, grade: th_grade } = getGradeInfoFromPercentage(theoryPercentage);
            const { point: in_gp, grade: in_grade } = getGradeInfoFromPercentage(internalPercentage);

            const theoryWGP = subjectInfo.theory.credit * th_gp;
            const internalWGP = subjectInfo.internal.credit * in_gp;

            totalWGP += theoryWGP + internalWGP;
            totalCreditHours += subjectInfo.theory.credit + subjectInfo.internal.credit;

            subjectGradeDetails[subjectId] = {
                th: th_grade,
                in: in_grade,
                th_gp: th_gp,
                in_gp: in_gp,
            };
        }

        const finalGPA = totalCreditHours > 0 ? totalWGP / totalCreditHours : 0;

        newGrades[studentId] = {
            gpa: finalGPA,
            subjects: subjectGradeDetails,
        };
    }

    return newGrades;
}
