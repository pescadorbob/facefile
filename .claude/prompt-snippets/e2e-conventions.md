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
- Each test must create the data it needs. Do **not** depend on a pre-seeded DB beyond the one default user/palace set `npm run seed` creates.

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

- The **only** place that knows about Playwright (`Page`, `Locator`, `APIRequestContext`), CSS/role selectors, the auth-interceptor's token-refresh dance, file-upload paths, and DB cleanup via the API or Prisma.
- Owns: navigating to routes, locating elements by accessible role/name (prefer `getByRole`/`getByLabel` over CSS), filling forms, uploading photos, reading network responses, and seeding/cleaning data through the backend API.
- OK: anything Playwright/HTTP/file-system related, retries/polling, `expect(locator).toBeVisible()`.
- **Not OK**: business vocabulary (`SM-2`, `palace`, `locus`) leaking into method names — driver methods describe *mechanisms* (`clickPrimaryButton`, `getRowsInTable('contacts')`), not *intent*. Intent belongs in the DSL.
- **Not OK**: throwing bare strings; use a `requirePage()` / `requireSignedInUser()` pattern so misuse fails with a clear message.
- Cleanup is mandatory and must remain idempotent — every test artifact (DB row, uploaded file, signed-in session) must be released in fixture teardown. **Deactivate** user accounts rather than deleting them. Never touch the account named `"Brent Fisher"`.

### Layer 4 — Fixtures (`e2e/fixtures/`)

- Wire the layers together for Playwright. `facefile.ts` extends `@playwright/test` with test-scoped fixtures: `driver` (constructs the driver, calls cleanup after each test, `auto: true`), `facefile` (wraps the driver in `FacefileDsl`).
- Specs import `test` and any skip helpers from `./fixtures` — **never** from `@playwright/test` directly — so the layering and any availability skips stay consistent.
- Don't add business logic here. Fixtures only do construction, lifecycle, and re-exports.

---

## Temporal isolation

When multiple test runs execute against the same database (sequential runs, parallel workers, or a shared dev environment), human-readable names can collide. Two test runs both creating a contact named "Tom" may find each other's rows and produce false positives or flaky failures.

**Temporal isolation** solves this by having the DSL silently append a short, run-unique suffix to any value that is used as a discriminator in the UI.

### How it works

`DslContext` (in `e2e/support/dsl-context.ts`) holds a SHA-256 hash derived from a per-test seed (default: `Date.now()`). Its `alias(value)` method builds a stable alias for any plain value:

```
alias("Tom")   →  "Tom1a3f2"    (within a test run seeded at 1693847201234)
alias("Tom")   →  "Tom1a3f2"    (same call → same result, always cached)
alias("Alice") →  "Alice1a3f2"  (different value, same hash suffix)

# A different test run (different seed) produces:
alias("Tom")   →  "Tom1b9c4"
```

The algorithm:
1. `shortHash(seed)` = first 4 hex characters of SHA-256(seed)
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
| Data that must survive across setup + assertion | Emails managed by explicit cleanup |

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
- Each spec **creates its own data** through the API or UI, and **deactivates it** in teardown (fixture `finally` block). Never delete user accounts — mark them as `deactivated` instead, so real accounts (e.g. `"Brent Fisher"`) are never accidentally removed.
- **Never delete or deactivate the account named `"Brent Fisher"`** — all TEARDOWN cleanup methods guard against this name. The driver's `deleteUserByEmail`, `deactivateUserByEmail`, and `deactivateAllNonSeedUsers` skip any user whose `name` is `"Brent Fisher"`. Note: `deleteAllNonSeedUsers` is a TEST SETUP precondition (not teardown) so it does NOT have this guard — it intentionally deletes all non-seed users including persistent test accounts to achieve a reliably empty state.
- **Cleanup belongs at the end** — put teardown in the fixture `finally` block. Do not add `beforeEach` or `afterEach` cleanup blocks in spec files; with temporal isolation (aliased names/emails), there are no pre-test leftovers to clean up, and the fixture `finally` runs unconditionally after each test.
- **Always alias user names and emails** — use `ctx.alias(name)` for names and `aliasEmail(email)` (alias the local part before `@`) for emails in every DSL method that creates or references a user. This ensures each test run produces unique, non-conflicting accounts and deactivation-based teardown never causes 409 conflicts on subsequent runs.
- Do not share users across specs. All DSL methods that create users (`registersUser`, `userExistsWith`, `userExistsWithEmail`, `submitsNewUserWith`) alias their inputs automatically — specs always write plain names/emails.
- The backend currently runs in single-user mode (`DEFAULT_USER_ID` in `amplify/backend.ts`, a fixed seeded UUID — see `amplify/seed.ts`). Until that changes, e2e specs must reset the relevant DynamoDB tables (Contacts, ReviewCards, QuizResults, TutorialProgress, etc.) in teardown rather than rely on user isolation.

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
