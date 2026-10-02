import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/db';

const router = Router();

router.use(authenticate);

router.get('/result', async (req, res, next) => {
  try {
    // Determine the latest revealed eviction
    const eviction = await prisma.eviction.findFirst({
      where: { revealed: true },
      orderBy: { revealedAt: 'desc' },
    });

    if (eviction && eviction.teamId === req.user!.sub) {
      return res.json({
        ok: true,
        data: {
          status: 'EVICTED',
          message: 'You have been evicted from Tech Boss.',
        },
      });
    }

    res.json({
      ok: true,
      data: {
        status: 'SAFE',
        message: 'You are currently safe.',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
