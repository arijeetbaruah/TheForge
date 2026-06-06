import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './requireAuth';
import { adminDb } from '../lib/firebase-admin';

export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const userRoleRef = adminDb.ref(`users/${req.user.uid}/role`);
    const snapshot = await userRoleRef.once('value');
    const role = snapshot.val();

    if (role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Requires Elder Artisan (ADMIN) status' });
    }

    return next();
  } catch (error) {
    console.error('Error verifying admin role in DB:', error);
    return res.status(500).json({ error: 'Internal Server Error verifying guild role' });
  }
};

export default requireAdmin;
