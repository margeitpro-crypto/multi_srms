import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import { AcademicCapIcon } from '../../components/icons/AcademicCapIcon';
import { ExclamationCircleIcon } from '../../components/icons/ExclamationCircleIcon';
import { UserGroupIcon } from '../../components/icons/UserGroupIcon';
import { School, Student } from '../../types';
import { usePageTitle } from '../../context/PageTitleContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { useData } from '../../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import BarChart from '../../components/charts/BarChart';
import { ClipboardDocumentCheckIcon } from '../../components/icons/ClipboardDocumentCheckIcon';
import { TableCellsIcon } from '../../components/icons/TableCellsIcon';
import { UserPlusIcon } from '../../components/icons/UserPlusIcon';
import { ExclamationTriangleIcon } from '../../components/icons/ExclamationTriangleIcon';
import dataService from '../../services/dataService';

const DetailItem: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <div className="text-sm text-gray-800 dark:text-white break-words">{value}</div>
    </div>
);

interface SchoolProfileCardProps {
    school: School;
    totalStudents: number;
}

const SchoolProfileCard: React.FC<SchoolProfileCardProps> = ({ school, totalStudents }) => {
    const PLAN_LIMITS = { Basic: 500, Pro: 2000, Enterprise: Infinity };
    const limit = PLAN_LIMITS[school.subscriptionPlan];
    const usagePercentage = limit === Infinity ? 0 : Math.min((totalStudents / limit) * 100, 100);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
             <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6 pb-6 border-b dark:border-gray-700">
                <img src={school.logoUrl?.startsWith('http') ? school.logoUrl : 'https://placehold.co/100x100?text=No+Logo'} alt="logo" className="h-24 w-24 rounded-full object-cover ring-4 ring-primary-200 dark:ring-primary-800" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{school.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{school.municipality}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <DetailItem label="IEMIS Code" value={school.iemisCode} />
                <DetailItem label="Subscription Plan" value={`${school.subscriptionPlan} Plan`} />
                <DetailItem label="Status" value={<span className={`px-2 py-1 text-xs font-medium rounded-full ${school.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{school.status}</span>} />
                <div className="md:col-span-3">
                    <DetailItem label="Student Usage" value={
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">{totalStudents} / {limit === Infinity ? 'Unlimited' : limit}</span>
                                {limit !== Infinity && <span className="text-xs">{usagePercentage.toFixed(0)}%</span>}
                            </div>
                            {limit !== Infinity && (
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${usagePercentage > 90 ? 'bg-red-500' : 'bg-primary-600'}`} style={{ width: `${usagePercentage}%` }}></div>
                                </div>
                            )}
                        </div>
                    } />
                </div>
            </div>
        </div>
    );
};

const SchoolDashboardPage: React.FC<{ school: School | null }> = ({ school }) => {
  const { setPageTitle } = usePageTitle();
  const { students, subjects, appSettings } = useData();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<{ [studentId: string]: number[] }>({});
  const [marks, setMarks] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [grades, setGrades] = useState<{ [studentId: string]: any }>({});

  useEffect(() => {
    setPageTitle('Dashboard');
  }, [setPageTitle]);

  const schoolToDisplay = school;

  // Fetch real data for assignments and marks
  useEffect(() => {
    const fetchData = async () => {
      if (!schoolToDisplay || !students) return;
      
      setIsLoading(true);
      try {
        const currentYear = appSettings.academicYear || '2082';
        const schoolStudents = students.filter(s => s.school_id === schoolToDisplay.id && s.year.toString() === currentYear);
        
        // Fetch assignments and marks for all students in parallel
        const assignmentsData: { [studentId: string]: number[] } = {};
        const marksData: { [studentId: string]: any } = {};
        const gradesData: { [studentId: string]: any } = {};
        
        // Reset state before fetching new data
        setAssignments({});
        setMarks({});
        setGrades({});
        
        if (schoolStudents.length === 0) {
          // If no students for this year, set empty data and finish loading
          setAssignments(assignmentsData);
          setMarks(marksData);
          setGrades(gradesData);
          setIsLoading(false);
          return;
        }
        
        await Promise.all(schoolStudents.map(async (student) => {
          try {
            // Fetch assignments
            const assignmentResponse = await dataService.subjectAssignments.getAssignments(student.id, currentYear);
            assignmentsData[student.id] = assignmentResponse.subjectIds || [];
            
            // Fetch marks
            const marksResponse = await dataService.marks.getMarks(student.id, currentYear);
            marksData[student.id] = marksResponse || {};
            
            // Calculate simple GPA based on marks (for demonstration)
            // In a real implementation, this would use the grade calculation logic
            let totalMarks = 0;
            let subjectCount = 0;
            
            Object.values(marksResponse || {}).forEach((subjectMarks: any) => {
              if (subjectMarks && !subjectMarks.isAbsent) {
                const theory = subjectMarks.theory || 0;
                const practical = subjectMarks.practical || 0;
                totalMarks += (theory + practical) / 2;
                subjectCount++;
              }
            });
            
            const gpa = subjectCount > 0 ? (totalMarks / subjectCount / 25) : 0; // Simple conversion to GPA scale
            gradesData[student.id] = { gpa: Math.min(gpa, 4.0) }; // Cap at 4.0
          } catch (error) {
            console.error(`Error fetching data for student ${student.id}:`, error);
            assignmentsData[student.id] = [];
            marksData[student.id] = {};
            gradesData[student.id] = { gpa: 0 };
          }
        }));
        
        setAssignments(assignmentsData);
        setMarks(marksData);
        setGrades(gradesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [schoolToDisplay, students, appSettings.academicYear]);

  const totalSchoolStudents = useMemo(() => {
    if (!schoolToDisplay || !students) return 0;
    return students.filter(s => s.school_id === schoolToDisplay.id).length;
  }, [schoolToDisplay, students]);

  const schoolStats = useMemo(() => {
    if (!schoolToDisplay || !students || !subjects || isLoading) {
      return {
        totalStudents: 0,
        averageGpa: '0.00',
        ngStudentCount: 0,
        gradePerformanceData: [],
        top5Students: [],
        ngStudents: [],
        studentBreakdown: null,
        studentsWithoutSubjects: [],
      };
    }

    const currentYear = appSettings.academicYear || '2082';
    const schoolStudents = students.filter(s => s.school_id === schoolToDisplay.id && s.year.toString() === currentYear);

    const totalStudents = schoolStudents.length;

    const genderCounts = schoolStudents.reduce((acc, student) => {
        acc[student.gender] = (acc[student.gender] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    const studentBreakdown = (
        <div className="flex items-center space-x-2 font-medium">
            <span title="Male" className="text-blue-600 dark:text-blue-400">M: {genderCounts['Male'] || 0}</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span title="Female" className="text-pink-600 dark:text-pink-400">F: {genderCounts['Female'] || 0}</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span title="Other" className="text-purple-600 dark:text-purple-400">O: {genderCounts['Other'] || 0}</span>
        </div>
    );

    const studentsWithoutSubjects = schoolStudents.filter(
        student => !assignments[student.id] || assignments[student.id].length === 0
    );

    let totalGpa = 0;
    let gradedStudentCount = 0;
    const ngStudentsList: Student[] = [];
    const gradedStudents: { name: string; gpa: number; id: string }[] = [];

    const grade11Gpas: number[] = [];
    const grade12Gpas: number[] = [];

    for (const student of schoolStudents) {
      const studentGrades = grades[student.id];
      if (studentGrades) {
        if (studentGrades.gpa > 0) {
          totalGpa += studentGrades.gpa;
          gradedStudentCount++;
          gradedStudents.push({ name: student.name, gpa: studentGrades.gpa, id: student.id });

          if (student.grade === '11') {
            grade11Gpas.push(studentGrades.gpa);
          } else if (student.grade === '12') {
            grade12Gpas.push(studentGrades.gpa);
          }
        } else {
          ngStudentsList.push(student);
        }
      }
    }

    const averageGpa = gradedStudentCount > 0 ? (totalGpa / gradedStudentCount).toFixed(2) : '0.00';
    const ngStudentCount = ngStudentsList.length;

    const avgGpaGrade11 = grade11Gpas.length > 0 ? (grade11Gpas.reduce((a, b) => a + b, 0) / grade11Gpas.length) : 0;
    const avgGpaGrade12 = grade12Gpas.length > 0 ? (grade12Gpas.reduce((a, b) => a + b, 0) / grade12Gpas.length) : 0;

    const gradePerformanceData = [
      { label: 'Grade 11', value: avgGpaGrade11 },
      { label: 'Grade 12', value: avgGpaGrade12 },
    ];

    gradedStudents.sort((a, b) => b.gpa - a.gpa);
    const top5Students = gradedStudents.slice(0, 5);

    return {
      totalStudents,
      averageGpa,
      ngStudentCount,
      gradePerformanceData,
      top5Students,
      ngStudents: ngStudentsList.slice(0, 5),
      studentBreakdown,
      studentsWithoutSubjects,
    };
  }, [schoolToDisplay, students, subjects, assignments, grades, isLoading]);

  const stats = [
    { title: `Total Students (${appSettings.academicYear || '2082'})`, value: schoolStats.totalStudents, icon: <UserGroupIcon className="w-8 h-8 text-white" />, color: 'bg-blue-500', description: schoolStats.studentBreakdown },
    { title: 'Average GPA', value: schoolStats.averageGpa, icon: <AcademicCapIcon className="w-8 h-8 text-white" />, color: 'bg-green-500' },
    { title: "'NG' Students", value: schoolStats.ngStudentCount, icon: <ExclamationCircleIcon className="w-8 h-8 text-white" />, color: 'bg-red-500' },
  ];

  const quickActions = [
    { text: 'Add New Student', icon: <UserPlusIcon className="w-8 h-8 text-blue-500" />, action: () => navigate('/school/students') },
    { text: 'Enter Marks', icon: <TableCellsIcon className="w-8 h-8 text-pink-500" />, action: () => navigate('/school/marks-entry') },
    { text: 'Assign Subjects', icon: <ClipboardDocumentCheckIcon className="w-8 h-8 text-green-500" />, action: () => navigate('/school/assign-subjects') }
  ];

  if (!schoolToDisplay) {
      return <div className="flex justify-center items-center h-64"><Loader /></div>
  }

  if (isLoading) {
      return <div className="flex justify-center items-center h-64"><Loader /></div>
  }

  return (
    <div className="animate-fade-in space-y-6">
      <SchoolProfileCard school={schoolToDisplay} totalStudents={totalSchoolStudents} />
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Performance Snapshot (Year: {appSettings.academicYear || '2082'})</h2>
      </div>

      {schoolStats.studentsWithoutSubjects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Alerts & Notifications</h2>
            <div className="space-y-3">
                <Link to="/school/assign-subjects" className="block p-3 rounded-lg transition-colors bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:hover:bg-yellow-900">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Pending Subject Assignments</p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                {schoolStats.studentsWithoutSubjects.length} {schoolStats.studentsWithoutSubjects.length > 1 ? 'students' : 'student'} for the current year have not been assigned any subjects. Click to assign subjects.
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            colorClass={stat.color}
            description={stat.description}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Grade-wise Performance (Average GPA)</h2>
          <div className="h-80">
            <BarChart data={schoolStats.gradePerformanceData} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
              {quickActions.map((action) => (
                  <button
                      key={action.text}
                      onClick={action.action}
                      className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                      {action.icon}
                      <span className="ml-4 text-sm font-semibold text-gray-700 dark:text-gray-200">{action.text}</span>
                  </button>
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Top 5 Students (by GPA)</h2>
          <ul className="space-y-2 text-xs">
            {schoolStats.top5Students.map((s, i) => (
              <li key={s.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <span className="truncate">{i+1}. {s.name}</span>
                <span className="font-bold text-green-600 dark:text-green-400">{s.gpa.toFixed(2)}</span>
              </li>
            ))}
            {schoolStats.top5Students.length === 0 && <p className="text-center py-4 text-gray-500">No graded students found.</p>}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Students Needing Improvement (NG)</h2>
           <ul className="space-y-2 text-xs">
              {schoolStats.ngStudents.map((s, i) => (
                  <li key={s.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <Link to={`/student/${s.id}`} className="truncate hover:underline">{i+1}. {s.name}</Link>
                    <span className="font-bold text-red-600 dark:text-red-400">NG</span>
                  </li>
              ))}
              {schoolStats.ngStudents.length === 0 && <p className="text-center py-4 text-gray-500">No students with 'NG' grade.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboardPage;