import { prisma } from '../utils/db';

export class AuditService {
  static async log(params: {
    actorType: 'SYSTEM' | 'ADMIN' | 'PARTICIPANT';
    actorId: string;
    action: string;
    entity: string;
    entityId: string;
    before?: any;
    after?: any;
    ip?: string;
  }) {
    await prisma.auditLog.create({
      data: {
        actorType: params.actorType,
        actorId: params.actorId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        before: params.before || null,
        after: params.after || null,
        ip: params.ip,
      },
    });
  }
}
