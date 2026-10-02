import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

import healthRouter from './routes/health';
import authRouter from './routes/auth';
import eventRouter from './routes/event';
import teamRouter from './routes/team';
import votingRouter from './routes/voting';
import featuresRouter from './routes/features';
import finalRouter from './routes/final';
import evictionRouter from './routes/eviction';

const app = express();
const httpServer = createServer(app);

const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

app.use(helmet());
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

// Strict rate limiting for REST
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Routes
app.use('/', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/event', eventRouter);
app.use('/api/team', teamRouter);
app.use('/api/voting', votingRouter);
app.use('/api/features', featuresRouter);
app.use('/api/final', finalRouter);
app.use('/api/eviction', evictionRouter);

// Global Error Handler
app.use(errorHandler);

// Sockets Configuration
const participantNamespace = io.of('/participant');
const adminNamespace = io.of('/admin');

import { registerParticipantHandlers } from './sockets/participant';
import { registerAdminHandlers } from './sockets/admin';

registerParticipantHandlers(participantNamespace);
registerAdminHandlers(adminNamespace);

httpServer.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

export { app, io };
