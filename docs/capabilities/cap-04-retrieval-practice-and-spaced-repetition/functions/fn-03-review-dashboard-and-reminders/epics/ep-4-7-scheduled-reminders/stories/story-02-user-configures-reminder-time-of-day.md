# User Configures Reminder Time of Day

**As a** user, **I can** set the time of day my review reminders are sent, **so that** they arrive when I'm most likely to act on them.

## Acceptance Criteria

- [ ] A time picker in notification settings lets the user choose hour and minute
- [ ] The saved time is stored in the user's local timezone
- [ ] The cron job respects the user's configured time when dispatching notifications
- [ ] Changing the time takes effect starting with the next scheduled notification
