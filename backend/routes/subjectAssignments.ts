import { Router, Response } from 'express';
import { studentSubjectAssignmentsService, studentsService } from '../services/dbService';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/subject-assignments/:studentId/:year - Get subject assignments for a student in a specific year
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
    
    const subjectIds = await studentSubjectAssignmentsService.getStudentAssignments(student.id, academicYear);
    const extraCreditSubjectId = await studentSubjectAssignmentsService.getStudentExtraCreditAssignment(student.id, academicYear);
    
    res.json({
      subjectIds,
      extraCreditSubjectId
    });
  } catch (err) {
    console.error('Error fetching subject assignments:', err);
    res.status(500).json({ error: 'Failed to fetch subject assignments' });
  }
});

// POST /api/subject-assignments/:studentId/:year - Assign subjects to a student for a specific year
router.post('/:studentId/:year', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const studentSystemId = req.params.studentId;
    const academicYear = parseInt(req.params.year);
    const { subjectIds, extraCreditSubjectId } = req.body;
    
    if (!studentSystemId || isNaN(academicYear)) {
      return res.status(400).json({ error: 'Invalid student ID or academic year' });
    }
    
    if (!Array.isArray(subjectIds)) {
      return res.status(400).json({ error: 'subjectIds must be an array' });
    }
    
    if (subjectIds.some(id => typeof id !== 'number' || isNaN(id))) {
      return res.status(400).json({ error: 'All subject IDs must be valid numbers' });
    }

    const student = await studentsService.getStudentBySystemId(studentSystemId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (user.role === 'school' && user.school_id !== student.school_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await studentSubjectAssignmentsService.assignSubjectsToStudent(student.id, subjectIds, academicYear);
    
    await studentSubjectAssignmentsService.assignExtraCreditSubjectToStudent(
      student.id, 
      extraCreditSubjectId !== undefined ? extraCreditSubjectId : null, 
      academicYear
    );
    
    res.status(200).json({ 
      message: 'Subject assignments saved successfully',
      subjectIds,
      extraCreditSubjectId
    });
  } catch (err) {
    console.error('Error saving subject assignments:', err);
    res.status(500).json({ error: 'Failed to save subject assignments' });
  }
});

// DELETE /api/subject-assignments/:studentId/:year - Delete subject assignments for a student in a specific year
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
    
    await studentSubjectAssignmentsService.deleteStudentAssignments(student.id, academicYear);
    
    await studentSubjectAssignmentsService.deleteStudentExtraCreditAssignment(student.id, academicYear);
    
    res.status(200).json({ 
      message: 'Subject assignments deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting subject assignments:', err);
    res.status(500).json({ error: 'Failed to delete subject assignments' });
  }
});

export default router;