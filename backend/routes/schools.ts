import { Router, Request, Response } from 'express';
import { schoolsService } from '../services/dbService';

const router = Router();

// GET /api/schools - Get all schools
router.get('/', async (req: Request, res: Response) => {
  try {
    const schools = await schoolsService.getAllSchools();
    res.json(schools);
  } catch (err) {
    console.error('Error fetching schools:', err);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// GET /api/schools/:id - Get a specific school
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
    
    res.json(school);
  } catch (err) {
    console.error('Error fetching school:', err);
    res.status(500).json({ error: 'Failed to fetch school' });
  }
});

// POST /api/schools - Create a new school
router.post('/', async (req: Request, res: Response) => {
  try {
    const schoolData = req.body;
    const newSchool = await schoolsService.createSchool(schoolData);
    res.status(201).json(newSchool);
  } catch (err: any) {
    console.error('Error creating school:', err);
    if (err.code === '23505') {
      // Handle unique constraint violation
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }
    
    const schoolData = req.body;
    const updatedSchool = await schoolsService.updateSchool(id, schoolData);
    
    if (!updatedSchool) {
      return res.status(404).json({ error: 'School not found' });
    }
    
    res.json(updatedSchool);
  } catch (err: any) {
    console.error('Error updating school:', err);
    if (err.code === '23505') {
      // Handle unique constraint violation
      if (err.detail && err.detail.includes('iemis_code')) {
        return res.status(409).json({ error: 'School with this IEMIS Code already exists' });
      } else if (err.detail && err.detail.includes('email')) {
        return res.status(409).json({ error: 'School with this email already exists' });
      }
    }
    res.status(500).json({ error: 'Failed to update school', details: err.message });
  }
});

// DELETE /api/schools/:id - Delete a school
router.delete('/:id', async (req: Request, res: Response) => {
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