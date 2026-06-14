# User Changes Password

**As a** user, **I can** change my password at any time from the account settings, **so that** I can maintain account security if my credentials are compromised.

## Acceptance Criteria

- [ ] A "Change Password" section requires the current password before accepting a new one
- [ ] The new password must meet the same requirements as registration (minimum 8 characters, at least one number)
- [ ] After a successful change, all existing sessions except the current one are invalidated
- [ ] An email confirmation is sent to the account email after a password change
