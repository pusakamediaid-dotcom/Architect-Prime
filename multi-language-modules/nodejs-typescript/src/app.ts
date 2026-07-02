import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const openApiDocument = {
  openapi: '3.0.3',
  info: { title: 'Architect-Prime Node API', version: '1.0.0' },
  paths: {
    '/health': { get: { summary: 'Health check', responses: { '200': { description: 'OK' } } } },
    '/api/auth/register': { post: { summary: 'Register demo user', responses: { '201': { description: 'Created' } } } },
    '/api/auth/login': { post: { summary: 'Login demo user', responses: { '200': { description: 'OK' } } } },
    '/api/users': { get: { summary: 'List users', responses: { '200': { description: 'OK' } } }, post: { summary: 'Create user', responses: { '201': { description: 'Created' } } } },
  },
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'architect-prime-nodejs', timestamp: new Date().toISOString() });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

app.use(errorHandler);

export default app;
