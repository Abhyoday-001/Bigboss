import fs from 'fs';
import path from 'path';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';

const seedPath = path.join(__dirname, '../../seed/private/event-content.EXAMPLE.json');
let eventContent: any = null;

export const IntegrationService = {
  getEventContent() {
    if (!eventContent) {
      if (fs.existsSync(seedPath)) {
        eventContent = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      } else {
        eventContent = {};
      }
    }
    return eventContent;
  },

  async handleRound0Submit(teamId: string, questionId: string, answer: string) {
    const content = this.getEventContent();
    const q = content?.round0?.questions?.find((x: any) => x.id === questionId);
    if (!q) throw new Error('Question not found');
    
    const isCorrect = (q.answer === answer);
    
    await prisma.round0Answer.create({
      data: { teamId, questionId, answer, isCorrect }
    });

    if (isCorrect) {
      await prisma.scoreEntry.create({
        data: {
          teamId,
          delta: 10,
          reason: `Round 0 Correct Answer for ${questionId}`,
          source: 'SYSTEM',
          actorId: 'SYSTEM'
        }
      });
    }
    return isCorrect;
  },

  async handleVerificationReady(teamId: string, round: number, elapsedMs: number, checklist?: any) {
    return prisma.verificationReady.create({
      data: {
        teamId,
        round,
        elapsedMs,
        checklist
      }
    });
  },

  async getSecretMissionTargets() {
    // Snap leaderboard
    const { LeaderboardService } = require('./leaderboard');
    const lb = await LeaderboardService.getLeaderboard();
    
    if (lb.length === 0) return [];

    const sorted = [...lb].sort((a, b) => b.score - a.score);
    const first = sorted[0];
    const middle = sorted[Math.floor(sorted.length / 2)];
    const last = sorted[sorted.length - 1];

    // unique in case small number of teams
    const targets = Array.from(new Set([first.teamId, middle.teamId, last.teamId]));
    return targets;
  },

  async handleSecretRespond(teamId: string, missionId: string, accept: boolean) {
    const status = accept ? 'ACCEPTED' : 'DECLINED';
    return prisma.secretMission.updateMany({
      where: { id: missionId, assignedTeamId: teamId },
      data: { status }
    });
  },

  async handleSecretSubmit(teamId: string, missionId: string, answer: string) {
    const mission = await prisma.secretMission.findFirst({
      where: { id: missionId, assignedTeamId: teamId }
    });

    if (!mission) throw new Error('Mission not found');

    const content = this.getEventContent();
    const correctAnswer = content?.secretMission?.answer;
    
    const isCorrect = (correctAnswer && answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim());
    
    await prisma.secretMissionAttempt.create({
      data: { missionId, teamId, answer, isCorrect }
    });

    if (isCorrect) {
      await prisma.secretMission.update({
        where: { id: mission.id },
        data: { status: 'COMPLETED' }
      });
      await prisma.scoreEntry.create({
        data: {
          teamId,
          delta: mission.reward,
          reason: 'Secret Mission Success',
          source: 'SYSTEM',
          actorId: 'SYSTEM'
        }
      });
    } else {
      await prisma.secretMission.update({
        where: { id: mission.id },
        data: { status: 'FAILED' }
      });
      await prisma.scoreEntry.create({
        data: {
          teamId,
          delta: -mission.penalty,
          reason: 'Secret Mission Failed',
          source: 'SYSTEM',
          actorId: 'SYSTEM'
        }
      });
    }

    return isCorrect;
  }
};
