
import React, { useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { BuildingOfficeIcon } from '../../components/icons/BuildingOfficeIcon';
import { UserGroupIcon } from '../../components/icons/UserGroupIcon';
import Table from '../../components/Table';
import { School } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../context/PageTitleContext';
import { useData } from '../../context/DataContext';
import { AcademicCapIcon } from '../../components/icons/AcademicCapIcon';
import PieChart from '../../components/charts/PieChart';
import { DocumentChartBarIcon } from '../../components/icons/DocumentChartBarIcon';
import { CheckBadgeIcon } from '../../components/icons/CheckBadgeIcon';
import { MegaphoneIcon } from '../../components/icons/MegaphoneIcon';
import { UserPlusIcon } from '../../components/icons/UserPlusIcon';
import { ExclamationTriangleIcon } from '../../components/icons/ExclamationTriangleIcon';
import { ExclamationCircleIcon } from '../../components/icons/ExclamationCircleIcon';

const AdminDashboardPage: React.FC = () => {
    const { setPageTitle } = usePageTitle();
    useEffect(() => {
        setPageTitle('Admin Dashboard');
    }, [setPageTitle]);
    
    const navigate = useNavigate();
    const { schools, students, subjects, grades, assignments, marks: allMarks } = useData();

    const dashboardStats = useMemo(() => {
        if (!schools || !students || !subjects || !grades || !allMarks) {
            return {
                totalSchools: 0,
                totalStudents: 0,
                activeSchools: 0,
                averageGpa: '0.00',
                demographics: [],
                academicHighlights: { topSchools: [], ngSchools: [] },
                subjectPopularity: [],
                studentBreakdown: null,
                pendingSchools: [],
                schoolsWithUnsubmittedMarks: [],
            };
        }

        const totalSchools = schools.length;
        const totalStudents = students.length;
        const activeSchools = schools.filter(s => s.status === 'Active').length;

        const gpaScores = Object.values(grades).map(g => g.gpa).filter(gpa => gpa > 0);
        const averageGpa = gpaScores.length > 0 ? (gpaScores.reduce((a, b) => a + b, 0) / gpaScores.length).toFixed(2) : '0.00';
        
        const genderCounts = students.reduce((acc, student) => {
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

        const schoolStats: { [schoolId: number]: { name: string; totalGpa: number; studentCount: number; ngCount: number } } = {};
        schools.forEach(school => {
            schoolStats[school.id] = { name: school.name, totalGpa: 0, studentCount: 0, ngCount: 0 };
        });

        students.forEach(student => {
            if (schoolStats[student.school_id]) {
                const gradeInfo = grades[student.id];
                if (gradeInfo) {
                    if (gradeInfo.gpa > 0) {
                        schoolStats[student.school_id].totalGpa += gradeInfo.gpa;
                        schoolStats[student.school_id].studentCount++;
                    } else {
                        schoolStats[student.school_id].ngCount++;
                    }
                }
            }
        });

        const schoolAverages = Object.values(schoolStats).map(s => ({
            name: s.name,
            avgGpa: s.studentCount > 0 ? (s.totalGpa / s.studentCount) : 0,
            ngCount: s.ngCount,
        }));

        const topSchools = [...schoolAverages].sort((a, b) => b.avgGpa - a.avgGpa).slice(0, 3);
        const ngSchools = [...schoolAverages].sort((a, b) => b.ngCount - a.ngCount).slice(0, 3);
        
        const subjectCounts = Object.values(assignments).flat().reduce((acc, subjectId) => {
            acc[subjectId] = (acc[subjectId] || 0) + 1;
            return acc;
        }, {} as { [key: number]: number });
        
        const subjectPopularity = Object.entries(subjectCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .map(([subjectId, count]) => {
                const subject = subjects.find(s => s.id === parseInt(subjectId));
                return { name: subject?.name || 'Unknown', value: count };
            });
        
        const pendingSchools = schools.filter(s => s.status === 'Inactive');
        const currentYear = '2082';
        const activeSchoolsList = schools.filter(s => s.status === 'Active');
        const schoolsWithStudentsInCurrentYear = activeSchoolsList.filter(school => 
            students.some(student => 
                student.school_id === school.id && student.year.toString() === currentYear
            )
        );
        const schoolsWithUnsubmittedMarks = schoolsWithStudentsInCurrentYear.filter(school => {
            const studentsForYear = students.filter(student => 
                student.school_id === school.id && student.year.toString() === currentYear
            );
            return !studentsForYear.some(student => 
                allMarks[student.id] && Object.keys(allMarks[student.id]).some(key => key !== 'isAbsent')
            );
        });

        return {
            totalSchools,
            totalStudents,
            activeSchools: activeSchoolsList.length,
            averageGpa,
            demographics,
            academicHighlights: { topSchools, ngSchools },
            subjectPopularity,
            studentBreakdown,
            pendingSchools,
            schoolsWithUnsubmittedMarks,
        };
    }, [schools, students, subjects, grades, assignments, allMarks]);

    const statCards = [
        { title: 'Total Schools', value: dashboardStats.totalSchools, icon: <BuildingOfficeIcon className="w-8 h-8 text-white" />, color: 'bg-blue-500' },
        { title: 'Total Students', value: dashboardStats.totalStudents, icon: <UserGroupIcon className="w-8 h-8 text-white" />, color: 'bg-teal-500', description: dashboardStats.studentBreakdown },
        { title: 'Average GPA', value: dashboardStats.averageGpa, icon: <AcademicCapIcon className="w-8 h-8 text-white" />, color: 'bg-amber-500' },
        { title: 'Active Schools', value: `${dashboardStats.activeSchools} / ${dashboardStats.totalSchools}`, icon: <BuildingOfficeIcon className="w-8 h-8 text-white" />, color: 'bg-indigo-500' },
    ];
    
    const recentSchools = schools.slice(-5).reverse();
    const columns = [
        { header: 'School Name', accessor: 'name' as const },
        { header: 'Municipality', accessor: 'municipality' as const },
        { header: 'Status', accessor: (school: School) => (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${school.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                {school.status}
            </span>
        )},
        { header: 'Head Teacher', accessor: 'headTeacherName' as const },
    ];
    
    const quickActions = [
        { text: 'Approve New School', icon: <CheckBadgeIcon className="w-8 h-8 text-green-500" />, action: () => navigate('/admin/schools') },
        { text: 'Add a New Student', icon: <UserPlusIcon className="w-8 h-8 text-blue-500" />, action: () => navigate('/admin/students') },
        { text: 'Send Notification', icon: <MegaphoneIcon className="w-8 h-8 text-yellow-500" />, action: () => { alert('Feature coming soon!') } },
        { text: 'Generate Reports', icon: <DocumentChartBarIcon className="w-8 h-8 text-purple-500" />, action: () => navigate('/admin/mark-wise-ledger') }
    ];

    const maxPopularity = Math.max(...dashboardStats.subjectPopularity.map(s => s.value), 0);

    const pendingSchoolsCount = dashboardStats.pendingSchools.length;
    const schoolsWithUnsubmittedMarksCount = dashboardStats.schoolsWithUnsubmittedMarks.length;

    return (
        <div className="animate-fade-in space-y-6">
            <p className="text-gray-500 dark:text-gray-400">Welcome! Here's a summary of the system.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} title={stat.title} value={stat.value} icon={stat.icon} colorClass={stat.color} description={stat.description} />
                ))}
            </div>

            {(pendingSchoolsCount > 0 || schoolsWithUnsubmittedMarksCount > 0) && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Alerts & Notifications</h2>
                    <div className="space-y-3">
                        {pendingSchoolsCount > 0 && (
                             <Link to="/admin/schools" className="block p-3 rounded-lg transition-colors bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:hover:bg-yellow-900">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Pending School Approvals</p>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                            {pendingSchoolsCount === 1
                                                ? `1 school (${dashboardStats.pendingSchools[0].name}) is pending approval.`
                                                : `${pendingSchoolsCount} schools, including ${dashboardStats.pendingSchools[0].name}, are pending approval.`
                                            } Click to review.
                                        </p>
                                    </div>
                                </div>
                             </Link>
                        )}
                        {schoolsWithUnsubmittedMarksCount > 0 && (
                            <Link to="/admin/marks-entry" className="block p-3 rounded-lg transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-900/50 dark:hover:bg-red-900">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-red-800 dark:text-red-200">Marks Submission Due</p>
                                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                            {schoolsWithUnsubmittedMarksCount} {schoolsWithUnsubmittedMarksCount > 1 ? 'schools' : 'school'} have not submitted final marks for the current year. Click to enter marks.
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
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent School Registrations</h2>
                        <Link to="/admin/schools" className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">View All</Link>
                    </div>
                    <Table<School> columns={columns} data={recentSchools} isLoading={false} />
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
                            <h3 className="text-sm font-semibold mb-2">Top Performing Schools (by GPA)</h3>
                            <ul className="space-y-2 text-xs">
                                {dashboardStats.academicHighlights.topSchools.map((s, i) => (
                                    <li key={i} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <span className="truncate">{s.name}</span>
                                        <span className="font-bold text-green-600 dark:text-green-400">{s.avgGpa.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Schools with Most NG Students</h3>
                             <ul className="space-y-2 text-xs">
                                {dashboardStats.academicHighlights.ngSchools.map((s, i) => (
                                    <li key={i} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <span className="truncate">{s.name}</span>
                                        <span className="font-bold text-red-600 dark:text-red-400">{s.ngCount} students</span>
                                    </li>
                                ))}
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

export default AdminDashboardPage;
