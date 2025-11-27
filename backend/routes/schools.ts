import { Router, Request, Response } from 'express';
import { AuthRequest, requireAdmin } from '../middleware/authMiddleware';
import { schoolsService } from '../services/dbService';
import { query } from '../services/dbService';
import logger from '../services/logger';

const router = Router();

// GET /api/schools - Get all schools
router.get('/', async (req: Request, res: Response) => {
  try {
    const schools = await schoolsService.getAllSchools();
    logger.info('Fetched all schools', { count: schools.length });
    res.json(schools);
  } catch (err) {
    logger.error('Error fetching schools:', err);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// GET /api/schools/:id - Get school by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }
    
    const school = await schoolsService.getSchoolById(id);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }
    
    logger.info('Fetched school by ID', { schoolId: id });
    res.json(school);
  } catch (err) {
    logger.error('Error fetching school by ID:', err);
    res.status(500).json({ error: 'Failed to fetch school' });
  }
});

// POST /api/schools - Create a new school (admin only)
router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const schoolData = req.body;
    
    // Validate required fields
    if (!schoolData.iemisCode || !schoolData.name || !schoolData.municipality || 
        !schoolData.estd || !schoolData.preparedBy || !schoolData.checkedBy || 
        !schoolData.headTeacherName || !schoolData.headTeacherContact) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newSchool = await schoolsService.createSchool(schoolData);
    if (!newSchool) {
      return res.status(500).json({ error: 'Failed to create school' });
    }
    
    res.status(201).json(newSchool);
  } catch (err: any) {
    console.error('Error creating school:', err);
    if (err.code === '23505') {
      if (err.detail && err.detail.includes('iemis_code')) {
        return res.status(409).json({ error: 'School with this IEMIS Code already exists' });
      } else if (err.detail && err.detail.includes('email')) {
        return res.status(409).json({ error: 'School with this email already exists' });
      }
    }
    res.status(500).json({ error: 'Failed to create school', details: err.message });
  }
});

// PUT /api/schools/:id - Update a school
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    // Admins can update any school
    // School users can only update their own school
    if (user.role === 'admin' || (user.role === 'school' && user.school_id === id)) {
      const schoolData = req.body;
      
      // Validate required fields
      if (!schoolData.iemisCode || !schoolData.name || !schoolData.municipality || 
          !schoolData.estd || !schoolData.preparedBy || !schoolData.checkedBy || 
          !schoolData.headTeacherName || !schoolData.headTeacherContact) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const updatedSchool = await schoolsService.updateSchool(id, schoolData);
      
      if (!updatedSchool) {
        return res.status(404).json({ error: 'School not found' });
      }
      
      res.json(updatedSchool);
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (err: any) {
    console.error('Error updating school:', err);
    if (err.code === '23505') {
      if (err.detail && err.detail.includes('iemis_code')) {
        return res.status(409).json({ error: 'School with this IEMIS Code already exists' });
      } else if (err.detail && err.detail.includes('email')) {
        return res.status(409).json({ error: 'School with this email already exists' });
      }
    }
    res.status(500).json({ error: 'Failed to update school', details: err.message });
  }
});

// DELETE /api/schools/:id - Delete a school (admin only)
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }
    
    const deletedSchool = await schoolsService.deleteSchool(id);
    
    if (!deletedSchool) {
      // Check if it's because of associated data
      try {
        // Try to get more specific error info
        const studentCountResult = await query('SELECT COUNT(*) as count FROM students WHERE school_id = $1', [id]);
        const userCountResult = await query('SELECT COUNT(*) as count FROM users WHERE school_id = $1', [id]);
        
        const studentCount = parseInt(studentCountResult.rows[0].count);
        const userCount = parseInt(userCountResult.rows[0].count);
        
        if (studentCount > 0 || userCount > 0) {
          return res.status(409).json({ 
            error: 'Cannot delete school with associated data',
            details: `This school has ${studentCount} student(s) and ${userCount} user(s) associated with it.`
          });
        }
      } catch (checkError) {
        // If we can't check, just return generic error
        return res.status(404).json({ error: 'School not found' });
      }
      
      return res.status(404).json({ error: 'School not found' });
    }
    
    res.json({ message: 'School deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting school:', err);
    
    // Check if it's our custom error for associated data
    if (err.message && err.message.includes('hasAssociatedData')) {
      try {
        const errorInfo = JSON.parse(err.message);
        if (errorInfo.hasAssociatedData) {
          return res.status(409).json({ 
            error: 'Cannot delete school with associated data',
            details: `This school has ${errorInfo.studentCount} student(s) and ${errorInfo.userCount} user(s) associated with it.`
          });
        }
      } catch (parseError) {
        // If parsing fails, continue with generic error
      }
    }
    
    res.status(500).json({ error: 'Failed to delete school' });
  }
});

export default router;