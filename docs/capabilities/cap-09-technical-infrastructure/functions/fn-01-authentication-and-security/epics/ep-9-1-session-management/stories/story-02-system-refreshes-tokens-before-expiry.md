# System Refreshes Tokens Before Expiry

**As a** system, **I can** issue a new access token using a long-lived refresh token before the current access token expires, **so that** active users are not unexpectedly logged out during a session.

## Acceptance Criteria

- [ ] A refresh token with a longer expiry (default 7 days) is issued alongside the access token at login
- [ ] The frontend silently requests a new access token when the current one is within 60 seconds of expiry
- [ ] Refresh tokens are stored server-side and can be revoked (e.g., on password change or logout)
- [ ] An expired refresh token returns a 401 that sends the user to the login screen
