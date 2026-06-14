# Photos Stored with Access-Controlled URLs

**As a** system, **I can** store uploaded photos such that they cannot be accessed via a direct URL without authentication, **so that** contact photos are never publicly accessible.

## Acceptance Criteria

- [ ] Photo files are stored outside the web root or behind a signed URL scheme
- [ ] Photo URLs served to the frontend include a time-limited signature or are proxied through an authenticated API endpoint
- [ ] An unauthenticated request for a photo URL returns a 401 or 403
- [ ] Photo URLs are never embedded in public-facing pages or shared outside the authenticated context
