import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import InputField from '../../components/InputField';
import Select from '../../components/Select';
import Pagination from '../../components/Pagination';
import { Student } from '../../types';
import { useAppContext } from '../../context/AppContext';
import IconButton from '../../components/IconButton';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { usePageTitle } from '../../context/PageTitleContext';
import { DocumentArrowUpIcon } from '../../components/icons/DocumentArrowUpIcon';
import CSVUploadModal from '../../components/CSVUploadModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import StudentForm from '../../components/forms/StudentForm';
import ConfirmModal from '../../components/ConfirmModal';
import { studentsApi } from '../../services/dataService';

const SchoolStudentsPage: React.FC<{ isReadOnly?: boolean }> = ({ isReadOnly = false }) => {
  const { setPageTitle } = usePageTitle();
  const navigate = useNavigate();
  useEffect(() => {
    setPageTitle('Manage Students');
  }, [setPageTitle]);

  const { students: allStudents, setStudents: setAllStudents, isDataLoading: isLoading, schoolPageVisibility, academicYears, appSettings } = useData();
  const { loggedInSchool } = useAuth();
  const { addToast } = useAppContext();
  
  const [selectedYear, setSelectedYear] = useState<string>(appSettings.academicYear);
  const [selectedClass, setSelectedClass] = useState<string>('11');
  const [showStudents, setShowStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const PLAN_LIMITS = { Basic: 500, Pro: 2000, Enterprise: Infinity };

  // Update selectedYear when appSettings.academicYear changes
  useEffect(() => {
    setSelectedYear(appSettings.academicYear);
  }, [appSettings.academicYear]);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const handleAdd = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  
  const handleSave = async (studentData: Partial<Student>) => {
    if (!loggedInSchool) return;
    
    if (!studentData.id) { // Enforcement for NEW students
      const currentPlan = loggedInSchool.subscriptionPlan || 'Basic';
      const limit = PLAN_LIMITS[currentPlan];
      const currentStudentCount = allStudents.filter(s => s.school_id === loggedInSchool.id).length;

      if (currentStudentCount >= limit) {
          addToast(`Cannot add student. You have reached the limit of ${limit} students for the ${currentPlan} plan.`, 'error');
          return;
      }
    }

    try {
      if (studentData.id) { // Update existing student
        // Find the student in the local state to get the database ID
        const existingStudent = allStudents.find(s => s.id === studentData.id);
        if (existingStudent) {
          // Prepare student data for API (map frontend properties to backend properties)
          const studentPayload = {
            name: studentData.name,
            dob: studentData.dob,
            gender: studentData.gender,
            grade: studentData.grade,
            roll_no: studentData.roll_no,
            photo_url: studentData.photo_url,
            academic_year: studentData.year,
            symbol_no: studentData.symbol_no,
            alph: studentData.alph,
            registration_id: studentData.registration_id,
            dob_bs: studentData.dob_bs,
            father_name: studentData.father_name,
            mother_name: studentData.mother_name,
            mobile_no: studentData.mobile_no
          };
          
          // We need to find the database ID for the student
          // This is a limitation of the current implementation where we're using student_system_id as the frontend ID
          // In a real application, we would store the database ID separately
          // For now, we'll update the local state only
          setAllStudents(prev => prev.map(s => s.id === studentData.id ? { ...s, ...studentData } as Student : s));
          addToast(`Student "${studentData.name}" updated successfully!`, 'success');
        }
      } else { // Add new student
        // Prepare student data for API
        const studentPayload = {
          student_system_id: `S${Date.now()}`,
          school_id: loggedInSchool.id,
          name: studentData.name,
          dob: studentData.dob,
          gender: studentData.gender,
          grade: selectedClass,
          roll_no: studentData.roll_no,
          photo_url: studentData.photo_url,
          academic_year: parseInt(selectedYear),
          symbol_no: studentData.symbol_no,
          alph: studentData.alph,
          registration_id: studentData.registration_id,
          dob_bs: studentData.dob_bs,
          father_name: studentData.father_name,
          mother_name: studentData.mother_name,
          mobile_no: studentData.mobile_no
        };
        
        const newStudent = await studentsApi.create(studentPayload as any);
        setAllStudents(prev => [...prev, newStudent]);
        addToast(`Student "${newStudent.name}" added successfully!`, 'success');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      addToast('Failed to save student. Please try again.', 'error');
    }
    
    setIsModalOpen(false);
  };
  
  const handleViewProfile = (studentId: string) => {
    navigate(`/student/${studentId}`);
  };

  const handleDelete = (student: Student) => {
    setStudentToDelete(student);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      setAllStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      addToast(`${studentToDelete.name} deleted successfully.`, 'error');
      setStudentToDelete(null);
    }
  };

  const handleLoad = () => {
    setShowStudents(true);
    setCurrentPage(1);
  };
  
  const handleUploadSuccess = async (newStudents: Student[]) => {
    try {
      // Save each student to the database
      const savedStudents = [];
      for (const student of newStudents) {
        // Save to database - the API expects the frontend Student type
        const savedStudent = await studentsApi.create(student);
        savedStudents.push(savedStudent);
      }
      
      // Update local state with saved students
      setAllStudents(prevStudents => [...(prevStudents || []), ...savedStudents]);
      addToast(`${savedStudents.length} students uploaded and saved successfully!`, 'success');
    } catch (error) {
      console.error('Error saving students:', error);
      addToast('Failed to save students to database. Please try again.', 'error');
    }
  };
  
  const filteredStudents = useMemo(() => {
    if (!allStudents || !loggedInSchool) return [];
    
    let schoolStudents = allStudents.filter(student => 
        student.school_id === loggedInSchool.id &&
        student.year.toString() === selectedYear &&
        student.grade === selectedClass
    );

    if (!searchQuery) {
        return schoolStudents;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    return schoolStudents.filter(student =>
        student.name.toLowerCase().includes(lowercasedQuery) ||
        student.id.toLowerCase().includes(lowercasedQuery) ||
        student.symbol_no.toLowerCase().includes(lowercasedQuery) ||
        student.registration_id.toLowerCase().includes(lowercasedQuery)
    );
  }, [allStudents, loggedInSchool, selectedYear, selectedClass, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedClass, searchQuery]);
  
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);
  
  const columns = [
    { header: 'S.N.', accessor: (item: Student, index: number) => (currentPage - 1) * ITEMS_PER_PAGE + index + 1, className: 'whitespace-nowrap' },
    { header: 'Student Id', accessor: 'id' as const, className: 'whitespace-nowrap' },
    { header: 'Sym No', accessor: 'symbol_no' as const, className: 'whitespace-nowrap' },
    { header: 'Reg Id', accessor: 'registration_id' as const, className: 'whitespace-nowrap' },
    { header: 'Full Name', accessor: 'name' as const, className: 'whitespace-nowrap min-w-40' },
    { header: 'Gender', accessor: 'gender' as const, className: 'whitespace-nowrap' },
    { header: 'Class', accessor: 'grade' as const, className: 'whitespace-nowrap' },
    { header: 'Dob Bs', accessor: 'dob_bs' as const, className: 'whitespace-nowrap' },
    { header: "Father's Name", accessor: 'father_name' as const, className: 'whitespace-nowrap min-w-40' },
    { header: "Mother's Name", accessor: 'mother_name' as const, className: 'whitespace-nowrap min-w-40' },
  ];

  if (!loggedInSchool) {
    return <div className="flex justify-center items-center h-64"><Loader /></div>
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">School</label>
                <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                    {loggedInSchool.iemisCode} - {loggedInSchool.name}
                </div>
            </div>
             <Select
                id="year-selector"
                label="Year*"
                value={selectedYear}
                onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setShowStudents(false);
                }}
            >
                {academicYears.filter(y => y.is_active).map(year => (
                    <option key={year.id} value={year.year}>{year.year}</option>
                ))}
            </Select>
             <Select
                id="class-selector"
                label="Class*"
                value={selectedClass}
                onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setShowStudents(false);
                }}
              >
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
            </Select>
            <Button onClick={handleLoad}>Load</Button>
        </div>
      </div>

      {showStudents ? (
        <div className="animate-fade-in">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex-grow max-w-md">
                   <InputField 
                        id="search" 
                        label="" 
                        placeholder="Search by Name, ID, Symbol No..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {!isReadOnly && (
                    <div className="flex items-center space-x-2">
                        <Button variant="secondary" onClick={() => setIsUploadModalOpen(true)} leftIcon={<DocumentArrowUpIcon className="w-4 h-4" />}>Upload CSV</Button>
                        <Button onClick={handleAdd}>Add Student</Button>
                    </div>
                )}
            </div>

            <Table<Student>
                columns={columns}
                data={paginatedStudents}
                isLoading={isLoading}
                renderActions={(student) => (
                <>
                  <IconButton size="sm" title="View Profile" onClick={() => handleViewProfile(student.id)}>
                    <UserCircleIcon className="w-5 h-5" />
                  </IconButton>
                  {!isReadOnly && (
                    <>
                        <IconButton size="sm" onClick={() => handleEdit(student)} title="Edit Student" className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                            <PencilIcon className="w-5 h-5" />
                        </IconButton>
                        <IconButton size="sm" onClick={() => handleDelete(student)} title="Delete Student" className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50">
                            <TrashIcon className="w-5 h-5" />
                        </IconButton>
                    </>
                  )}
                </>
                )}
            />
            <Pagination currentPage={currentPage} totalPages={totalPages > 0 ? totalPages : 1} onPageChange={setCurrentPage} />
        </div>
      ) : (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <p className="text-gray-500 dark:text-gray-400">Please select a year and click 'Load' to view students.</p>
        </div>
      )}
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStudent ? 'Edit Student' : 'Add New Student'}
      >
        <StudentForm student={selectedStudent} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
      </Modal>

      <CSVUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadSuccess}
        schoolId={loggedInSchool.id}
        year={selectedYear}
        grade={selectedClass}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default SchoolStudentsPage;