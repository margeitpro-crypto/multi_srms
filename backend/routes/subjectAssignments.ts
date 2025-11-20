import { Router, Request, Response } from 'express';
import { subjectAssignmentsService } from '../services/dbService';

const router = Router();

// GET /api/subject-assignments/:studentId/:year - Get subject assignments for a student in a specific year
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
    
    const subjectIds = await subjectAssignmentsService.getStudentAssignments(studentId, academicYear);
    const extraCreditSubjectId = await subjectAssignmentsService.getStudentExtraCreditAssignment(studentId, academicYear);
    
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
router.post('/:studentId/:year', async (req: Request, res: Response) => {
  try {
    const studentSystemId = req.params.studentId;
    const academicYear = parseInt(req.params.year);
    const { subjectIds, extraCreditSubjectId } = req.body;
    
    if (!studentSystemId || isNaN(academicYear)) {
      return res.status(400).json({ error: 'Invalid student ID or academic year' });
    }
    
    if (!Array.isArray(subjectIds)) {
      return res.status(400).json({ error: 'subjectIds must be an array' });
    }
    
    // Validate that all subjectIds are numbers
    if (subjectIds.some(id => typeof id !== 'number' || isNaN(id))) {
      return res.status(400).json({ error: 'All subject IDs must be valid numbers' });
    }
    
    // Get the database ID for the student
    const studentId = await subjectAssignmentsService.getStudentDatabaseIdBySystemId(studentSystemId);
    if (studentId === null) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Assign main subjects
    await subjectAssignmentsService.assignSubjectsToStudent(studentId, subjectIds, academicYear);
    
    // Assign extra credit subject if provided
    await subjectAssignmentsService.assignExtraCreditSubjectToStudent(
      studentId, 
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

export default router;