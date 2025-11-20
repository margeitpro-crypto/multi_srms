import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import dataService from '../services/dataService';

interface AppSettings {
  appName: string;
  academicYear: string;
  appLogo: string;
}

/**
 * Custom hook to manage application settings
 * Provides access to current settings and functions to update them
 */
export const useAppSettings = () => {
  const { appSettings, setAppSettings } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all application settings from the database
   */
  const loadAppSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const settingsData = await dataService.applicationSettings.getAll();
      
      // Convert array to key-value map
      const settingsMap: { [key: string]: any } = {};
      settingsData.forEach((setting: any) => {
        settingsMap[setting.key] = setting.value;
      });
      
      // Update the appSettings in DataContext
      setAppSettings({
        appName: settingsMap['app_name'] || 'ResultSys',
        academicYear: settingsMap['academic_year'] || '2082',
        appLogo: settingsMap['app_logo'] || ''
      });
    } catch (err) {
      console.error('Error loading application settings:', err);
      setError('Failed to load application settings');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update a single application setting
   */
  const updateAppSetting = async (key: string, value: any, description?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await dataService.applicationSettings.saveSetting(key, value, description);
      
      // Update the appSettings in DataContext
      setAppSettings(prev => ({
        ...prev,
        [key === 'app_name' ? 'appName' : 
         key === 'academic_year' ? 'academicYear' : 
         key === 'app_logo' ? 'appLogo' : key]: value
      }));
    } catch (err) {
      console.error(`Error updating application setting ${key}:`, err);
      setError(`Failed to update setting ${key}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update multiple application settings at once
   */
  const updateAppSettings = async (settings: { [key: string]: any }) => {
    setIsLoading(true);
    setError(null);
    try {
      await dataService.applicationSettings.saveSettings(settings);
      
      // Update the appSettings in DataContext
      setAppSettings(prev => {
        const updatedSettings = { ...prev };
        Object.keys(settings).forEach(key => {
          const value = settings[key];
          if (key === 'app_name') {
            updatedSettings.appName = value;
          } else if (key === 'academic_year') {
            updatedSettings.academicYear = value;
          } else if (key === 'app_logo') {
            updatedSettings.appLogo = value;
          }
        });
        return updatedSettings;
      });
    } catch (err) {
      console.error('Error updating application settings:', err);
      setError('Failed to update settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    appSettings,
    isLoading,
    error,
    loadAppSettings,
    updateAppSetting,
    updateAppSettings
  };
};