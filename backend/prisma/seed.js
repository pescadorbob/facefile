const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.findUnique({ where: { id: 1 } });
  if (!user) {
    user = await prisma.user.create({
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

  const palaceCount = await prisma.palace.count({ where: { userId: 1 } });
  if (palaceCount === 0) {
    await prisma.palace.createMany({
      data: [
        { userId: 1, name: 'Childhood Home' },
        { userId: 1, name: 'Secondary School' },
        { userId: 1, name: 'Daily Commute Route' },
      ],
    });
    const palaces = await prisma.palace.findMany({ where: { userId: 1 }, orderBy: { id: 'asc' } });
    const lociData = [
      { palaceId: palaces[0].id, name: 'Front doorstep',      position: 0 },
      { palaceId: palaces[0].id, name: 'Coat rack in hallway', position: 1 },
      { palaceId: palaces[0].id, name: 'Kitchen sink',         position: 2 },
      { palaceId: palaces[0].id, name: 'Dining table',         position: 3 },
      { palaceId: palaces[0].id, name: 'Living room armchair', position: 4 },
      { palaceId: palaces[1].id, name: 'Main entrance gates',  position: 0 },
      { palaceId: palaces[1].id, name: 'Reception desk',       position: 1 },
      { palaceId: palaces[1].id, name: 'Corridor noticeboard', position: 2 },
      { palaceId: palaces[1].id, name: 'Science lab bench',    position: 3 },
      { palaceId: palaces[1].id, name: 'Library reading table', position: 4 },
      { palaceId: palaces[2].id, name: 'Bus stop shelter',     position: 0 },
      { palaceId: palaces[2].id, name: 'Pedestrian crossing',  position: 1 },
      { palaceId: palaces[2].id, name: 'Corner newsagent',     position: 2 },
      { palaceId: palaces[2].id, name: 'Office building lobby', position: 3 },
    ];
    await prisma.locus.createMany({ data: lociData });
    console.log('Seeded 3 palaces with loci for user 1');
  } else {
    console.log('Palaces already seeded');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
