# S-1.1.1: New User Walks Through the 7-Step Fundamentals Tutorial

> Epic: [E-1.1 User Learns Memory Palace Fundamentals](../README.md)

**As a** new user, **I can** step through all seven memory-palace fundamentals one at a time and only receive a "fundamentals complete" confirmation on the final step, **so that** I learn the full foundation before the application marks me ready.

## Acceptance Criteria

- [ ] The tutorial presents exactly 7 named steps in sequence.
- [ ] Each step displays its educational content before the option to advance to the next step is shown.
- [ ] At least one of the 7 steps includes a visual example of memory palace structure or person placement.
- [ ] A user who completes step 7 sees a "fundamentals complete" confirmation.
- [ ] A user on any step before step 7 does not see a "fundamentals complete" confirmation.

## Scenarios

**Happy path — full walkthrough**

GIVEN a new user has not started the tutorial  
WHEN they open the tutorial  
THEN they see step 1 of 7 with its educational content displayed before any "next step" option

GIVEN a user is on step 7 and has viewed its content  
WHEN they advance past step 7  
THEN they see a "fundamentals complete" confirmation

**Completion is gated to the final step**

GIVEN a user is on step 6 of the tutorial  
WHEN they complete step 6  
THEN they are taken to step 7 and do not yet see a "fundamentals complete" confirmation

**Visual example is present**

GIVEN a user is progressing through the tutorial  
WHEN they view the steps  
THEN at least one step contains a visual example of a memory palace structure or person placement
