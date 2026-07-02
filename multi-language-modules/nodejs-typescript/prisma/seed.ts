import bcrypt from 'bcrypt';
import { prisma } from '../src/database/prisma';

async function main() {
  const passwordHash = await bcrypt.hash('Password123', 12);
  await prisma.user.upsert({
    where: { email: 'demo@architect-prime.local' },
    update: {
      name: 'Demo Admin',
      role: 'admin',
      status: 'active',
    },
    create: {
      name: 'Demo Admin',
      email: 'demo@architect-prime.local',
      passwordHash,
      role: 'admin',
      status: 'active',
      emailVerified: true,
      metadataJson: JSON.stringify({ seeded: true }),
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
