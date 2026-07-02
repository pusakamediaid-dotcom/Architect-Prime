import { beforeEach, afterAll } from 'vitest';
import { prisma, disconnectDatabase } from '../database/prisma';

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await disconnectDatabase();
});
