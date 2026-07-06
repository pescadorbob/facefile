# FaceFile — Claude Instructions

---

## Architecture Overview

FaceFile is a two-process monorepo: an **Angular 19 SPA** (`frontend/`) and a **Node.js/Express REST API** (`backend/`). They share no code — the frontend communicates with the backend exclusively via HTTP.

```
frontend/ (Angular 19, port 4200)
  └── proxies /api and /uploads → backend (port 3001) via proxy.conf.json

backend/ (Express 5, port 3001)
  ├── SQLite database via Prisma ORM
  ├── JWT auth: 15-min access token + 7-day refresh token
  └── Uploaded photos served as static files from /uploads
```

**Core data flow for quizzing:**
1. `Contact` is created → a `ReviewCard` is automatically created with SM-2 defaults
2. `GET /api/quiz/due` returns cards where `ReviewCard.nextReviewAt <= now`
3. User submits a rating (1/3/5) → `POST /api/quiz/answer` runs `sm2()` and updates the `ReviewCard`
4. `QuizResult` rows record every answer for stats

---

## Dev Commands

### Backend
```bash
cd backend
npm run dev          # nodemon watch mode → http://localhost:3001
npm run db:migrate   # run pending Prisma migrations
npm run db:generate  # regenerate Prisma client after schema changes
npm run db:studio    # open Prisma Studio GUI
```

### Frontend
```bash
cd frontend
ng serve                                       # dev server → http://localhost:4200
ng build                                       # production build → dist/
ng test                                        # Karma/Jasmine unit tests (all specs)
ng test --include="**/app.component.spec.ts"  # single spec file
```

---

## ⚠ Authorization Status — Single-User Mode

**This application has no working authorization.** Although JWT infrastructure exists (`AuthService`, `authInterceptor`, `authGuard`, `POST /api/auth/login`, `POST /api/auth/signup`), **every backend route ignores the token and operates against a hardcoded `DEFAULT_USER_ID = 1`.**

Practical consequences:
- The auth interceptor exists in the frontend but the backend routes do **not** use `authMiddleware` — `req.userId` is never read.
- All contacts, quiz cards, quiz results, and tutorial progress belong to user 1 regardless of who is "logged in."
- There is no per-user data isolation today.
- Do **not** assume `req.userId` is available in any route — it is not wired in.
- Do **not** attempt to fix this as a side-effect of other work. Per-user authorization is a deliberate future story.

When writing e2e tests, **do not attempt to log in as different users to get data isolation.** Use temporal isolation (aliased names via `DslContext`) and explicit teardown instead — see `.claude/prompt-snippets/e2e-conventions.md`.

---

## Key Conventions

### Frontend — Angular

- **No NgModules anywhere.** Every component is standalone (`standalone: true`).
- **Signals for all state.** Use `signal()`, `computed()`, and `toSignal()` — not `BehaviorSubject` or plain class fields for reactive state.
- **New control flow syntax only.** Use `@if`, `@for`, `@else` in templates — not `*ngIf` / `*ngFor`.
- **Functional guards and interceptors.** `authGuard` and `authInterceptor` are functions, not classes.
- **Lazy-loaded routes.** Every page component in `pages/` is loaded via `loadComponent` in `app.routes.ts`.
- **Auth interceptor** (`interceptors/auth.interceptor.ts`) attaches the Bearer token to every request and auto-retries once on 401 using the refresh token. If refresh fails, it calls `auth.logout()`.
- **Token storage:** `accessToken`, `refreshToken`, and `user` are stored in `localStorage`. Auth state is a signal in `AuthService`.
- **Styling:** Tailwind CSS v3 utility classes only — no component-level CSS files for layout/styling.

### Backend — Node.js

- **CommonJS modules throughout.** The backend uses `require()`/`module.exports` — never `import`/`export`.
- **All DB access via Prisma.** No raw SQL. Use `prisma.<model>.<method>()` patterns.
- **Each route file creates its own `PrismaClient` instance** — there is no shared singleton.
- **Photo uploads** use Multer (`middleware/upload.js`, 5 MB limit). Uploaded files land in `backend/uploads/` (gitignored). Serve the path stored in `Contact.photoPath` as a static URL under `/uploads`.
- **Auth middleware** (`middleware/auth.js`) verifies the JWT and attaches `req.userId` to the request.
- **SM-2 algorithm** lives entirely in `services/sm2.js`. It takes a `card` object `{ easeFactor, interval, repetitions }` and a `quality` (0–5), and returns updated values. Quiz ratings map as: Hard=1, Good=3, Easy=5.
- **CORS** allows only the origin in `FRONTEND_URL` env var (defaults to `http://localhost:5173`).

---

## Database Schema

```
User ——< Contact ——— ReviewCard   (one ReviewCard per Contact)
         |    └—< QuizResult
Contact ——< QuizResult
User ——— UserMicrosoftConnection  (optional MS Graph integration)
```

`ReviewCard` tracks SM-2 state: `easeFactor` (default 2.5), `interval` (days), `repetitions`, `nextReviewAt`.

---

## Environment Setup

Backend requires a `.env` file (copy from `.env.example`):
- `DATABASE_URL` — path to the SQLite file (e.g., `file:./prisma/dev.db`)
- `JWT_SECRET` — secret for 15-min access tokens
- `JWT_REFRESH_SECRET` — secret for 7-day refresh tokens
- `FRONTEND_URL` — allowed CORS origin

After changing `prisma/schema.prisma`, always run `npm run db:migrate` then `npm run db:generate`.

---

## Skills and Reference Material

Detailed guidance for specific workflows lives in `.claude/` to keep this file focused.

### Skills (read when the task matches)

| File | When to apply |
|---|---|
| [`.claude/skills/plan-work.md`](.claude/skills/plan-work.md) | Planning or scoping work: Capability → Function → Epic → Story hierarchy, story rules, ordering |
| [`.claude/skills/write-ac.md`](.claude/skills/write-ac.md) | Writing or reviewing acceptance criteria for story files under `docs/capabilities/` |
| [`.claude/skills/write-specs.md`](.claude/skills/write-specs.md) | Generating executable specifications from story ACs (DSL/driver/SUT architecture) |
| [`.claude/skills/ports-and-adapters.md`](.claude/skills/ports-and-adapters.md) | Refactoring a route handler into route (HTTP) + service (business) + repository (Prisma) layers |

### Prompt snippets (reference material)

| File | Contents |
|---|---|
| [`.claude/prompt-snippets/e2e-conventions.md`](.claude/prompt-snippets/e2e-conventions.md) | E2E test layering (Spec → DSL → Driver → Playwright), temporal isolation, Playwright run commands on Windows, selectors, DoD |
| [`.claude/prompt-snippets/story-format.md`](.claude/prompt-snippets/story-format.md) | Story file format template and `docs/capabilities/` directory structure |
