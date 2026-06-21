# System Issues JWT on Login and Validates on Requests

**As a** system, **I can** issue a JWT access token on successful login and validate it on every protected API request, **so that** unauthenticated access is rejected before touching any user data.

## Acceptance Criteria

- [ ] A successful login returns a signed JWT with a configurable expiry (default 15 minutes)
- [ ] All protected endpoints reject requests without a valid JWT with a 401 response
- [ ] The JWT contains only the user ID and expiry — no sensitive user data in the payload
- [ ] Token validation is applied by middleware, not individually per-route
