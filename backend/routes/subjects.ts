import { Router, Request, Response } from 'express';
import { subjectsService } from '../services/dbService';

const router = Router();

// GET /api/subjects - Get all subjects
router.get('/', async (req: Request, res: Response) => {
  try {
    const subjects = await subjectsService.getAllSubjects();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /api/subjects/grade/:grade - Get subjects by grade
router.get('/grade/:grade', async (req: Request, res: Response) => {
  try {
    const grade = parseInt(req.params.grade);
    if (isNaN(grade) || (grade !== 11 && grade !== 12)) {
      return res.status(400).json({ error: 'Invalid grade. Must be 11 or 12' });
    }
    
    const subjects = await subjectsService.getSubjectsByGrade(grade);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

export default router;