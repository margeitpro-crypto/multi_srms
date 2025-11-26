import { Router, Request, Response } from 'express';
import { academicYearsService } from '../services/academicYearsService';
import { requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// GET /api/academic-years - Get all academic years
router.get('/', async (req: Request, res: Response) => {
  try {
    const academicYears = await academicYearsService.getAllAcademicYears();
    res.json(academicYears);
  } catch (err) {
    console.error('Error fetching academic years:', err);
    res.status(500).json({ error: 'Failed to fetch academic years' });
  }
});

// GET /api/academic-years/active - Get active academic years
router.get('/active', async (req: Request, res: Response) => {
  try {
    const academicYears = await academicYearsService.getActiveAcademicYears();
    res.json(academicYears);
  } catch (err) {
    console.error('Error fetching active academic years:', err);
    res.status(500).json({ error: 'Failed to fetch active academic years' });
  }
});

// GET /api/academic-years/:id - Get a specific academic year
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid academic year ID' });
    }
    
    const academicYear = await academicYearsService.getAcademicYearById(id);
    if (!academicYear) {
      return res.status(404).json({ error: 'Academic year not found' });
    }
    
    res.json(academicYear);
  } catch (err) {
    console.error('Error fetching academic year:', err);
    res.status(500).json({ error: 'Failed to fetch academic year' });
  }
});

// POST /api/academic-years - Create a new academic year
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { year, is_active } = req.body;
    
    // Validate input
    if (!year || typeof year !== 'number') {
      return res.status(400).json({ error: 'Year is required and must be a number' });
    }
    
    // Check if year already exists
    const existingYear = await academicYearsService.getAcademicYearByYear(year);
    if (existingYear) {
      return res.status(409).json({ error: `Academic year ${year} already exists` });
    }
    
    const newAcademicYear = await academicYearsService.createAcademicYear(year, is_active);
    res.status(201).json(newAcademicYear);
  } catch (err: any) {
    console.error('Error creating academic year:', err);
    res.status(500).json({ error: 'Failed to create academic year', details: err.message });
  }
});

// PUT /api/academic-years/:id - Update an academic year
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid academic year ID' });
    }
    
    const { year, is_active } = req.body;
    
    // Validate input
    if (!year || typeof year !== 'number') {
      return res.status(400).json({ error: 'Year is required and must be a number' });
    }
    
    // Check if year already exists (excluding current record)
    const existingYear = await academicYearsService.getAcademicYearByYear(year);
    if (existingYear && existingYear.id !== id) {
      return res.status(409).json({ error: `Academic year ${year} already exists` });
    }
    
    const updatedAcademicYear = await academicYearsService.updateAcademicYear(id, year, is_active);
    
    if (!updatedAcademicYear) {
      return res.status(404).json({ error: 'Academic year not found' });
    }
    
    res.json(updatedAcademicYear);
  } catch (err: any) {
    console.error('Error updating academic year:', err);
    res.status(500).json({ error: 'Failed to update academic year', details: err.message });
  }
});

// DELETE /api/academic-years/:id - Delete an academic year
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid academic year ID' });
    }
    
    const deletedAcademicYear = await academicYearsService.deleteAcademicYear(id);
    
    if (!deletedAcademicYear) {
      return res.status(404).json({ error: 'Academic year not found' });
    }
    
    res.json({ message: 'Academic year deleted successfully' });
  } catch (err) {
    console.error('Error deleting academic year:', err);
    res.status(500).json({ error: 'Failed to delete academic year' });
  }
});

// PUT /api/academic-years/:id/toggle - Toggle active status
router.put('/:id/toggle', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid academic year ID' });
    }
    
    const { is_active } = req.body;
    
    const updatedAcademicYear = await academicYearsService.toggleActiveStatus(id, is_active);
    
    if (!updatedAcademicYear) {
      return res.status(404).json({ error: 'Academic year not found' });
    }
    
    res.json(updatedAcademicYear);
  } catch (err) {
    console.error('Error toggling academic year status:', err);
    res.status(500).json({ error: 'Failed to toggle academic year status' });
  }
});

export default router;