# Queries Scoped to Authenticated User ID

**As a** system, **I can** scope every database query to the authenticated user's ID, **so that** no user can access or modify another user's contacts, reviews, or palaces.

## Acceptance Criteria

- [ ] All data-access queries include a `WHERE userId = authenticatedUserId` clause or Prisma equivalent
- [ ] The user ID is extracted from the validated JWT, never from the request body
- [ ] An attempt to access a resource belonging to another user returns a 404 (not 403, to avoid revealing existence)
- [ ] The isolation is enforced at the service layer, not only in route handlers
