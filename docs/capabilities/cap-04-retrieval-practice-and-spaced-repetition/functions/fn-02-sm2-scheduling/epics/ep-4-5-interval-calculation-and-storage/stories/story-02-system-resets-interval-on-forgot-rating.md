# System Resets Interval on Forgot Rating

**As a** system, **I can** reset a contact's review interval to 1 day when the user rates their recall as "Forgot", **so that** lapsed memories restart from the beginning of the learning curve.

## Acceptance Criteria

- [ ] A "Forgot" rating sets the contact's next review date to the following day
- [ ] The easiness factor is reduced by 0.2 (SM-2 standard) but not below 1.3
- [ ] The repetition count is reset to 0
- [ ] The lapse event is logged in the contact's review history for analytics
