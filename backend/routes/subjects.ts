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

// POST /api/subjects - Create a new subject
router.post('/', async (req: Request, res: Response) => {
  try {
    const subjectData = req.body;
    // Validate required fields
    if (!subjectData.name || subjectData.grade === undefined || !subjectData.theory || !subjectData.internal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate grade
    if (subjectData.grade !== 11 && subjectData.grade !== 12) {
      return res.status(400).json({ error: 'Grade must be 11 or 12' });
    }
    
    // Validate theory and internal objects
    if (!subjectData.theory.subCode || subjectData.theory.credit === undefined || 
        subjectData.theory.fullMarks === undefined || subjectData.theory.passMarks === undefined) {
      return res.status(400).json({ error: 'Missing required theory subject fields' });
    }
    
    if (!subjectData.internal.subCode || subjectData.internal.credit === undefined || 
        subjectData.internal.fullMarks === undefined || subjectData.internal.passMarks === undefined) {
      return res.status(400).json({ error: 'Missing required internal subject fields' });
    }
    
    // Map frontend data to database fields
    const dbSubjectData = {
      name: subjectData.name,
      grade: subjectData.grade,
      theory_sub_code: subjectData.theory.subCode,
      theory_credit: subjectData.theory.credit,
      theory_full_marks: subjectData.theory.fullMarks,
      theory_pass_marks: subjectData.theory.passMarks,
      internal_sub_code: subjectData.internal.subCode,
      internal_credit: subjectData.internal.credit,
      internal_full_marks: subjectData.internal.fullMarks,
      internal_pass_marks: subjectData.internal.passMarks
    };
    
    const newSubject = await subjectsService.createSubject(dbSubjectData);
    res.status(201).json(newSubject);
  } catch (err) {
    console.error('Error creating subject:', err);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

export default router;