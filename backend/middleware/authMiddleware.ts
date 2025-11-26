import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { getUserById } from '../services/userService';
import logger from '../services/logger';

// Extend the Request type to include user information
export interface AuthRequest extends Request {
  user?: {
    id: number;
    iemis_code: string;
    email: string | null;
    role: 'admin' | 'school';
    school_id: number | null;
  };
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('Access token required but not provided', { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      logger.warn('Invalid or expired token', { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get the user from the database to ensure they still exist
    const user = await getUserById(decoded.id);
    if (!user) {
      logger.warn('User not found in database', { userId: decoded.id });
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user information to the request
    req.user = {
      id: user.id,
      iemis_code: user.iemis_code,
      email: user.email,
      role: user.role,
      school_id: user.school_id
    };

    logger.info('User authenticated successfully', { 
      userId: user.id, 
      role: user.role,
      iemisCode: user.iemis_code
    });
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    logger.warn('Admin access denied', { 
      userId: req.user.id, 
      userRole: req.user.role 
    });
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

/**
 * Middleware to check if user is a school user or admin
 */
export const requireSchoolOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'school') {
    logger.warn('School or admin access denied', { 
      userId: req.user.id, 
      userRole: req.user.role 
    });
    return res.status(403).json({ error: 'School or admin access required' });
  }

  next();
};

export default {
  authenticateToken,
  requireAdmin,
  requireSchoolOrAdmin
};