import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/db';

const router = Router();

router.use(authenticate);

router.get('/features', async (req, res, next) => {
  try {
    // Only return features that have been revealed
    const features = await prisma.feature.findMany({
      where: { revealed: true },
    });

    res.json({
      ok: true,
      data: features,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
