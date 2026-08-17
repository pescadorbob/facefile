# Reference: E2E Test Conventions

End-to-end tests for FaceFile drive the **real Angular SPA against a real backend** through a browser. They are the only layer that can exercise routing, the auth interceptor, server-rendered errors, and uploaded photo serving end to end.

## Module location

E2E tests live in a **top-level `e2e/` module** at the same level as `frontend/` and `backend/`:

```
facefile/
├── backend/
├── frontend/
├── e2e/           ← all e2e code lives here
│   ├── package.json
│   ├── playwright.config.ts
│   ├── jest.config.ts
│   ├── specs/         (*.e2e.spec.ts files)
│   ├── facefile/      (DSL + driver)
│   ├── fixtures/
│   └── support/
└── ...
```

Unit tests stay in `frontend/src/**/*.spec.ts` (Karma/Jasmine). Never mix unit tests and e2e tests in the same module.

## Tooling

- **Playwright** (`@playwright/test`) handles browser automation. Do not introduce Cypress, WebdriverIO, Selenium, or Protractor.
- **Jest** is the test runner for non-browser tests within the `e2e/` module (e.g. DSL unit tests, driver contract tests). Use `@playwright/test` for browser-driven specs.
- The Playwright config (`e2e/playwright.config.ts`) governs e2e runs so it can be tuned independently of any future smoke suite.

## NPM scripts (run from `e2e/`)

```jsonc
{
  "test:e2e":        "playwright test --config=playwright.config.ts",
  "test:e2e:headed": "playwright test --config=playwright.config.ts --headed",
  "test:e2e:ui":     "playwright test --config=playwright.config.ts --ui",
  "test:e2e:report": "playwright show-report",
  "test:unit":       "jest"
}
```

### Running tests on Windows

On Windows, `npx` and `npm run` spawn child processes in a **separate console window** — the output is not visible in the calling PowerShell session. Run the playwright binary directly and redirect to a temp file:

```powershell
# All e2e tests
cd e2e
cmd /c "node_modules\.bin\playwright.cmd test --config=playwright.config.ts --reporter=list > C:\Temp\test-out.txt 2>&1"
Get-Content C:\Temp\test-out.txt

# Single spec
cmd /c "node_modules\.bin\playwright.cmd test --config=playwright.config.ts --reporter=list specs/palaces/create-custom-palace.e2e.spec.ts > C:\Temp\test-out.txt 2>&1"
Get-Content C:\Temp\test-out.txt

# With grep filter
cmd /c "node_modules\.bin\playwright.cmd test --config=playwright.config.ts --grep ""S-2.1.1"" --reporter=list > C:\Temp\test-out.txt 2>&1"
Get-Content C:\Temp\test-out.txt

# Jest unit tests (DSL/driver contract tests)
cmd /c "node_modules\.bin\jest.cmd > C:\Temp\test-out.txt 2>&1"
Get-Content C:\Temp\test-out.txt
```

Rules:
- **Always use `node_modules\.bin\playwright.cmd`** directly — not `npm run test:e2e` or bare `npx playwright`. npm spawns a PowerShell child that re-spawns playwright in a new window, swallowing the redirect. The redirect must be **inside** the `cmd /c` string.
- **Always pass `--config=playwright.config.ts`** so `baseURL` is set; without it, all `page.goto('/...')` calls fail with "Cannot navigate to invalid URL".
- Exit code from `cmd /c` is reliable: 0 = all passed, non-zero = failures.
- Pass `--reporter=line` or `--reporter=list` for readable streaming output.

## Local prerequisites

There is no local backend process anymore — `backend/` (Express + Prisma/SQLite) was retired when FaceFile moved to Amplify (API Gateway + Lambda + DynamoDB). E2E now always runs the frontend against a **real deployed sandbox**:

```powershell
# 1. Deploy a personal sandbox backend (from amplify/) — leave this running, it watches for changes
cd amplify; npm run sandbox

# 2. Once it reports the first successful deploy, seed the default user + palaces
npm run seed

# 3. Copy amplify_outputs.json into frontend/public/ so both ng serve and e2e/support/api-config.ts
#    (used by the driver's BACKEND_URL) can find the deployed API endpoint
cd ../frontend; npm run sync-outputs
```

Then verify both are up by **checking their ports** — do NOT try to read process output on Windows (spawned processes write to a separate console window):

```powershell
(Invoke-WebRequest -Uri "http://localhost:4200" -UseBasicParsing -EA SilentlyContinue).StatusCode  # expect 200
```

If the frontend is not up, start it and poll the port:

```powershell
# ng serve spawns a separate window — just poll the port
Start-Process cmd -ArgumentList "/c", "cd /d C:\Users\bcfis\work\facefile\frontend && npx @angular/cli@21 serve --port 4200" -WindowStyle Minimized
$end = (Get-Date).AddSeconds(120)
while ((Get-Date) -lt $end) {
  if ((Invoke-WebRequest -Uri "http://localhost:4200" -UseBasicParsing -EA SilentlyContinue).StatusCode -eq 200) { "Frontend ready"; break }
  Start-Sleep 5
}
```

Rules:
- **Never wait on command output** to determine if a server is ready — on Windows, `ng serve` writes to a separate console window.
- **Always poll the port** with `Invoke-WebRequest` until you get a 200.
- Each test creates its own user (functional isolation — see below) and then whatever data it needs inside that account. Do **not** depend on a pre-seeded DB beyond the one default user/palace set `npm run seed` creates — that seeded profile is only for the narrow set of specs that specifically need it.

---

## Spec → DSL → Driver → Playwright (four layers)

Keep e2e code split into four layers, each with one job. Mixing them — calling Playwright APIs from a spec, or putting business vocabulary in the driver — is the most common review-rejection pattern.

```
spec —uses—> DSL (FacefileDsl, FacefileDslAssert) —uses—> Driver (FacefileBrowserDriver) —uses—> Playwright (page, request, expect)
                    ↑
              Fixtures (e2e/fixtures/) wire it all together
```

### Layer 1 — Spec files (`e2e/specs/**/*.e2e.spec.ts`)

- Express **business scenarios** in Given/When/Then form, mirroring the `## Scenarios` block in the corresponding story under `docs/capabilities/**/stories/`.
- OK: `await facefile.signUp('email: alice@example.com')`, `await facefile.addContact('name: Brian')`, `await confirmThat(facefile).quizDueCount('count: 1')`.
- OK: `test.skip(...)` and using fixtures from `./fixtures`.
- **Not OK**: importing from `playwright`, `@playwright/test` (beyond what fixtures re-export), or any `*.driver.ts`. Don't touch `page`, selectors, cookies, `localStorage`, timeouts, or env vars here.
- **Not OK**: bare `expect(...)` on raw values. Always go through `confirmThat(facefile).<assertion>(...)`.
- One spec file per story (or per epic when stories share scenes). Name it after the story slug.

### Layer 2 — DSL (`e2e/facefile/facefile.dsl.ts`, `e2e/facefile/facefile.dsl-assert.ts`)

- A **domain vocabulary** for FaceFile concepts: contacts, quiz cards, SM-2 ratings, tutorial steps, palaces. Methods read like English (`signUp`, `addContact`, `startQuiz`, `rateCurrentCard`, `walkThroughTutorial`).
- The DSL is the **only** layer specs talk to.
- Use the typed-tag string format `'<name: value>'` (e.g. `'name: Brian'`, `'rating: easy'`) and parse it via a shared `parseParam` helper. Keep this convention so specs stay readable.
- Action verbs live on `FacefileDsl`. Assertions live on `FacefileDslAssert` and are reached through `confirmThat(facefile).<...>`. Don't put `expect(...)` on `FacefileDsl`.
- The DSL **delegates to the driver** for anything that touches the browser or HTTP: `this.driver.fillSignUpForm(...)`, `this.driver.clickAddContact()`, `this.driver.readDueCount()`. It must not call Playwright directly.
- **Not OK**: importing `playwright`, `@playwright/test`, `fs`, `path`, `child_process`, or referencing selectors, cookies, `localStorage`, or timeouts.
- When adding a new scenario verb, add it to the DSL first (a `console.log` stub is fine), then back it with a driver method.

### Layer 3 — Driver (`e2e/facefile/facefile.browser.driver.ts`)

- The **only** place that knows about Playwright (`Page`, `Locator`, `APIRequestContext`), CSS/role selectors, the auth-interceptor's token-refresh dance, and file-upload paths.
- Owns: navigating to routes, locating elements by accessible role/name (prefer `getByRole`/`getByLabel` over CSS), filling forms, uploading photos, reading network responses, and seeding data through the backend API.
- OK: anything Playwright/HTTP/file-system related, retries/polling, `expect(locator).toBeVisible()`.
- **Not OK**: business vocabulary (`SM-2`, `palace`, `locus`) leaking into method names — driver methods describe *mechanisms* (`clickPrimaryButton`, `getRowsInTable('contacts')`), not *intent*. Intent belongs in the DSL.
- **Not OK**: throwing bare strings; use a `requirePage()` / `requireSignedInUser()` pattern so misuse fails with a clear message.
- **Not OK**: talking to DynamoDB directly (AWS SDK Document Client, table scans/gets/puts) for setup. All seeding goes through the UI or the REST API — see "Never hit DynamoDB directly" below.
- No cleanup step is required. Every test creates its own fresh user via functional isolation (see below), so its data lives in that user's own partition and never needs to be found again, let alone deleted. Never touch the account named `"Brent Fisher"` regardless.

### Layer 4 — Fixtures (`e2e/fixtures/`)

- Wire the layers together for Playwright. `facefile.ts` extends `@playwright/test` with test-scoped fixtures: `driver` (constructs the driver, `auto: true`), `facefile` (wraps the driver in `FacefileDsl`).
- Specs import `test` and any skip helpers from `./fixtures` — **never** from `@playwright/test` directly — so the layering and any availability skips stay consistent.
- Don't add business logic here. Fixtures only do construction, lifecycle, and re-exports.

---

## Functional isolation

This is the **primary** isolation mechanism for FaceFile's e2e specs, and it comes before temporal isolation both in this doc and in what a spec should do first.

Every table in DynamoDB is partitioned by `userId` (see CLAUDE.md's Data Model section), and `resolveUserId()` genuinely honors whichever user the session cookie names — there's no verified login, but there *is* real per-user data scoping (see CLAUDE.md's Authorization Status section). That makes the user/profile the natural functional isolation boundary for this app, the same way "a hospital" or "a book" is the boundary in other systems: a self-contained unit that everything a test does can happen inside of, invisible to every other test.

**The rule:** at the start of every e2e test, create a brand-new user and sign in as it — `await facefile.signsInAsTestUser()`. Everything that test does from that point on (contacts, palaces, review cards, quiz results, tutorial progress, settings, notifications) lives inside that one account and is invisible to every other test, because it's a different partition key. No other test can see it, race with it, or be broken by it — whether the other test runs before, after, or *at the same time*.

**Then leave it be.** Don't clean the account up at the end of the test, don't deactivate it, don't delete its data. There's nothing to protect it from — no other test shares it — so there's nothing tidying up would buy you, and tidying up is exactly the intrusive, slow pattern isolation is meant to replace. Test accounts are cheap and the sandbox is disposable; let them accumulate and reseed/redeploy when you want a clean environment, not between tests.

**The one narrow exception:** a handful of specs (the add-person wizard, and anything else that needs the seeded starter palaces) must exercise the one seeded default profile instead of a fresh account, because a fresh account has no palaces of its own. Those specs don't get functional isolation from the user boundary — they share it with every other spec that also needs the seeded profile — so they lean on temporal isolation (below) for their contact/palace names instead. This is the exception, not the pattern to copy for new specs.

```ts
// Every new spec starts like this:
test('...', async ({ facefile }) => {
  await facefile.signsInAsTestUser();
  // ...everything else happens inside this account
});
```

## Temporal isolation

Functional isolation handles data *inside* a test's own account. But the account itself has to be created somewhere shared — the `Users` table isn't partitioned by anything, so two test runs creating "a test user" at close to the same moment could collide on name or email. Temporal isolation is what keeps that one shared step collision-free, by having the DSL silently append a short, run-unique suffix to any value used as a discriminator.

Combine the two: functional isolation scopes a test to an account it creates for itself; temporal isolation makes sure that account (and, for the seeded-profile exception above, the values created within it) is unique even across repeated runs.

### How it works

`DslContext` (in `e2e/support/dsl-context.ts`) holds a SHA-256 hash derived from a per-test seed (default: `Date.now()`). Its `alias(value)` method builds a stable alias for any plain value:

```
alias("Tom")   →  "Tom1a3f2c81"    (within a test run seeded at 1693847201234)
alias("Tom")   →  "Tom1a3f2c81"    (same call → same result, always cached)
alias("Alice") →  "Alice1a3f2c81"  (different value, same hash suffix)

# A different test run (different seed) produces:
alias("Tom")   →  "Tom1b9c4e07"
```

The algorithm:
1. `shortHash(seed)` = first 8 hex characters of SHA-256(seed) — wide enough that runs
   don't reuse each other's aliases; at 4 the space was small enough to collide in practice
2. `alias(value)` = `value` + global sequence number (starts at 1 per unique value) + hash
3. Aliases are cached — calling `alias("Tom")` twice returns the exact same string

### Wiring (fixture creates one context per test)

```ts
// e2e/fixtures/facefile.ts
facefile: async ({ driver }, use) => {
  const ctx = new DslContext();          // unique seed per test
  await use(new FacefileDsl(driver, ctx));
},
```

### DSL usage — alias at the boundary

Call `ctx.alias()` in the DSL when the value will be written to the system **and** later searched for in assertions. The spec always writes the plain name; isolation is invisible above the DSL.

```ts
// e2e/facefile/facefile.dsl.ts — action verb
async addsContact(nameParam: string): Promise<void> {
  const name = this.ctx.alias(parseParam(nameParam, 'name')); // "Tom" → "Tom1a3f2"
  await this.driver.fillInputByLabel(/Name/i, name);
  await this.driver.clickButtonByName(/Save/i);
}

// e2e/facefile/facefile.dsl-assert.ts — assertion verb
async showsContactInList(nameParam: string): Promise<void> {
  const name = this.dsl.ctx.alias(parseParam(nameParam, 'name')); // same "Tom" → same "Tom1a3f2"
  await this.dsl.driver.waitForRowContaining(new RegExp(name));
}
```

The spec remains plain and readable:

```ts
// spec file — no alias knowledge
await facefile.addsContact('name: Tom');
await confirmThat(facefile).showsContactInList('name: Tom');
```

### When to alias vs when not to

| Use `ctx.alias()` | Use raw `parseParam()` |
|---|---|
| Display names (contacts, users) | Enum values (`status: active`) |
| Usernames, handles | Counts (`count: 3`) |
| Any field searched by text | IDs looked up by another mechanism |
| Data that must survive across setup + assertion | A literal boundary value the test is deliberately checking (e.g. a name at the minimum length) |

### String interpolation

When one param value references another aliased value by name, use `ctx.interpolate()`:

```ts
// param: "message: Hello ${Tom}"
const message = this.ctx.interpolate(parseParam(messageParam, 'message'));
// → "Hello Tom1a3f2"  (Tom must have been aliased already in this context)
```

### Temporal isolation rules

- **Only the DSL calls `ctx.alias()`** — never the spec, never the driver. The spec is always isolated from the alias mechanism.
- **Assertions mirror their corresponding setup verbs** — if `addsContact('name: Tom')` aliases `Tom`, then `showsContactInList('name: Tom')` must alias `Tom` with the same context.
- `DslContext` is created once per test (in the fixture). Never share a context across tests.
- Do not alias values that are not discriminators in the UI (statuses, counts, booleans).
- Each spec **creates its own data** through the API or UI. Nothing needs to be torn down afterward — see Functional isolation above.
- **Never delete or deactivate the account named `"Brent Fisher"`.** This is the one standing exception to "no cleanup needed": no spec should ever touch this account, full stop, so any driver method that could plausibly reach a real account still guards against this name.
- Do not add `beforeEach` or `afterEach` cleanup blocks in spec files. With functional isolation (a fresh account per test) plus temporal isolation (aliased names/emails on that account's own creation), there is nothing left over from a previous run for a later test to collide with.
- **Always alias user names and emails** — use `ctx.alias(name)` for names and `aliasEmail(email)` (alias the local part before `@`) for emails in every DSL method that creates or references a user. This is what keeps concurrent/parallel test runs from colliding while creating their own accounts on the shared `Users` table.
- Do not share users across specs. All DSL methods that create users (`registersUser`, `signsInAsTestUser`, `userExistsWith`, `userExistsWithEmail`, `submitsNewUserWith`) alias their inputs automatically — specs always write plain names/emails.

---

## Never hit DynamoDB directly

- E2E specs, the DSL, and the driver must **never** read or write DynamoDB directly — no AWS SDK Document Client calls, no `aws dynamodb` CLI, no scans/gets/puts against `Contacts`, `ReviewCards`, `QuizResults`, `TutorialProgress`, `Users`, `Palaces`, `UserSettings`, or `Notifications`. Every setup and seed step goes through the **UI** (Playwright) or the **REST API** (`APIRequestContext`), exactly like a real client.
- This matters even though functional isolation means there's no teardown to write anymore: a direct table write for *setup* (e.g. planting a contact) would still bypass the same validation and side effects (e.g. `POST /contacts` also creating a `ReviewCard`) that production traffic goes through, and it would silently drift out of sync with the API as the schema evolves.
- **If the operation you need has no existing route** (e.g. "force a card's `nextReviewAt` into the past", "read a raw `QuizResult` row for an assertion"), **add an admin API endpoint** for it rather than reaching into the table:
  - Mount it as a new sub-path on the existing `admin/users` Lambda (`amplify/functions/adminUsers/`) if it's user-management-shaped, or add a new resource in `amplify/backend.ts` (`mountLambda`) following the handler/service/repository split in `.claude/skills/ports-and-adapters.md`.
  - Have the driver call the new admin endpoint via `APIRequestContext`, the same way it calls every other route.
  - Treat the new endpoint as real product surface: it ships in `amplify/backend.ts` like any other route, and should be reviewed with the same care (it's still unauthenticated, per the Authorization Status section in `CLAUDE.md`, so keep destructive admin routes scoped to what tests actually need).

---

## Selectors

- Prefer `getByRole`, `getByLabel`, `getByText` — these reflect the user's view and survive Tailwind class churn.
- Add `data-testid` attributes only when accessible queries are genuinely insufficient (e.g. an icon-only button with no label). Set the attribute in the component, then key off it in the driver.
- Never select by Tailwind utility classes (`.bg-indigo-600`) — they are layout, not contract.

## Definition of done for an e2e change

- `npm run lint`, `npm test`, and `npm run build` (frontend) pass.
- `npm run test:e2e` (from `e2e/`) passes locally with both backend and frontend running.
- `npm run test:unit` (from `e2e/`) passes for any Jest tests added or modified.
- Any new DSL verb has a matching driver method and at least one spec exercising it.
- No spec imports Playwright directly. No driver method names mention domain concepts. No DSL method touches selectors or the network.
