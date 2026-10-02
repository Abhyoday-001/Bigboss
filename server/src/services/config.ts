import { prisma } from '../utils/db';

export const DEFAULT_CONFIG = {
  evictionCount: 3,
  nominationPercent: 0.3,
  voterRoles: ['PARTICIPANT', 'JUDGE'],
  captainPerks: {
    bonusPoints: 50,
    hasImmunity: true,
    nominationPower: 2,
  },
  secretMissionRewards: {
    FIRST: { points: 100, penalty: -50 },
    MIDDLE: { points: 150, "penalty": -25 },
    LAST: { points: 200, "penalty": 0 },
  },
  round4PointsPerFeature: 50,
  round4PenaltyPerOutOfScope: 25,
  round1MaxAttempts: 3,
  round1AttemptCooldownMs: 60000,
};

export class ConfigService {
  static async getConfig() {
    let configDoc = await prisma.eventConfig.findUnique({ where: { id: 1 } });
    if (!configDoc) {
      configDoc = await prisma.eventConfig.create({
        data: { id: 1, config: DEFAULT_CONFIG },
      });
    }
    return configDoc.config as typeof DEFAULT_CONFIG;
  }

  static async updateConfig(newConfig: Partial<typeof DEFAULT_CONFIG>) {
    const currentConfig = await this.getConfig();
    const updated = { ...currentConfig, ...newConfig };
    
    await prisma.eventConfig.update({
      where: { id: 1 },
      data: {
        config: updated,
        version: { increment: 1 },
      },
    });

    return updated;
  }
}
