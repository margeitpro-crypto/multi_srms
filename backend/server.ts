import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import schoolsRouter from './routes/schools';
import studentsRouter from './routes/students';
import subjectsRouter from './routes/subjects';
import usersRouter from './routes/users';
import subjectAssignmentsRouter from './routes/subjectAssignments';
import marksRouter from './routes/marks';
import academicYearsRouter from './routes/academicYears';
import applicationSettingsRouter from './routes/applicationSettings';
import excelUploadRouter from './routes/excelUpload';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3002; // Changed to 3002 as per project configuration

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://192.168.100.3:3000',
    'http://192.168.100.3:3001',
    'http://192.168.100.3:3002'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Multi-School Result Management System API');
});

// API routes
app.use('/api/schools', schoolsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/users', usersRouter);
app.use('/api/subject-assignments', subjectAssignmentsRouter);
app.use('/api/marks', marksRouter);
app.use('/api/academic-years', academicYearsRouter);
app.use('/api/application-settings', applicationSettingsRouter);
app.use('/api/excel', excelUploadRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'API is running successfully'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});

export default app;