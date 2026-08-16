# Editing a Contact Leaves Its Review Schedule Untouched

**As a** user, **I want** editing a contact's name or photo to leave their review schedule exactly as it was, **so that** correcting a typo or swapping a photo doesn't cost me the spaced-repetition progress I've already built up on that contact.

## Acceptance Criteria

- [ ] Saving a name-only edit does not change the contact's next review date or review interval
- [ ] Saving a photo-only edit does not change the contact's next review date or review interval
- [ ] Saving a combined name-and-photo edit does not change the contact's next review date or review interval
- [ ] The contact's review history (past quiz results) is unaffected by an edit

## Scenarios

Scenario: Name edit does not reschedule review
GIVEN a contact is due for review in 6 days
WHEN the user edits and saves only the contact's name
THEN the contact is still due for review in 6 days

Scenario: Photo edit does not reschedule review
GIVEN a contact is due for review in 6 days
WHEN the user edits and saves only the contact's photo
THEN the contact is still due for review in 6 days

Scenario: Edit does not erase review history
GIVEN a contact has been quizzed and answered correctly twice
WHEN the user edits the contact's name and saves
THEN the contact's two prior quiz results are still present in its review history
