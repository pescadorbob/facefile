const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * @typedef {Object} PalaceRepository
 * @property {(userId: number) => Promise<Palace[]>} findAllByUser
 */
const palaceRepository = {
  findAllByUser(userId) {
    return prisma.palace.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
      include: {
        loci: { orderBy: { position: 'asc' } },
      },
    });
  },
};

module.exports = palaceRepository;
