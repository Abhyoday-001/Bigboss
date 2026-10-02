import { Namespace, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { buildSnapshot, wrapAck } from './socketUtils';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../middleware/auth';
import { IntegrationService } from '../services/integration';
import { LeaderboardService } from '../services/leaderboard';

export const registerParticipantHandlers = (io: Namespace) => {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: Missing token'));

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      if (payload.role !== 'TEAM') {
        return next(new Error('Authentication error: Invalid role'));
      }
      socket.data.user = payload;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const teamId = socket.data.user.sub;
    logger.info(`Participant socket connected: ${socket.id} (Team: ${teamId})`);
    
    // Join a specific room for this team to receive targeted events (like secret missions)
    socket.join(`team:${teamId}`);

    // Immediately push the current snapshot
    try {
      const snapshot = await buildSnapshot();
      socket.emit('state:snapshot', snapshot);
    } catch (err) {
      logger.error(err, 'Failed to send initial snapshot');
    }

    socket.on('time:ping', (clientTime: number, callback: Function) => {
      if (typeof callback === 'function') {
        callback({ serverNow: Date.now(), clientTime });
      }
    });

    socket.on('sync:request', (_, callback) => {
      wrapAck(buildSnapshot(), callback);
    });

    socket.on('round0:submit', async (payload: any, callback: Function) => {
      try {
        console.log('Received round0:submit', payload);
        let correctCount = 0;
        let score = 0;
        
        if (payload.answers) {
          // Frontend sends all answers at once
          const entries = Object.entries(payload.answers);
          for (const [qId, ans] of entries) {
            try {
              const isCorrect = await IntegrationService.handleRound0Submit(teamId, qId, ans as string);
              if (isCorrect) {
                correctCount++;
                score += 10;
              }
            } catch (e) {
              console.error('Error on question', qId, e);
            }
          }
        } else if (payload.questionId) {
          // Legacy payload
          try {
            const isCorrect = await IntegrationService.handleRound0Submit(teamId, payload.questionId, payload.answer);
            if (isCorrect) {
              correctCount++;
              score += 10;
            }
          } catch (e) {
            console.error('Error on question', payload.questionId, e);
          }
        }
        
        const lb = await LeaderboardService.getLeaderboard();
        io.server.of('/participant').emit('leaderboard:updated', lb);
        io.server.of('/admin').emit('leaderboard:updated', lb);

        const result = {
          score,
          correctCount,
          totalQuestions: payload.answers ? Object.keys(payload.answers).length : 1,
          timeTakenSeconds: payload.timeTakenSeconds || 0
        };

        console.log('Sending result', result);
        if (typeof callback === 'function') {
          callback(result);
        } else {
          socket.emit('round0:result', result);
        }
      } catch (err: any) {
        console.error('round0:error', err);
        if (typeof callback === 'function') callback({ error: err.message });
        else socket.emit('round0:error', { error: err.message });
      }
    });

    socket.on('verification:ready', ({ round, elapsedMs, checklist }, callback) => {
      const promise = async () => {
        const record = await IntegrationService.handleVerificationReady(teamId, round, elapsedMs, checklist);
        io.server.of('/admin').emit('verification:received', record);
        return record;
      };
      wrapAck(promise(), callback);
    });

    socket.on('secret:respond', ({ missionId, accept }, callback) => {
      const promise = async () => {
        await IntegrationService.handleSecretRespond(teamId, missionId, accept);
        if (accept) {
          const content = IntegrationService.getEventContent();
          return { riddle: content?.secretMission?.riddle };
        }
        return { riddle: null };
      };
      wrapAck(promise(), callback);
    });

    socket.on('secret:submit', ({ missionId, answer }, callback) => {
      const promise = async () => {
        const isCorrect = await IntegrationService.handleSecretSubmit(teamId, missionId, answer);
        const lb = await LeaderboardService.getLeaderboard();
        io.server.of('/participant').emit('leaderboard:updated', lb);
        io.server.of('/admin').emit('leaderboard:updated', lb);
        return { isCorrect };
      };
      wrapAck(promise(), callback);
    });

    socket.on('disconnect', () => {
      logger.info(`Participant socket disconnected: ${socket.id}`);
    });
  });
};
