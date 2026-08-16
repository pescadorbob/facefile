# Clearing the First Name Blocks the Update

**As a** user, **when I** clear the First Name field while editing a contact, **I expect** the save to be rejected, **so that** I can't accidentally leave a contact without a name.

## Acceptance Criteria

- [ ] Submitting the edit form with an empty First Name is rejected and highlights the field as required
- [ ] When the update is rejected, none of the contact's fields (name or photo) are changed
- [ ] The rest of the form's entered values (Last Name, Nickname, chosen photo) remain in the form after the rejected save, so the user doesn't lose other edits already made

## Scenarios

Scenario: Empty First Name blocks the save
GIVEN the user is editing a contact and clears the First Name field
WHEN the user attempts to save
THEN the save is rejected, the First Name field is highlighted as required, and the contact is not updated

Scenario: A rejected save does not discard other in-progress edits
GIVEN the user is editing a contact, has cleared First Name, and has also changed the Nickname field
WHEN the user attempts to save and the save is rejected
THEN the Nickname field still shows the user's entered value so they can fix the First Name and retry
