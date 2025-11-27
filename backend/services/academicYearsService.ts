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

// Academic years service
export const academicYearsService = {
  // Get all academic years
  async getAllAcademicYears() {
    const result = await query('SELECT * FROM academic_years ORDER BY year DESC');
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  },
  
  // Get active academic years
  async getActiveAcademicYears() {
    const result = await query('SELECT * FROM academic_years WHERE is_active = true ORDER BY year DESC');
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  },
  
  // Get academic year by ID
  async getAcademicYearById(id: number) {
    const result = await query('SELECT * FROM academic_years WHERE id = $1', [id]);
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0] || null);
  },
  
  // Get academic year by year
  async getAcademicYearByYear(year: number) {
    const result = await query('SELECT * FROM academic_years WHERE year = $1', [year]);
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0] || null);
  },
  
  // Create a new academic year
  async createAcademicYear(year: number, isActive: boolean = true) {
    const result = await query(
      'INSERT INTO academic_years (year, is_active) VALUES ($1, $2) RETURNING *',
      [year, isActive]
    );
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0]);
  },
  
  // Update an academic year
  async updateAcademicYear(id: number, year: number, isActive: boolean) {
    const result = await query(
      'UPDATE academic_years SET year = $1, is_active = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [year, isActive, id]
    );
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0]);
  },
  
  // Delete an academic year
  async deleteAcademicYear(id: number) {
    const result = await query('DELETE FROM academic_years WHERE id = $1 RETURNING *', [id]);
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0] || null);
  },
  
  // Toggle active status
  async toggleActiveStatus(id: number, isActive: boolean) {
    const result = await query(
      'UPDATE academic_years SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0]);
  }
};

export default academicYearsService;