# User Sees Correct Name After Answering

**As a** user who has submitted an answer in Face → Name mode, **I can** see the correct name confirmed on the reveal screen regardless of whether I was right, **so that** I can self-calibrate even on correct answers.

## Acceptance Criteria

- [ ] The reveal screen always shows the contact's full name prominently
- [ ] A correct answer shows a positive confirmation alongside the name
- [ ] An incorrect answer shows the correct name without negative language
- [ ] The name image and interaction description are shown on the reveal for encoding reinforcement

## Scenarios

Scenario: The reveal shows the full name after a correct answer
GIVEN a Face → Name question about Priya
WHEN the user answers correctly
THEN the reveal names her

Scenario: The reveal shows the full name after a wrong answer too
GIVEN a Face → Name question about Priya
WHEN the user answers with the wrong name
THEN the reveal still names her

Scenario: A correct answer is confirmed alongside the name
GIVEN a Face → Name question about Priya
WHEN the user answers correctly
THEN the reveal confirms the recall as well as showing the name

Scenario: A wrong answer is corrected without negative language
GIVEN a Face → Name question about Priya
WHEN the user answers with the wrong name
THEN the reveal corrects them without calling the attempt wrong, incorrect or failed

Scenario: The name image and association scene are shown for reinforcement
GIVEN a Face → Name question about a contact with both encoding cues recorded
WHEN the user answers
THEN the name image and association scene are shown back alongside the name
