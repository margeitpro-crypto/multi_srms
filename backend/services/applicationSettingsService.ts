import { query } from './dbService';

/**
 * Convert snake_case keys to camelCase keys in an object
 * @param obj Object with snake_case keys
 * @returns Object with camelCase keys
 */
function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }
  
  const camelObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      camelObj[camelKey] = snakeToCamel(obj[key]);
    }
  }
  return camelObj;
}

interface ApplicationSetting {
  id: number;
  key: string;
  value: any;
  description: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get an application setting by key
 */
export const getSetting = async (key: string): Promise<any> => {
  try {
    const result = await query(
      'SELECT value FROM application_settings WHERE key = $1',
      [key]
    );
    
    if (result.rows.length > 0) {
      // Parse the JSON value
      try {
        return JSON.parse(result.rows[0].value);
      } catch (parseError) {
        // If parsing fails, return the raw value
        return result.rows[0].value;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching setting with key ${key}:`, error);
    throw error;
  }
};

/**
 * Set an application setting by key
 */
export const setSetting = async (key: string, value: any, description: string = ''): Promise<void> => {
  try {
    // If the value is not already a JSON string, convert it to one
    const jsonValue = typeof value === 'string' && (value.startsWith('{') || value.startsWith('[') || value === 'null' || value === 'true' || value === 'false' || !isNaN(Number(value))) 
      ? value 
      : JSON.stringify(value);
      
    await query(
      `INSERT INTO application_settings (key, value, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (key)
       DO UPDATE SET value = $2, description = $3, updated_at = NOW()`,
      [key, jsonValue, description]
    );
  } catch (error) {
    console.error(`Error setting setting with key ${key}:`, error);
    throw error;
  }
};

/**
 * Get multiple application settings by keys
 */
export const getSettings = async (keys: string[]): Promise<{[key: string]: any}> => {
  try {
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(',');
    const result = await query(
      `SELECT key, value FROM application_settings WHERE key IN (${placeholders})`,
      keys
    );
    
    const settings: {[key: string]: any} = {};
    result.rows.forEach(row => {
      // Parse the JSON value
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (parseError) {
        // If parsing fails, return the raw value
        settings[row.key] = row.value;
      }
    });
    
    return settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

/**
 * Get all application settings
 */
export const getAllSettings = async (): Promise<ApplicationSetting[]> => {
  try {
    const result = await query('SELECT * FROM application_settings ORDER BY key');
    // Parse the JSON values and convert snake_case to camelCase
    return result.rows.map(row => {
      const parsedRow = {
        ...row,
        value: (() => {
          try {
            return JSON.parse(row.value);
          } catch (parseError) {
            // If parsing fails, return the raw value
            return row.value;
          }
        })()
      };
      return snakeToCamel(parsedRow);
    });
  } catch (error) {
    console.error('Error fetching all settings:', error);
    throw error;
  }
};
