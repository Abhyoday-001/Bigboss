import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/db';
import { z } from 'zod';
import { ConfigService } from '../services/config';

const router = Router();

router.use(authenticate);

router.get('/data', async (req, res, next) => {
  try {
    const config = await ConfigService.getConfig();
    const window = await prisma.votingWindow.findFirst({
      where: { status: 'OPEN' },
    });

    if (!window) {
      return res.json({
        ok: true,
        data: { candidates: [], allowedRoles: config.voterRoles, hasVoted: false },
      });
    }

    const candidates = await prisma.team.findMany({
      where: { status: 'NOMINATED' },
      select: { id: true, name: true, avatarUrl: true },
    });

    const vote = await prisma.vote.findUnique({
      where: {
        windowId_voterType_voterId: {
          windowId: window.id,
          voterType: req.user!.role,
          voterId: req.user!.sub,
        },
      },
    });

    res.json({
      ok: true,
      data: {
        candidates,
        allowedRoles: config.voterRoles,
        hasVoted: !!vote,
      },
    });
  } catch (err) {
    next(err);
  }
});

const voteSchema = z.object({ candidateId: z.string() });

router.post('/vote', async (req, res, next) => {
  try {
    const { candidateId } = voteSchema.parse(req.body);
    const window = await prisma.votingWindow.findFirst({
      where: { status: 'OPEN' },
    });

    if (!window) {
      return res.status(400).json({ ok: false, message: 'Voting is not open' });
    }

    const config = await ConfigService.getConfig();
    if (!config.voterRoles.includes(req.user!.role as any)) {
      return res.status(403).json({ ok: false, message: 'Your role cannot vote' });
    }

    // Weight calculation
    let weight = 1;
    if (req.user!.role === 'TEAM') {
      const team = await prisma.team.findUnique({ where: { id: req.user!.sub } });
      if (team?.isCaptain) {
        weight = config.captainPerks.nominationPower; // Capt gets 2 votes typically
      }
    }

    await prisma.vote.upsert({
      where: {
        windowId_voterType_voterId: {
          windowId: window.id,
          voterType: req.user!.role,
          voterId: req.user!.sub,
        },
      },
      update: { targetTeamId: candidateId, weight },
      create: {
        windowId: window.id,
        voterType: req.user!.role,
        voterId: req.user!.sub,
        targetTeamId: candidateId,
        weight,
      },
    });

    res.json({ ok: true, data: { success: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
