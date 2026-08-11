function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

function notFound(message) {
  return Object.assign(new Error(message), { status: 404 });
}

function conflict(message) {
  return Object.assign(new Error(message), { status: 409 });
}

function createUserService(repository) {
  return {
    async listAll() {
      return repository.findAll();
    },

    async getOrThrow(id) {
      const user = await repository.findById(id);
      if (!user) throw notFound('User not found');
      return user;
    },

    async create({ name, email }) {
      if (!name?.trim()) throw badRequest('name is required');
      if (!email?.trim()) throw badRequest('email is required');

      const existing = await repository.findByEmail(email.trim());
      if (existing) throw conflict('email is already in use');

      return repository.create({ name: name.trim(), email: email.trim() });
    },

    async update(id, { name, email }) {
      await this.getOrThrow(id);

      const data = {};
      if (name !== undefined) {
        if (!name?.trim()) throw badRequest('name cannot be blank');
        data.name = name.trim();
      }
      if (email !== undefined) {
        if (!email?.trim()) throw badRequest('email cannot be blank');
        const existing = await repository.findByEmail(email.trim());
        if (existing && existing.id !== id) throw conflict('email is already in use');
        data.email = email.trim();
      }

      return repository.update(id, data);
    },

    async deactivate(id) {
      await this.getOrThrow(id);
      return repository.update(id, { active: false });
    },

    async reactivate(id) {
      await this.getOrThrow(id);
      return repository.update(id, { active: true });
    },
  };
}

module.exports = { createUserService };
