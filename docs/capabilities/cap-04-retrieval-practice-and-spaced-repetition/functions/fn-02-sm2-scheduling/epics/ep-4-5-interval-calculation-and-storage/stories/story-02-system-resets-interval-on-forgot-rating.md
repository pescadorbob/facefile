# System Resets Interval on Forgot Rating

**As a** system, **I can** reset a contact's review interval to 1 day when the user rates their recall as "Forgot", **so that** lapsed memories restart from the beginning of the learning curve.

## Acceptance Criteria

- [ ] A "Forgot" rating sets the contact's next review date to the following day
- [ ] The easiness factor is reduced by 0.2 (SM-2 standard) but not below 1.3
- [ ] The repetition count is reset to 0
- [ ] The lapse event is logged in the contact's review history for analytics

## Scenarios

Scenario: A forgot rating moves the next review to the following day
GIVEN a contact reviewed successfully several times, so its interval has widened
WHEN the user forgets it on the next review
THEN it is not due today, but is scheduled again tomorrow rather than weeks out

Scenario: A forgot rating reduces the easiness factor by 0.2
GIVEN a contact at the default easiness factor
WHEN the user rates their recall Forgot
THEN the easiness factor drops by exactly the lapse penalty

Scenario: The easiness factor never falls below its floor however often it lapses
GIVEN a contact already at the minimum easiness factor of 1.3
WHEN the user forgets it again
THEN it holds at the floor rather than sinking further

Scenario: A forgot rating resets the repetition count to zero
GIVEN a contact with five successful repetitions behind it
WHEN the user rates their recall Forgot
THEN the repetition count starts again

Scenario: The lapse is logged in the contact's review history
GIVEN a contact due for review
WHEN the user rates their recall as Forgot
THEN the lapse is on that contact's history, available for later analysis

Scenario: A successful recall logs no lapse
GIVEN a contact due for review
WHEN the user recalls it successfully
THEN nothing is recorded as a lapse

## Coverage notes

The easiness-factor and repetition-count scenarios describe internal scheduling
parameters with no representation on any screen; they are exercised directly in
`e2e/unit/sm2-scheduling.unit.spec.ts`. The observable scenarios run in
`e2e/specs/sm2-scheduling/story-02-system-resets-interval-on-forgot-rating.e2e.spec.ts`.
