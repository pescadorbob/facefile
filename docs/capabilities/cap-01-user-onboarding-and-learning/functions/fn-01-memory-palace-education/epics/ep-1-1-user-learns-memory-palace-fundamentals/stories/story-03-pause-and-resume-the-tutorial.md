# S-1.1.3: New User Can Pause and Resume the Tutorial

> Epic: [E-1.1 User Learns Memory Palace Fundamentals](../README.md)

**As a** new user, **I can** leave the tutorial before finishing and return to the same step later, **so that** I do not have to restart from the beginning if I cannot complete it in one sitting.

## Acceptance Criteria

- [ ] A user who exits the tutorial on step N and later returns is placed back at step N.
- [ ] A user who has never opened the tutorial starts at step 1 when they open it.
- [ ] A user who has already completed the tutorial sees the "fundamentals complete" state when they return.

## Scenarios

**Resume at the step where the user left off**

GIVEN a user is on step 4 of the tutorial  
WHEN they exit the tutorial and return at a later time  
THEN they are placed at step 4 with its content displayed

**First-time open starts at step 1**

GIVEN a user has never opened the tutorial  
WHEN they open it for the first time  
THEN they are placed at step 1

**Returning after completion**

GIVEN a user has previously completed the tutorial  
WHEN they return to the tutorial  
THEN they see the "fundamentals complete" state
