import dotenv from 'dotenv';

dotenv.config();

const production = process.env.NODE_ENV === 'production';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  logHttp: process.env.LOG_HTTP !== 'false',
};

if (production && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production.');
}

if (production && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in production.');
}
