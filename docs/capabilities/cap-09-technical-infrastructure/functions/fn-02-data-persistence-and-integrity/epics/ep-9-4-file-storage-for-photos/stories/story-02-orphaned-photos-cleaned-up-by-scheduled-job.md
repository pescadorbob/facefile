# Orphaned Photos Cleaned Up by Scheduled Job

**As a** system, **I can** run a scheduled cleanup job that deletes photo files whose corresponding contact records have been removed, **so that** storage doesn't grow unbounded from deleted contacts.

## Acceptance Criteria

- [ ] A cron job runs daily and identifies photo files with no matching contact record in the database
- [ ] Identified orphaned files are deleted from storage
- [ ] The job logs the count of files deleted and the total storage reclaimed
- [ ] The job runs in a low-priority thread and does not affect request latency
