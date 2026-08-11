# FaceFile — Claude Instructions

---

## Architecture Overview

FaceFile is a two-part project: an **Angular 21 SPA** (`frontend/`) and an **AWS Amplify Gen 2 backend** (`amplify/`) — plain REST via API Gateway + Lambda + DynamoDB, not GraphQL/AppSync. There is no Node/Express process anymore; the old `backend/` (Express + Prisma/SQLite) was fully retired in favor of this migration, and the frontend and backend are genuinely separate origins now (Amplify Hosting vs. API Gateway), not same-origin via a dev proxy.

```
frontend/ (Angular 21, port 4200)
  └── fetches the deployed API Gateway endpoint directly (credentialed cross-origin requests)
      — see frontend/src/app/services/api-config.service.ts + interceptors/api-url.interceptor.ts

amplify/ (Amplify Gen 2 — CDK-based)
  ├── backend.ts            — DynamoDB tables, S3 bucket, Lambda functions, API Gateway REST API, all wired together
  ├── functions/<name>/     — one Lambda per API Gateway resource mount (session, tutorial, palaces, contacts, admin-users, dashboard)
  ├── functions/_shared/    — repositories, services, session/cors/http helpers shared across functions via relative imports
  └── seed.ts               — seeds the one DEFAULT_USER_ID stub user + starter palaces/loci (run after first deploy)
```

**Core data flow for quizzing:**

1. `Contact` is created (`POST /contacts`) → a `ReviewCard` is created alongside it in the same call, with SM-2 defaults
2. Dashboard metrics (`GET /dashboard/metrics`) report `cardsDue` — `ReviewCard`s where `nextReviewAt <= now`
3. `QuizResult` rows would record every answer for stats — **note**: no route currently submits quiz answers (there is no `POST /quiz/answer` today; `functions/_shared/sm2.ts` is ported but not yet wired to any handler — this was already true of the pre-migration Express app, not something this migration changed)

---

## Dev Commands

### Backend (Amplify)

```bash
cd amplify
npm run sandbox   # ampx sandbox — deploys a personal AWS stack, watches for changes, hot-swaps Lambda code
npm run seed      # tsx seed.ts — seeds the default user + starter palaces (run once after the first sandbox deploy)
npm run deploy    # ampx pipeline-deploy — non-interactive deploy for CI/Amplify Hosting builds (see amplify.yml)
```

`ampx sandbox` deploys real AWS resources to your account — it needs AWS credentials (standard credential chain) and is not an offline emulator. It writes `amplify_outputs.json` to the repo root on every deploy.

### Frontend

```bash
cd frontend
npm run sync-outputs                           # copies ../amplify_outputs.json into public/ so ng serve can read it
ng serve                                       # dev server → http://localhost:4200
ng build                                       # production build → dist/frontend/browser
ng test                                        # Karma/Jasmine unit tests (all specs)
ng test --include="**/app.component.spec.ts"  # single spec file
```

Run `npm run sync-outputs` again any time `amplify_outputs.json` changes (e.g. after a sandbox redeploy that adds/renames a resource) — the frontend reads it at runtime, not build time, via `fetch('/amplify_outputs.json')`.

---

## ⚠ Authorization Status — Single-User Mode

**This application has no working authorization.** Every Lambda route ignores any notion of "who is logged in" beyond a single stub: `functions/_shared/session.ts`'s `resolveUserId()` reads the signed session cookie (falling back to a `userId` query param, then to a fixed seeded `DEFAULT_USER_ID`), and every function applies that same stub uniformly.

Practical consequences:

- There is no Cognito/Amplify Auth category in `amplify/backend.ts` — this was a deliberate choice during the Amplify migration, not an oversight. Fixing authorization is a deliberate future story, not something to bundle into other work.
- All contacts, quiz cards, quiz results, and tutorial progress belong to the one seeded default user (`amplify/seed.ts`) regardless of who is "logged in" via the profile picker.
- The `POST /session`, `GET /session/me` login flow (`functions/session/handler.ts`) is real (it reads/writes a signed, `SameSite=None; Secure` cookie) but doesn't gate anything — every other route resolves the same way whether or not that cookie is present.
- Do **not** attempt to fix this as a side-effect of other work.

When writing e2e tests, **do not attempt to log in as different users to get data isolation.** Use temporal isolation (aliased names via `DslContext`) and explicit teardown instead — see `.claude/prompt-snippets/e2e-conventions.md`.

---

## Key Conventions

### Frontend — Angular

- **No NgModules anywhere.** Every component is standalone (`standalone: true`).
- **Signals for all state.** Use `signal()`, `computed()`, and `toSignal()` — not `BehaviorSubject` or plain class fields for reactive state.
- **New control flow syntax only.** Use `@if`, `@for`, `@else` in templates — not `*ngIf` / `*ngFor`.
- **Functional guards and interceptors.** Interceptors are functions (`HttpInterceptorFn`), not classes.
- **Lazy-loaded routes.** Every page component in `pages/` is loaded via `loadComponent` in `app.routes.ts`.
- **API URL rewriting**: all `*.service.ts` files call plain relative paths (`/api/contacts`, etc.) unchanged — `interceptors/api-url.interceptor.ts` rewrites `/api/*` to the real deployed API Gateway endpoint and marks the request `withCredentials: true`. The endpoint itself is resolved once at bootstrap by `services/api-config.service.ts` (an app initializer fetching `/amplify_outputs.json`) before the interceptor is ever exercised.
- **Ids are strings.** Every entity id (`Contact.id`, `Palace.id`, `AdminUser.id`, `SessionUser.id`, …) is a UUID string, not a number — DynamoDB has no autoincrement primary key. Don't reintroduce `number` id types.
- **Styling:** Tailwind CSS v3 utility classes only — no component-level CSS files for layout/styling.

### Backend — Amplify (TypeScript, Lambda + DynamoDB)

- **TypeScript + ESM throughout `amplify/`.** `import`/`export`, not `require()`/`module.exports` — this is the opposite convention from the retired Express backend.
- **All persistence via the AWS SDK v3 DynamoDB Document Client**, wrapped in `_shared/dynamo.ts`'s `ddb` — no ORM, no raw SQL.
- **One Lambda per API Gateway resource mount**, not per HTTP verb — each handler in `functions/<name>/handler.ts` dispatches internally on `event.httpMethod` + a sub-path (the same way the old Express router dispatched), mirroring the pre-migration route-file boundaries 1:1. See `amplify/backend.ts`'s `mountLambda` for how each function is wired to its resource.
- **Shared code lives in `functions/_shared/`** (repositories, services, `http.ts` response/error helpers, `session.ts`, `cors.ts`, `dynamo.ts`) and is pulled in via relative imports — each function bundles independently via esbuild, so this costs nothing at runtime. See `.claude/skills/ports-and-adapters.md` for the repository/service/handler split.
- **Photo uploads** go to S3 (`PhotosBucket` in `backend.ts`, `photos/` prefix, public-read — matches the old unauthenticated `/uploads` static serving) via `_shared/photos.ts` + `_shared/multipart.ts` (a `busboy`-based parser for the base64-encoded multipart body API Gateway hands the `contacts` Lambda). There is no local disk involved anywhere.
- **Session cookie**: `_shared/session.ts` hand-rolls HMAC signing (`SESSION_COOKIE_SECRET`, an Amplify-managed secret) since there's no `cookie-parser` in Lambda. Cookies are `SameSite=None; Secure` — required because frontend and API are different origins now; do not weaken this back to `Lax`.
- **CORS**: API Gateway's `defaultCorsPreflightOptions` handles `OPTIONS`, but every non-OPTIONS Lambda response must still attach CORS headers itself (`_shared/cors.ts`'s `corsHeaders()`, folded into `_shared/http.ts`'s `json()`) — proxy integration responses bypass gateway-level CORS entirely.
- **Table/bucket names and secrets are env vars**, wired per-function in `amplify/backend.ts` (`wire()` + `grantReadData`/`grantReadWriteData`/`grantPut`) — a function should only receive env vars for the resources it's actually granted. Read them via `tableName()`/`requiredEnv()` (`_shared/dynamo.ts` / `_shared/env.ts`), never hardcoded.
- **No `defineAuth`/Cognito** — see the Authorization Status section above.

---

## Data Model (DynamoDB)

```
Users              PK id                          (GSI byEmail: PK email)
Palaces            PK userId, SK id                — loci are an embedded ordered list on the item, not a table
Contacts           PK userId, SK id
ReviewCards        PK userId, SK contactId          — 1:1 with Contact, created alongside it
QuizResults        PK userId, SK id
TutorialProgress   PK userId                        — single item per user
```

Every table is partitioned by `userId` (list-by-user is the only access pattern any route needs today) except `Users`, which is looked up by its own `id` (login) or by `email` via the `byEmail` GSI (admin user management's uniqueness check).

Two Prisma models from the old schema were **deliberately not carried over** as their own tables, because no route ever queried them independently:
- **`Locus`** — always read nested under its `Palace` (Prisma's `include: { loci }`), so it's an embedded list on the `Palace` item instead.
- **`UserMicrosoftConnection`** — no route reads or writes it at all, pre- or post-migration.

If a future story needs either as a first-class, independently-queryable resource, give it its own table at that point rather than resurrecting it speculatively now.

---

## Environment Setup

No `.env` file — Amplify Gen 2 backends configure via `backend.ts` + Amplify-managed secrets, not dotenv:

- **`SESSION_COOKIE_SECRET`** — set per sandbox with `npx ampx sandbox secret set SESSION_COOKIE_SECRET` (from `amplify/`), or via the Amplify Console's Secrets UI for deployed branches. Referenced in code via `secret('SESSION_COOKIE_SECRET')` in each function's `resource.ts`.
- **`FRONTEND_URL`** — read from the `FRONTEND_URL` process env var at CDK synth time in `backend.ts` (defaults to `http://localhost:4200`), used for both CORS and the S3 bucket's CORS policy. Set this to the real Amplify Hosting domain for deployed environments.
- Table names, the photos bucket name, and `DEFAULT_USER_ID` are wired automatically by `backend.ts` — nothing to configure by hand.

After changing DynamoDB table shape/GSIs in `amplify/backend.ts`, just redeploy (`ampx sandbox` picks up the change and hot-swaps or falls back to a full stack update as needed) — there is no separate migration step like Prisma's `db:migrate`.

---

## Skills and Reference Material

Detailed guidance for specific workflows lives in `.claude/` to keep this file focused.

### Skills (read when the task matches)

| File                                                                            | When to apply                                                                                      |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`.claude/skills/plan-work.md`](.claude/skills/plan-work.md)                   | Planning or scoping work: Capability → Function → Epic → Story hierarchy, story rules, ordering |
| [`.claude/skills/write-ac.md`](.claude/skills/write-ac.md)                     | Writing or reviewing acceptance criteria for story files under`docs/capabilities/`               |
| [`.claude/skills/write-specs.md`](.claude/skills/write-specs.md)               | Generating executable specifications from story ACs (DSL/driver/SUT architecture)                  |
| [`.claude/skills/ports-and-adapters.md`](.claude/skills/ports-and-adapters.md) | Refactoring a Lambda handler into handler (API Gateway) + service (business) + repository (DynamoDB) layers |

### Prompt snippets (reference material)

| File                                                                                        | Contents                                                                                                                        |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`.claude/prompt-snippets/e2e-conventions.md`](.claude/prompt-snippets/e2e-conventions.md) | E2E test layering (Spec → DSL → Driver → Playwright), temporal isolation, running against a deployed sandbox on Windows, selectors, DoD |
| [`.claude/prompt-snippets/story-format.md`](.claude/prompt-snippets/story-format.md)       | Story file format template and`docs/capabilities/` directory structure                                                        |
