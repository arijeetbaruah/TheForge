import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { adminDb } from '../lib/firebase-admin';

const router = Router();

// Apply auth and admin middleware to all user/role routes
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/users - List all users (ADMIN only)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const usersRef = adminDb.ref('users');
    const snapshot = await usersRef.once('value');
    const usersVal = snapshot.val();
    const usersList = usersVal ? Object.values(usersVal) as any[] : [];

    // Sort users by username
    return res.json(usersList.sort((a, b) => a.username.localeCompare(b.username)));
  } catch (error) {
    console.error('Error listing users:', error);
    return res.status(500).json({ error: 'Failed to retrieve guild names ledger.' });
  }
});

// PATCH /api/users/:uid/role - Promote/Demote user role (ADMIN only)
router.patch('/:uid/role', async (req: AuthenticatedRequest, res: Response) => {
  const targetUid = req.params.uid;
  const { role } = req.body;
  const callerUid = req.user!.uid;

  if (!role || !['USER', 'MEMBER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid or missing role parameter.' });
  }

  if (targetUid === callerUid) {
    return res.status(400).json({ error: 'Artisan, thou cannot alter thine own station!' });
  }

  try {
    const targetUserRef = adminDb.ref(`users/${targetUid}`);
    const snapshot = await targetUserRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Traveler not found in archives.' });
    }

    const targetUser = snapshot.val();

    // Check if target user is currently an ADMIN
    if (targetUser.role === 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Elder Artisans (ADMIN) cannot be modified.' });
    }

    // Update role
    await targetUserRef.update({
      role,
      updatedAt: Date.now(),
    });

    const updatedSnapshot = await targetUserRef.once('value');
    return res.json(updatedSnapshot.val());
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Failed to update traveler station.' });
  }
});

export default router;
