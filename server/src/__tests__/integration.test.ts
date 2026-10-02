import { PrismaClient } from '@prisma/client';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc, Socket } from 'socket.io-client';
import { IntegrationService } from '../services/integration';
import { registerParticipantHandlers } from '../sockets/participant';

const prisma = new PrismaClient();

describe('End-to-End Socket Integration', () => {
  let io: Server;
  let clientSocket: Socket;
  let httpServer: any;
  let service: typeof IntegrationService;

  beforeAll(async () => {
    httpServer = createServer();
    io = new Server(httpServer);
    service = IntegrationService;

    // Mock io.server for namespace access
    (io as any).server = {
      of: () => ({ emit: () => {} })
    };
    registerParticipantHandlers(io as any);

    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        const port = httpServer.address().port;
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ sub: 'team-01', role: 'TEAM' }, process.env.JWT_SECRET || '1234567890123456');
        clientSocket = ioc(`http://localhost:${port}`, { auth: { token } });
        clientSocket.on('connect', () => resolve());
      });
    });
  });

  afterAll(async () => {
    clientSocket.disconnect();
    io.close();
    httpServer.close();
    await prisma.$disconnect();
  });

  it('R0: should receive round0:submit and return score', async () => {
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        clientSocket.emit('round0:submit', { answers: { q1: '1' }, timeTakenSeconds: 30 }, (result: any) => {
          expect(result.score).toBeDefined();
          expect(result.correctCount).toBeDefined();
          resolve();
        });
      }, 200);

      // Fallback in case backend emits round0:result
      clientSocket.once('round0:result', (result) => {
        expect(result.score).toBeDefined();
        expect(result.correctCount).toBeDefined();
        resolve();
      });
      clientSocket.once('round0:error', (err) => {
        reject(new Error(err.error));
      });
    });
  });

  it('R1: should receive verification:ready', async () => {
    await new Promise<void>((done) => {
      clientSocket.emit('verification:ready', { round: 1, elapsedMs: 10000, checklist: {} });
      setTimeout(async () => {
        const count = await prisma.verificationReady.count({ where: { teamId: 'team-01' } });
        expect(count).toBeGreaterThan(0);
        done();
      }, 500);
    });
  });

  it('R2: should handle secret:respond', async () => {
    await new Promise<void>((done) => {
      prisma.secretMission.create({
        data: {
          title: 'Mock Mission',
          brief: 'Mock Brief',
          slot: 'FIRST',
          assignedTeamId: 'team-01',
          reward: 100,
          penalty: 50,
          status: 'OFFERED',
        }
      }).then((mission) => {
        clientSocket.emit('secret:respond', { missionId: mission.id, accept: true });
        setTimeout(async () => {
          const attempt = await prisma.secretMission.findFirst({ where: { id: mission.id } });
          expect(attempt?.status).toBe('ACCEPTED');
          done();
        }, 500);
      });
    });
  });

});
