# Skill: Write Executable Specifications (Component Tests)

When asked to write or generate executable specifications from story acceptance criteria, apply the rules below.

## System under test

- Run the SUT as production-like as possible without running it end to end.
- Simulate external systems with system stubs — not mocks of internal units.

## DSL layer

- Create a Domain Specific Language (DSL) layer that turns the plain business language (the "HOW") into complete test fixtures for each example.
- Write the DSL in the native language of the application (TypeScript for this project) so test fixtures can be executed as part of the build process.
- Alternatively consider Gherkin / Cucumber if the team prefers a separate business-readable layer.
- Isolate each spec functionally first: have it create its own fresh user/profile at the start (the natural isolation boundary in this app) and do everything else inside that account. Don't tear it down afterward — there's nothing to protect it from once nothing else shares it.
- Layer temporal isolation on top, in the DSL, using aliases — this covers the one thing functional isolation can't scope on its own: the shared `Users` table itself, where two runs creating "a test user" at the same moment need unique names/emails.
- Relentlessly focus DSL language on the end user and the domain — never on implementation details.

## Protocol driver

- Use a protocol driver to drive the tests at the desired layer of abstraction (UI protocol driver or REST API driver).
- The test calls the DSL. The DSL calls the driver. The driver translates instructions into the protocol required to connect to the SUT.
- Use the DSL to control the external system stubs the SUT depends on as part of each component test.

## Never access the database directly

- The driver must **never** read or write DynamoDB directly (no AWS SDK Document Client calls, no table scans/gets/puts) for setup, seeding, or teardown. Every interaction with the SUT's data goes through the **UI** or the **REST API** — the same paths a real user or client would use.
- If a spec needs a capability the existing API doesn't expose (bulk reset, deactivating stray records, reading data no user-facing route returns), **add an admin API endpoint** for it (mount it alongside the existing `admin/users` resource in `amplify/backend.ts`, following `.claude/skills/ports-and-adapters.md` for the handler/service/repository split) rather than reaching around the API into the table.
- This keeps specs production-like: they exercise the same authorization, validation, and side effects (e.g. a ReviewCard created alongside a Contact) that a real request would, instead of silently drifting out of sync with the API contract.

## E2E module location and tooling

- All executable specifications that drive the running application live in the top-level **`e2e/`** module — at the same level as `frontend/` and `backend/`, not inside either.
- **Playwright** (`@playwright/test`) is the browser automation tool for UI-layer specs.
- **Jest** is the test runner for non-browser tests within `e2e/` (DSL unit tests, driver contract tests).
- See `.claude/prompt-snippets/e2e-conventions.md` for the full four-layer architecture (Spec → DSL → Driver → Playwright), file paths, and Windows run commands.

## Skipping and incremental delivery

- Find ways to skip tests until they are implemented, but allow them to be executed individually as needed during development.
- A skipped spec should still be visible in the test report so nothing is silently dropped.
