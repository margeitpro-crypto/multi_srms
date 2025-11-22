import { query } from '../backend/services/dbService';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importAnonymizedData() {
  try {
    console.log('Starting import of anonymized data...');
    
    const dataDir = path.join(__dirname, '../data/anonymized');
    
    // Check if anonymized data exists
    if (!fs.existsSync(dataDir)) {
      console.error('Anonymized data directory not found. Please run anonymize-data.ts first.');
      return;
    }
    
    // Read the SQL file
    const sqlFilePath = path.join(dataDir, 'anonymized-data.sql');
    if (!fs.existsSync(sqlFilePath)) {
      console.error('SQL file not found. Please run anonymize-data.ts first.');
      return;
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.startsWith('--')) {
        // Skip comments
        continue;
      }
      
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      try {
        await query(statement);
        console.log('✓ Statement executed successfully');
      } catch (error) {
        console.error(`✗ Error executing statement:`, error);
        // Continue with other statements
      }
    }
    
    console.log('\n--- Import Summary ---');
    console.log('Anonymized data imported successfully!');
    console.log('The database now contains anonymized data for pre-production testing.');
    
  } catch (error) {
    console.error('Error during data import:', error);
  }
}

importAnonymizedData();