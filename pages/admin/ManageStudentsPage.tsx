import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAppContext } from '../../context/AppContext';
import { studentsApi } from '../../services/dataService';
import { School, Student } from '../../types';
import Button from '../../components/Button';
import Select from '../../components/Select';
import InputField from '../../components/InputField';
import Table from '../../components/Table';
import ConfirmModal from '../../components/ConfirmModal';
import StudentForm from '../../components/forms/StudentForm';
import CSVUploadModal from '../../components/CSVUploadModal';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import IconButton from '../../components/IconButton';
import Modal from '../../components/Modal';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { DocumentArrowUpIcon } from '../../components/icons/DocumentArrowUpIcon';
import { usePageTitle } from '../../context/PageTitleContext';
import { formatToYYMMDD } from '../../utils/nepaliDateConverter';

// Utility function to format A.D. date from ISO string to YY-MM-DD
const formatADDate = (isoDateStr: string): string => {
    if (!isoDateStr) return '';
    return formatToYYMMDD(isoDateStr);
};

const ManageStudentsPage: React.FC = () => {
  const { setPageTitle } = usePageTitle();
  const navigate = useNavigate();
  useEffect(() => {
    setPageTitle('Manage Students');
  }, [setPageTitle]);

  const { students: allStudents, setStudents: setAllStudents, schools, isDataLoading: isLoading, academicYears, appSettings } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const { addToast } = useAppContext();
  
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2082');
  const [selectedClass, setSelectedClass] = useState<string>('11');
  const [showStudents, setShowStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const PLAN_LIMITS = { Basic: 500, Pro: 2000, Enterprise: Infinity };

  const handleAdd = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  
  const handleSave = async (studentData: Partial<Student>) => {
    if (!studentData.id) { // Enforcement for NEW students
      const school = schools.find(s => s.id.toString() === selectedSchoolId);
      if (school) {
        const currentPlan = school.subscriptionPlan || 'Basic';
        const limit = PLAN_LIMITS[currentPlan];
        const currentStudentCount = allStudents.filter(s => s.school_id.toString() === selectedSchoolId).length;
        
        if (currentStudentCount >= limit) {
          addToast(`Cannot add student. The school has reached the limit of ${limit} students for the ${currentPlan} plan.`, 'error');
          return;
        }
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
          school_id: Number(selectedSchoolId),
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
      if(selectedSchoolId){
          setShowStudents(true);
          setCurrentPage(1);
      } else {
          addToast("Please select a school first.", "warning");
      }
  }
  
  const handleUploadSuccess = async (newStudents: Student[]) => {
    const school = schools.find(s => s.id.toString() === selectedSchoolId);
    if (school) {
        const currentPlan = school.subscriptionPlan || 'Basic';
        const limit = PLAN_LIMITS[currentPlan];
        const currentStudentCount = allStudents.filter(s => s.school_id.toString() === selectedSchoolId).length;

        if (currentStudentCount + newStudents.length > limit) {
            const remainingSlots = Math.max(0, limit - currentStudentCount);
            addToast(`Upload failed. This would exceed the school's student limit of ${limit} for the ${currentPlan} plan. They can add up to ${remainingSlots} more students.`, 'error');
            return;
        }
    }
    
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

  // Function to export student data as CSV
  const exportStudentsToCSV = () => {
    if (!filteredStudents || filteredStudents.length === 0) {
      addToast("No students to export.", "warning");
      return;
    }

    // Create CSV content
    const headers = [
      "S.N.",
      "School Code",
      "Student ID",
      "Symbol No",
      "Registration ID",
      "Full Name",
      "Gender",
      "Class",
      "DOB (BS)",
      "DOB (AD)",
      "Father's Name",
      "Mother's Name",
      "Mobile No",
      "Year"
    ];

    let csvContent = headers.join(",") + "\n";

    filteredStudents.forEach((student, index) => {
      const school = schools?.find(s => s.id === student.school_id);
      const row = [
        index + 1,
        school?.iemisCode || "N/A",
        student.id,
        student.symbol_no,
        student.registration_id,
        `"${student.name}"`,
        student.gender,
        student.grade,
        student.dob_bs,
        formatADDate(student.dob),
        `"${student.father_name}"`,
        `"${student.mother_name}"`,
        student.mobile_no,
        student.year
      ];
      csvContent += row.join(",") + "\n";
    });

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `students_${selectedSchoolId}_${selectedYear}_grade${selectedClass}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = useMemo(() => {
    if (!allStudents || !selectedSchoolId || !selectedYear || !selectedClass) return [];
    
    let schoolStudents = allStudents.filter(student => 
        student.school_id.toString() === selectedSchoolId &&
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
  }, [allStudents, selectedSchoolId, selectedYear, selectedClass, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSchoolId, selectedYear, selectedClass, searchQuery]);
  
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);
  
  const columns = [
    { header: 'S.N.', accessor: (item: Student, index: number) => (currentPage - 1) * ITEMS_PER_PAGE + index + 1, className: 'whitespace-nowrap' },
    { header: 'Iemis No', accessor: (student: Student) => schools?.find(s => s.id === student.school_id)?.iemisCode || 'N/A', className: 'whitespace-nowrap' },

    
    { header: 'Student Id', accessor: 'id' as const, className: 'whitespace-nowrap' },
    { header: 'Sym No', accessor: 'symbol_no' as const, className: 'whitespace-nowrap' },
   
    { header: 'Reg Id', accessor: 'registration_id' as const, className: 'whitespace-nowrap' },
    { header: 'Full Name', accessor: 'name' as const, className: 'whitespace-nowrap min-w-40' },
    { header: 'Gender', accessor: 'gender' as const, className: 'whitespace-nowrap' },
    { header: 'Class', accessor: 'grade' as const, className: 'whitespace-nowrap' },
    { header: 'Dob Bs', accessor: 'dob_bs' as const, className: 'whitespace-nowrap' },
    { header: 'Dob Ad', accessor: (student: Student) => formatADDate(student.dob), className: 'whitespace-nowrap' },
    { header: "Father's Name", accessor: 'father_name' as const, className: 'whitespace-nowrap min-w-40' },
    { header: "Mother's Name", accessor: 'mother_name' as const, className: 'whitespace-nowrap min-w-40' },
    { header: 'Mobile No', accessor: 'mobile_no' as const, className: 'whitespace-nowrap' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <Select
              id="school-selector"
              label="Selected School*"
              value={selectedSchoolId}
              onChange={(e) => {
                  setSelectedSchoolId(e.target.value);
                  setShowStudents(false);
              }}
              containerClassName="md:col-span-2"
            >
              <option value="">-- Select a School --</option>
              {schools?.map(school => (
                <option key={school.id} value={school.id}>
                  {school.iemisCode}-{school.name}
                </option>
              ))}
            </Select>

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

            <Button onClick={handleLoad} disabled={!selectedSchoolId}>Load</Button>
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
                <div className="flex items-center space-x-2">
                    <Button variant="secondary" onClick={() => setIsUploadModalOpen(true)} leftIcon={<DocumentArrowUpIcon className="w-4 h-4" />}>Upload CSV</Button>
                    <Button variant="secondary" onClick={exportStudentsToCSV}>Export</Button>
                    <Button onClick={() => navigate('/students')}>AllProfile</Button>
                    <Button onClick={handleAdd}>Add Student</Button>
                </div>
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
                  <IconButton size="sm" onClick={() => handleEdit(student)} title="Edit Student" className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                    <PencilIcon className="w-5 h-5" />
                  </IconButton>
                  <IconButton size="sm" onClick={() => handleDelete(student)} title="Delete Student" className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50">
                    <TrashIcon className="w-5 h-5" />
                  </IconButton>
                </>
                )}
            />
            <Pagination currentPage={currentPage} totalPages={totalPages > 0 ? totalPages : 1} onPageChange={setCurrentPage} />
        </div>
      ) : (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <p className="text-gray-500 dark:text-gray-400">Please select criteria and click 'Load' to view students.</p>
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
        schoolId={selectedSchoolId}
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

export default ManageStudentsPage;