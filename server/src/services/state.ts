import { prisma } from '../utils/db';
import { AuditService } from './audit';
import { io } from '../index'; // Note: circular import resolution handled by exporting io correctly or passing instance
import { StateError } from '../utils/errors';

export class StateService {
  static async getState() {
    let state = await prisma.eventState.findUnique({ where: { id: 1 } });
    if (!state) {
      state = await prisma.eventState.create({
        data: { phase: 'LANDING' },
      });
    }
    return state;
  }

  static async advancePhase(actorId: string, nextPhase: string) {
    const currentState = await this.getState();

    // Inside a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const state = await tx.eventState.update({
        where: { id: 1 },
        data: {
          phase: nextPhase,
          previousPhase: currentState.phase,
          seq: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorId,
          action: 'PHASE_ADVANCE',
          entity: 'EventState',
          entityId: '1',
          before: { phase: currentState.phase },
          after: { phase: nextPhase },
        },
      });

      return state;
    });

    return updated;
  }

  static async toggleFreeze(actorId: string) {
    const currentState = await this.getState();
    const updated = await prisma.eventState.update({
      where: { id: 1 },
      data: {
        frozen: !currentState.frozen,
        seq: { increment: 1 },
      },
    });

    await AuditService.log({
      actorType: 'ADMIN',
      actorId,
      action: 'TOGGLE_FREEZE',
      entity: 'EventState',
      entityId: '1',
      after: { frozen: updated.frozen },
    });

    return updated;
  }
}
