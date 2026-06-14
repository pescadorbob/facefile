# User Sees Overdue Contact Count

**As a** user, **I can** see how many contacts are overdue (past their scheduled review date without being reviewed), **so that** I understand the size of my backlog and can prioritize clearing it.

## Acceptance Criteria

- [ ] An "Overdue" count is shown on the dashboard distinct from the "Due Today" count
- [ ] Overdue is defined as: `next_review_date < today` AND the contact has not been reviewed today
- [ ] The count updates in real time as the user completes reviews
- [ ] Tapping the overdue count launches a session filtered to only overdue contacts, ordered oldest-due first
