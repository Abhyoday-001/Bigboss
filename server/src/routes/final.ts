import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { prisma } from '../utils/db';
import { z } from 'zod';
import { StateService } from '../services/state';

const router = Router();

router.use(authenticate);

router.get('/submission', requireRole(['TEAM']), async (req, res, next) => {
  try {
    const teamId = req.user!.sub;
    const submission = await prisma.finalSubmission.findUnique({
      where: { teamId },
    });

    if (submission) {
      res.json({
        ok: true,
        data: {
          submitted: true,
          url: submission.url,
          status: submission.lockedAt ? 'SCORED' : 'SUBMITTED',
          submittedAt: submission.submittedAt,
        },
      });
    } else {
      res.json({ ok: true, data: { submitted: false } });
    }
  } catch (err) {
    next(err);
  }
});

const submitSchema = z.object({ url: z.string().url() });

router.post('/submission', requireRole(['TEAM']), async (req, res, next) => {
  try {
    const { url } = submitSchema.parse(req.body);
    const teamId = req.user!.sub;

    const state = await StateService.getState();
    if (state.phase !== 'ROUND_4_SUBMISSION' && state.phase !== 'ROUND_4_FEATURES_REVEALED') {
      return res.status(400).json({ ok: false, message: 'Submissions are not currently open.' });
    }

    const existing = await prisma.finalSubmission.findUnique({ where: { teamId } });
    if (existing?.lockedAt) {
      return res.status(403).json({ ok: false, message: 'Your submission has been locked and cannot be updated.' });
    }

    await prisma.finalSubmission.upsert({
      where: { teamId },
      update: { url, submittedAt: new Date() },
      create: { teamId, url },
    });

    res.json({ ok: true, data: { success: true } });
  } catch (err) {
    next(err);
  }
});

router.get('/results', async (req, res, next) => {
  try {
    const state = await StateService.getState();
    if (state.phase !== 'FINAL_RESULTS') {
      return res.json({ ok: true, data: null }); // Don't reveal yet
    }

    // Pull leaderboard logic (which is already ranked)
    const { LeaderboardService } = require('../services/leaderboard');
    const leaderboard = await LeaderboardService.getLeaderboard();

    res.json({
      ok: true,
      data: {
        winner: leaderboard[0],
        rankings: leaderboard,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
