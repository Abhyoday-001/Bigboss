import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { prisma } from '../utils/db';
import { LeaderboardService } from '../services/leaderboard';
import { StateService } from '../services/state';

const router = Router();

router.use(authenticate);
router.use(requireRole(['TEAM']));

router.get('/me', async (req, res, next) => {
  try {
    const teamId = req.user!.sub;
    const leaderboard = await LeaderboardService.getLeaderboard();
    const myTeam = leaderboard.find((t) => t.id === teamId);
    
    const dbTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    res.json({
      ok: true,
      data: {
        ...dbTeam,
        ...myTeam, // Overwrite with rank and score
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me/nomination', async (req, res, next) => {
  try {
    const teamId = req.user!.sub;
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    
    if (team?.status === 'NOMINATED') {
      const nomination = await prisma.nomination.findFirst({
        where: { teamId },
        orderBy: { round: 'desc' },
      });
      res.json({
        ok: true,
        data: {
          isNominated: true,
          reason: nomination?.reason || 'Nominated by Captain or Peers',
          nextSteps: 'Prepare for the Immunity Challenge',
        },
      });
    } else {
      res.json({ ok: true, data: { isNominated: false } });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/me/secret-mission', async (req, res, next) => {
  try {
    const teamId = req.user!.sub;
    const state = await StateService.getState();
    
    // Only return mission if we are at or past ROUND_2_SECRET_TASK
    if (!state.phase.includes('ROUND_2') && !state.phase.includes('ROUND_3') && !state.phase.includes('ROUND_4')) {
      return res.json({ ok: true, data: { isAssigned: false } });
    }

    const mission = await prisma.secretMission.findFirst({
      where: { assignedTeamId: teamId },
    });

    if (mission) {
      res.json({
        ok: true,
        data: {
          isAssigned: true,
          brief: mission.brief,
          status: mission.status,
        },
      });
    } else {
      // Identical structure to avoid sniffing
      res.json({ ok: true, data: { isAssigned: false } });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/me/immunity', async (req, res, next) => {
  try {
    const teamId = req.user!.sub;
    const pairing = await prisma.immunityPairing.findFirst({
      where: {
        OR: [{ nominatedTeamId: teamId }, { safeTeamId: teamId }],
      },
    });

    if (pairing) {
      const isNominated = pairing.nominatedTeamId === teamId;
      const partnerId = isNominated ? pairing.safeTeamId : pairing.nominatedTeamId;
      const partner = await prisma.team.findUnique({ where: { id: partnerId } });

      res.json({
        ok: true,
        data: {
          isParticipating: true,
          pairedTeam: {
            id: partner?.id,
            name: partner?.name,
            role: isNominated ? 'SAFE' : 'NOMINATED', // The partner's role
          },
          challenge: {
            title: 'Blind Pair Programming',
            description: 'The safe team member types, while the nominated team member dictates.',
          },
          outcome: pairing.outcome,
        },
      });
    } else {
      res.json({ ok: true, data: { isParticipating: false } });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
