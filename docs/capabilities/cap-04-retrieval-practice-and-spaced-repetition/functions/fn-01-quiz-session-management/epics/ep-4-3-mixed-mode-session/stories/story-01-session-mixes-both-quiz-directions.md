# Session Mixes Both Quiz Directions

**As a** user in a mixed-mode session, **I can** receive both Face → Name and Name → Face questions in random order, **so that** both retrieval directions are practiced in every session.

## Acceptance Criteria

- [ ] Mixed mode is the default session type unless the user has overridden their preference
- [ ] Each question type is assigned randomly with approximately equal probability
- [ ] The quiz card clearly indicates the task direction before the user answers
- [ ] The session summary shows how many questions of each type were asked

## Scenarios

Scenario: Mixed is the session type a user starts on by default
GIVEN a user who has never changed their session preference
WHEN they open the quiz
THEN mixed mode is the one already selected

Scenario: An overridden preference is honoured over the default
GIVEN a user on the quiz start screen
WHEN they choose a single direction instead
THEN the session runs in that direction, not the mix

Scenario: Every card states its task direction before the user answers
GIVEN a mixed-mode session
WHEN the session starts
THEN the card says which way round it is being asked

Scenario: The two directions come up with roughly equal frequency
GIVEN a long mixed-mode session
WHEN the questions are assigned
THEN neither direction dominates

Scenario: The summary reports how many questions of each type were asked
GIVEN a session in which every question has been answered and rated
WHEN the session ends
THEN the summary breaks it down by question type

## Coverage notes

The equal-frequency scenario is a statistical property, exercised over hundreds of
questions in `e2e/unit/quiz-session.unit.spec.ts`; a browser session is far too short to
distinguish a fair coin from a biased one. The rest run in
`e2e/specs/quiz-mixed-mode/story-01-session-mixes-both-quiz-directions.e2e.spec.ts`.
