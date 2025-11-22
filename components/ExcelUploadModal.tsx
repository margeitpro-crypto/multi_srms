import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Student } from '../types';
import Loader from './Loader';
import InputField from './InputField';
import { studentsApi } from '../services/dataService';
import * as XLSX from 'xlsx';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (newStudents: Student[]) => void;
  schoolId: number | string;
  year: number | string;
  grade: string;
}

const REQUIRED_HEADERS = ['name', 'symbol_no', 'registration_id', 'dob_bs', 'dob_ad', 'gender', 'father_name', 'mother_name', 'mobile_no', 'roll_no'];
const SAMPLE_EXCEL_DATA = [
  ['name', 'symbol_no', 'registration_id', 'dob_bs', 'dob_ad', 'gender', 'father_name', 'mother_name', 'mobile_no', 'roll_no'],
  ['Jane Doe', 'SYM001', 'REG001', '2062-01-01', '2005-04-14', 'Female', 'John Doe', 'Jane Smith', '9800000001', '101'],
  ['John Roe', 'SYM002', 'REG002', '2062-02-02', '2005-05-15', 'Male', 'Peter Roe', 'Mary Roe', '9800000002', '102']
];

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ isOpen, onClose, onUpload, schoolId, year, grade }) => {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [parsedStudents, setParsedStudents] = useState<Partial<Student>[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = () => {
    setFile(null);
    setErrors([]);
    setParsedStudents(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls',
        '.xlsx'
      ];
      
      const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase();
      const isValidType = validTypes.includes(uploadedFile.type) || 
                         (fileExtension && ['xls', 'xlsx'].includes(fileExtension));
      
      if (!isValidType) {
        setErrors(['Invalid file type. Please upload an Excel file (.xls or .xlsx).']);
        return;
      }
      
      // Validate file size (5MB limit)
      if (uploadedFile.size > 5 * 1024 * 1024) {
        setErrors(['File size exceeds 5MB limit.']);
        return;
      }
      
      setFile(uploadedFile);
    }
  };

  const handleDownloadSample = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create worksheet from sample data
    const ws = XLSX.utils.aoa_to_sheet(SAMPLE_EXCEL_DATA);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    
    // Generate Excel file and download
    XLSX.writeFile(wb, 'sample_students.xlsx');
  };

  const processFile = useCallback(() => {
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);
    setParsedStudents(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: ''
        });
        
        if (jsonData.length < 1) {
          setErrors(['Excel file is empty or contains only a header.']);
          setIsProcessing(false);
          return;
        }

        // Get headers from the first row
        const headers = Object.keys(jsonData[0]).map(h => h.trim().toLowerCase());
        const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          setErrors([`Missing required headers: ${missingHeaders.join(', ')}`]);
          setIsProcessing(false);
          return;
        }

        const validationErrors: string[] = [];
        const studentsToUpload: Partial<Student>[] = [];

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const studentData: { [key: string]: string } = {};
          
          // Normalize keys to lowercase for case-insensitive matching
          Object.keys(row).forEach(key => {
            studentData[key.trim().toLowerCase()] = String(row[key] || '').trim();
          });

          // Validation
          if (!studentData.name) validationErrors.push(`Row ${i + 2}: 'name' is required.`);
          if (!studentData.symbol_no) validationErrors.push(`Row ${i + 2}: 'symbol_no' is required.`);
          if (!studentData.registration_id) validationErrors.push(`Row ${i + 2}: 'registration_id' is required.`);
          
          const gender = studentData.gender?.toLowerCase();
          if (gender && !['male', 'female', 'other'].includes(gender)) {
            validationErrors.push(`Row ${i + 2}: 'gender' must be Male, Female, or Other.`);
          }

          studentsToUpload.push({
            name: studentData.name,
            symbol_no: studentData.symbol_no,
            registration_id: studentData.registration_id,
            dob_bs: studentData.dob_bs,
            dob: studentData.dob_ad,
            gender: (studentData.gender?.charAt(0).toUpperCase() + studentData.gender?.slice(1)) as Student['gender'],
            father_name: studentData.father_name,
            mother_name: studentData.mother_name,
            mobile_no: studentData.mobile_no,
            roll_no: studentData.roll_no,
          });
        }
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        } else {
          setParsedStudents(studentsToUpload);
        }
      } catch (error) {
        console.error('Error processing Excel file:', error);
        setErrors(['Error processing Excel file. Please ensure it is a valid Excel file.']);
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
    };
    
    reader.onerror = () => {
      setErrors(['Error reading file.']);
      setIsProcessing(false);
      return;
    };
    
    reader.readAsArrayBuffer(file);
  }, [file]);

  const handleConfirmUpload = async () => {
    if (!parsedStudents) return;

    try {
      const newStudents: Student[] = [];
      
      // Process students one by one to ensure proper database insertion
      for (let i = 0; i < parsedStudents.length; i++) {
        const s = parsedStudents[i];
        const studentData = {
          student_system_id: `S${Date.now()}${i}`,
          school_id: Number(schoolId),
          name: s.name,
          dob: s.dob,
          gender: s.gender,
          grade: grade,
          roll_no: s.roll_no,
          photo_url: '',
          academic_year: Number(year),
          symbol_no: s.symbol_no,
          alph: '',
          registration_id: s.registration_id,
          dob_bs: s.dob_bs,
          father_name: s.father_name,
          mother_name: s.mother_name,
          mobile_no: s.mobile_no,
          year: Number(year),
          created_at: new Date().toISOString()
        };
        
        // Save to database using the data service
        const newStudent = await studentsApi.create(studentData);
        
        newStudents.push(newStudent);
      }

      onUpload(newStudents);
      handleClose();
    } catch (error) {
      console.error('Error uploading students:', error);
      // Show more detailed error message
      if (error instanceof Error) {
        setErrors([`Error uploading students to database: ${error.message}. Please try again.`]);
      } else {
        setErrors(['Error uploading students to database. Please try again.']);
      }
      // Return early to prevent success flow
      return;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Students from Excel">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white">Instructions</h4>
          <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
            <li>Your Excel file must contain the following headers: {REQUIRED_HEADERS.join(', ')}.</li>
            <li>The order of columns does not matter, but header names must match exactly.</li>
            <li>Ensure required fields like 'name', 'symbol_no', and 'registration_id' are not empty.</li>
            <li>Click <button onClick={handleDownloadSample} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">here to download a sample Excel file</button>.</li>
          </ul>
        </div>

        <div className="flex items-center space-x-4 pt-4 border-t dark:border-gray-700">
            <InputField id="excel-file" label="Excel File" type="file" accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileChange} containerClassName="flex-grow" />
            <Button onClick={processFile} disabled={!file || isProcessing} className="self-end">
                {isProcessing ? <><Loader /> Processing...</> : 'Upload & Validate'}
            </Button>
        </div>
        
        {isProcessing && <div className="text-center p-4"><Loader /></div>}

        {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
                <h4 className="font-semibold text-red-700 dark:text-red-300">Validation Errors</h4>
                <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 mt-2 max-h-40 overflow-y-auto">
                    {errors.map((error, i) => <li key={i}>{error}</li>)}
                </ul>
            </div>
        )}
        
        {parsedStudents && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <h4 className="font-semibold text-green-700 dark:text-green-300">Validation Successful!</h4>
                <p className="text-xs text-green-600 dark:text-green-400">{parsedStudents.length} students are ready to be imported. Please review the preview below.</p>
                 <div className="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 rounded">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Symbol No</th>
                                <th className="p-2 text-left">Gender</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsedStudents.slice(0, 5).map((s, i) => (
                                <tr key={i} className="border-b dark:border-gray-600">
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2">{s.symbol_no}</td>
                                    <td className="p-2">{s.gender}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {parsedStudents.length > 5 && <p className="text-center p-2 text-gray-500">...and {parsedStudents.length - 5} more rows.</p>}
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleConfirmUpload}>Confirm & Add Students</Button>
                </div>
            </div>
        )}

      </div>
    </Modal>
  );
};

export default ExcelUploadModal;