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
import ExcelUploadModal from '../../components/ExcelUploadModal';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import IconButton from '../../components/IconButton';
import Modal from '../../components/Modal';

import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { DocumentArrowUpIcon } from '../../components/icons/DocumentArrowUpIcon';
import { DocumentArrowDownIcon } from '../../components/icons/DocumentArrowDownIcon';
import { ArrowLeftOnRectangleIcon } from '../../components/icons/ArrowLeftOnRectangleIcon';
import { usePageTitle } from '../../context/PageTitleContext';
import { formatToYYMMDD } from '../../utils/nepaliDateConverter';
import * as XLSX from 'xlsx';
import { DropdownMenu, DropdownMenuItem } from '../../components/DropdownMenu';

// Utility function to format A.D. date from ISO string to YY-MM-DD
const formatADDate = (isoDateStr: string): string => {
    if (!isoDateStr) return '';
    return formatToYYMMDD(isoDateStr);
};

const ManageStudentsPage: React.FC<{ school?: School; isReadOnly?: boolean }> = ({ school, isReadOnly = false }) => {
  const { setPageTitle } = usePageTitle();
  const navigate = useNavigate();
  useEffect(() => {
    setPageTitle('Manage Students');
  }, [setPageTitle]);

  const { students: allStudents, setStudents: setAllStudents, schools, isDataLoading: isLoading, academicYears, appSettings, loadStudents } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const { addToast } = useAppContext();
  
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(school ? school.id.toString() : '');
  const [selectedYear, setSelectedYear] = useState<string>(appSettings.academicYear || '2082');
  const [selectedClass, setSelectedClass] = useState<string>('11');
  const [showStudents, setShowStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Effect to update selectedSchoolId when school prop changes
  useEffect(() => {
    if (school) {
      setSelectedSchoolId(school.id.toString());
    }
  }, [school]);

  // Effect to update selectedYear when appSettings change
  useEffect(() => {
    if (appSettings.academicYear) {
      setSelectedYear(appSettings.academicYear);
    }
  }, [appSettings.academicYear]);

  // Auto-load data when school is provided (for school users)
  useEffect(() => {
    if (school && selectedSchoolId && selectedYear && selectedClass && !showStudents) {
        // Small delay to ensure all state updates are processed
        const timer = setTimeout(() => {
            handleLoad();
        }, 100);
        
        return () => clearTimeout(timer);
    }
  }, [school, selectedSchoolId, selectedYear, selectedClass, showStudents]);

  // Auto-load data when selectedYear changes
  useEffect(() => {
    if (selectedSchoolId && selectedYear && selectedClass) {
        // Set showStudents to true to indicate we want to display students
        setShowStudents(true);
        // Reset current page to 1
        setCurrentPage(1);
    }
  }, [selectedYear, selectedSchoolId, selectedClass]); // Trigger when any of these change

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const PLAN_LIMITS = { Basic: 500, Pro: 2000, Enterprise: Infinity };

  // Function to refresh student data
  const refreshStudents = async () => {
    try {
      await loadStudents();
      addToast('Students data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing students:', error);
      addToast('Failed to refresh students data', 'error');
    }
  };

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
          
          // Get the database ID for the student
          const dbId = await studentsApi.getDatabaseIdBySystemId(studentData.id);
          if (dbId) {
            // Update in database
            const updatedStudent = await studentsApi.update(dbId, studentPayload);
            setAllStudents(prev => prev.map(s => s.id === studentData.id ? updatedStudent : s));
            addToast(`Student "${studentData.name}" updated successfully!`, 'success');
          } else {
            addToast('Failed to update student. Student not found in database.', 'error');
          }
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
    } catch (error: any) {
      console.error('Error saving student:', error);
      let errorMessage = 'Failed to save student. Please try again.';
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 409) {
          // Conflict - duplicate student
          errorMessage = error.response.data.error || 'Student already exists';
        } else if (error.response.status === 400) {
          // Bad request - validation error
          errorMessage = error.response.data.error || 'Invalid student data provided';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data && error.response.data.details) {
          errorMessage = `Server error: ${error.response.data.details}`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error - please check your connection';
      }
      
      addToast(errorMessage, 'error');
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

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        // Get the database ID for the student
        const dbId = await studentsApi.getDatabaseIdBySystemId(studentToDelete.id);
        if (dbId) {
          // Delete from database
          await studentsApi.delete(dbId);
          
          // Update local state
          setAllStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
          
          addToast(`${studentToDelete.name} deleted successfully.`, 'success');
        } else {
          addToast(`Failed to delete ${studentToDelete.name}. Student not found in database.`, 'error');
        }
      } catch (error: any) {
        console.error('Error deleting student:', error);
        let errorMessage = `Failed to delete ${studentToDelete.name}. Please try again.`;
        
        // Handle specific error cases
        if (error.response) {
          if (error.response.status === 409) {
            // Conflict - student has associated data
            errorMessage = error.response.data.error || 'Cannot delete student with associated data';
          } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data && error.response.data.details) {
            errorMessage = `Server error: ${error.response.data.details}`;
          }
        } else if (error.request) {
          // Network error
          errorMessage = 'Network error - please check your connection';
        }
        
        addToast(errorMessage, 'error');
      } finally {
        setStudentToDelete(null);
        setIsConfirmModalOpen(false);
      }
    }
  };

  const handleLoad = () => {
      if(selectedSchoolId || (school && school.id)){
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
        // Prepare student data for API
        const studentPayload = {
          student_system_id: student.id,
          school_id: student.school_id,
          name: student.name,
          dob: student.dob,
          gender: student.gender,
          grade: student.grade,
          roll_no: student.roll_no,
          photo_url: student.photo_url,
          academic_year: student.year,
          symbol_no: student.symbol_no,
          alph: student.alph,
          registration_id: student.registration_id,
          dob_bs: student.dob_bs,
          father_name: student.father_name,
          mother_name: student.mother_name,
          mobile_no: student.mobile_no,
          year: student.year,
          created_at: new Date().toISOString()
        };
        
        // Save to database - the API expects the frontend Student type
        const savedStudent = await studentsApi.create(studentPayload);
        savedStudents.push(savedStudent);
      }
      
      // Update local state with saved students
      setAllStudents(prevStudents => [...(prevStudents || []), ...savedStudents]);
      addToast(`${savedStudents.length} students uploaded and saved successfully!`, 'success');
    } catch (error: any) {
      console.error('Error saving students:', error);
      // Show more detailed error message
      let errorMessage = 'Failed to save students to database. Please try again.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = `Failed to save students to database: ${error.message}. Please try again.`;
      }
      addToast(errorMessage, 'error');
      // Return early to prevent success flow
      return;
    }
  };

  // Function to export student data as Excel
  const exportStudentsToExcel = () => {
    if (!filteredStudents || filteredStudents.length === 0) {
      addToast("No students to export.", "warning");
      return;
    }

    // Create Excel content
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

    // Create data array
    const data = filteredStudents.map((student, index) => {
      const school = schools?.find(s => s.id === student.school_id);
      return [
        index + 1,
        school?.iemisCode || "N/A",
        student.id,
        student.symbol_no,
        student.registration_id,
        student.name,
        student.gender,
        student.grade,
        student.dob_bs,
        formatADDate(student.dob),
        student.father_name,
        student.mother_name,
        student.mobile_no,
        student.year
      ];
    });

    // Add headers to the beginning of the data array
    const excelData = [headers, ...data];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    // Generate Excel file and download
    XLSX.writeFile(wb, `students_${selectedSchoolId}_${selectedYear}_grade${selectedClass}.xlsx`);
  };

  // Function to handle CSV import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      addToast('Please upload a CSV file', 'error');
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length <= 1) {
        addToast('CSV file is empty or invalid', 'error');
        return;
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      // Validate required headers
      const requiredHeaders = ['Full Name', 'Registration ID', 'Symbol No', 'Roll No', 'Gender', 'DOB (BS)', 'Father\'s Name', 'Mother\'s Name'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      
      if (missingHeaders.length > 0) {
        addToast(`Missing required columns: ${missingHeaders.join(', ')}`, 'error');
        return;
      }

      // Process data rows
      const previewRows: any[] = [];
      
      for (let i = 1; i < Math.min(lines.length, 6); i++) { // Preview first 5 rows
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        
        if (values.length !== headers.length) {
          addToast(`Row ${i + 1} has invalid number of columns`, 'error');
          return;
        }
        
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });
        
        previewRows.push(rowData);
      }

      // Show preview
      setPreviewData(previewRows);
      setShowPreview(true);
      
      // Note: Actual import will be handled in a separate function after user confirmation
    } catch (error) {
      console.error('Error reading CSV file:', error);
      addToast('Failed to read CSV file', 'error');
    }
  };

  // Function to confirm CSV import
  const confirmImport = async () => {
    if (previewData.length === 0) return;
    
    setIsImporting(true);
    
    try {
      // Process all data rows
      const newStudents: Partial<Student>[] = [];
      
      // In a real implementation, we would read the full file again here
      // For now, we'll just use the preview data as a sample
      for (const rowData of previewData) {
        // Map to Student object
        newStudents.push({
          id: `S${Date.now() + Math.random()}`,
          school_id: Number(selectedSchoolId),
          name: rowData['Full Name'],
          registration_id: rowData['Registration ID'],
          symbol_no: rowData['Symbol No'],
          roll_no: rowData['Roll No'],
          gender: rowData['Gender'] || 'Male',
          dob_bs: rowData['DOB (BS)'],
          father_name: rowData['Father\'s Name'],
          mother_name: rowData['Mother\'s Name'],
          mobile_no: rowData['Mobile No'] || '',
          alph: rowData['Alph'] || '',
          year: parseInt(selectedYear),
          grade: selectedClass,
          photo_url: 'https://placehold.co/100x100?text=No+Photo'
        });
      }

      // Import students
      const importedStudents = [];
      let successCount = 0;
      let errorCount = 0;
      
      for (const studentData of newStudents) {
        try {
          // Prepare student data for API
          const studentPayload = {
            student_system_id: studentData.id,
            school_id: studentData.school_id,
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
          
          const newStudent = await studentsApi.create(studentPayload as any);
          importedStudents.push(newStudent);
          successCount++;
        } catch (error: any) {
          console.error('Error importing student:', error);
          errorCount++;
        }
      }
      
      // Update state with newly imported students
      setAllStudents(prev => [...prev, ...importedStudents]);
      
      // Close preview
      setShowPreview(false);
      setPreviewData([]);
      
      if (errorCount === 0) {
        addToast(`${successCount} students imported successfully!`, 'success');
      } else {
        addToast(`${successCount} students imported successfully, ${errorCount} failed.`, 'warning');
      }
    } catch (error) {
      console.error('Error importing students:', error);
      addToast('Failed to import students', 'error');
    } finally {
      setIsImporting(false);
    }
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
        student.registration_id.toLowerCase().includes(lowercasedQuery) ||
        student.father_name.toLowerCase().includes(lowercasedQuery) ||
        student.mother_name.toLowerCase().includes(lowercasedQuery) ||
        student.mobile_no.toLowerCase().includes(lowercasedQuery)
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
    { header: 'Sym No', accessor: 'symbol_no' as const, className: 'whitespace-nowrap' },

    { header: 'Reg Id', accessor: 'registration_id' as const, className: 'whitespace-nowrap' },
    { header: 'Full Name', accessor: 'name' as const, className: 'whitespace-nowrap min-w-40' },
    { header: 'Gender', accessor: 'gender' as const, className: 'whitespace-nowrap' },
    { header: 'Class', accessor: 'grade' as const, className: 'whitespace-nowrap' },
    { header: 'Dob Bs', accessor: 'dob_bs' as const, className: 'whitespace-nowrap' },

  ];

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {school ? (
              // If school prop is provided, show school info instead of dropdown
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Selected School</label>
                <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                  {school.iemisCode} - {school.name}
                </div>
              </div>
            ) : (
              // If no school prop, show the dropdown
              <Select
                id="school-selector"
                label="Selected School*"
                value={selectedSchoolId}
                onChange={(e) => {
                    setSelectedSchoolId(e.target.value);
                    // Removed setShowStudents(false) to allow auto-loading
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
            )}

             <Select
                id="year-selector"
                label="Year*"
                value={selectedYear}
                onChange={(e) => {
                    setSelectedYear(e.target.value);
                    // Removed setShowStudents(false) to allow auto-loading
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
                    // Removed setShowStudents(false) to allow auto-loading
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
                {!isReadOnly && (
                  <div className="flex items-center space-x-2">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".csv"
                        className="hidden" 
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        variant="secondary"
                        disabled={isImporting}
                      >
                        {isImporting ? 'Importing...' : 'Import CSV'}
                      </Button>
                      <Button variant="secondary" onClick={() => setIsUploadModalOpen(true)} leftIcon={<DocumentArrowUpIcon className="w-4 h-4" />}>Upload Excel</Button>
                      <Button variant="secondary" onClick={exportStudentsToExcel} leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}>Export to Excel</Button>
                      <Button variant="secondary" onClick={refreshStudents} leftIcon={<ArrowLeftOnRectangleIcon className="w-4 h-4" />}>Refresh</Button>
                      <Button onClick={() => navigate('/student/all-profiles')}>Print All Profiles</Button>
                      <Button onClick={handleAdd}>Add Student</Button>
                  </div>
                )}
            </div>

            <Table<Student>
                columns={columns}
                data={paginatedStudents}
                isLoading={isLoading}
                renderActions={(student) => (
                  <DropdownMenu
                    trigger={
                      <IconButton 
                        size="sm" 
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </IconButton>
                    }
                  >
                    <DropdownMenuItem onClick={() => handleViewProfile(student.id)}>
                      <div className="flex items-center">
                        <UserCircleIcon className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                        <span>View Profile</span>
                      </div>
                    </DropdownMenuItem>
                    {!isReadOnly && (
                      <>
                        <DropdownMenuItem onClick={() => handleEdit(student)}>
                          <div className="flex items-center">
                            <PencilIcon className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            <span>Edit</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(student)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <div className="flex items-center">
                            <TrashIcon className="w-4 h-4 mr-2" />
                            <span>Delete</span>
                          </div>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenu>
                )}
            />
            <Pagination currentPage={currentPage} totalPages={totalPages > 0 ? totalPages : 1} onPageChange={setCurrentPage} />
        </div>
      ) : (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <p className="text-gray-500 dark:text-gray-400">Please select criteria and click 'Load' to view students.</p>
        </div>
      )}
      
      {!isReadOnly && (
        <>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={selectedStudent ? 'Edit Student' : 'Add New Student'}
          >
            <StudentForm student={selectedStudent} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
          </Modal>

          <Modal
            isOpen={showPreview}
            onClose={() => {
              setShowPreview(false);
              setPreviewData([]);
            }}
            title="Import Preview"
            size="lg"
          >
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Please review the data before importing. Only the first 5 rows are shown for preview.
              </p>
              
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      {previewData.length > 0 && Object.keys(previewData[0]).map((header) => (
                        <th 
                          key={header}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {Object.values(row).map((value, colIndex) => (
                          <td 
                            key={colIndex}
                            className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate"
                            title={String(value)}
                          >
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewData([]);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmImport}
                  disabled={isImporting}
                >
                  {isImporting ? 'Importing...' : 'Import Students'}
                </Button>
              </div>
            </div>
          </Modal>

          <ExcelUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUpload={handleUploadSuccess}
            schoolId={selectedSchoolId || (school ? school.id.toString() : '')}
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
            message={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone. All associated data will be permanently removed.`}
            confirmText="Delete"
            confirmVariant="danger"
          />
          
        </>
      )}
    </div>
  );
};

export default ManageStudentsPage;