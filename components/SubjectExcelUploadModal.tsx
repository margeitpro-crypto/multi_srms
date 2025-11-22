import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Subject } from '../types';
import Loader from './Loader';
import InputField from './InputField';
import * as XLSX from 'xlsx';

interface SubjectExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newSubjects: Omit<Subject, 'id'>[]) => void;
}

const REQUIRED_HEADERS = [
  'name', 'grade', 
  'theory_subcode', 'theory_credit', 'theory_fullmarks', 'theory_passmarks', 
  'internal_subcode', 'internal_credit', 'internal_fullmarks', 'internal_passmarks'
];

const SAMPLE_EXCEL_DATA = [
  ['name', 'grade', 'theory_subcode', 'theory_credit', 'theory_fullmarks', 'theory_passmarks', 'internal_subcode', 'internal_credit', 'internal_fullmarks', 'internal_passmarks'],
  ['Physics', 11, 'PHY101', 3.75, 75, 27, 'PHY102', 1.25, 25, 10],
  ['Chemistry', 11, 'CHM101', 3.75, 75, 27, 'CHM102', 1.25, 25, 10],
  ['Mathematics', 12, 'MTH201', 3.75, 75, 27, 'MTH202', 1.25, 25, 10]
];

const SubjectExcelUploadModal: React.FC<SubjectExcelUploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [parsedSubjects, setParsedSubjects] = useState<Omit<Subject, 'id'>[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = () => {
    setFile(null);
    setErrors([]);
    setParsedSubjects(null);
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
    XLSX.utils.book_append_sheet(wb, ws, 'Subjects');
    
    // Generate Excel file and download
    XLSX.writeFile(wb, 'sample_subjects.xlsx');
  };

  const processFile = useCallback(() => {
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);
    setParsedSubjects(null);

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
          setErrors([`Missing required Excel headers: ${missingHeaders.join(', ')}`]);
          setIsProcessing(false);
          return;
        }

        const validationErrors: string[] = [];
        const subjectsToUpload: Omit<Subject, 'id'>[] = [];

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowData: { [key: string]: string } = {};
          
          // Normalize keys to lowercase for case-insensitive matching
          Object.keys(row).forEach(key => {
            rowData[key.trim().toLowerCase()] = String(row[key] || '').trim();
          });

          const grade = parseInt(rowData.grade, 10);
          if (isNaN(grade) || (grade !== 11 && grade !== 12)) {
            validationErrors.push(`Row ${i + 2}: 'grade' must be either 11 or 12.`);
            continue;
          }

          const subject: Omit<Subject, 'id'> = {
            name: rowData.name,
            grade: grade as 11 | 12,
            theory: {
              subCode: rowData.theory_subcode || '',
              credit: parseFloat(rowData.theory_credit || '0'),
              fullMarks: parseInt(rowData.theory_fullmarks || '0', 10),
              passMarks: parseInt(rowData.theory_passmarks || '0', 10)
            },
            internal: {
              subCode: rowData.internal_subcode || '',
              credit: parseFloat(rowData.internal_credit || '0'),
              fullMarks: parseInt(rowData.internal_fullmarks || '0', 10),
              passMarks: parseInt(rowData.internal_passmarks || '0', 10)
            }
          };

          if (Object.values(subject.theory).some(v => v === undefined || (typeof v === 'number' && isNaN(v))) ||
              Object.values(subject.internal).some(v => v === undefined || (typeof v === 'number' && isNaN(v)))) {
            validationErrors.push(`Row ${i + 2}: Contains invalid or missing numerical values.`);
            continue;
          }
          
          subjectsToUpload.push(subject);
        }
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        } else {
          setParsedSubjects(subjectsToUpload);
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

  const handleConfirmUpload = () => {
    if (!parsedSubjects) return;
    onUploadSuccess(parsedSubjects);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Subjects from Excel">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white">Instructions</h4>
          <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
            <li>Your Excel file must contain the following headers: {REQUIRED_HEADERS.join(', ')}.</li>
            <li>The 'grade' column must be either 11 or 12.</li>
            <li>Click <button onClick={handleDownloadSample} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">here to download a sample Excel file</button>.</li>
          </ul>
        </div>

        <div className="flex items-center space-x-4 pt-4 border-t dark:border-gray-700">
            <InputField id="excel-file" label="Excel File" type="file" accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileChange} containerClassName="flex-grow" />
            <Button onClick={processFile} disabled={!file || isProcessing} className="self-end">
                {isProcessing ? <><Loader /> Processing...</> : 'Validate File'}
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
        
        {parsedSubjects && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <h4 className="font-semibold text-green-700 dark:text-green-300">Validation Successful!</h4>
                <p className="text-xs text-green-600 dark:text-green-400">{parsedSubjects.length} subjects are ready to be imported.</p>
                 <div className="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 rounded">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Grade</th>
                                <th className="p-2 text-left">Theory Credit</th>
                                <th className="p-2 text-left">Internal Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsedSubjects.slice(0, 5).map((s, i) => (
                                <tr key={i} className="border-b dark:border-gray-600">
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2">{s.grade}</td>
                                    <td className="p-2">{s.theory.credit}</td>
                                    <td className="p-2">{s.internal.credit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {parsedSubjects.length > 5 && <p className="text-center p-2 text-gray-500">...and {parsedSubjects.length - 5} more rows.</p>}
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleConfirmUpload}>Confirm & Import</Button>
                </div>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default SubjectExcelUploadModal;