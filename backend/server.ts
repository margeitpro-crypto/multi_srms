import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './services/logger';
import schoolsRouter from './routes/schools';
import studentsRouter from './routes/students';
import subjectsRouter from './routes/subjects';
import usersRouter from './routes/users';
import subjectAssignmentsRouter from './routes/subjectAssignments';
import marksRouter from './routes/marks';
import academicYearsRouter from './routes/academicYears';
import applicationSettingsRouter from './routes/applicationSettings';
import excelUploadRouter from './routes/excelUpload';
import otpRouter from './routes/otpRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3002; // Changed to 3002 as per project configuration

const ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3002'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting to all requests
app.use(limiter);

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
app.use('/api/otp', otpRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  logger.info('Health check endpoint accessed');
  res.json({
    status: 'OK',
    message: 'API is running successfully'
  });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;