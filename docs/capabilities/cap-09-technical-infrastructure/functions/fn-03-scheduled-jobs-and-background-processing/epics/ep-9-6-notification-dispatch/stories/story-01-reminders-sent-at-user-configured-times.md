# Reminders Sent at User-Configured Times

**As a** system, **I can** dispatch review reminder notifications at each user's individually configured time, **so that** delivery is personalized and not sent at a generic system time.

## Acceptance Criteria

- [ ] The notification dispatch job runs every 15 minutes and sends to users whose configured reminder time falls within that window
- [ ] Each user's local timezone is applied when comparing their configured time to the current UTC time
- [ ] A user is not notified if they have zero contacts due that day
- [ ] A user is not notified more than once per day regardless of how many times the job runs
