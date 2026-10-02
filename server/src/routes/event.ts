import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { StateService } from '../services/state';
import { LeaderboardService } from '../services/leaderboard';
import { TimerService } from '../services/timer';

const router = Router();

router.get('/state', authenticate, async (req, res, next) => {
  try {
    const state = await StateService.getState();
    const timers = await TimerService.getActiveTimers();
    // Reformat slightly to match frontend expectations if necessary
    res.json({
      ok: true,
      data: {
        currentPhase: state.phase,
        phaseLabel: state.phase, // Optionally mapped
        roundNumber: 0, // Calculate based on phase if needed
        status: state.paused ? 'PAUSED' : 'RUNNING',
        frozen: state.frozen,
        timers,
        lastUpdated: state.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', authenticate, async (req, res, next) => {
  try {
    const leaderboard = await LeaderboardService.getLeaderboard();
    res.json({ ok: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
});

export default router;
