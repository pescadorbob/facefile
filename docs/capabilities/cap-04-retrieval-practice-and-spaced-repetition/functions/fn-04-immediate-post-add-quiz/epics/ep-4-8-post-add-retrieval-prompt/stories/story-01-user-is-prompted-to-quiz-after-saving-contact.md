# User Is Prompted to Quiz After Saving Contact

**As a** user who has just saved a new contact, **I can** be automatically prompted to answer a one-question quiz about them, **so that** retrieval practice starts within the critical window before the image fades from working memory.

## Acceptance Criteria

- [ ] A quiz prompt appears immediately after the contact save confirmation
- [ ] The prompt contains a single Face → Name or Name → Face question for the just-added contact
- [ ] The quiz uses the same reveal and rating flow as a standard session
- [ ] Completing the prompt updates the contact's SM-2 schedule as if it were a regular session

## Scenarios

Scenario: Saving a contact leads straight to a quiz prompt
GIVEN a user completing the add-person wizard
WHEN they save the new contact
THEN they are taken to a quiz prompt rather than back to a list

Scenario: The prompt holds a single question about the contact just added
GIVEN a user who has just saved a contact
WHEN the prompt appears
THEN it is one question, and it is about them

Scenario: The prompt uses the same reveal and rating flow as any session
GIVEN a user on the post-add quiz prompt
WHEN they answer the question
THEN the name is revealed and the same four ratings are offered

Scenario: Completing the prompt updates the contact's review schedule
GIVEN a user on the post-add quiz prompt
WHEN they rate their recall
THEN the answer is on record and a new review date has been computed
