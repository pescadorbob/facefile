# Scheduler Logs Run Time and Record Count

**As a** system, **I can** log the start time, end time, and number of records updated for each scheduler run, **so that** failures or anomalies are detectable in application logs.

## Acceptance Criteria

- [ ] Each job run writes a structured log entry with: run_start, run_end, records_updated, and status (success/error)
- [ ] If the job throws an error, the exception is logged and the job does not silently swallow it
- [ ] Logs are written to the same output stream as application logs (stdout or log file)
- [ ] A run that updates 0 records is still logged (this is a valid and common state)
