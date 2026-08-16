# Clearing the Name Blocks the Update

**As a** user, **when I** clear the Name field while editing a contact, **I expect** the save to be rejected, **so that** I can't accidentally leave a contact without a name.

## Acceptance Criteria

- [ ] Submitting the edit form with an empty Name is rejected and highlights the field as required
- [ ] When the update is rejected, none of the contact's fields (name or photo) are changed
- [ ] Other in-progress edits (e.g. a newly chosen photo) remain in the form after the rejected save, so the user doesn't lose them

## Scenarios

Scenario: Empty name blocks the save
GIVEN the user is editing a contact and clears the Name field
WHEN the user attempts to save
THEN the save is rejected, the Name field is highlighted as required, and the contact is not updated

Scenario: A rejected save does not discard other in-progress edits
GIVEN the user is editing a contact, has cleared the Name field, and has also chosen a new photo
WHEN the user attempts to save and the save is rejected
THEN the newly chosen photo is still showing in the form so the user can fix the Name and retry
