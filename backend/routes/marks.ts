import { Router, Response } from 'express';
import { studentMarksService, studentsService } from '../services/dbService';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/marks/:studentId/:year - Get marks for a student in a specific year
router.get('/:studentId/:year', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const studentSystemId = req.params.studentId;
    const academicYear = parseInt(req.params.year);
    
    if (!studentSystemId || isNaN(academicYear)) {
      return res.status(400).json({ error: 'Invalid student ID or academic year' });
    }
    
    const student = await studentsService.getStudentBySystemId(studentSystemId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (user.role === 'school' && user.school_id !== student.school_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const marks = await studentMarksService.getStudentMarks(student.id, academicYear);
    
    res.json(marks);
  } catch (err) {
    console.error('Error fetching student marks:', err);
    res.status(500).json({ error: 'Failed to fetch student marks' });
  }
});

// POST /api/marks/:studentId/:year - Save marks for a student in a specific year
router.post('/:studentId/:year', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const studentSystemId = req.params.studentId;
    const academicYear = parseInt(req.params.year);
    const marksData = req.body;
    
    if (!studentSystemId || isNaN(academicYear)) {
      return res.status(400).json({ error: 'Invalid student ID or academic year' });
    }
    
    if (typeof marksData !== 'object' || marksData === null) {
      return res.status(400).json({ error: 'Invalid marks data' });
    }
    
    const student = await studentsService.getStudentBySystemId(studentSystemId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (user.role === 'school' && user.school_id !== student.school_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const savedMarks = await studentMarksService.saveStudentMarks(student.id, academicYear, marksData);
    
    res.status(200).json({ 
      message: 'Marks saved successfully',
      marks: savedMarks
    });
  } catch (err) {
    console.error('Error saving student marks:', err);
    res.status(500).json({ error: 'Failed to save student marks' });
  }
});

// DELETE /api/marks/:studentId/:year - Delete marks for a student in a specific year
router.delete('/:studentId/:year', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const studentSystemId = req.params.studentId;
    const academicYear = parseInt(req.params.year);
    
    if (!studentSystemId || isNaN(academicYear)) {
      return res.status(400).json({ error: 'Invalid student ID or academic year' });
    }
    
    const student = await studentsService.getStudentBySystemId(studentSystemId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (user.role === 'school' && user.school_id !== student.school_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await studentMarksService.deleteStudentMarks(student.id, academicYear);
    
    res.status(200).json({ 
      message: 'Marks deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting student marks:', err);
    res.status(500).json({ error: 'Failed to delete student marks' });
  }
});

export default router;