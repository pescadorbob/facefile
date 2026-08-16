# Editing a Contact Leaves Its Palace and Locus Placement Untouched

**As a** user, **I want** editing a contact's name or photo to leave them in the same palace and locus, **so that** a name/photo correction never accidentally moves them somewhere else in my memory palace.

## Acceptance Criteria

- [ ] Saving a name and/or photo edit does not change which palace the contact belongs to
- [ ] Saving a name and/or photo edit does not change which locus within that palace the contact is assigned to
- [ ] The edit view does not offer palace or locus reassignment — moving a contact remains a separate action

## Scenarios

Scenario: Name edit leaves locus assignment unchanged
GIVEN a contact is assigned to a specific locus in a palace
WHEN the user edits and saves the contact's name
THEN the contact remains assigned to the same locus in the same palace

Scenario: Photo edit leaves palace assignment unchanged
GIVEN a contact belongs to a specific palace
WHEN the user edits and saves the contact's photo
THEN the contact still belongs to the same palace

Scenario: Edit view has no palace or locus controls
GIVEN the user has opened the edit view for a contact
WHEN they look for a way to change the contact's palace or locus
THEN no such control is present in the edit view
