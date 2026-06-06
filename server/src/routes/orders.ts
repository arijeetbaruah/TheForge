import { Router, Response, Request } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { adminDb } from '../lib/firebase-admin';

const router = Router();

// GET /api/orders - List orders (ADMIN: all, MEMBER/USER: own)
router.get('/list', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;

  try {
    // Get user role
    const userRoleRef = adminDb.ref(`users/${uid}/role`);
    const roleSnapshot = await userRoleRef.once('value');
    const role = roleSnapshot.val();

    // Fetch all orders
    const ordersRef = adminDb.ref('orders');
    const ordersSnapshot = await ordersRef.once('value');
    const ordersVal = ordersSnapshot.val();
    const allOrders = ordersVal ? Object.values(ordersVal) as any[] : [];

    if (role === 'ADMIN') {
      // Return sorted by createdAt descending
      return res.json(allOrders.sort((a, b) => b.createdAt - a.createdAt));
    } else {
      // Filter own orders
      const userOrders = allOrders.filter((order) => order.userId === uid);
      return res.json(userOrders.sort((a, b) => b.createdAt - a.createdAt));
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to retrieve orders ledger.' });
  }
});

// POST /api/orders - Create commission (MEMBER+ only)
router.post('/', async (req: Request, res: Response) => {
  const { discordId,
    character,
    category,
    baseItem,
    enchantment,
    quantity,
    providingBaseItem,
    specialRequests } = req.body;

  if (!category || !discordId || !character || !baseItem || !quantity) {
    return res.status(400).json({ error: 'Missing required contract specifications.' });
  }

  try {
    // Generate order ID
    const newOrderRef = adminDb.ref('orders').push();
    const orderId = newOrderRef.key;

    const newOrder = {
      id: orderId,
      discordUsername: discordId,
      character: character,
      category: category,
      baseItem: baseItem,
      enchantment: enchantment,
      quantity: quantity,
      providingBaseItem: providingBaseItem,
      specialRequests: specialRequests,
      status: 'PENDING',
      adminNote: null,
      internalNote: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await newOrderRef.set(newOrder);
    return res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to record commission in ledger.' });
  }
});

// GET /api/orders/:id - Get order by ID (Owner or ADMIN)
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const orderId = req.params.id;

  try {
    // Get user role
    const userRoleSnapshot = await adminDb.ref(`users/${uid}/role`).once('value');
    const role = userRoleSnapshot.val();

    const orderRef = adminDb.ref(`orders/${orderId}`);
    const orderSnapshot = await orderRef.once('value');

    if (!orderSnapshot.exists()) {
      return res.status(404).json({ error: 'Commission contract not found.' });
    }

    const order = orderSnapshot.val();

    // Access check: Owner or ADMIN
    if (order.userId !== uid && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Access to this scroll is restricted.' });
    }

    // Hide internal note for non-admins
    if (role !== 'ADMIN') {
      order.internalNote = undefined;
    }

    return res.json(order);
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return res.status(500).json({ error: 'Failed to retrieve contract specifications.' });
  }
});

// PATCH /api/orders/:id - Update status and notes (ADMIN only)
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const orderId = req.params.id;
  const { status, adminNote, internalNote } = req.body;

  try {
    const orderRef = adminDb.ref(`orders/${orderId}`);
    const orderSnapshot = await orderRef.once('value');

    if (!orderSnapshot.exists()) {
      return res.status(404).json({ error: 'Commission contract not found.' });
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (status !== undefined) updates.status = status;
    if (adminNote !== undefined) updates.adminNote = adminNote;
    if (internalNote !== undefined) updates.internalNote = internalNote;

    await orderRef.update(updates);

    // Retrieve updated order
    const updatedSnapshot = await orderRef.once('value');
    return res.json(updatedSnapshot.val());
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ error: 'Failed to update ledger contract.' });
  }
});

// DELETE /api/orders/:id - Delete order (ADMIN only)
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const orderId = req.params.id;

  try {
    const orderRef = adminDb.ref(`orders/${orderId}`);
    const orderSnapshot = await orderRef.once('value');

    if (!orderSnapshot.exists()) {
      return res.status(404).json({ error: 'Commission contract not found.' });
    }

    await orderRef.remove();
    return res.json({ success: true, message: 'Commission struck from the archives.' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ error: 'Failed to remove contract from archives.' });
  }
});

export default router;
