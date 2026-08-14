# User Is Shown Photo and Recalls Name

**As a** user in a quiz session, **I can** be shown a contact's photo and type or select their name, **so that** I practice the real-world face-first recall direction.

## Acceptance Criteria

- [ ] The quiz card shows only the contact's photo and no name hint
- [ ] The user can type a name or select from a multiple-choice list depending on session settings
- [ ] Submitting the answer reveals whether it was correct and shows the correct name
- [ ] The question moves to the next card after the user acknowledges the reveal

## Scenarios

Scenario: The quiz card shows the photo and no name hint
GIVEN the user has contacts with photos on file
WHEN they start a Face → Name session
THEN the card shows a face alone, with the contact's name nowhere on it

Scenario: The user can type the name they recall
GIVEN a session set to typed answering
WHEN the session starts
THEN a field is offered for the recalled name

Scenario: The user can select from a multiple-choice list instead
GIVEN a session set to multiple-choice answering
WHEN the session starts
THEN four names are offered to choose between

Scenario: Submitting a correct answer reveals the name and confirms it
GIVEN a Face → Name question about Priya
WHEN the user types her name and submits it
THEN the answer is confirmed and her name is shown

Scenario: Submitting a wrong answer still reveals the correct name
GIVEN a Face → Name question about Priya
WHEN the user types somebody else's name
THEN the answer is marked as not recalled and her name is shown anyway

Scenario: The session moves to the next card once the reveal is acknowledged
GIVEN a two-question session with the first card revealed
WHEN the user acknowledges the reveal by rating their recall
THEN the second card is shown
