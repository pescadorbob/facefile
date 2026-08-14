# User Views Upcoming Reviews by Date

**As a** user, **I can** see a list of upcoming reviews grouped by date, **so that** I can plan ahead and anticipate busy practice days.

## Acceptance Criteria

- [ ] A "Upcoming" view shows reviews grouped by day for the next 14 days
- [ ] Each day shows the count of contacts due and the contacts' names
- [ ] Days with zero reviews are not shown to keep the list concise
- [ ] Tapping a future date shows which specific contacts are due that day

## Scenarios

Scenario: The upcoming view is reachable from the dashboard
GIVEN a user on the dashboard
WHEN they open the upcoming reviews
THEN they land on that view

Scenario: Reviews are grouped by the day they fall on
GIVEN two contacts scheduled for the same future day
WHEN the user views the upcoming reviews
THEN they are grouped into a single day carrying both

Scenario: Each day names the contacts due on it
GIVEN a contact scheduled for a future review
WHEN the user views the upcoming reviews
THEN that contact's name is listed under the day

Scenario: Days with no reviews are left out of the list
GIVEN a single contact scheduled one day out, with nothing on the days after
WHEN the user views the upcoming reviews
THEN exactly one day is listed, not fourteen with thirteen of them empty

Scenario: The view covers fourteen days and stops there
GIVEN one contact due on the last day of the window and one just past it
WHEN the user views the upcoming reviews
THEN the day inside the window is shown and the one beyond it is not

Scenario: Tapping a day shows which contacts are due on it
GIVEN two contacts scheduled for a future day
WHEN the user taps that day
THEN each contact due on it is listed individually

Scenario: A user with nothing scheduled is told the window is clear
GIVEN a user with no contacts at all
WHEN they view the upcoming reviews
THEN they are told there is nothing scheduled rather than shown a blank list

## Coverage notes

The fourteen-day boundary scenario is exercised in
`e2e/unit/review-reminders.unit.spec.ts`, which can place a review exactly on and just
past the edge of the window against a fixed clock. The rest run in
`e2e/specs/due-review-dashboard/story-02-user-views-upcoming-reviews-by-date.e2e.spec.ts`.
