import { Router } from 'express';
import { upload, uploadExcelFile, uploadExcelFileAdvanced } from '../controllers/excelUploadController';

const router = Router();

// Route for basic Excel file upload
router.post('/upload', upload.single('excelFile'), uploadExcelFile);

// Route for advanced Excel file upload with more control
router.post('/upload-advanced', upload.single('excelFile'), uploadExcelFileAdvanced);

export default router;