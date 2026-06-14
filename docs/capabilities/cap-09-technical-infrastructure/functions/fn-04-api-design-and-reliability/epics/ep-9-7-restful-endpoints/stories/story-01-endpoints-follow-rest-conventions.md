# Endpoints Follow REST Conventions

**As a** developer building the Angular frontend, **I can** rely on all API endpoints following standard REST conventions (GET/POST/PUT/DELETE with resource-based URLs), **so that** the API is predictable and easy to consume.

## Acceptance Criteria

- [ ] Resources use plural nouns: `/contacts`, `/palaces`, `/review-sessions`
- [ ] GET retrieves, POST creates, PUT/PATCH updates, DELETE removes — no action verbs in URLs
- [ ] Nested resources follow `/contacts/:id/reviews` pattern where appropriate
- [ ] API routes are documented in a route manifest or OpenAPI spec committed to the repository
