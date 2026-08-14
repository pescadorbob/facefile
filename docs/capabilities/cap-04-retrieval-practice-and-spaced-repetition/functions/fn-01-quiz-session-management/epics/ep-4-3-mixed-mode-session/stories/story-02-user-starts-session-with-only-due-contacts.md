# User Starts Session with Only Due Contacts

**As a** user starting a quiz session, **I can** choose to include only contacts whose review date has passed, **so that** my time is spent where the SM-2 schedule says it matters most.

## Acceptance Criteria

- [ ] The session start screen shows the number of contacts currently due
- [ ] A "Review Due" button starts a session containing only those contacts
- [ ] If zero contacts are due, the button is replaced with the next due date and a time countdown
- [ ] A "Practice All" option is also available for users who want to drill beyond the schedule

## Scenarios

Scenario: The start screen shows how many contacts are currently due
GIVEN the user has three contacts, all due
WHEN they open the quiz
THEN the count of contacts due is shown

Scenario: Review Due starts a session holding only the due contacts
GIVEN two contacts, one of which has just been reviewed and so is not due again
WHEN the user taps Review Due
THEN the session holds the one due contact and no more

Scenario: With nothing due, the button is replaced by the next due date and a countdown
GIVEN a user whose only contact has just been reviewed
WHEN they open the quiz
THEN there is no Review Due button, and they are told when the next review lands

Scenario: Practice All is offered for drilling beyond the schedule
GIVEN a user with nothing currently due
WHEN they choose to practise everything anyway
THEN their contacts are quizzed despite not being due
