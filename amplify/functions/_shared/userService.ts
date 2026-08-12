import { badRequest, conflict, notFound } from './http';
import { UserRecord, usersRepo } from './usersRepo';

// Direct port of backend/src/services/userService.js against usersRepo.
export const userService = {
  listAll({ status }: { status?: string } = {}) {
    if (status === undefined) return usersRepo.findAll();
    return usersRepo.findAll({ active: status === 'active' });
  },

  async getOrThrow(id: string): Promise<UserRecord> {
    const user = await usersRepo.findById(id);
    if (!user) throw notFound('User not found');
    return user;
  },

  async create({ name, email }: { name?: string; email?: string }): Promise<UserRecord> {
    if (!name?.trim()) throw badRequest('name is required');
    if (!email?.trim()) throw badRequest('email is required');

    const existing = await usersRepo.findByEmail(email.trim());
    if (existing) throw conflict('email is already in use');

    return usersRepo.create({ name: name.trim(), email: email.trim() });
  },

  /**
   * Self-service profile creation from the picker (S-1.7.4): name only, no
   * email — the admin flow above stays the route for accounts that need one.
   *
   * Names are the only thing distinguishing one tile from another in the
   * picker, so they're the uniqueness key here (case-insensitive, trimmed).
   * DynamoDB can't express that as a condition or a case-insensitive query, so
   * the check reads the (small, single-household) user list and compares in
   * memory — same shape as the admin flow's findByEmail guard, which is
   * likewise a read-then-write rather than a true constraint.
   */
  async createProfile({ name }: { name?: string }): Promise<UserRecord> {
    const trimmed = name?.trim();
    if (!trimmed) throw badRequest('name is required');

    const existing = await usersRepo.findAll();
    if (existing.some((u) => u.name.trim().toLowerCase() === trimmed.toLowerCase())) {
      throw conflict('name is already in use');
    }

    return usersRepo.create({ name: trimmed });
  },

  async update(id: string, { name, email }: { name?: string; email?: string }): Promise<UserRecord> {
    await userService.getOrThrow(id);

    const data: Partial<Pick<UserRecord, 'name' | 'email'>> = {};
    if (name !== undefined) {
      if (!name?.trim()) throw badRequest('name cannot be blank');
      data.name = name.trim();
    }
    if (email !== undefined) {
      if (!email?.trim()) throw badRequest('email cannot be blank');
      const existing = await usersRepo.findByEmail(email.trim());
      if (existing && existing.id !== id) throw conflict('email is already in use');
      data.email = email.trim();
    }

    return usersRepo.update(id, data);
  },

  async deactivate(id: string): Promise<UserRecord> {
    await userService.getOrThrow(id);
    return usersRepo.update(id, { active: false });
  },

  async reactivate(id: string): Promise<UserRecord> {
    await userService.getOrThrow(id);
    return usersRepo.update(id, { active: true });
  },
};
