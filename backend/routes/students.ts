import { Router, Request, Response } from 'express';
import { studentsService } from '../services/dbService';

const router = Router();

// GET /api/students - Get all students
router.get('/', async (req: Request, res: Response) => {
  try {
    const students = await studentsService.getAllStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/students/school/:schoolId - Get students by school ID
router.get('/school/:schoolId', async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }
    
    const students = await studentsService.getStudentsBySchoolId(schoolId);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/students/:id - Get a specific student
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    
    const student = await studentsService.getStudentById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// GET /api/students/system-id/:studentSystemId - Get database ID by student system ID
router.get('/system-id/:studentSystemId', async (req: Request, res: Response) => {
  try {
    const studentSystemId = req.params.studentSystemId;
    const databaseId = await studentsService.getStudentDatabaseIdBySystemId(studentSystemId);
    
    if (!databaseId) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ id: databaseId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student database ID' });
  }
});

// POST /api/students - Create a new student
router.post('/', async (req: Request, res: Response) => {
  try {
    const studentData = req.body;
    const newStudent = await studentsService.createStudent(studentData);
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// PUT /api/students/:id - Update a student
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    
    const studentData = req.body;
    const updatedStudent = await studentsService.updateStudent(id, studentData);
    
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(updatedStudent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE /api/students/:id - Delete a student
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    
    const deletedStudent = await studentsService.deleteStudent(id);
    
    if (!deletedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router;