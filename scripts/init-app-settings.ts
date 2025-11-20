import { setSetting } from '../backend/services/applicationSettingsService';

async function initAppSettings() {
  try {
    console.log('Initializing application settings...');
    
    // Set default application name
    await setSetting('app_name', '"ResultSys"', 'Application name displayed in the UI');
    
    // Set default academic year
    await setSetting('academic_year', '"2082"', 'Current academic year for the application');
    
    console.log('Application settings initialized successfully!');
  } catch (error) {
    console.error('Error initializing application settings:', error);
    process.exit(1);
  }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initAppSettings();
}

export default initAppSettings;