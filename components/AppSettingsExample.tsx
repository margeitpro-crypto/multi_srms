import React, { useState } from 'react';
import { useAppSettings } from '../hooks/useAppSettings';
import Button from './Button';
import InputField from './InputField';

/**
 * Example component demonstrating how to use the useAppSettings hook
 * This component shows how to display and update application settings
 */
const AppSettingsExample: React.FC = () => {
  const { appSettings, updateAppSetting, isLoading, error } = useAppSettings();
  const [newAppName, setNewAppName] = useState(appSettings.appName);
  const [newAcademicYear, setNewAcademicYear] = useState(appSettings.academicYear);

  const handleSaveAppName = async () => {
    try {
      await updateAppSetting('app_name', newAppName, 'Application name displayed in the UI');
    } catch (err) {
      console.error('Failed to update app name:', err);
    }
  };

  const handleSaveAcademicYear = async () => {
    try {
      await updateAppSetting('academic_year', newAcademicYear, 'Current academic year for the application');
    } catch (err) {
      console.error('Failed to update academic year:', err);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Application Settings Example</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <InputField
            id="app-name"
            label="Application Name"
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
          />
          <Button 
            onClick={handleSaveAppName} 
            disabled={isLoading}
            className="mt-2"
          >
            {isLoading ? 'Saving...' : 'Save App Name'}
          </Button>
        </div>
        
        <div>
          <InputField
            id="academic-year"
            label="Current Academic Year"
            value={newAcademicYear}
            onChange={(e) => setNewAcademicYear(e.target.value)}
          />
          <Button 
            onClick={handleSaveAcademicYear} 
            disabled={isLoading}
            className="mt-2"
          >
            {isLoading ? 'Saving...' : 'Save Academic Year'}
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h3 className="font-semibold mb-2">Current Settings:</h3>
          <p><strong>App Name:</strong> {appSettings.appName}</p>
          <p><strong>Academic Year:</strong> {appSettings.academicYear}</p>
          <p><strong>App Logo:</strong> {appSettings.appLogo || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
};

export default AppSettingsExample;