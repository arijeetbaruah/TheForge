import { Router } from 'express';
import authRouter from './auth';
import ordersRouter from './orders';
import usersRouter from './users';
import sheetData from './sheetData';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

router.use('/auth', authRouter);
router.use('/orders', ordersRouter);
router.use('/users', usersRouter);
router.use('/sheetdata', sheetData);

export default router;
