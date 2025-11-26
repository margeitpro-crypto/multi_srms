import { Router, Response } from 'express';
import { studentsService } from '../services/dbService';
import { AuthRequest, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// GET /api/students - Get all students (for admin) or students of a specific school
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (user.role === 'admin') {
      const students = await studentsService.getAllStudents();
      res.json(students);
    } else if (user.role === 'school' && user.school_id) {
      const students = await studentsService.getStudentsBySchoolId(user.school_id);
      res.json(students);
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/students/school/:schoolId - Get students by school ID
router.get('/school/:schoolId', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const schoolId = parseInt(req.params.schoolId);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    // Admins can access any school's students
    // School users can only access their own school's students
    if (user.role === 'admin' || (user.role === 'school' && user.school_id === schoolId)) {
      const students = await studentsService.getStudentsBySchoolId(schoolId);
      res.json(students);
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/students/:id - Get a specific student
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const student = await studentsService.getStudentById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Admins can access any student
    // School users can only access students from their own school
    if (user.role === 'admin' || (user.role === 'school' && user.school_id === student.school_id)) {
      res.json(student);
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// GET /api/students/system-id/:studentSystemId - Get database ID by student system ID
router.get('/system-id/:studentSystemId', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const studentSystemId = req.params.studentSystemId;
    const student = await studentsService.getStudentBySystemId(studentSystemId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Admins can access any student's ID
    // School users can only access students from their own school
    if (user.role === 'admin' || (user.role === 'school' && user.school_id === student.school_id)) {
      res.json({ id: student.id });
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student database ID' });
  }
});

// POST /api/students - Create a new student
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const studentData = req.body;

    // Admins can create students for any school (if school_id is provided)
    // School users can only create students for their own school
    if (user.role === 'admin' || (user.role === 'school' && user.school_id === studentData.school_id)) {
      const newStudent = await studentsService.createStudent(studentData);
      res.status(201).json(newStudent);
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// PUT /api/students/:id - Update a student
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    
    const studentToUpdate = await studentsService.getStudentById(id);
    if (!studentToUpdate) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Admins can update any student
    // School users can only update students from their own school
    if (user.role === 'admin' || (user.role === 'school' && user.school_id === studentToUpdate.school_id)) {
      const studentData = req.body;
      const updatedStudent = await studentsService.updateStudent(id, studentData);
      res.json(updatedStudent);
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE /api/students/:id - Delete a student
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const studentToDelete = await studentsService.getStudentById(id);
    if (!studentToDelete) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Admins can delete any student
    // School users can only delete students from their own school
    if (user.role === 'admin' || (user.role === 'school' && user.school_id === studentToDelete.school_id)) {
      const deletedStudent = await studentsService.deleteStudent(id);
      res.json({ message: 'Student deleted successfully' });
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router;