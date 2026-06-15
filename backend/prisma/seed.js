const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { id: 1 } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: 1,
        email: 'default@facefile.local',
        passwordHash: await bcrypt.hash('changeme', 10),
      },
    });
    console.log('Default user created (id=1)');
  } else {
    console.log('Default user already exists');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
