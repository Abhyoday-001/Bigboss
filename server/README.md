# Tech Boss Backend

Production-grade, real-time backend for Tech Boss (Bigg Boss-themed tech event) by Cognito Club, JAIN University.

## Tech Stack
- **Node.js** + **TypeScript**
- **Express.js** (REST API) + **Socket.IO** (Real-time Events)
- **PostgreSQL** via **Prisma ORM**
- **Zod** (Validation)
- **JWT** (Auth)
- **Pino** (Structured Logging)

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Database (Ensure Postgres is running):
   ```bash
   npx prisma migrate dev --name init
   ```

4. Seed the database with demo teams and admins:
   ```bash
   npx ts-node scripts/seed.ts
   ```

5. Run in development:
   ```bash
   npm run dev
   ```

## Production Deployment (Railway)
1. Set the `DATABASE_URL`, `JWT_SECRET`, and other environment variables in the Railway dashboard.
2. The start script in `package.json` should run `prisma migrate deploy` before starting the server.
3. Railway provides built-in Postgres databases which can be directly attached.

## Event-Day Runbook
- **Freeze Mode:** In case of emergency or unexpected behavior, admins can trigger a global freeze using the `freeze:toggle` socket event from the admin dashboard. This stops all participant mutations.
- **Exporting Data:** Navigate to `/api/admin/export` or run `npm run export` (to be implemented) to take a snapshot of the audit log and current scores.
- **Restarts:** If the server crashes, it will recover gracefully upon restart, pulling active timers and sequence numbers from Postgres. Clients will automatically reconnect and request state synchronization.
