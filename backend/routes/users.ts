import { Router, Request, Response } from 'express';
import { createUser, getAllUsers, updateUser, deleteUser, verifyPassword, getUserById, getUserByEmail, getUsersBySchoolId, updateUserPassword } from '../services/userService';
import { register, login } from '../services/authService';
import logger from '../services/logger';

const router = Router();

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

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.info('Fetched user by ID', { userId: id });
    res.json(user);
  } catch (err) {
    logger.error('Error fetching user by ID:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create a new user (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, password, role, school_id } = req.body;
    
    // Validate required fields
    if (!password || !role) {
      return res.status(400).json({ error: 'Password and role are required' });
    }
    
    const newUser = await createUser({ email, password, role, school_id });
    logger.info('User created', { userId: newUser.id });
    res.status(201).json(newUser);
  } catch (err: any) {
    logger.error('Error creating user:', err);
    if (err.message && err.message.includes('duplicate key')) {
      res.status(400).json({ error: 'User with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const { email, role, school_id } = req.body;
    
    const updatedUser = await updateUser(id, { email, role, school_id });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.info('User updated', { userId: id });
    res.json(updatedUser);
  } catch (err) {
    logger.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const deletedUser = await deleteUser(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.info('User deleted', { userId: id });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    logger.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST /api/users/login - User login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Attempt to login
    const { user, token, error } = await login(email, password);
    
    if (error) {
      logger.warn('Login failed', { email, error });
      return res.status(401).json({ error });
    }
    
    if (!user || !token) {
      logger.warn('Login failed - unexpected error', { email });
      return res.status(401).json({ error: 'Login failed' });
    }
    
    logger.info('User login successful', { userId: user.id, role: user.role });
    
    // Return token and user info
    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
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

// POST /api/users/register - User registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role, school_id } = req.body;
    
    // Validate required fields
    if (!password || !role) {
      return res.status(400).json({ error: 'Password and role are required' });
    }
    
    // Register user
    const { user, error } = await register({ email, password, role, school_id });
    
    if (error) {
      logger.warn('Registration failed', { email, error });
      return res.status(400).json({ error });
    }
    
    if (!user) {
      logger.error('Registration failed - unexpected error', { email });
      return res.status(500).json({ error: 'Registration failed' });
    }
    
    logger.info('User registration successful', { userId: user.id, role: user.role });
    
    res.status(201).json({ 
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        school_id: user.school_id
      }
    });
  } catch (err) {
    logger.error('Error during registration:', err);
    res.status(500).json({ error: 'Registration failed' });
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
    
    // First verify the current password
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isCurrentPasswordValid = await verifyPassword(currentPassword, currentUser.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Update the password
    const updatedUser = await updateUserPassword(userId, newPassword);
    
    if (!updatedUser) {
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