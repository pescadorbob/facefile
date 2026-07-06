# Skill: Separate Endpoint into Core Business + Repository (Ports and Adapters)

When asked to refactor a route handler, apply the ports-and-adapters pattern: extract a pure domain service (the core) and a Prisma-backed repository (the adapter), connected by an interface defined in the route module or a shared contracts file.

The goal is that the route handler owns HTTP concerns only, the service owns business logic only, and the repository owns persistence only. None of the three layers knows about the internals of the others.

---

## Pattern overview

```
routes/<resource>.js          → HTTP adapter (req/res, status codes, error mapping)
services/<resource>Service.js → core business logic (validation, rules, orchestration)
repositories/<resource>Repository.js → Prisma adapter (all DB access)
```

The service receives a repository instance via constructor injection. The route constructs both and wires them together. No layer reaches past its immediate neighbour.

---

## Step-by-step process

### 1. Read the target route file

Identify every Prisma call. For each call, note:
- **What it returns** (the shape the service will consume)
- **What parameters it needs** (what the service will pass in)
- **Whether it has side-effects** (create/update/delete)

### 2. Define the repository interface (as a comment contract)

At the top of the new repository file, write a JSDoc block listing every method the service will call. This is the "port" — the boundary. The Prisma implementation is the "adapter."

```js
/**
 * @typedef {Object} PalaceRepository
 * @property {(userId: number, options?: object) => Promise<Palace[]>} findAllByUser
 * @property {(id: number, userId: number) => Promise<Palace|null>} findById
 * @property {(data: object) => Promise<Palace>} create
 * @property {(id: number, data: object) => Promise<Palace>} update
 * @property {(id: number) => Promise<void>} remove
 */
```

### 3. Write the repository

- One `PrismaClient` instance per repository (consistent with this codebase's convention).
- Every method maps exactly one Prisma operation — no business logic, no validation.
- Methods accept plain scalars and plain objects; they return plain Prisma result objects.
- Name the file `backend/src/repositories/<resource>Repository.js`.

```js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const palaceRepository = {
  findAllByUser(userId) {
    return prisma.palace.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
      include: { loci: { orderBy: { position: 'asc' } } },
    });
  },

  findById(id, userId) {
    return prisma.palace.findFirst({ where: { id, userId } });
  },

  create(data) {
    return prisma.palace.create({ data });
  },

  update(id, data) {
    return prisma.palace.update({ where: { id }, data });
  },

  remove(id) {
    return prisma.palace.delete({ where: { id } });
  },
};

module.exports = palaceRepository;
```

### 4. Write the service

- Accept the repository as a constructor argument (dependency injection).
- Contains all business rules: validation, authorization checks, domain decisions.
- Never touches `req`, `res`, or HTTP status codes.
- Throws plain `Error` objects (or typed errors) with business-meaningful messages; the route maps these to status codes.
- Name the file `backend/src/services/<resource>Service.js`.

```js
function createPalaceService(repository) {
  return {
    async listForUser(userId) {
      return repository.findAllByUser(userId);
    },

    async getForUser(id, userId) {
      const palace = await repository.findById(id, userId);
      if (!palace) throw Object.assign(new Error('Palace not found'), { status: 404 });
      return palace;
    },

    async create(userId, data) {
      if (!data.name?.trim()) throw Object.assign(new Error('Name is required'), { status: 400 });
      return repository.create({ ...data, userId });
    },

    async update(id, userId, data) {
      await this.getForUser(id, userId); // existence + ownership check
      return repository.update(id, data);
    },

    async remove(id, userId) {
      await this.getForUser(id, userId);
      return repository.remove(id);
    },
  };
}

module.exports = { createPalaceService };
```

### 5. Rewrite the route

- Import the repository and service factory.
- Construct both once at the top of the file.
- Each handler: parse input from `req`, call the service, map the result or error to a response.
- Error mapping: if the thrown error has a `.status` field, use it; otherwise 500.

```js
const express = require('express');
const palaceRepository = require('../repositories/palaceRepository');
const { createPalaceService } = require('../services/palaceService');

const router = express.Router();
const DEFAULT_USER_ID = 1;
const palaceService = createPalaceService(palaceRepository);

function handleError(res, err) {
  res.status(err.status ?? 500).json({ error: err.message });
}

router.get('/', async (req, res) => {
  try {
    const palaces = await palaceService.listForUser(DEFAULT_USER_ID);
    res.json(palaces);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
```

---

## Rules to follow strictly

1. **No Prisma in routes or services.** `PrismaClient` is used only inside `repositories/`.
2. **No HTTP concepts in services.** A service method must not reference `req`, `res`, `status`, or Express.
3. **No business logic in repositories.** A repository method is a thin Prisma call — one query, nothing more.
4. **Injection, not global state.** The service receives its repository as an argument; the route wires them. Do not import `prisma` at the top of a service file.
5. **Errors carry intent.** Throw `Error` objects with a `.status` property for expected failure cases (404, 400, 403); the route's `handleError` maps them. Unexpected failures bubble as 500.
6. **Keep this codebase's file conventions.** CommonJS (`require`/`module.exports`) throughout. No TypeScript, no `import`.
7. **One `PrismaClient` per repository file** — consistent with how other route files work today.

---

## Checklist before finishing

- [ ] `routes/<resource>.js` — no Prisma import, only Express and service calls
- [ ] `services/<resource>Service.js` — no Prisma, no Express; accepts repository via factory arg
- [ ] `repositories/<resource>Repository.js` — only Prisma; no business rules
- [ ] All existing behaviour preserved (same HTTP verbs, same response shapes, same status codes)
- [ ] Error cases are reachable and return the correct status code
- [ ] No new dependencies added beyond what is already in `package.json`
