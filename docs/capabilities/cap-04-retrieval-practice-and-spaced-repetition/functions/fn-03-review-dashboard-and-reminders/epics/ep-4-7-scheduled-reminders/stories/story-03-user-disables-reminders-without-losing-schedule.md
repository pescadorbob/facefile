# User Disables Reminders Without Losing Schedule

**As a** user, **I can** turn off all review reminders without affecting my SM-2 schedule, **so that** I can stay in control of my notifications while keeping my review data intact.

## Acceptance Criteria

- [ ] A toggle in notification settings disables all reminders immediately
- [ ] Disabling reminders does not delete or reset any contact's SM-2 parameters
- [ ] The due-review dashboard continues to update normally while reminders are off
- [ ] Re-enabling reminders restores delivery at the user's previously configured time

## Scenarios

Scenario: A single toggle stops all reminders immediately
GIVEN a user with reminders on and a contact due
WHEN they turn reminders off and the sweep runs
THEN nothing is delivered

Scenario: Turning reminders off leaves the review schedule untouched
GIVEN a user with two contacts, one already reviewed and so not due
WHEN they turn reminders off
THEN both contacts keep the schedule they had — one due, one not

Scenario: The due-review dashboard keeps updating while reminders are off
GIVEN a user with reminders off and two contacts due
WHEN one of them is reviewed
THEN the dashboard count moves as normal

Scenario: Re-enabling restores delivery at the previously configured time
GIVEN a user who configured a reminder time and then turned reminders off
WHEN they turn reminders back on without setting a time again
THEN their original time is still in place, and the next sweep delivers
