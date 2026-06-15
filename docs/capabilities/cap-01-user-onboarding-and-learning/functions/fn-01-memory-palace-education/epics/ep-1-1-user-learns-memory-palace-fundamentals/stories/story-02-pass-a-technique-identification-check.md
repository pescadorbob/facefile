# S-1.1.2: New User Passes a Technique Identification Check

> Epic: [E-1.1 User Learns Memory Palace Fundamentals](../README.md)

**As a** new user, **I can** answer a short check that asks me to identify the three core name-image techniques, **so that** I can confirm I understand them before my fundamentals are marked complete.

## Acceptance Criteria

- [ ] The check presents at least one question covering each of the three name-image techniques: sound-alike, meaning-based, and split-name.
- [ ] A user who correctly identifies all three techniques sees a passing result and can proceed.
- [ ] A user who answers one or more questions incorrectly sees which technique(s) they missed and is offered the option to retry.
- [ ] The fundamentals are not marked complete until the user has passed the check.

## Scenarios

**Check covers all three techniques**

GIVEN a user has reached the technique identification check  
WHEN the check is displayed  
THEN it includes at least one question for each of the sound-alike, meaning-based, and split-name techniques

**Passing the check**

GIVEN a user has correctly identified all three techniques  
WHEN they submit the check  
THEN they see a passing result and can continue in the tutorial flow

**Failing the check**

GIVEN a user has answered one or more questions incorrectly  
WHEN they submit the check  
THEN they see which technique(s) they missed  
AND they are offered the option to retry the check

**Check is a prerequisite for completion**

GIVEN a user has not yet passed the technique check  
WHEN they would otherwise be eligible to see the "fundamentals complete" confirmation  
THEN the confirmation is not shown and they are directed to complete the check first
