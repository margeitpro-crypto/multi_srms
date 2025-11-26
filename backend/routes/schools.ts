import { Router, Response } from 'express';
import { schoolsService } from '../services/dbService';
import { AuthRequest, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// GET /api/schools - Get all schools (for admin) or the user's school
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (user.role === 'admin') {
      const schools = await schoolsService.getAllSchools();
      res.json(schools);
    } else if (user.role === 'school' && user.school_id) {
      const school = await schoolsService.getSchoolById(user.school_id);
      res.json(school ? [school] : []);
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (err) {
    console.error('Error fetching schools:', err);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// GET /api/schools/:id - Get a specific school
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    // Admins can access any school
    // School users can only access their own school
    if (user.role === 'admin' || (user.role === 'school' && user.school_id === id)) {
      const school = await schoolsService.getSchoolById(id);
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }
      res.json(school);
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (err) {
    console.error('Error fetching school:', err);
    res.status(500).json({ error: 'Failed to fetch school' });
  }
});

// POST /api/schools - Create a new school (admin only)
router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const schoolData = req.body;
    const newSchool = await schoolsService.createSchool(schoolData);
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
      return res.status(404).json({ error: 'School not found' });
    }
    
    res.json({ message: 'School deleted successfully' });
  } catch (err) {
    console.error('Error deleting school:', err);
    res.status(500).json({ error: 'Failed to delete school' });
  }
});

export default router;