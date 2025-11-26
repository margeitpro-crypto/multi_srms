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
import { authenticateToken } from './middleware/authMiddleware';

const app: Application = express();
const PORT = process.env.PORT || 3002; // Changed to 3002 as per project configuration

const ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : [
      'http://localhost:5173', 
      'http://localhost:3002',
      'http://localhost:3000',
      'http://192.168.100.3:3000',
      'http://192.168.100.3:5173'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    // Also allow any localhost or 192.168.x.x origins for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://192.168.')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
}));

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (increased from 100)
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

// Public routes (no authentication required)
app.use('/api/otp', otpRouter);

// Authentication routes (no authentication required)
app.use('/api/users', usersRouter);

// Protected routes (authentication required)
app.use('/api/schools', authenticateToken, schoolsRouter);
app.use('/api/students', authenticateToken, studentsRouter);
app.use('/api/subjects', authenticateToken, subjectsRouter);
app.use('/api/subject-assignments', authenticateToken, subjectAssignmentsRouter);
app.use('/api/marks', authenticateToken, marksRouter);
app.use('/api/academic-years', authenticateToken, academicYearsRouter);
app.use('/api/application-settings', authenticateToken, applicationSettingsRouter);
app.use('/api/excel', authenticateToken, excelUploadRouter);

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