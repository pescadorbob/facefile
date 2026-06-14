# Lapse Event Is Logged

**As a** system, **I can** log each lapse event with a timestamp, **so that** the user can later see which contacts have lapsed most often and the analytics dashboard has accurate data.

## Acceptance Criteria

- [ ] Each "Forgot" rating creates a lapse record in the review history with a timestamp
- [ ] The lapse count is queryable per contact and used to sort the "Needs Work" list
- [ ] Lapse records are included in the user's data export
- [ ] Lapse records are never deleted when the contact improves — the full history is preserved
