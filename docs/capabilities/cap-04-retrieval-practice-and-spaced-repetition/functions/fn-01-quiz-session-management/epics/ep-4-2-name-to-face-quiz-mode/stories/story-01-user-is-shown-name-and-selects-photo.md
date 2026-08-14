# User Is Shown Name and Selects Photo

**As a** user in a quiz session, **I can** be shown a contact's name and select their photo from a set of options, **so that** I practice face recognition for people I've been told about.

## Acceptance Criteria

- [ ] The quiz card shows the contact's name and displays 4 photo options
- [ ] Exactly one of the options is the correct contact's photo
- [ ] Tapping a photo locks in the selection and reveals whether it was correct
- [ ] The correct photo is highlighted on the reveal regardless of which option was selected

## Scenarios

Scenario: The quiz card shows a name and four photo options
GIVEN the user has four contacts with photos
WHEN they start a Name → Face session
THEN the card names someone and offers four faces to choose between

Scenario: Exactly one option is the contact being asked about
GIVEN a Name → Face question about Priya
WHEN the answer is revealed
THEN exactly one of the four faces is marked as hers

Scenario: Tapping a photo locks in the selection and reveals the outcome
GIVEN a Name → Face question about Priya
WHEN the user taps her photo
THEN the selection is confirmed as the right one and her name is shown

Scenario: The correct photo is highlighted even when another was chosen
GIVEN a Name → Face question about Priya
WHEN the user taps somebody else's photo
THEN her photo is still the one marked as the answer
