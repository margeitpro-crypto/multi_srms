import { Router, Request, Response } from 'express';
import { marksService, subjectAssignmentsService } from '../services/dbService';

const router = Router();

// GET /api/marks/:studentId/:year - Get marks for a student in a specific year
router.get('/:studentId/:year', async (req: Request, res: Response) => {
  try {
    const studentSystemId = req.params.studentId;
    const academicYear = parseInt(req.params.year);
    
    if (!studentSystemId || isNaN(academicYear)) {
      return res.status(400).json({ error: 'Invalid student ID or academic year' });
    }
    
    // Get the database ID for the student
    const studentId = await subjectAssignmentsService.getStudentDatabaseIdBySystemId(studentSystemId);
    if (studentId === null) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const marks = await marksService.getStudentMarks(studentId, academicYear);
    
    res.json(marks);
  } catch (err) {
    console.error('Error fetching student marks:', err);
    res.status(500).json({ error: 'Failed to fetch student marks' });
  }
});

// POST /api/marks/:studentId/:year - Save marks for a student in a specific year
router.post('/:studentId/:year', async (req: Request, res: Response) => {
  try {
    const studentSystemId = req.params.studentId;
    const academicYear = parseInt(req.params.year);
    const marksData = req.body;
    
    if (!studentSystemId || isNaN(academicYear)) {
      return res.status(400).json({ error: 'Invalid student ID or academic year' });
    }
    
    // Validate marks data
    if (typeof marksData !== 'object' || marksData === null) {
      return res.status(400).json({ error: 'Invalid marks data' });
    }
    
    // Get the database ID for the student
    const studentId = await subjectAssignmentsService.getStudentDatabaseIdBySystemId(studentSystemId);
    if (studentId === null) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const savedMarks = await marksService.saveStudentMarks(studentId, academicYear, marksData);
    
    res.status(200).json({ 
      message: 'Marks saved successfully',
      marks: savedMarks
    });
  } catch (err) {
    console.error('Error saving student marks:', err);
    res.status(500).json({ error: 'Failed to save student marks' });
  }
});

export default router;