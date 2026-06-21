# Endpoints Return Consistent Error Shapes

**As a** developer, **I can** rely on all API errors returning a consistent JSON shape with status code, message, and optional field errors, **so that** the frontend can handle failures uniformly without custom logic per endpoint.

## Acceptance Criteria

- [ ] All error responses follow the shape: `{ "error": { "code": number, "message": string, "fields"?: Record<string, string> } }`
- [ ] Authentication errors return 401, authorization errors return 403, not-found returns 404, validation errors return 400
- [ ] 500-level errors return a generic message without stack traces or internal details
- [ ] Error handling is implemented as Express middleware applied globally, not per-route
