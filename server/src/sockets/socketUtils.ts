import { StateService } from '../services/state';
import { TimerService } from '../services/timer';
import { LeaderboardService } from '../services/leaderboard';

export interface SocketAck {
  ok: boolean;
  data?: any;
  code?: string;
  message?: string;
}

export const buildSnapshot = async () => {
  const [state, timers, leaderboard] = await Promise.all([
    StateService.getState(),
    TimerService.getActiveTimers(),
    LeaderboardService.getLeaderboard(),
  ]);

  return {
    state,
    timers,
    leaderboard,
  };
};

export const wrapAck = (promise: Promise<any>, callback?: (ack: SocketAck) => void) => {
  if (!callback) return;
  promise
    .then((data) => callback({ ok: true, data }))
    .catch((err) => {
      callback({
        ok: false,
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'An error occurred',
      });
    });
};
