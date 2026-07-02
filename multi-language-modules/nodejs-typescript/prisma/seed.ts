import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'demo@architect-prime.local' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@architect-prime.local',
      password: await bcrypt.hash('Password123', 12),
      role: 'admin',
      status: 'active',
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
