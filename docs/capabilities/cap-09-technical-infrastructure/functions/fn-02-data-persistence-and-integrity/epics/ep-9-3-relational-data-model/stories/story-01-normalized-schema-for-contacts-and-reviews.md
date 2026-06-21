# Normalized Schema for Contacts and Reviews

**As a** system, **I can** store contacts, review history, SM-2 parameters, palaces, and locus assignments in a normalized relational schema, **so that** data relationships are consistent and queryable without duplication.

## Acceptance Criteria

- [ ] The schema separates users, contacts, review_events, sm2_state, palaces, and locus_assignments into distinct tables with foreign key relationships
- [ ] The SM-2 state (easiness factor, interval, repetition count, next_review_date) is stored per contact per user
- [ ] Cascading deletes are configured so removing a user removes all their associated records
- [ ] The schema is committed to the repository under `prisma/schema.prisma`
