import { query } from './dbService';

// Academic years service
export const academicYearsService = {
  // Get all academic years
  async getAllAcademicYears() {
    const result = await query('SELECT * FROM academic_years ORDER BY year DESC');
    return result.rows;
  },
  
  // Get active academic years
  async getActiveAcademicYears() {
    const result = await query('SELECT * FROM academic_years WHERE is_active = true ORDER BY year DESC');
    return result.rows;
  },
  
  // Get academic year by ID
  async getAcademicYearById(id: number) {
    const result = await query('SELECT * FROM academic_years WHERE id = $1', [id]);
    return result.rows[0] || null;
  },
  
  // Get academic year by year
  async getAcademicYearByYear(year: number) {
    const result = await query('SELECT * FROM academic_years WHERE year = $1', [year]);
    return result.rows[0] || null;
  },
  
  // Create a new academic year
  async createAcademicYear(year: number, isActive: boolean = true) {
    const result = await query(
      'INSERT INTO academic_years (year, is_active) VALUES ($1, $2) RETURNING *',
      [year, isActive]
    );
    return result.rows[0];
  },
  
  // Update an academic year
  async updateAcademicYear(id: number, year: number, isActive: boolean) {
    const result = await query(
      'UPDATE academic_years SET year = $1, is_active = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [year, isActive, id]
    );
    return result.rows[0];
  },
  
  // Delete an academic year
  async deleteAcademicYear(id: number) {
    const result = await query('DELETE FROM academic_years WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },
  
  // Toggle active status
  async toggleActiveStatus(id: number, isActive: boolean) {
    const result = await query(
      'UPDATE academic_years SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    return result.rows[0];
  }
};

export default academicYearsService;