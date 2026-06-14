# Cron Marks Contacts as Due Hourly

**As a** system, **I can** run a cron job hourly that identifies contacts whose `next_review_date` has passed and marks them as due, **so that** the dashboard always reflects the current review queue.

## Acceptance Criteria

- [ ] The cron job runs on the hour using node-cron or equivalent
- [ ] It queries for all contacts where `next_review_date <= now()` and updates their `is_due` flag (or equivalent)
- [ ] The dashboard reads from this flag rather than computing due status on every page load
- [ ] The job completes within 5 seconds for a dataset of up to 10,000 contacts
