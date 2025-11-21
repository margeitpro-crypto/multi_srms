
import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Student } from '../types';
import Loader from './Loader';
// FIX: Import InputField component
import InputField from './InputField';
import { studentsApi } from '../services/dataService';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (newStudents: Student[]) => void;
  schoolId: number | string;
  year: number | string;
  grade: string;
}

const REQUIRED_HEADERS = ['name', 'symbol_no', 'registration_id', 'dob_bs', 'dob_ad', 'gender', 'father_name', 'mother_name', 'mobile_no', 'roll_no'];
const SAMPLE_CSV_DATA = REQUIRED_HEADERS.join(',') + '\n' +
  'Jane Doe,SYM001,REG001,2062-01-01,2005-04-14,Female,John Doe,Jane Smith,9800000001,101\n' +
  'John Roe,SYM002,REG002,2062-02-02,2005-05-15,Male,Peter Roe,Mary Roe,9800000002,102';

const CSVUploadModal: React.FC<CSVUploadModalProps> = ({ isOpen, onClose, onUpload, schoolId, year, grade }) => {
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
        if (uploadedFile.type !== 'text/csv') {
            setErrors(['Invalid file type. Please upload a .csv file.']);
            return;
        }
        setFile(uploadedFile);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_students.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = useCallback(() => {
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);
    setParsedStudents(null);

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            setErrors(['CSV file is empty or contains only a header.']);
            setIsProcessing(false);
            return;
        }

        const header = lines[0].split(',').map(h => h.trim());
        const missingHeaders = REQUIRED_HEADERS.filter(h => !header.includes(h));
        if (missingHeaders.length > 0) {
            setErrors([`Missing required headers: ${missingHeaders.join(', ')}`]);
            setIsProcessing(false);
            return;
        }

        const validationErrors: string[] = [];
        const studentsToUpload: Partial<Student>[] = [];

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            if (row.length !== header.length) {
                validationErrors.push(`Row ${i + 1}: Column count mismatch. Expected ${header.length}, got ${row.length}.`);
                continue;
            }

            const studentData: { [key: string]: string } = {};
            header.forEach((h, index) => {
                studentData[h] = row[index]?.trim();
            });

            // Validation
            if (!studentData.name) validationErrors.push(`Row ${i + 1}: 'name' is required.`);
            if (!studentData.symbol_no) validationErrors.push(`Row ${i + 1}: 'symbol_no' is required.`);
            if (!studentData.registration_id) validationErrors.push(`Row ${i + 1}: 'registration_id' is required.`);
            const gender = studentData.gender?.toLowerCase();
            if (gender && !['male', 'female', 'other'].includes(gender)) {
                validationErrors.push(`Row ${i + 1}: 'gender' must be Male, Female, or Other.`);
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

        setIsProcessing(false);
    };
    reader.readAsText(file);
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
      // In a real implementation, we would show an error message to the user
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Students from CSV">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white">Instructions</h4>
          <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
            <li>Your CSV file must contain the following headers: {REQUIRED_HEADERS.join(', ')}.</li>
            <li>The order of columns does not matter, but header names must match exactly.</li>
            <li>Ensure required fields like 'name', 'symbol_no', and 'registration_id' are not empty.</li>
            <li>Click <button onClick={handleDownloadSample} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">here to download a sample CSV file</button>.</li>
          </ul>
        </div>

        <div className="flex items-center space-x-4 pt-4 border-t dark:border-gray-700">
            <InputField id="csv-file" label="CSV File" type="file" accept=".csv" onChange={handleFileChange} containerClassName="flex-grow" />
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

export default CSVUploadModal;
