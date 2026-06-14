# Interval Resets to One Day on Forgot

**As a** system, **I can** reset a contact's review interval to 1 day when the user rates their recall as "Forgot", **so that** lapsed memories restart the learning curve from the beginning.

## Acceptance Criteria

- [ ] A "Forgot" rating sets the next review date to tomorrow regardless of the previous interval
- [ ] The SM-2 repetition count is reset to 0 for the contact
- [ ] The easiness factor is decremented by 0.2, floored at 1.3
- [ ] The reset is applied atomically — no partial state is possible if the request fails mid-flight
