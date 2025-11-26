import { Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'path';
import { AuthRequest } from '../middleware/authMiddleware';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only Excel files
  if (file.mimetype === 'application/vnd.ms-excel' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.match(/\.(xls|xlsx)$/)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xls, .xlsx) are allowed!') as any);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to parse Excel file and preserve numeric data as strings
const parseExcelFile = (filePath: string): any[] => {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath, { 
      cellDates: true,
      cellNF: false,
      cellText: false
    });
    
    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON with proper formatting
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // This ensures numbers are treated as strings
      defval: '', // Default value for empty cells
      dateNF: 'yyyy-mm-dd' // Date format
    });
    
    return jsonData;
  } catch (error) {
    throw new Error('Error parsing Excel file: ' + (error as Error).message);
  }
};

// Controller function to handle Excel file upload
export const uploadExcelFile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    let schoolId: number | null = null;
    if (user.role === 'school') {
      schoolId = user.school_id;
    } else if (user.role === 'admin') {
      schoolId = req.body.school_id;
      if (!schoolId) {
        return res.status(400).json({ success: false, message: 'school_id is required for admin users' });
      }
    }

    if (!schoolId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const studentsData = parseExcelFile(req.file.path);
    
    const processedStudents = studentsData.map((row: any) => {
      return {
        school_id: schoolId,
        registrationId: String(row['Registration ID'] || row['registration_id'] || ''),
        name: String(row['Name'] || row['name'] || ''),
        phone: String(row['Phone'] || row['phone'] || row['Mobile'] || ''),
        symbolNo: String(row['Symbol No'] || row['symbol_no'] || ''),
      };
    });
    
    res.status(200).json({
      success: true,
      message: 'File uploaded and parsed successfully',
      schoolId: schoolId,
      data: processedStudents,
      count: processedStudents.length
    });
    
  } catch (error) {
    console.error('Error uploading Excel file:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing file: ' + (error as Error).message
    });
  }
};

// Alternative approach with more control over data types
export const uploadExcelFileAdvanced = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const file = (req as any).file;
    
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let schoolId: number | null = null;
    if (user.role === 'school') {
      schoolId = user.school_id;
    } else if (user.role === 'admin') {
      schoolId = req.body.school_id;
      if (!schoolId) {
        return res.status(400).json({ success: false, message: 'school_id is required for admin users' });
      }
    }

    if (!schoolId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const workbook = XLSX.readFile(file.path, {
      cellDates: true,
      cellNF: true,
      cellText: true
    });
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    const students: any[] = [];
    
    for (let rowNum = 1; rowNum <= range.e.r; rowNum++) {
      const row: any = { school_id: schoolId };
      
      for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
        const headerAddress = XLSX.utils.encode_cell({ r: 0, c: colNum });
        
        const cell = worksheet[cellAddress];
        const headerCell = worksheet[headerAddress];
        
        if (cell && headerCell) {
          const headerName = String(headerCell.v);
          let cellValue: any = '';
          
          if (cell.t === 'n') {
            cellValue = cell.w ? cell.w : String(cell.v);
          } else if (cell.t === 's') {
            cellValue = cell.v;
          } else if (cell.t === 'd') {
            cellValue = cell.w ? cell.w : cell.v.toISOString().split('T')[0];
          } else {
            cellValue = cell.v ? String(cell.v) : '';
          }
          
          row[headerName] = String(cellValue);
        }
      }
      
      if (Object.keys(row).length > 1) { // Check for more than just school_id
        students.push(row);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'File uploaded and parsed successfully',
      schoolId: schoolId,
      data: students,
      count: students.length
    });
    
  } catch (error) {
    console.error('Error uploading Excel file:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing file: ' + (error as Error).message
    });
  }
};