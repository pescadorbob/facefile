const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  active: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * @typedef {Object} UserRepository
 * @property {(filter?: {active?: boolean}) => Promise<User[]>} findAll
 * @property {(id: number) => Promise<User|null>} findById
 * @property {(email: string) => Promise<User|null>} findByEmail
 * @property {(data: object) => Promise<User>} create
 * @property {(id: number, data: object) => Promise<User>} update
 */
const userRepository = {
  findAll(filter = {}) {
    return prisma.user.findMany({
      where: filter.active !== undefined ? { active: filter.active } : {},
      orderBy: { id: 'asc' },
      select: USER_FIELDS,
    });
  },

  findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: USER_FIELDS,
    });
  },

  findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      select: USER_FIELDS,
    });
  },

  create(data) {
    return prisma.user.create({
      data,
      select: USER_FIELDS,
    });
  },

  update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: USER_FIELDS,
    });
  },
};

module.exports = userRepository;
