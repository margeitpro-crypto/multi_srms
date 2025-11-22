import { schoolsService, studentsService, subjectsService } from '../backend/services/dbService';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate random names
const firstNamesMale = ['Bikash', 'Suresh', 'Anish', 'Dipesh', 'Sagar', 'Prabin', 'Manish', 'Ramesh', 'Hari', 'Santosh'];
const firstNamesFemale = ['Anjali', 'Sabina', 'Pooja', 'Manisha', 'Sunita', 'Kopila', 'Bimala', 'Rita', 'Gita', 'Sarita'];
const lastNames = ['Thapa', 'Rana', 'Karki', 'Shrestha', 'Adhikari', 'Bhatta', 'Joshi', 'Bohara', 'Chand', 'Saud', 'KC', 'Poudel', 'Chaudhary', 'Singh', 'Sharma'];

// Function to generate random mobile numbers
function generateRandomMobile(): string {
  const prefix = '98';
  const suffix = Math.floor(10000000 + Math.random() * 90000000).toString();
  return prefix + suffix;
}

// Function to generate random email
function generateRandomEmail(name: string): string {
  const domains = ['example.com', 'test.com', 'demo.com', 'sample.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  return `${cleanName}.${Math.floor(1000 + Math.random() * 9000)}@${domain}`;
}

// Function to anonymize school data
function anonymizeSchool(school: any): any {
  return {
    ...school,
    iemisCode: `IEMIS${Math.floor(100000 + Math.random() * 900000)}`,
    name: `Test School ${Math.floor(1000 + Math.random() * 9000)}`,
    municipality: `Test Municipality ${Math.floor(1 + Math.random() * 20)}`,
    preparedBy: `${firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    checkedBy: `${firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    headTeacherName: `${firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    headTeacherContact: generateRandomMobile(),
    email: generateRandomEmail(`school${school.id}`),
  };
}

// Function to anonymize student data
function anonymizeStudent(student: any): any {
  const gender = Math.random() > 0.5 ? 'Male' : 'Female';
  const firstName = gender === 'Male' ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)] : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fatherFirstName = firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)];
  const motherFirstName = firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
  
  // Format dates properly
  let dob = student.dob;
  if (dob && typeof dob === 'string' && !dob.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Try to parse and reformat the date
    try {
      const dateObj = new Date(dob);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dob = `${year}-${month}-${day}`;
      }
    } catch (e) {
      // If parsing fails, keep original
    }
  } else if (dob && typeof dob === 'string' && dob.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Already in correct format, keep as is
  } else if (dob instanceof Date) {
    // Convert Date object to string
    const year = dob.getFullYear();
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const day = String(dob.getDate()).padStart(2, '0');
    dob = `${year}-${month}-${day}`;
  }
  
  return {
    ...student,
    name: `${firstName} ${lastName}`,
    father_name: `${fatherFirstName} ${lastName}`,
    mother_name: `${motherFirstName} ${lastName}`,
    mobile_no: generateRandomMobile(),
    email: generateRandomEmail(`${firstName}.${lastName}`),
    dob: dob,
  };
}

// Function to escape SQL values
function escapeSqlValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'string') {
    // Handle special cases
    if (value === 'null') {
      return 'NULL';
    }
    
    // Escape single quotes
    return `'${value.replace(/'/g, "''")}'`;
  }
  
  // For date objects, convert to string in YYYY-MM-DD format
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `'${year}-${month}-${day}'`;
  }
  
  return `'${value}'`;
}

async function anonymizeData() {
  try {
    console.log('Starting data anonymization process...');
    
    // Get all data from database
    console.log('Fetching data from database...');
    const schools = await schoolsService.getAllSchools();
    const students = await studentsService.getAllStudents();
    const subjects = await subjectsService.getAllSubjects();
    
    console.log(`Found ${schools.length} schools, ${students.length} students, and ${subjects.length} subjects`);
    
    // Anonymize data
    console.log('Anonymizing data...');
    const anonymizedSchools = schools.map(anonymizeSchool);
    const anonymizedStudents = students.map(anonymizeStudent);
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../data/anonymized');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save anonymized data to JSON files
    console.log('Saving anonymized data to files...');
    
    fs.writeFileSync(
      path.join(outputDir, 'schools.json'),
      JSON.stringify(anonymizedSchools, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'students.json'),
      JSON.stringify(anonymizedStudents, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'subjects.json'),
      JSON.stringify(subjects, null, 2)
    );
    
    console.log('Anonymized data saved successfully!');
    console.log(`Files saved to: ${outputDir}`);
    
    // Also save as SQL insert statements for direct database import
    console.log('Generating SQL insert statements...');
    
    let sqlContent = `-- Anonymized data for pre-production testing\n`;
    sqlContent += `-- Generated on ${new Date().toISOString()}\n\n`;
    
    // Generate schools insert statements
    sqlContent += `-- Schools\n`;
    sqlContent += `DELETE FROM schools;\n`;
    for (const school of anonymizedSchools) {
      sqlContent += `INSERT INTO schools (id, iemis_code, name, logo_url, municipality, estd, prepared_by, checked_by, head_teacher_name, head_teacher_contact, email, status, subscription_plan) VALUES (${escapeSqlValue(school.id)}, ${escapeSqlValue(school.iemisCode)}, ${escapeSqlValue(school.name)}, ${escapeSqlValue(school.logoUrl)}, ${escapeSqlValue(school.municipality)}, ${escapeSqlValue(school.estd)}, ${escapeSqlValue(school.preparedBy)}, ${escapeSqlValue(school.checkedBy)}, ${escapeSqlValue(school.headTeacherName)}, ${escapeSqlValue(school.headTeacherContact)}, ${escapeSqlValue(school.email)}, ${escapeSqlValue(school.status)}, ${escapeSqlValue(school.subscriptionPlan)});\n`;
    }
    
    // Generate students insert statements
    sqlContent += `\n-- Students\n`;
    sqlContent += `DELETE FROM students;\n`;
    for (const student of anonymizedStudents) {
      sqlContent += `INSERT INTO students (student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url, academic_year, symbol_no, alph, registration_id, dob_bs, father_name, mother_name, mobile_no) VALUES (${escapeSqlValue(student.id)}, ${escapeSqlValue(student.school_id)}, ${escapeSqlValue(student.name)}, ${escapeSqlValue(student.dob)}, ${escapeSqlValue(student.gender)}, ${escapeSqlValue(student.grade)}, ${escapeSqlValue(student.roll_no)}, ${escapeSqlValue(student.photo_url)}, ${escapeSqlValue(student.year)}, ${escapeSqlValue(student.symbol_no)}, ${escapeSqlValue(student.alph)}, ${escapeSqlValue(student.registration_id)}, ${escapeSqlValue(student.dob_bs)}, ${escapeSqlValue(student.father_name)}, ${escapeSqlValue(student.mother_name)}, ${escapeSqlValue(student.mobile_no)});\n`;
    }
    
    // Generate subjects insert statements
    sqlContent += `\n-- Subjects\n`;
    sqlContent += `DELETE FROM subjects;\n`;
    for (const subject of subjects) {
      sqlContent += `INSERT INTO subjects (id, name, grade, theory_sub_code, theory_credit, theory_full_marks, theory_pass_marks, internal_sub_code, internal_credit, internal_full_marks, internal_pass_marks) VALUES (${escapeSqlValue(subject.id)}, ${escapeSqlValue(subject.name)}, ${escapeSqlValue(subject.grade)}, ${escapeSqlValue(subject.theory.subCode)}, ${escapeSqlValue(subject.theory.credit)}, ${escapeSqlValue(subject.theory.fullMarks)}, ${escapeSqlValue(subject.theory.passMarks)}, ${escapeSqlValue(subject.internal.subCode)}, ${escapeSqlValue(subject.internal.credit)}, ${escapeSqlValue(subject.internal.fullMarks)}, ${escapeSqlValue(subject.internal.passMarks)});\n`;
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'anonymized-data.sql'),
      sqlContent
    );
    
    console.log('SQL insert statements generated successfully!');
    
    console.log('\n--- Summary ---');
    console.log(`Anonymized ${anonymizedSchools.length} schools`);
    console.log(`Anonymized ${anonymizedStudents.length} students`);
    console.log(`Preserved ${subjects.length} subjects (no PII)`);
    console.log('Files generated:');
    console.log('- schools.json');
    console.log('- students.json');
    console.log('- subjects.json');
    console.log('- anonymized-data.sql');
    
  } catch (error) {
    console.error('Error during data anonymization:', error);
  }
}

anonymizeData();