# Skill: Separate a Lambda Handler into Core Business + Repository (Ports and Adapters)

When asked to refactor a Lambda handler, apply the ports-and-adapters pattern: extract a pure domain service (the core) and a DynamoDB-backed repository (the adapter), connected by a plain TypeScript interface.

The goal is that the handler owns API Gateway concerns only (parsing the event, mapping results/errors to an `APIGatewayProxyResult`), the service owns business logic only, and the repository owns persistence only. None of the three layers knows about the internals of the others.

---

## Pattern overview

```
functions/<resource>/handler.ts       → API Gateway adapter (event/response, status codes, error mapping)
functions/_shared/<resource>Service.ts → core business logic (validation, rules, orchestration)
functions/_shared/<resource>Repo.ts    → DynamoDB adapter (all persistence)
```

Repositories and services live in `amplify/functions/_shared/` (not per-function) because each Lambda bundles independently via esbuild — a relative import from `_shared/` is inlined into whichever function imports it, so sharing code this way costs nothing at runtime. See `amplify/functions/_shared/usersRepo.ts` + `userService.ts` (used by both the `session` and `admin-users` Lambdas) for a real example.

The service receives a repository instance via constructor injection where the resource has enough surface to warrant it (`usersRepo`); trivial single-call resources (`palacesRepo`) are fine called directly from the handler — see the "when to skip the service layer" rule below.

---

## Step-by-step process

### 1. Read the target handler

Identify every DynamoDB call (`ddb.send(...)`). For each call, note:
- **What it returns** (the shape the service will consume)
- **What parameters it needs** (what the service will pass in)
- **Whether it has side-effects** (Put/Update/Delete)

### 2. Define the repository

- Table name comes from `tableName('SOME_TABLE_NAME')` (`_shared/dynamo.ts`), reading the env var wired up for that specific Lambda in `amplify/backend.ts` — never hardcode a table name.
- Every method maps to one (or a small, cohesive group of) DynamoDB operation — no business logic, no validation.
- Methods accept plain scalars and plain objects; they return plain record types (`interface FooRecord { ... }`).
- Name the file `amplify/functions/_shared/<resource>Repo.ts`.

```ts
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from './dynamo';

const TABLE = () => tableName('PALACES_TABLE_NAME');

export interface PalaceRecord {
  userId: string;
  id: string;
  name: string;
  createdAt: string;
}

export const palacesRepo = {
  async findAllByUser(userId: string): Promise<PalaceRecord[]> {
    // one QueryCommand, no filtering/validation beyond what the query itself needs
  },
};
```

### 3. Write the service (when the resource has real business rules)

- Accept the repository as a factory/constructor argument (dependency injection) — never import a repository singleton directly into a service.
- Contains all business rules: validation, uniqueness checks, domain decisions.
- Never touches the API Gateway event or an `APIGatewayProxyResult`.
- Throws `ApiError` (`_shared/http.ts` — `badRequest`, `notFound`, `conflict`, etc.) with business-meaningful messages; the handler's `errorResponse()` maps these to status codes.
- Name the file `amplify/functions/_shared/<resource>Service.ts`.

```ts
import { badRequest, conflict, notFound } from './http';
import { UserRecord, usersRepo } from './usersRepo';

export const userService = {
  async create({ name, email }: { name?: string; email?: string }): Promise<UserRecord> {
    if (!name?.trim()) throw badRequest('name is required');
    const existing = await usersRepo.findByEmail(email!.trim());
    if (existing) throw conflict('email is already in use');
    return usersRepo.create({ name: name.trim(), email: email!.trim() });
  },
};
```

**When to skip the service layer**: if a resource is a single passthrough call with no validation or business rule (list-only, e.g. `palacesRepo.findAllByUser`), call the repository directly from the handler rather than adding a one-line service wrapper — see `functions/palaces/handler.ts`. Add the service layer the moment a second rule shows up.

### 4. Rewrite the handler

- Import the repository/service.
- Dispatch on `event.httpMethod` + a sub-path derived by stripping this function's own mount prefix from `event.path` (each Lambda is mounted at exactly one API Gateway resource — see `amplify/backend.ts`'s `mountLambda` calls — so the handler only ever needs to route within its own subtree).
- Each branch: parse input from the event, call the service/repository, return via `json()`/`noContent()` (`_shared/http.ts`).
- Error mapping: wrap the whole dispatch in one `try { ... } catch (err) { return errorResponse(err); }` — `errorResponse` reads `ApiError.status` when present, otherwise 500.

```ts
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, json, preflight } from '../_shared/http';
import { palacesRepo } from '../_shared/palacesRepo';
import { resolveUserId } from '../_shared/session';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  const sub = (event.path.replace(/^\/palaces/, '') || '/').replace(/\/+$/, '') || '/';

  try {
    if (event.httpMethod === 'GET' && sub === '/') {
      return json(200, await palacesRepo.findAllByUser(resolveUserId(event)));
    }
    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};
```

---

## Rules to follow strictly

1. **No DynamoDB SDK calls in handlers or services.** `ddb.send(...)` is used only inside `_shared/<resource>Repo.ts`.
2. **No API Gateway concepts in services.** A service method must not reference `event`, `APIGatewayProxyResult`, or status codes.
3. **No business logic in repositories.** A repository method is a thin DynamoDB call — one query/put/update, nothing more.
4. **Injection, not global state.** A service that needs a repository takes it as an argument; don't reach for a repository singleton from inside a service module.
5. **Errors carry intent.** Throw `ApiError` subtypes (`_shared/http.ts`) for expected failure cases (404, 400, 409); the handler's `errorResponse()` maps them. Unexpected failures bubble as 500.
6. **Keep this codebase's file conventions.** TypeScript throughout in `amplify/`, ESM (`import`/`export`), one function per API Gateway resource mount.
7. **Table/bucket names always come from env vars** (`tableName('X_TABLE_NAME')`, `requiredEnv('X_BUCKET_NAME')`) wired per-function in `amplify/backend.ts` — a function should only have env vars for the tables it's actually granted access to.

---

## Checklist before finishing

- [ ] `functions/<resource>/handler.ts` — no `ddb.send`/S3 calls, only dispatch + service/repository calls
- [ ] `functions/_shared/<resource>Service.ts` (if present) — no DynamoDB SDK, no API Gateway types; accepts repository via factory arg
- [ ] `functions/_shared/<resource>Repo.ts` — only DynamoDB SDK calls; no business rules
- [ ] All existing behaviour preserved (same HTTP verbs, same response shapes, same status codes)
- [ ] Error cases are reachable and return the correct status code via `ApiError`
- [ ] Any new table access is granted + wired (`grantReadData`/`grantReadWriteData` + `addEnvironment`) in `amplify/backend.ts`
