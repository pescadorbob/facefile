# User Removes a Contact's Photo and Reverts to the Placeholder

**As a** user, **I can** remove a contact's saved photo without choosing a replacement, **so that** I can clear a wrong or unwanted photo even if I don't have a new one ready.

## Acceptance Criteria

- [ ] The edit view offers a "Remove Photo" action whenever the contact currently has a saved photo
- [ ] Removing the photo and saving clears the contact's saved photo
- [ ] After removal, the contact displays the placeholder silhouette wherever its photo is shown
- [ ] The "Remove Photo" action is not offered when the contact already has no saved photo (it already shows the placeholder)

## Scenarios

Scenario: User removes a contact's photo
GIVEN a contact has a saved photo
WHEN the user opens the edit view, chooses "Remove Photo", and saves
THEN the contact has no saved photo and displays the placeholder silhouette

Scenario: Remove action is unavailable with no photo to remove
GIVEN a contact has no saved photo and shows the placeholder silhouette
WHEN the user opens the edit view
THEN no "Remove Photo" action is offered
