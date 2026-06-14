import { Router, Response, Request } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { adminDb } from '../lib/firebase-admin';
import { nanoid } from 'nanoid';
import axios from "axios";
import _ from 'underscore';

const router = Router();

// GET /api/orders - List orders (ADMIN: all, MEMBER/USER: own)
router.get('/list', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;

  // Get user role
  const userRoleRef = adminDb.ref(`users/${uid}/role`);
  const roleSnapshot = await userRoleRef.once('value');
  const role = roleSnapshot.val();

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  if (!appsScriptUrl) {
    console.warn('APPS_SCRIPT_URL not set — returning mock data.');
    return res.status(200).json([]);
  }

  try{
    const response = await axios.get(appsScriptUrl, {
      params: { type: "ORDERS" }
    });

    const responseData = response.data.orders.map((item: any) => {
      return {
        id: item.OrderId,
        discordUsername: item.DiscordId,
        character: item.Character,
        category: item.Category,
        baseItem: item.Item,
        enchantment: item.Enchantment,
        quantity: item.Quntity,
        providingBaseItem: item.ProvidingBase,
        specialRequests: "",
        status: item.Status,
        adminNote: null,
        internalNote: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    });

    return res.status(200).json({
      data: responseData,
    });
  }
  catch(error){
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to retrieve orders ledger.' });
  }

    // Fetch all orders
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

  const orderId = nanoid(10);
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  if (!appsScriptUrl) {
    console.warn('APPS_SCRIPT_URL not set — returning mock data.');
    return res.status(200).json([]);
  }

  const newOrder = {
    taskId: orderId,
    discordId: discordId,
    character: character,
    category: category,
    baseItem: baseItem,
    enchantment: enchantment,
    quantity: quantity,
    providingBase: providingBaseItem,
    specialRequests: specialRequests,
    status: 'PENDING',
    adminNote: null,
    internalNote: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    const response = await axios.post(appsScriptUrl, newOrder, {
      headers: { "Content-Type": "application/json" }
    })

    return res.status(201).json(response.data);
  }
  catch(error){
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to retrieve log orders.' });
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

    const appsScriptUrl = process.env.APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      console.warn('APPS_SCRIPT_URL not set — returning mock data.');
      return res.status(200).json([]);
    }

    const response = await axios.get(appsScriptUrl, {
      params: {type: "ORDERS"}
    });

    const order = _.find(response.data.orders, (order: any) => order["OrderId"] === orderId);

    if (_.isEmpty(order)){
      return res.status(404).json({ error: 'Order not found' });
    }

    const responseData = {
      taskId: order.OrderId,
      discordId: order.DiscordId,
      character: order.Character,
      category: order.Category,
      baseItem: order.Item,
      enchantment: order.Enchantment,
      quantity: order.Quntity,
      providingBase: order.ProvidingBase,
      specialRequests: '',
      status: order.Status.toUpperCase(),
      adminNote: null,
      internalNote: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return res.status(200).json(responseData);
  }
  catch (error){
    console.error('Error fetching order detail:', error);
    return res.status(500).json({ error: 'Failed to retrieve contract specifications.' });
  }
});

// PATCH /api/orders/:id - Update status and notes (ADMIN only)
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const orderId = req.params.id;
  const { status, adminNote, internalNote, assignee } = req.body;

  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    if (!appsScriptUrl) {
      console.warn('APPS_SCRIPT_URL not set — returning mock data.');
      return res.status(500).json([]);
    }

    // Verify the order exists first
    const getResponse = await axios.get(appsScriptUrl, {
      params: { type: "ORDERS" }
    });

    const order = _.find(getResponse.data.orders, (o: any) => o.OrderId === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Commission contract not found.' });
    }

    const updates: Record<string, any> = {};
    if (status       !== undefined) updates.status       = status;
    if (adminNote    !== undefined) updates.adminNote    = adminNote;
    if (internalNote !== undefined) updates.internalNote = internalNote;
    if (assignee     !== undefined) updates.assignee     = assignee;

    // POST (not PATCH) to Apps Script with action discriminator
    const patchResponse = await axios.post(appsScriptUrl, {
      action:  "UPDATE_ORDER",
      orderId: orderId,
      updates: updates,
    });

    return res.status(patchResponse.status).json(patchResponse.data);
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
