/**
 * Utility functions for date formatting and handling
 */

/**
 * Formats a date to YYYY-MM-DD format
 * @param date - Date object or date string
 * @returns Date string in YYYY-MM-DD format
 */
export const formatToYYYYMMDD = (date: Date | string): string => {
  if (!date) return '';
  
  let dateObj: Date;
  if (typeof date === 'string') {
    // If it's already in YYYY-MM-DD format, return as is
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string to a more readable format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export const formatReadableDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Gets current date in YYYY-MM-DD format
 * @returns Current date string in YYYY-MM-DD format
 */
export const getCurrentDateYYYYMMDD = (): string => {
  return formatToYYYYMMDD(new Date());
};

/**
 * Validates if a string is in YYYY-MM-DD format
 * @param dateString - Date string to validate
 * @returns Boolean indicating if the string is in valid YYYY-MM-DD format
 */
export const isValidYYYYMMDD = (dateString: string): boolean => {
  if (!dateString) return false;
  
  // Check format
  if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return false;
  }
  
  // Check if it's a valid date
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && 
         date.toISOString().split('T')[0] === dateString;
};

export default {
  formatToYYYYMMDD,
  formatReadableDate,
  getCurrentDateYYYYMMDD,
  isValidYYYYMMDD
};