# User Receives Notification When Reviews Due

**As a** user with reviews due, **I can** receive a push or email notification alerting me to practice, **so that** I don't forget and miss my optimal review window.

## Acceptance Criteria

- [ ] A notification is sent on any day the user has at least one contact due for review
- [ ] The notification message states how many contacts are due and links directly to the review session
- [ ] Notifications are not sent on days the user has already completed all due reviews
- [ ] Users who have not enabled any notification channel do not receive errors — the setting is silently skipped

## Scenarios

Scenario: A reminder is sent on a day with contacts due
GIVEN a user with reminders on and a contact due for review
WHEN the reminder sweep runs after their configured time
THEN a reminder is waiting for them

Scenario: The reminder states how many contacts are due
GIVEN a user with reminders on and three contacts due
WHEN the reminder sweep runs
THEN the message names that number

Scenario: The reminder leads straight into the review session
GIVEN a user with a reminder waiting
WHEN they open it
THEN they land in a review session

Scenario: No reminder is sent once the day's reviews are all done
GIVEN a user with reminders on whose only contact has already been reviewed
WHEN the reminder sweep runs
THEN nothing is sent

Scenario: A user with no channel enabled is skipped without error
GIVEN a user with reminders on, contacts due, but every delivery channel turned off
WHEN the reminder sweep runs
THEN it completes, having quietly sent them nothing

Scenario: A second sweep on the same day does not send a second reminder
GIVEN a user who has already been reminded today
WHEN the sweep runs again
THEN they still have exactly the one reminder

## Delivery channels

One channel is implemented: **in-app**, which surfaces the reminder on the dashboard.
The channel list is a set, so "no channel enabled" is expressible and is what the
silently-skipped criterion is checked against. Email and push are a further story —
neither an email provider nor a push service is configured in the Amplify backend today,
and `reminderService` dispatches per channel, so adding one is a delivery adapter rather
than a change to any rule above.
