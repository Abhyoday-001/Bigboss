import { prisma } from '../utils/db';

export class TimerService {
  static async setTimer(scope: string, durationSeconds: number, label: string) {
    const endsAt = new Date(Date.now() + durationSeconds * 1000);
    
    // We assume 1 active timer per scope at a time for simplicity.
    const existing = await prisma.timer.findFirst({ where: { scope } });
    
    if (existing) {
      return prisma.timer.update({
        where: { id: existing.id },
        data: { endsAt, status: 'RUNNING', label, pausedRemainingMs: null },
      });
    }

    return prisma.timer.create({
      data: { scope, endsAt, status: 'RUNNING', label },
    });
  }

  static async pauseTimer(scope: string) {
    const timer = await prisma.timer.findFirst({ where: { scope } });
    if (!timer || timer.status !== 'RUNNING' || !timer.endsAt) return null;

    const remaining = timer.endsAt.getTime() - Date.now();
    return prisma.timer.update({
      where: { id: timer.id },
      data: { status: 'PAUSED', pausedRemainingMs: remaining, endsAt: null },
    });
  }

  static async resumeTimer(scope: string) {
    const timer = await prisma.timer.findFirst({ where: { scope } });
    if (!timer || timer.status !== 'PAUSED' || !timer.pausedRemainingMs) return null;

    const endsAt = new Date(Date.now() + timer.pausedRemainingMs);
    return prisma.timer.update({
      where: { id: timer.id },
      data: { status: 'RUNNING', endsAt, pausedRemainingMs: null },
    });
  }

  static async clearTimer(scope: string) {
    const timer = await prisma.timer.findFirst({ where: { scope } });
    if (!timer) return null;

    return prisma.timer.update({
      where: { id: timer.id },
      data: { status: 'ENDED', endsAt: null, pausedRemainingMs: null },
    });
  }

  static async getActiveTimers() {
    return prisma.timer.findMany({
      where: { status: { in: ['RUNNING', 'PAUSED'] } },
    });
  }
}
