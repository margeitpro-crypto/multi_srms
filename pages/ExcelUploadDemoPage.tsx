import React from 'react';
import ExcelUploadForm from '../components/ExcelUploadForm';

const ExcelUploadDemoPage: React.FC = () => {
  const handleUploadSuccess = (data: any) => {
    console.log('Upload successful:', data);
    // Here you would typically update your UI or state with the new data
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // Handle error in your UI
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Excel Student Data Import</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Import student data from Excel files while preserving large numeric values
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <ExcelUploadForm 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3 mt-1">
                <span className="text-primary-600 dark:text-primary-400 text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Upload Excel File</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Select a .xls or .xlsx file containing student data
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3 mt-1">
                <span className="text-primary-600 dark:text-primary-400 text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Preserve Numeric Data</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Large numbers like registration IDs are preserved as strings to prevent scientific notation
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3 mt-1">
                <span className="text-primary-600 dark:text-primary-400 text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Process Data</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  The system parses the Excel file and converts data for storage
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Why Excel Instead of CSV?</h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Preserves data types and formatting</li>
              <li>• Prevents scientific notation for large numbers</li>
              <li>• Maintains leading zeros in numeric fields</li>
              <li>• More reliable parsing of complex data</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-2">Data Preparation</h3>
            <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
              <li>• Format numeric ID columns as "Text" in Excel before entering data</li>
              <li>• Use consistent column headers across files</li>
              <li>• Remove any special characters that might cause parsing issues</li>
              <li>• Validate data before export to ensure consistency</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-2">Technical Considerations</h3>
            <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
              <li>• Always validate file type and size on both client and server</li>
              <li>• Implement proper error handling for malformed files</li>
              <li>• Use transactions when saving data to prevent partial imports</li>
              <li>• Provide clear feedback to users about upload progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadDemoPage;