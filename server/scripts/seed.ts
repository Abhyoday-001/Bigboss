import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { DEFAULT_CONFIG } from '../src/services/config';

const prisma = new PrismaClient();

async function main() {
  // Config
  await prisma.eventConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      config: DEFAULT_CONFIG,
    },
  });

  // State
  await prisma.eventState.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      phase: 'LANDING',
    },
  });

  // Admin
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'admin123';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  
  await prisma.admin.upsert({
    where: { username: process.env.ADMIN_BOOTSTRAP_USERNAME || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_BOOTSTRAP_USERNAME || 'admin',
      passwordHash: hashedAdminPassword,
      role: 'ADMIN',
    },
  });

  // Judge
  await prisma.admin.upsert({
    where: { username: 'judge1' },
    update: {},
    create: {
      username: 'judge1',
      passwordHash: await bcrypt.hash('judge123', 10),
      role: 'JUDGE',
    },
  });

  // 10 Teams
  for (let i = 1; i <= 10; i++) {
    const teamCode = `team-${i.toString().padStart(2, '0')}`;
    const password = `pass${i}`;
    const hashed = await bcrypt.hash(password, 10);
    
    await prisma.team.upsert({
      where: { code: teamCode },
      update: {},
      create: {
        code: teamCode,
        name: `Team ${i}`,
        passwordHash: hashed,
        members: {
          create: [
            { name: `Member A of Team ${i}` },
            { name: `Member B of Team ${i}` },
          ]
        }
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
