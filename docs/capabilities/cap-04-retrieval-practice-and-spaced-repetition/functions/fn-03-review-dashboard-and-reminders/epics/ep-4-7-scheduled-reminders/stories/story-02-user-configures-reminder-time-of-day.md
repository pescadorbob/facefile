# User Configures Reminder Time of Day

**As a** user, **I can** set the time of day my review reminders are sent, **so that** they arrive when I'm most likely to act on them.

## Acceptance Criteria

- [ ] A time picker in notification settings lets the user choose hour and minute
- [ ] The saved time is stored in the user's local timezone
- [ ] The cron job respects the user's configured time when dispatching notifications
- [ ] Changing the time takes effect starting with the next scheduled notification

## Scenarios

Scenario: The settings offer a time picker for the hour and minute
GIVEN a user in notification settings
WHEN they open the reminder settings
THEN a time of day can be chosen down to the minute

Scenario: A chosen time is saved and shown back
GIVEN a user in reminder settings
WHEN they pick 18:45
THEN that is the time their reminders are scheduled for

Scenario: The settings state the timezone the time is read in
GIVEN a user in reminder settings
WHEN they set a time
THEN the timezone it will be honoured in is shown alongside it

Scenario: The configured time is read in the user's own timezone
GIVEN two users who both asked for 09:00, one in Sydney and one in New York
WHEN the sweep runs at an instant that is past 09:00 in Sydney but not in New York
THEN the Sydney user is reminded and the New York user is not

Scenario: The sweep holds a reminder back until the configured time has passed
GIVEN a user with reminders on, contacts due, and a reminder time late in the day
WHEN the sweep runs before that time
THEN nothing has been sent yet

Scenario: Changing the time takes effect on the very next sweep
GIVEN a user whose reminder is being held back until late in the day
WHEN they move the time to one that has already passed today
THEN the reminder goes out on that sweep

## Coverage notes

The timezone scenario is exercised in `e2e/unit/review-reminders.unit.spec.ts`, which can
hold one instant still and read it in two zones at once; a browser run only ever sits in
one zone. The rest run in
`e2e/specs/scheduled-reminders/story-02-user-configures-reminder-time-of-day.e2e.spec.ts`.
