
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
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{value || '-'}</dd>
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
        <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="mt-4 text-red-600 dark:text-red-400">Student not found.</p>
             <div className="mt-6">
                <Button variant="secondary" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
                    Go Back
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
        <div>
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
                Back
            </Button>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {student.photo_url ? (
                        <img className="h-24 w-24 rounded-full object-cover ring-4 ring-primary-200 dark:ring-primary-800" src={student.photo_url} alt="Student photo" />
                    ) : (
                         <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-4 ring-primary-200 dark:ring-primary-800">
                           <UserCircleIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                         </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Symbol No: {student.symbol_no} | Registration ID: {student.registration_id}</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700">
                <dl>
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        <div>
                             <h3 className="text-base font-semibold leading-7 text-gray-900 dark:text-white mb-2">Personal Information</h3>
                             <DetailItem label="Gender" value={student.gender} />
                             <DetailItem label="Date of Birth (AD)" value={student.dob} />
                             <DetailItem label="Date of Birth (BS)" value={student.dob_bs} />
                        </div>
                         <div>
                            <h3 className="text-base font-semibold leading-7 text-gray-900 dark:text-white mb-2 invisible hidden md:block">&nbsp;</h3>
                             <DetailItem label="Father's Name" value={student.father_name} />
                             <DetailItem label="Mother's Name" value={student.mother_name} />
                             <DetailItem label="Mobile Number" value={student.mobile_no} />
                        </div>
                    </div>
                    <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        <div>
                            <h3 className="text-base font-semibold leading-7 text-gray-900 dark:text-white mb-2">Academic Information</h3>
                            <DetailItem label="School Name" value={school?.name} />
                            <DetailItem label="School IEMIS Code" value={school?.iemisCode} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold leading-7 text-gray-900 dark:text-white mb-2 invisible hidden md:block">&nbsp;</h3>
                            <DetailItem label="Year" value={student.year} />
                            <DetailItem label="Grade" value={student.grade} />
                            <DetailItem label="Roll Number" value={student.roll_no} />
                        </div>
                    </div>
                     <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
                        <h3 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">Assigned Subjects for Grade {student.grade}</h3>
                        {assignedSubjects.length > 0 ? (
                            <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                                {assignedSubjects.map(subject => (
                                    <li key={subject.id} className="p-2 bg-white dark:bg-gray-700 rounded-md border dark:border-gray-600">
                                        <span className="font-semibold">{subject.theory.subCode}</span> - {subject.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No subjects have been assigned to this student for the current grade and year.</p>
                        )}
                    </div>
                </dl>
            </div>
        </div>
    </div>
  );
};

export default StudentProfilePage;
