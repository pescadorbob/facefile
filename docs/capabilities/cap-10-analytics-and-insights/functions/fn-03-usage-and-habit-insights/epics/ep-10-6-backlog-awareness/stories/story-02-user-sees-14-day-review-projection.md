# User Sees 14-Day Review Projection

**As a** user, **I can** see a projection of how many reviews are coming up each day over the next two weeks, **so that** I can anticipate heavy days and spread the load by practicing ahead.

## Acceptance Criteria

- [ ] A bar chart shows projected review counts per day for the next 14 days
- [ ] The projection is computed from all contacts' `next_review_date` values
- [ ] Days with more than the user's configured session maximum are visually flagged as "heavy"
- [ ] The projection updates after each session as new intervals are computed
