import React, { useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { BuildingOfficeIcon } from '../../components/icons/BuildingOfficeIcon';
import { UserGroupIcon } from '../../components/icons/UserGroupIcon';
import Table from '../../components/Table';
import { Student } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../context/PageTitleContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { AcademicCapIcon } from '../../components/icons/AcademicCapIcon';
import PieChart from '../../components/charts/PieChart';
import { DocumentChartBarIcon } from '../../components/icons/DocumentChartBarIcon';
import { CheckBadgeIcon } from '../../components/icons/CheckBadgeIcon';
import { MegaphoneIcon } from '../../components/icons/MegaphoneIcon';
import { UserPlusIcon } from '../../components/icons/UserPlusIcon';
import { ExclamationTriangleIcon } from '../../components/icons/ExclamationTriangleIcon';
import { ExclamationCircleIcon } from '../../components/icons/ExclamationCircleIcon';

const SchoolAdminDashboardPage: React.FC = () => {
    const { setPageTitle } = usePageTitle();
    const { loggedInSchool } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        setPageTitle('School Dashboard');
    }, [setPageTitle]);
    
    const { students, subjects, grades, assignments, marks: allMarks, appSettings } = useData();

    const dashboardStats = useMemo(() => {
        if (!loggedInSchool || !students || !subjects || !grades || !allMarks) {
            return {
                totalStudents: 0,
                averageGpa: '0.00',
                demographics: [],
                academicHighlights: { topStudents: [], ngStudents: [] },
                subjectPopularity: [],
                studentBreakdown: null,
                studentsWithoutSubjects: [],
                studentsWithUnsubmittedMarks: [],
            };
        }

        const currentYear = appSettings.academicYear || '2082';
        const schoolStudents = students.filter(s => s.school_id === loggedInSchool.id && s.year.toString() === currentYear);
        
        const totalStudents = schoolStudents.length;

        const gpaScores = Object.entries(grades).filter(([studentId, _]) => {
            const student = students.find(s => s.id === studentId);
            return student && student.school_id === loggedInSchool.id;
        }).map(([_, gradeInfo]) => gradeInfo.gpa).filter(gpa => gpa > 0);
        
        const averageGpa = gpaScores.length > 0 ? (gpaScores.reduce((a, b) => a + b, 0) / gpaScores.length).toFixed(2) : '0.00';
        
        const genderCounts = schoolStudents.reduce((acc, student) => {
            acc[student.gender] = (acc[student.gender] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
        
        const demographics = [
            { name: 'Male', value: genderCounts['Male'] || 0, color: '#3b82f6' },
            { name: 'Female', value: genderCounts['Female'] || 0, color: '#ec4899' },
            { name: 'Other', value: genderCounts['Other'] || 0, color: '#a855f7' },
        ];
        
        const studentBreakdown = (
            <div className="flex items-center space-x-2 font-medium">
                <span title="Male" className="text-blue-600 dark:text-blue-400">M: {genderCounts['Male'] || 0}</span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span title="Female" className="text-pink-600 dark:text-pink-400">F: {genderCounts['Female'] || 0}</span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span title="Other" className="text-purple-600 dark:text-purple-400">O: {genderCounts['Other'] || 0}</span>
            </div>
        );

        // Get students without subjects assigned
        const studentsWithoutSubjects = schoolStudents.filter(
            student => !assignments[student.id] || assignments[student.id].length === 0
        );

        // Get students with unsubmitted marks
        const studentsWithUnsubmittedMarks = schoolStudents.filter(student => {
            return !allMarks[student.id] || Object.keys(allMarks[student.id]).length === 0 || 
                   Object.keys(allMarks[student.id]).every(key => key === 'isAbsent');
        });

        // Top performing students by GPA
        const studentGpas = schoolStudents.map(student => {
            const gradeInfo = grades[student.id];
            return {
                student,
                gpa: gradeInfo ? gradeInfo.gpa : 0
            };
        }).filter(item => item.gpa > 0);

        const topStudents = [...studentGpas]
            .sort((a, b) => b.gpa - a.gpa)
            .slice(0, 3)
            .map(item => ({ name: item.student.name, avgGpa: item.gpa }));

        // Students with NG grades
        const ngStudents = schoolStudents.filter(student => {
            const gradeInfo = grades[student.id];
            return gradeInfo && gradeInfo.gpa === 0;
        }).slice(0, 3);

        // Subject popularity based on assignments
        const subjectCounts = Object.values(assignments).flat().reduce((acc, subjectId) => {
            // Only count subjects for students in this school
            const studentId = Object.keys(assignments).find(key => assignments[key].includes(subjectId));
            if (studentId) {
                const student = students.find(s => s.id === studentId);
                if (student && student.school_id === loggedInSchool.id) {
                    acc[subjectId] = (acc[subjectId] || 0) + 1;
                }
            }
            return acc;
        }, {} as { [key: number]: number });
        
        const subjectPopularity = Object.entries(subjectCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .map(([subjectId, count]) => {
                const subject = subjects.find(s => s.id === Number(subjectId));
                return { name: subject?.name || 'Unknown', value: count };
            });

        return {
            totalStudents,
            averageGpa,
            demographics,
            academicHighlights: { topStudents, ngStudents },
            subjectPopularity,
            studentBreakdown,
            studentsWithoutSubjects,
            studentsWithUnsubmittedMarks,
        };
    }, [loggedInSchool, students, subjects, grades, assignments, allMarks, appSettings.academicYear]);

    const statCards = [
        { title: 'Total Students', value: dashboardStats.totalStudents, icon: <UserGroupIcon className="w-8 h-8 text-white" />, color: 'bg-blue-500', description: dashboardStats.studentBreakdown },
        { title: 'Average GPA', value: dashboardStats.averageGpa, icon: <AcademicCapIcon className="w-8 h-8 text-white" />, color: 'bg-amber-500' },
    ];
    
    const recentStudents = students.filter(s => s.school_id === loggedInSchool?.id).slice(-5).reverse();
    const columns = [
        { header: 'Student Name', accessor: 'name' as const },
        { header: 'Grade', accessor: 'grade' as const },
        { header: 'Gender', accessor: 'gender' as const },
        { header: 'Year', accessor: 'year' as const },
    ];
    
    const quickActions = [
        { text: 'Add New Student', icon: <UserPlusIcon className="w-8 h-8 text-blue-500" />, action: () => navigate('/school/students') },
        { text: 'Assign Subjects', icon: <CheckBadgeIcon className="w-8 h-8 text-green-500" />, action: () => navigate('/school/assign-subjects') },
        { text: 'Enter Marks', icon: <DocumentChartBarIcon className="w-8 h-8 text-purple-500" />, action: () => navigate('/school/marks-entry') },
        { text: 'Send Notification', icon: <MegaphoneIcon className="w-8 h-8 text-yellow-500" />, action: () => { alert('Feature coming soon!') } }
    ];

    const maxPopularity = Math.max(...dashboardStats.subjectPopularity.map(s => s.value), 0);

    const studentsWithoutSubjectsCount = dashboardStats.studentsWithoutSubjects.length;
    const studentsWithUnsubmittedMarksCount = dashboardStats.studentsWithUnsubmittedMarks.length;

    if (!loggedInSchool) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <p className="text-gray-500 dark:text-gray-400">Welcome to {loggedInSchool.name} dashboard!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} title={stat.title} value={stat.value} icon={stat.icon} colorClass={stat.color} description={stat.description} />
                ))}
            </div>

            {(studentsWithoutSubjectsCount > 0 || studentsWithUnsubmittedMarksCount > 0) && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Alerts & Notifications</h2>
                    <div className="space-y-3">
                        {studentsWithoutSubjectsCount > 0 && (
                             <Link to="/school/assign-subjects" className="block p-3 rounded-lg transition-colors bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:hover:bg-yellow-900">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Pending Subject Assignments</p>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                            {studentsWithoutSubjectsCount} {studentsWithoutSubjectsCount > 1 ? 'students' : 'student'} for the current year have not been assigned any subjects. Click to assign subjects.
                                        </p>
                                    </div>
                                </div>
                             </Link>
                        )}
                        {studentsWithUnsubmittedMarksCount > 0 && (
                            <Link to="/school/marks-entry" className="block p-3 rounded-lg transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-900/50 dark:hover:bg-red-900">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-red-800 dark:text-red-200">Marks Submission Due</p>
                                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                            {studentsWithUnsubmittedMarksCount} {studentsWithUnsubmittedMarksCount > 1 ? 'students' : 'student'} have not submitted final marks for the current year. Click to enter marks.
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Students</h2>
                        <Link to="/school/students" className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">View All</Link>
                    </div>
                    <Table<Student> columns={columns} data={recentStudents} isLoading={false} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Student Demographics</h2>
                    <div className="flex justify-center items-center my-4">
                        <PieChart data={dashboardStats.demographics} />
                    </div>
                    <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-xs">
                        {dashboardStats.demographics.map(item => (
                            <div key={item.name} className="flex items-center">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                                <span>{item.name} ({item.value})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Academic Highlights</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Top Performing Students (by GPA)</h3>
                            <ul className="space-y-2 text-xs">
                                {dashboardStats.academicHighlights.topStudents.map((s, i) => (
                                    <li key={i} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <span className="truncate">{s.name}</span>
                                        <span className="font-bold text-green-600 dark:text-green-400">{s.avgGpa.toFixed(2)}</span>
                                    </li>
                                ))}
                                {dashboardStats.academicHighlights.topStudents.length === 0 && (
                                    <li className="text-center py-2 text-gray-500">No data available</li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Students Needing Attention</h3>
                             <ul className="space-y-2 text-xs">
                                {dashboardStats.academicHighlights.ngStudents.map((s, i) => (
                                    <li key={i} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <span className="truncate">{s.name}</span>
                                        <span className="font-bold text-red-600 dark:text-red-400">Needs Improvement</span>
                                    </li>
                                ))}
                                {dashboardStats.academicHighlights.ngStudents.length === 0 && (
                                    <li className="text-center py-2 text-gray-500">All students are performing well</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Most Popular Subjects</h2>
                    <div className="space-y-3">
                        {dashboardStats.subjectPopularity.map((subject, index) => (
                            <div key={index} className="text-xs">
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium text-gray-600 dark:text-gray-300">{subject.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{subject.value} students</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${(subject.value / maxPopularity) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                        {dashboardStats.subjectPopularity.length === 0 && (
                            <p className="text-center py-2 text-gray-500">No subject data available</p>
                        )}
                    </div>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action) => (
                            <button
                                key={action.text}
                                onClick={action.action}
                                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {action.icon}
                                <span className="mt-2 text-xs font-semibold text-center text-gray-600 dark:text-gray-300">{action.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolAdminDashboardPage;