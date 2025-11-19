
import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Subject } from '../types';
import Loader from './Loader';
import InputField from './InputField';

interface SubjectCSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newSubjects: Omit<Subject, 'id'>[]) => void;
}

const REQUIRED_HEADERS = [
  'name', 'grade', 
  'theory_subCode', 'theory_credit', 'theory_fullMarks', 'theory_passMarks', 
  'internal_subCode', 'internal_credit', 'internal_fullMarks', 'internal_passMarks'
];

const SAMPLE_CSV_DATA = REQUIRED_HEADERS.join(',') + '\n' +
  'Physics,11,PHY101,3.75,75,27,PHY102,1.25,25,10\n' +
  'Chemistry,11,CHM101,3.75,75,27,CHM102,1.25,25,10\n' +
  'Mathematics,12,MTH201,3.75,75,27,MTH202,1.25,25,10';

const SubjectCSVUploadModal: React.FC<SubjectCSVUploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
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
    link.setAttribute('download', 'sample_subjects.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = useCallback(() => {
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);
    setParsedSubjects(null);

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
        setErrors([`Missing required CSV headers: ${missingHeaders.join(', ')}`]);
        setIsProcessing(false);
        return;
      }

      const validationErrors: string[] = [];
      const subjectsToUpload: Omit<Subject, 'id'>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        const rowData: { [key: string]: string } = {};
        header.forEach((h, index) => {
            rowData[h] = row[index]?.trim();
        });

        const grade = parseInt(rowData.grade, 10);
        if (isNaN(grade) || (grade !== 11 && grade !== 12)) {
            validationErrors.push(`Row ${i + 1}: 'grade' must be either 11 or 12.`);
            continue;
        }

        const subject: Omit<Subject, 'id'> = {
            name: rowData.name,
            grade: grade as 11 | 12,
            theory: {
                subCode: rowData.theory_subCode,
                credit: parseFloat(rowData.theory_credit),
                fullMarks: parseInt(rowData.theory_fullMarks, 10),
                passMarks: parseInt(rowData.theory_passMarks, 10)
            },
            internal: {
                subCode: rowData.internal_subCode,
                credit: parseFloat(rowData.internal_credit),
                fullMarks: parseInt(rowData.internal_fullMarks, 10),
                passMarks: parseInt(rowData.internal_passMarks, 10)
            }
        };

        if (Object.values(subject.theory).some(v => v === undefined || (typeof v === 'number' && isNaN(v))) ||
            Object.values(subject.internal).some(v => v === undefined || (typeof v === 'number' && isNaN(v)))) {
            validationErrors.push(`Row ${i + 1}: Contains invalid or missing numerical values.`);
            continue;
        }
        
        subjectsToUpload.push(subject);
      }
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      } else {
        setParsedSubjects(subjectsToUpload);
      }

      setIsProcessing(false);
    };
    reader.readAsText(file);
  }, [file]);

  const handleConfirmUpload = () => {
    if (!parsedSubjects) return;
    onUploadSuccess(parsedSubjects);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Subjects from CSV">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white">Instructions</h4>
          <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
            <li>Your CSV file must contain the following headers: {REQUIRED_HEADERS.join(', ')}.</li>
            <li>The 'grade' column must be either 11 or 12.</li>
            <li>Click <button onClick={handleDownloadSample} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">here to download a sample CSV file</button>.</li>
          </ul>
        </div>

        <div className="flex items-center space-x-4 pt-4 border-t dark:border-gray-700">
            <InputField id="csv-file" label="CSV File" type="file" accept=".csv" onChange={handleFileChange} containerClassName="flex-grow" />
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

export default SubjectCSVUploadModal;
