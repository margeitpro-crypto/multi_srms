# Application Settings Implementation Guide

This guide explains how to use the application settings feature that displays dynamic application name and logo in the sidebar and uses the current academic year as the default in all year dropdowns.

## Features Implemented

1. **Dynamic Application Name and Logo in Sidebar**
   - The sidebar now displays the application name and logo from the database
   - Logo falls back to the AcademicCapIcon if not set
   - Settings are loaded when the application starts

2. **Current Academic Year as Default in Dropdowns**
   - All academic year dropdowns across the application use the current academic year from the database as the default value
   - When the current academic year is updated in settings, all dropdowns automatically update

3. **Centralized Settings Management**
   - Application settings are stored in the database in the `application_settings` table
   - Settings are accessible through the DataContext
   - Custom hook `useAppSettings` provides easy access to settings and update functions

## How It Works

### 1. Data Flow

```
Database (application_settings table)
    ↓
DataContext (appSettings state)
    ↓
Sidebar Component (displays appName and appLogo)
    ↓
Academic Year Dropdowns (use appSettings.academicYear as default)
```

### 2. Key Components

#### DataContext Updates
- Added `appSettings` state to DataContext
- Added `setAppSettings` dispatcher to DataContext
- Modified `DataProvider` to load application settings on initialization

#### Sidebar Component
- Uses `useData()` hook to access `appSettings`
- Displays dynamic application name and logo
- Falls back to default icon if no logo is set

#### Academic Year Dropdowns
- All pages with academic year dropdowns now use `appSettings.academicYear` as the default value
- Added useEffect hooks to update when `appSettings.academicYear` changes

#### Admin Settings Page
- Updated GeneralSettings component to save settings to database
- Updates DataContext when settings are saved

### 3. Custom Hook

The `useAppSettings` hook provides:
- `appSettings`: Current application settings
- `updateAppSetting(key, value)`: Update a single setting
- `updateAppSettings(settings)`: Update multiple settings
- `loadAppSettings()`: Reload all settings from database
- `isLoading` and `error` states

## Implementation Details

### Database Schema

The `application_settings` table stores key-value pairs:

```sql
CREATE TABLE application_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Default Settings

When the application initializes, it loads these default settings:
- `app_name`: "ResultSys"
- `academic_year`: "2082"
- `app_logo`: "" (empty string)

### API Endpoints

The application settings are accessible through these endpoints:
- `GET /api/application-settings` - Get all settings
- `GET /api/application-settings/:key` - Get a specific setting
- `POST /api/application-settings` - Save multiple settings
- `PUT /api/application-settings/:key` - Save a specific setting

## Usage Examples

### Accessing Settings in Components

```typescript
import { useData } from '../context/DataContext';

const MyComponent = () => {
  const { appSettings } = useData();
  
  return (
    <div>
      <h1>{appSettings.appName}</h1>
      {appSettings.appLogo ? (
        <img src={appSettings.appLogo} alt="Logo" />
      ) : (
        <div>Default Logo</div>
      )}
    </div>
  );
};
```

### Using Academic Year Dropdowns

```typescript
import { useData } from '../context/DataContext';
import Select from '../components/Select';

const AcademicYearSelector = () => {
  const { academicYears, appSettings } = useData();
  const [selectedYear, setSelectedYear] = useState(appSettings.academicYear);
  
  return (
    <Select 
      value={selectedYear} 
      onChange={(e) => setSelectedYear(e.target.value)}
    >
      {academicYears.filter(y => y.is_active).map(year => (
        <option key={year.id} value={year.year}>
          {year.year}
        </option>
      ))}
    </Select>
  );
};
```

### Updating Settings

```typescript
import { useAppSettings } from '../hooks/useAppSettings';

const SettingsUpdater = () => {
  const { updateAppSetting } = useAppSettings();
  
  const handleUpdateAppName = async () => {
    await updateAppSetting('app_name', 'New App Name', 'Application name');
  };
  
  return (
    <button onClick={handleUpdateAppName}>
      Update App Name
    </button>
  );
};
```

## Files Modified

1. `context/DataContext.tsx` - Added appSettings state and loading logic
2. `layouts/Sidebar.tsx` - Updated to use dynamic appName and appLogo
3. `pages/admin/ManageStudentsPage.tsx` - Updated to use dynamic academic year
4. `pages/admin/MarksEntryAdminPage.tsx` - Updated to use dynamic academic year
5. `pages/admin/SubjectAssignPage.tsx` - Updated to use dynamic academic year
6. `pages/school/SchoolStudentsPage.tsx` - Updated to use dynamic academic year
7. `pages/school/MarksEntryPage.tsx` - Updated to use dynamic academic year
8. `pages/admin/AdminSettingsPage.tsx` - Updated to save settings to database and update DataContext

## New Files Added

1. `hooks/useAppSettings.ts` - Custom hook for managing application settings
2. `components/AppSettingsExample.tsx` - Example component demonstrating usage
3. `APP_SETTINGS_GUIDE.md` - This documentation file

## Testing

To test the implementation:

1. Start the application
2. Verify that the sidebar displays "ResultSys" as the application name
3. Navigate to the Admin Settings page
4. Change the application name and academic year
5. Save the settings
6. Verify that the sidebar updates with the new application name
7. Navigate to any page with academic year dropdowns
8. Verify that the dropdowns default to the new academic year