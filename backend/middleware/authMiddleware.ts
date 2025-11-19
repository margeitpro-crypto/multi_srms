import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from '../services/userService';

// JWT secret - should match the one used in routes
const JWT_SECRET = process.env.JWT_SECRET || 'multi_srms_secret_key';

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

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      iemis_code: string;
      email: string | null;
      role: 'admin' | 'school';
      school_id: number | null;
    };

    // Fetch the user from the database to ensure they still exist
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // Attach user information to the request
    req.user = {
      id: user.id,
      iemis_code: user.iemis_code,
      email: user.email,
      role: user.role,
      school_id: user.school_id
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

export const authorizeSchool = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'school') {
    return res.status(403).json({ error: 'School access required' });
  }

  next();
};