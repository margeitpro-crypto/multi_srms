import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../context/PageTitleContext';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import { ArrowLeftIcon } from '../../components/icons/ArrowLeftIcon';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
// FIX: Use central data context instead of importing mock data from pages.
import { useData } from '../../context/DataContext';

const DetailItem: React.FC<{ label: string, value?: string | number | null }> = ({ label, value }) => (
    <div className="py-3 sm:py-4 first:pt-0 last:pb-0">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-base font-medium text-gray-900 dark:text-white">{value || '-'}</dd>
    </div>
);

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { setPageTitle } = usePageTitle();
  // FIX: Get data from the central DataContext.
  const { students: MOCK_ADMIN_STUDENTS, schools: MOCK_SCHOOLS, subjects: MOCK_SUBJECTS, assignments: MOCK_STUDENT_SUBJECT_ASSIGNMENTS } = useData();

  const student = MOCK_ADMIN_STUDENTS.find(s => s.id === studentId);
  const school = student ? MOCK_SCHOOLS.find(s => s.id === student.school_id) : null;
  const assignedSubjectIds = student ? MOCK_STUDENT_SUBJECT_ASSIGNMENTS[student.id] || [] : [];
  const assignedSubjects = MOCK_SUBJECTS.filter(s => assignedSubjectIds.includes(s.id));
  
  useEffect(() => {
    if (student) {
      setPageTitle(`Student Profile: ${student.name}`);
    } else {
      setPageTitle('Student Profile');
    }
  }, [student, setPageTitle]);

  if (!student) {
    return (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-4">
                <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Student Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">The requested student profile could not be found.</p>
            <Button variant="primary" size="md" onClick={() => navigate(-1)} leftIcon={<ArrowLeftIcon className="w-5 h-5" />}>
                Go Back
            </Button>
        </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
        <div className="mb-6">
            <Button 
                variant="ghost" 
                size="md" 
                onClick={() => navigate(-1)} 
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                leftIcon={<ArrowLeftIcon className="w-5 h-5 mr-2" />}
            >
                Back to Previous Page
            </Button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* Header Section with Student Info */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
                    <div className="relative">
                        {student.photo_url ? (
                            <img 
                                className="h-32 w-32 rounded-2xl object-cover border-4 border-white/30 shadow-lg" 
                                src={student.photo_url} 
                                alt={`${student.name}'s profile`}
                            />
                        ) : (
                            <div className="h-32 w-32 rounded-2xl bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-lg">
                                <UserCircleIcon className="w-20 h-20 text-white/80" />
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-2 shadow-md">
                            <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center md:text-left text-white flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{student.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p className="text-xs text-white/80 uppercase tracking-wide">Symbol No</p>
                                <p className="font-semibold">{student.symbol_no}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p className="text-xs text-white/80 uppercase tracking-wide">Registration ID</p>
                                <p className="font-semibold">{student.registration_id}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p className="text-xs text-white/80 uppercase tracking-wide">Grade</p>
                                <p className="font-semibold">{student.grade}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-5">
                        <div className="text-center">
                            <p className="text-xs text-white/80 uppercase tracking-wide mb-1">Academic Year</p>
                            <p className="text-2xl font-bold">{student.year}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Content Sections */}
            <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information Card */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center mb-6">
                            <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailItem label="Gender" value={student.gender} />
                                <DetailItem label="Date of Birth (AD)" value={student.dob} />
                                <DetailItem label="Date of Birth (BS)" value={student.dob_bs} />
                                <DetailItem label="Mobile Number" value={student.mobile_no} />
                            </div>
                            
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Parent Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailItem label="Father's Name" value={student.father_name} />
                                    <DetailItem label="Mother's Name" value={student.mother_name} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Academic Information Card */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center mb-6">
                            <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Academic Information</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailItem label="School Name" value={school?.name} />
                                <DetailItem label="School IEMIS Code" value={school?.iemisCode} />
                                <DetailItem label="Year" value={student.year} />
                                <DetailItem label="Grade" value={student.grade} />
                                <DetailItem label="Roll Number" value={student.roll_no} />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Assigned Subjects Section */}
                <div className="mt-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assigned Subjects for Grade {student.grade}</h2>
                        </div>
                        <div className="mt-2 sm:mt-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                                {assignedSubjects.length} Subjects
                            </span>
                        </div>
                    </div>
                    
                    {assignedSubjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assignedSubjects.map(subject => (
                                <div 
                                    key={subject.id} 
                                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{subject.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                <span className="font-medium">{subject.theory.subCode}</span>
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Theory
                                        </span>
                                    </div>
                                    
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Credit</p>
                                            <p className="font-semibold">{subject.theory.credit.toFixed(2)}</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Full Marks</p>
                                            <p className="font-semibold">{subject.theory.fullMarks}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="bg-gray-200 dark:bg-gray-700 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Subjects Assigned</h3>
                            <p className="text-gray-500 dark:text-gray-400">No subjects have been assigned to this student for the current grade and year.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default StudentProfilePage;