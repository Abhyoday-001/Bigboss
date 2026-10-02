import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/db';

const router = Router();

const loginTeamSchema = z.object({
  code: z.string(),
  password: z.string(),
});

const loginAdminSchema = z.object({
  username: z.string(),
  password: z.string(),
});

router.post('/team/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, password } = loginTeamSchema.parse(req.body);
    const result = await AuthService.loginTeam(code, password);
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = loginAdminSchema.parse(req.body);
    const result = await AuthService.loginAdmin(username, password);
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role === 'TEAM') {
      const team = await prisma.team.findUnique({
        where: { id: req.user!.sub },
        include: { members: true },
      });
      res.json({ ok: true, data: { user: team, role: 'TEAM' } });
    } else {
      const admin = await prisma.admin.findUnique({
        where: { id: req.user!.sub },
      });
      res.json({ ok: true, data: { user: admin, role: admin?.role } });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
