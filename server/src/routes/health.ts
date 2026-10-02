import { Router } from 'express';
import { prisma } from '../utils/db';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'Server is running' });
});

router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true, message: 'Database is reachable' });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Database is not reachable' });
  }
});

export default router;
