import { Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'path';

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

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
    // Using raw: true to get raw values and preserve numbers as strings
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
export const uploadExcelFile = async (req: Request, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    // Parse the Excel file
    const studentsData = parseExcelFile(req.file.path);
    
    // Process the student data (example implementation)
    const processedStudents = studentsData.map((row: any) => {
      return {
        // Ensure numeric fields are treated as strings
        registrationId: String(row['Registration ID'] || row['registration_id'] || ''),
        name: String(row['Name'] || row['name'] || ''),
        phone: String(row['Phone'] || row['phone'] || row['Mobile'] || ''),
        // Add other fields as needed
        // Preserve leading zeros and avoid scientific notation
        symbolNo: String(row['Symbol No'] || row['symbol_no'] || ''),
        // Handle any other numeric fields similarly
      };
    });
    
    // Here you would typically save to database
    // For example:
    // await saveStudentsToDatabase(processedStudents);
    
    res.status(200).json({
      success: true,
      message: 'File uploaded and parsed successfully',
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
export const uploadExcelFileAdvanced = async (req: Request, res: Response) => {
  try {
    // Type assertion to access file property
    const file = (req as any).file;
    
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    // Read workbook with more control
    const workbook = XLSX.readFile(file.path, {
      cellDates: true,
      cellNF: true, // Capture number formats
      cellText: true
    });
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Get sheet range
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Process row by row to have full control
    const students: any[] = [];
    
    // Start from row 1 to skip header (assuming row 0 is header)
    for (let rowNum = 1; rowNum <= range.e.r; rowNum++) {
      const row: any = {};
      
      // Process each column
      for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
        const headerAddress = XLSX.utils.encode_cell({ r: 0, c: colNum });
        
        const cell = worksheet[cellAddress];
        const headerCell = worksheet[headerAddress];
        
        if (cell && headerCell) {
          const headerName = String(headerCell.v);
          let cellValue: any = '';
          
          // Preserve numeric values as strings to avoid scientific notation
          if (cell.t === 'n') {
            // For numbers, use the formatted value if available, otherwise raw value
            cellValue = cell.w ? cell.w : String(cell.v);
          } else if (cell.t === 's') {
            // String values
            cellValue = cell.v;
          } else if (cell.t === 'd') {
            // Date values
            cellValue = cell.w ? cell.w : cell.v.toISOString().split('T')[0];
          } else {
            // Other types
            cellValue = cell.v ? String(cell.v) : '';
          }
          
          // Ensure all values are strings to prevent scientific notation
          row[headerName] = String(cellValue);
        }
      }
      
      // Only add non-empty rows
      if (Object.keys(row).length > 0) {
        students.push(row);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'File uploaded and parsed successfully',
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