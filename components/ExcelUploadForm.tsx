import React, { useState } from 'react';
import Button from './Button';

interface ExcelUploadFormProps {
  onUploadSuccess?: (data: any) => void;
  onUploadError?: (error: string) => void;
}

const ExcelUploadForm: React.FC<ExcelUploadFormProps> = ({ 
  onUploadSuccess, 
  onUploadError 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls',
        '.xlsx'
      ];
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isValidType = validTypes.includes(file.type) || 
                         (fileExtension && ['xls', 'xlsx'].includes(fileExtension));
      
      if (!isValidType) {
        alert('Please select a valid Excel file (.xls or .xlsx)');
        event.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        event.target.value = ''; // Clear the input
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to backend
      const response = await fetch('/api/excel/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        onUploadSuccess?.(result.data);
        alert(`Successfully uploaded ${result.count} students`);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'An error occurred during upload';
      console.error('Upload error:', error);
      onUploadError?.(errorMessage);
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('excel-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Upload Student Data</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Upload Excel files (.xls or .xlsx) to import student data. Large numeric fields like 
        registration IDs and phone numbers will be preserved without scientific notation.
      </p>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Excel File
        </label>
        <div className="flex items-center space-x-4">
          <input
            id="excel-file-input"
            type="file"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-600 file:text-white
              hover:file:bg-primary-700
              dark:file:bg-primary-700 dark:hover:file:bg-primary-600
              disabled:opacity-50"
          />
        </div>
        {selectedFile && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </div>

      {isUploading && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="flex-1"
        >
          {isUploading ? 'Uploading...' : 'Upload Excel File'}
        </Button>
        {selectedFile && !isUploading && (
          <Button
            variant="secondary"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Important Notes</h3>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Only .xls and .xlsx files are supported</li>
          <li>• File size limit: 5MB</li>
          <li>• Large numeric values (like 818000000001) will be preserved as strings</li>
          <li>• Leading zeros in numeric fields will be maintained</li>
          <li>• Scientific notation conversion will be prevented</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelUploadForm;