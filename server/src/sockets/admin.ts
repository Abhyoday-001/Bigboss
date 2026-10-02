import { Namespace, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { buildSnapshot, wrapAck } from './socketUtils';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../middleware/auth';
import { StateService } from '../services/state';
import { TimerService } from '../services/timer';
import { prisma } from '../utils/db';
import { AuditService } from '../services/audit';

export const registerAdminHandlers = (io: Namespace) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: Missing token'));

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      if (payload.role !== 'ADMIN' && payload.role !== 'JUDGE') {
        return next(new Error('Authentication error: Invalid role'));
      }
      socket.data.user = payload;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const adminId = socket.data.user.sub;
    logger.info(`Admin socket connected: ${socket.id} (Admin: ${adminId})`);
    
    try {
      const snapshot = await buildSnapshot();
      socket.emit('state:snapshot', snapshot);
    } catch (err) {
      logger.error(err, 'Failed to send initial snapshot');
    }

    socket.on('phase:advance', (nextPhase: string, callback) => {
      const promise = async () => {
        const state = await StateService.advancePhase(adminId, nextPhase);
        io.server.of('/participant').emit('phase:changed', state);
        io.emit('phase:changed', state);
        return state;
      };
      wrapAck(promise(), callback);
    });

    socket.on('freeze:toggle', (callback) => {
      const promise = async () => {
        const state = await StateService.toggleFreeze(adminId);
        io.server.of('/participant').emit('server:freeze', state.frozen);
        io.emit('server:freeze', state.frozen);
        return state;
      };
      wrapAck(promise(), callback);
    });

    socket.on('timer:set', ({ scope, durationSeconds, label }, callback) => {
      const promise = async () => {
        const timer = await TimerService.setTimer(scope, durationSeconds, label);
        io.server.of('/participant').emit('timer:updated', timer);
        io.emit('timer:updated', timer);
        return timer;
      };
      wrapAck(promise(), callback);
    });

    socket.on('timer:pause', (scope, callback) => {
      const promise = async () => {
        const timer = await TimerService.pauseTimer(scope);
        if (timer) {
          io.server.of('/participant').emit('timer:updated', timer);
          io.emit('timer:updated', timer);
        }
        return timer;
      };
      wrapAck(promise(), callback);
    });

    socket.on('timer:resume', (scope, callback) => {
      const promise = async () => {
        const timer = await TimerService.resumeTimer(scope);
        if (timer) {
          io.server.of('/participant').emit('timer:updated', timer);
          io.emit('timer:updated', timer);
        }
        return timer;
      };
      wrapAck(promise(), callback);
    });

    socket.on('score:adjust', ({ teamId, delta, reason }, callback) => {
      const promise = async () => {
        const entry = await prisma.scoreEntry.create({
          data: {
            teamId,
            delta,
            reason,
            source: 'ADMIN',
            actorId: adminId,
          }
        });
        
        await AuditService.log({
          actorType: 'ADMIN', actorId: adminId, action: 'SCORE_ADJUST',
          entity: 'ScoreEntry', entityId: entry.id, after: entry,
        });

        const { LeaderboardService } = require('../services/leaderboard');
        const lb = await LeaderboardService.getLeaderboard();
        io.server.of('/participant').emit('leaderboard:updated', lb);
        io.emit('leaderboard:updated', lb);
        return entry;
      };
      wrapAck(promise(), callback);
    });

    socket.on('nominations:set', ({ teamIds, round }, callback) => {
      const promise = async () => {
        await prisma.team.updateMany({
          where: { id: { in: teamIds } },
          data: { status: 'NOMINATED' },
        });

        for (const tid of teamIds) {
          await prisma.nomination.create({
            data: { teamId: tid, round, reason: 'Admin overridden', createdBy: adminId },
          });
        }

        io.server.of('/participant').emit('nomination:updated');
        io.emit('nomination:updated');
        return true;
      };
      wrapAck(promise(), callback);
    });

    socket.on('secret:assign', ({ teamId, title, brief, reward, penalty, slot }, callback) => {
      const promise = async () => {
        const mission = await prisma.secretMission.create({
          data: { title, brief, reward, penalty, slot, status: 'PENDING', assignedTeamId: teamId }
        });
        
        io.server.of('/participant').to(`team:${teamId}`).emit('secret:assigned', mission);
        io.emit('secret:assigned', mission); // to all admins
        return mission;
      };
      wrapAck(promise(), callback);
    });

    socket.on('voting:open', ({ round, durationSeconds }, callback) => {
      const promise = async () => {
        const endsAt = durationSeconds ? new Date(Date.now() + durationSeconds * 1000) : null;
        const window = await prisma.votingWindow.create({
          data: { round, status: 'OPEN', opensAt: new Date(), closesAt: endsAt }
        });
        io.server.of('/participant').emit('voting:status', 'OPEN');
        io.emit('voting:status', 'OPEN');
        return window;
      };
      wrapAck(promise(), callback);
    });

    socket.on('voting:close', (windowId, callback) => {
      const promise = async () => {
        const window = await prisma.votingWindow.update({
          where: { id: windowId },
          data: { status: 'CLOSED' }
        });
        io.server.of('/participant').emit('voting:status', 'CLOSED');
        io.emit('voting:status', 'CLOSED');
        return window;
      };
      wrapAck(promise(), callback);
    });

    socket.on('eviction:reveal', ({ teamId, round }, callback) => {
      const promise = async () => {
        const eviction = await prisma.eviction.create({
          data: { teamId, round, revealed: true, revealedAt: new Date() }
        });

        await prisma.team.update({
          where: { id: teamId },
          data: { status: 'EVICTED' },
        });

        io.server.of('/participant').emit('eviction:revealed', { teamId, status: 'EVICTED' });
        io.emit('eviction:revealed', { teamId, status: 'EVICTED' });

        const { LeaderboardService } = require('../services/leaderboard');
        const lb = await LeaderboardService.getLeaderboard();
        io.server.of('/participant').emit('leaderboard:updated', lb);
        io.emit('leaderboard:updated', lb);

        return eviction;
      };
      wrapAck(promise(), callback);
    });

    socket.on('sync:request', (_, callback) => {
      wrapAck(buildSnapshot(), callback);
    });

    socket.on('disconnect', () => {
      logger.info(`Admin socket disconnected: ${socket.id}`);
    });
  });
};
