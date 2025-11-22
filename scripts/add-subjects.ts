import { subjectsService } from '../backend/services/dbService';

async function addSubjects() {
  try {
    console.log('Adding subjects to the database...');
    
    // Sample subjects data
    const sampleSubjects = [
      {
        name: 'Com.Nepali',
        grade: 11,
        theory_sub_code: '11',
        theory_credit: 2.25,
        theory_full_marks: 75,
        theory_pass_marks: 27,
        internal_sub_code: '12',
        internal_credit: 0.75,
        internal_full_marks: 25,
        internal_pass_marks: 10
      },
      {
        name: 'Com.English',
        grade: 11,
        theory_sub_code: '31',
        theory_credit: 3,
        theory_full_marks: 75,
        theory_pass_marks: 27,
        internal_sub_code: '32',
        internal_credit: 1,
        internal_full_marks: 25,
        internal_pass_marks: 10
      }
    ];
    
    // Insert subjects
    console.log('Inserting subjects...');
    for (const subject of sampleSubjects) {
      await subjectsService.createSubject(subject);
    }
    
    console.log('Subjects added successfully!');
  } catch (error) {
    console.error('Error adding subjects:', error);
  }
}

addSubjects();