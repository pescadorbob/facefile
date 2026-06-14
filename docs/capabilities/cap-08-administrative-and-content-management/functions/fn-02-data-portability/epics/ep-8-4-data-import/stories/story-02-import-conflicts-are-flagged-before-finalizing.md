# Import Conflicts Are Flagged Before Finalizing

**As a** user importing data, **I can** see a list of conflicts (e.g., duplicate contact names) before the import is finalized, **so that** I don't accidentally overwrite good data with stale data from a backup.

## Acceptance Criteria

- [ ] The import flow detects duplicate contacts by matching full name and flags them
- [ ] The user can choose to skip, overwrite, or import as a new entry for each conflict
- [ ] Conflict resolution is applied per-contact, not as an all-or-nothing decision
- [ ] The final import summary shows how many contacts were added, skipped, and overwritten
