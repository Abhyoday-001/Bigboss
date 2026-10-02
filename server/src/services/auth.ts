import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/db';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import { JwtPayload } from '../middleware/auth';

export class AuthService {
  static async loginTeam(code: string, passwordPlain: string) {
    const team = await prisma.team.findUnique({ where: { code } });
    if (!team) {
      throw new UnauthorizedError('Invalid login credentials');
    }

    const isValid = await bcrypt.compare(passwordPlain, team.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid login credentials');
    }

    const payload: JwtPayload = { sub: team.id, role: 'TEAM' };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

    return { token, team };
  }

  static async loginAdmin(username: string, passwordPlain: string) {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      throw new UnauthorizedError('Invalid admin credentials');
    }

    const isValid = await bcrypt.compare(passwordPlain, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid admin credentials');
    }

    const role = admin.role as 'ADMIN' | 'JUDGE';
    const payload: JwtPayload = { sub: admin.id, role };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

    return { token, admin };
  }
}
