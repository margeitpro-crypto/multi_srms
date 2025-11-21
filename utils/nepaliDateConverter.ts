
// A compact mapping of days in months for Nepali years from 2050 to 2085 BS.
// Format: [year, [days_in_m1, days_in_m2, ...]]
// This covers the typical range for current student birthdates.

const bsMonthDaysData: { [key: number]: number[] } = {
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2051: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2052: [31, 31, 32, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2054: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2055: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2056: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2057: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2058: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2059: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2060: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2061: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2062: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2063: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2064: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2065: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2066: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2067: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2068: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2069: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2070: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2071: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2074: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
};

// Reference date: 2000-01-01 AD is 2056-09-15 BS (Adjusted for accuracy)
const refAdYear = 2000;
const refAdMonth = 0; // Jan
const refAdDay = 1;
const refBsYear = 2056;
const refBsMonth = 9; // Poush
const refBsDay = 15;

/**
 * Converts a Nepali Date (BS) string (YYYY-MM-DD) to English Date (AD) string (YYYY-MM-DD).
 * @param bsDateStr - The BS date string in 'YYYY-MM-DD' format.
 * @returns The corresponding AD date string in 'YYYY-MM-DD' format, or null if invalid.
 */
export function convertBsToAd(bsDateStr: string): string | null {
  const parts = bsDateStr.split(/[-/.]/);
  if (parts.length !== 3) return null;

  const bsYear = parseInt(parts[0], 10);
  const bsMonth = parseInt(parts[1], 10);
  const bsDay = parseInt(parts[2], 10);

  if (isNaN(bsYear) || isNaN(bsMonth) || isNaN(bsDay)) return null;
  if (bsMonth < 1 || bsMonth > 12) return null;
  if (bsYear < 2050 || bsYear > 2082) {
      return null;
  }

  const daysInBsMonth = bsMonthDaysData[bsYear]?.[bsMonth - 1];
  if (!daysInBsMonth || bsDay < 1 || bsDay > daysInBsMonth) return null;

  // Calculate total days difference between reference BS date and target BS date
  let totalDaysDiff = 0;

  // Helper: days from start of year to given month/day
  const getDaysFromStartOfYear = (year: number, month: number, day: number) => {
      let days = 0;
      for (let m = 0; m < month - 1; m++) {
          days += bsMonthDaysData[year][m];
      }
      days += day;
      return days;
  };

  // Days from ref year start to ref date
  const refDaysFromStart = getDaysFromStartOfYear(refBsYear, refBsMonth, refBsDay);
  
  // Days from target year start to target date
  const targetDaysFromStart = getDaysFromStartOfYear(bsYear, bsMonth, bsDay);

  // Difference in years
  if (bsYear >= refBsYear) {
    for (let y = refBsYear; y < bsYear; y++) {
      const daysInYear = bsMonthDaysData[y]?.reduce((a, b) => a + b, 0) || 365;
      totalDaysDiff += daysInYear;
    }
    totalDaysDiff += targetDaysFromStart - refDaysFromStart;
  } else {
    for (let y = bsYear; y < refBsYear; y++) {
      const daysInYear = bsMonthDaysData[y]?.reduce((a, b) => a + b, 0) || 365;
      totalDaysDiff -= daysInYear;
    }
    totalDaysDiff += targetDaysFromStart - refDaysFromStart;
  }

  // Create AD date
  const adDate = new Date(refAdYear, refAdMonth, refAdDay);
  adDate.setDate(adDate.getDate() + totalDaysDiff);

  // Format YYYY-MM-DD
  const y = adDate.getFullYear();
  const m = String(adDate.getMonth() + 1).padStart(2, '0');
  const d = String(adDate.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

/**
 * Converts a Nepali (Bikram Sambat) date string to an English (Gregorian) date string.
 * @param bsDateStr - The BS date string in 'YYYY-MM-DD' format.
 * @returns The corresponding AD date string in 'YYYY-MM-DD' format, or null if invalid.
 */
export function bsToAd(bsDateStr: string): string | null {
    return convertBsToAd(bsDateStr);
}

// Utility function to convert date to YY-MM-DD format
export const formatToYYMMDD = (dateStr: string): string => {
    if (!dateStr) return '';
    
    // If it's already in YY-MM-DD format, return as is
    if (dateStr.match(/^\d{2}-\d{2}-\d{2}$/)) {
        return dateStr;
    }
    
    // If it's in YYYY-MM-DD format, convert to YY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr.substring(2);
    }
    
    // If it's an ISO string, extract the date part and convert
    if (dateStr.includes('T')) {
        const datePart = dateStr.split('T')[0];
        return datePart.substring(2);
    }
    
    // Otherwise, try to parse as date and format
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            const isoString = date.toISOString().split('T')[0];
            return isoString.substring(2);
        }
    } catch (e) {
        // If parsing fails, return original string
    }
    
    return dateStr;
};
