# System Calculates Next Review Date via SM-2

**As a** system, **I can** compute the next review date for each contact using the SM-2 algorithm after every quiz answer, **so that** reviews are scheduled at the optimal interval for long-term retention.

## Acceptance Criteria

- [ ] SM-2 parameters (easiness factor, interval, repetition count) are stored per contact per user
- [ ] The algorithm updates these parameters based on the recall rating after each quiz answer
- [ ] The computed next-review date is stored and used to populate the due-review dashboard
- [ ] Calculation is idempotent — replaying the same rating on the same state produces the same result
