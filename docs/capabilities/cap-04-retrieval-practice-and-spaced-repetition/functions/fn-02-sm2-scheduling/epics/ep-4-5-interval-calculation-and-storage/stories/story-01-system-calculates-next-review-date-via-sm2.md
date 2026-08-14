# System Calculates Next Review Date via SM-2

**As a** system, **I can** compute the next review date for each contact using the SM-2 algorithm after every quiz answer, **so that** reviews are scheduled at the optimal interval for long-term retention.

## Acceptance Criteria

- [ ] SM-2 parameters (easiness factor, interval, repetition count) are stored per contact per user
- [ ] The algorithm updates these parameters based on the recall rating after each quiz answer
- [ ] The computed next-review date is stored and used to populate the due-review dashboard
- [ ] Calculation is idempotent — replaying the same rating on the same state produces the same result

## Scenarios

Scenario: Answering a question stores a new schedule for that contact
GIVEN a newly added contact, due for review straight away
WHEN the user rates their recall
THEN a next review date has been computed and stored for that contact

Scenario: The schedule is recalculated from the rating the user gave
GIVEN a contact due for review
WHEN the user rates the recall as Easy
THEN the rating is on record and the card has been pushed out of today's queue

Scenario: A first successful recall schedules the next review one day out
GIVEN a contact that has never been reviewed
WHEN the user rates their recall Good
THEN the interval, repetition count and next review date all advance together

Scenario: A second successful recall schedules the next review six days out
GIVEN a contact recalled successfully once already
WHEN the user rates their recall Good again
THEN the interval widens to the SM-2 second step

Scenario: Later successful recalls multiply the interval by the easiness factor
GIVEN a contact with an established interval and easiness factor
WHEN the user recalls it successfully again
THEN the next interval is the previous one stretched by that easiness factor

Scenario: The computed date feeds the due-review dashboard
GIVEN two contacts due for review
WHEN one of them is reviewed successfully
THEN the dashboard counts only the one still due

Scenario: The schedule is kept per contact, not shared across them
GIVEN two contacts due for review
WHEN only one of them is reviewed
THEN the other is still due, with a schedule of its own

Scenario: Replaying the same rating on the same state produces the same result
GIVEN one card state and one rating
WHEN the rating is applied twice
THEN both calculations agree exactly

## Coverage notes

The interval-progression and idempotency scenarios are exercised in
`e2e/unit/sm2-scheduling.unit.spec.ts`, which can hold the clock and the card state
still — through the browser, every replay would start from the state the previous one
wrote. The observable scenarios run in
`e2e/specs/sm2-scheduling/story-01-system-calculates-next-review-date-via-sm2.e2e.spec.ts`.
