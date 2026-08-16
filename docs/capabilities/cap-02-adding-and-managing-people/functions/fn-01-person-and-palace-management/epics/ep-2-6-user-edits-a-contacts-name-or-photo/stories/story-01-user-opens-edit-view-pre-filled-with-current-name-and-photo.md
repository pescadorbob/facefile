# User Opens an Edit View Pre-Filled with the Contact's Current Name and Photo

**As a** user, **I can** open an edit view for an existing contact, **so that** I can review and change their name or photo starting from what's already saved.

## Acceptance Criteria

- [ ] Every contact offers an "Edit" action from wherever the contact is displayed (today, the names-and-faces inventory)
- [ ] Opening the edit view shows the Name field pre-filled with the contact's current name
- [ ] Opening the edit view shows the contact's current photo, or the placeholder silhouette if no photo is saved
- [ ] The edit view can be closed or cancelled without changing the contact

## Scenarios

Scenario: Edit view opens pre-filled
GIVEN a contact exists with name "Priya Chandra" and a saved photo
WHEN the user opens the edit view for that contact
THEN the Name field shows "Priya Chandra" and the saved photo is displayed

Scenario: Edit view opens for a contact with no photo
GIVEN a contact exists with no saved photo
WHEN the user opens the edit view for that contact
THEN the placeholder silhouette is displayed in place of a photo

Scenario: Cancelling the edit view discards changes
GIVEN the user has opened the edit view and changed the Name field
WHEN the user cancels instead of saving
THEN the contact's stored name is unchanged
