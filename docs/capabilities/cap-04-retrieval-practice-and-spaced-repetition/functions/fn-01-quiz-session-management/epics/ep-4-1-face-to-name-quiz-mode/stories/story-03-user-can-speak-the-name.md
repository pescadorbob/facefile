# User Can Speak the Name Instead of Typing It

**As a** user in a Face → Name quiz session, **I can** say the contact's name aloud instead of typing it, **so that** I can answer the way I'd actually greet someone, without reaching for the keyboard.

## Acceptance Criteria

- [ ] The user can choose "Say the name" as the answering method for a Face → Name session, alongside multiple choice and typing
- [ ] A spoken-answering question offers a control to start listening and shows when it is listening
- [ ] What the user said is shown back to them as text once it is heard
- [ ] A spoken answer is accepted as correctly recalled when it is a close match to the contact's name, not only an exact match
- [ ] A spoken answer that is not a close match to the contact's name is marked as not recalled
- [ ] The spoken answering method is not offered when the user's browser cannot listen for speech

## Scenarios

Scenario: The user can choose to answer by speaking
GIVEN a Face → Name session about to start
WHEN the user selects "Say the name" as the answering method
THEN the session begins with a control for speaking the answer, not a typed field or multiple-choice list

Scenario: The spoken answer is shown back as text
GIVEN a spoken-answering Face → Name question about Priya
WHEN the user speaks and their words are heard
THEN what they said is displayed as text on the card

Scenario: A close but imperfect spoken answer is still accepted
GIVEN a spoken-answering Face → Name question about Priya
WHEN what is heard is close to "Priya" but not identical, such as "Pria"
THEN the answer is accepted as correctly recalled

Scenario: A spoken answer that misses badly is marked as not recalled
GIVEN a spoken-answering Face → Name question about Priya
WHEN what is heard is an unrelated name
THEN the answer is marked as not recalled, and the reveal still shows Priya's name as usual

Scenario: Spoken answers are graded by closeness, not an exact match
GIVEN a spoken-answering Face → Name question about Priya
WHEN what is heard is <heard>
THEN the answer is graded as <outcome>

| Heard          | Outcome              |
|----------------|-----------------------|
| Priya          | correctly recalled    |
| priya          | correctly recalled    |
| Pria           | correctly recalled    |
| Somebody Else  | not recalled          |

Scenario: Voice answering is not offered when the browser cannot listen
GIVEN a browser with no speech recognition support
WHEN the user reaches the session-type screen
THEN "Say the name" is not offered as an answering method
