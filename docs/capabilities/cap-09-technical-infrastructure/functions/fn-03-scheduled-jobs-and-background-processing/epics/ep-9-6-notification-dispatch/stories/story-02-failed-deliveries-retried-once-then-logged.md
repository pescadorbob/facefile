# Failed Deliveries Retried Once Then Logged

**As a** system, **I can** retry a failed notification delivery once before logging it as a persistent failure, **so that** transient errors don't cause missed reminders while delivery spamming is avoided.

## Acceptance Criteria

- [ ] If a notification delivery fails, one retry is attempted after a 30-second delay
- [ ] If the retry also fails, a structured error log entry is written with the user ID, channel, and error message
- [ ] No further delivery attempts are made for that notification after the second failure
- [ ] Persistent failures are aggregated in logs so ops can identify systemic issues
