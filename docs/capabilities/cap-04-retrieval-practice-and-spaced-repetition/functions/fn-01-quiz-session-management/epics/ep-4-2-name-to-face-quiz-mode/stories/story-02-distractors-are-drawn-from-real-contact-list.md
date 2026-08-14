# Distractors Are Drawn from Real Contact List

**As a** user taking a Name → Face quiz, **I can** see distractor photos drawn from my actual contact list, **so that** the task stays challenging and realistic as my list grows.

## Acceptance Criteria

- [ ] Distractor photos are randomly selected from contacts the user has added
- [ ] Distractors are never the correct contact for that question
- [ ] When the contact list has fewer than 4 entries, the quiz degrades gracefully (fewer options or a different mode)
- [ ] Distractor selection changes each time the same contact is quizzed to prevent pattern matching

## Scenarios

Scenario: The options offered are all contacts the user has added
GIVEN the user has exactly four contacts with photos
WHEN they start a Name → Face session
THEN the four options can only have come from that list

Scenario: The contact being asked about is never also a distractor
GIVEN a Name → Face question about Priya
WHEN the answer is revealed
THEN she appears exactly once, as the answer

Scenario: A list shorter than four offers fewer options rather than failing
GIVEN the user has only two contacts with photos
WHEN they start a Name → Face session
THEN the card offers two faces and still works

Scenario: A single contact is quizzed the other way round instead
GIVEN the user has exactly one contact, so there is no decoy to offer
WHEN they start a Name → Face session
THEN the question degrades to Face → Name rather than offering a list of one

Scenario: Quizzing the same contact twice offers a different set of distractors
GIVEN a user with many contacts, of whom one is quizzed repeatedly
WHEN that contact is quizzed several times over
THEN the set of decoys is not the same every time

## Coverage notes

The last scenario is exercised in `e2e/unit/quiz-session.unit.spec.ts`, which can ask
about one fixed contact repeatedly and compare the sets. Driving it through the browser
would compare options across different questions, which proves nothing about the
distractors. All other scenarios run in
`e2e/specs/quiz-name-to-face/story-02-distractors-are-drawn-from-real-contact-list.e2e.spec.ts`.
