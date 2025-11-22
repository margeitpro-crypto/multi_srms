import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createUser, getUserByIemisCode, getAllUsers, updateUser, deleteUser, verifyPassword, getUserById, getUserByEmail, getUsersBySchoolId, updateUserPassword } from '../services/userService';
import logger from '../services/logger';

const router = Router();

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'multi_srms_secret_key';

// GET /api/users - Get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    logger.info('Fetched all users', { count: users.length });
    res.json(users);
  } catch (err) {
    logger.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/school/:schoolId - Get users by school ID
router.get('/school/:schoolId', async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }
    
    const users = await getUsersBySchoolId(schoolId);
    logger.info('Fetched users by school ID', { schoolId, count: users.length });
    res.json(users);
  } catch (err) {
    logger.error('Error fetching users by school ID:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get a specific user
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await getUserById(id);
    if (!user) {
      logger.warn('User not found', { userId: id });
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.info('Fetched user by ID', { userId: id });
    res.json(user);
  } catch (err) {
    logger.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { iemis_code, email, password, role, school_id } = req.body;
    
    // Validate required fields
    if (!iemis_code || !password || !role) {
      return res.status(400).json({ error: 'IEMIS Code, password, and role are required' });
    }
    
    // Check if user already exists by IEMIS code
    const existingUserByIemis = await getUserByIemisCode(iemis_code);
    if (existingUserByIemis) {
      logger.warn('User with IEMIS Code already exists', { iemisCode: iemis_code });
      return res.status(409).json({ error: 'User with this IEMIS Code already exists' });
    }
    
    // Check if user already exists by email (if email is provided)
    if (email) {
      const existingUserByEmail = await getUserByEmail(email);
      if (existingUserByEmail) {
        logger.warn('User with email already exists', { email });
        return res.status(409).json({ error: 'User with this email already exists' });
      }
    }
    
    // Create new user
    const newUser = await createUser({ iemis_code, email, password, role, school_id });
    logger.info('Created new user', { userId: newUser.id, iemisCode: newUser.iemis_code });
    res.status(201).json(newUser);
  } catch (err: any) {
    logger.error('Error creating user:', err);
    if (err.code === '23505') {
      // Handle unique constraint violation
      if (err.detail && err.detail.includes('iemis_code')) {
        return res.status(409).json({ error: 'User with this IEMIS Code already exists' });
      } else if (err.detail && err.detail.includes('email')) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update a user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const { iemis_code, email, role, school_id } = req.body;
    const updatedUser = await updateUser(id, { iemis_code, email, role, school_id });
    
    if (!updatedUser) {
      logger.warn('User not found for update', { userId: id });
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.info('Updated user', { userId: id });
    res.json(updatedUser);
  } catch (err: any) {
    logger.error('Error updating user:', err);
    if (err.code === '23505') {
      // Handle unique constraint violation
      if (err.detail && err.detail.includes('iemis_code')) {
        return res.status(409).json({ error: 'User with this IEMIS Code already exists' });
      } else if (err.detail && err.detail.includes('email')) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const deletedUser = await deleteUser(id);
    
    if (!deletedUser) {
      logger.warn('User not found for deletion', { userId: id });
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.info('Deleted user', { userId: id });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    logger.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST /api/users/login - User login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, iemisCode, password } = req.body;
    
    // Validate required fields
    if (!password || (!email && !iemisCode)) {
      return res.status(400).json({ error: 'Email or IEMIS Code and password are required' });
    }
    
    // Get user by email or IEMIS Code
    let user = null;
    if (email) {
      user = await getUserByEmail(email);
      if (!user) {
        logger.warn('Login failed - invalid email', { email });
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else if (iemisCode) {
      user = await getUserByIemisCode(iemisCode);
      if (!user) {
        logger.warn('Login failed - invalid IEMIS code', { iemisCode });
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    
    // Verify that the user exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      logger.warn('Login failed - invalid password', { userId: user.id });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        iemis_code: user.iemis_code, 
        email: user.email, 
        role: user.role,
        school_id: user.school_id
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    logger.info('User login successful', { userId: user.id, role: user.role });
    
    // Return token and user info
    res.json({ 
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        iemis_code: user.iemis_code,
        email: user.email,
        role: user.role,
        school_id: user.school_id
      }
    });
  } catch (err) {
    logger.error('Error during login:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/users/change-password - Change user password
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.id; // Get user ID from auth middleware
    
    // Validate required fields
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }
    
    // Get the current user
    const user = await getUserById(userId);
    if (!user) {
      logger.warn('User not found for password change', { userId });
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      logger.warn('Password change failed - invalid current password', { userId });
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    const updatedUser = await updateUserPassword(userId, newPassword);
    if (!updatedUser) {
      logger.error('Failed to update password', { userId });
      return res.status(500).json({ error: 'Failed to update password' });
    }
    
    logger.info('Password changed successfully', { userId });
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    logger.error('Error changing password:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;