import { createUser } from '../backend/services/userService';

async function addAdminUser() {
  try {
    // Create an admin user with email
    const adminUser = await createUser({
      iemis_code: 'ADMIN001',
      email: 'admin@multi_srms.com',
      password: 'admin123',
      role: 'admin'
    });
    
    console.log('Admin user created successfully:', adminUser);
    
    // Create a school user with IEMIS code
    const schoolUser = await createUser({
      iemis_code: '720160001',
      password: 'school123',
      role: 'school'
    });
    
    console.log('School user created successfully:', schoolUser);
  } catch (error) {
    console.error('Error creating users:', error);
  }
}

addAdminUser();