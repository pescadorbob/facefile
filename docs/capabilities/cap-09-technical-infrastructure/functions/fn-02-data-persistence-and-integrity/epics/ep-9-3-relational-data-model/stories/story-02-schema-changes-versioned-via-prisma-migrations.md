# Schema Changes Versioned via Prisma Migrations

**As a** system, **I can** manage all schema changes through Prisma migrations, **so that** every change is versioned, reversible, and applied consistently across environments.

## Acceptance Criteria

- [ ] All schema changes produce a new migration file under `prisma/migrations/`
- [ ] Migrations are applied automatically on server startup in development and via a deploy step in production
- [ ] No manual SQL is used to modify the schema — all changes go through `prisma migrate dev`
- [ ] The migration history is committed to version control and not modified after merging
