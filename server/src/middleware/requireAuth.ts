import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    [key: string]: any;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    return next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export default requireAuth;
