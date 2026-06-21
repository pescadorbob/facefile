# User Sees Average Time to Stabilize

**As a** user, **I can** see the average number of days it has taken me to bring a new contact to a stable review interval (>21 days), **so that** I can set realistic expectations when adding new contacts.

## Acceptance Criteria

- [ ] The average stabilization time is computed across all contacts that have crossed the 21-day threshold
- [ ] The metric is shown as "X days on average to reach stable recall"
- [ ] Contacts that have lapsed and re-stabilized use the time from their most recent lapse, not their initial addition
- [ ] If fewer than 5 contacts have stabilized, the metric is hidden and a "Not enough data yet" message is shown instead
