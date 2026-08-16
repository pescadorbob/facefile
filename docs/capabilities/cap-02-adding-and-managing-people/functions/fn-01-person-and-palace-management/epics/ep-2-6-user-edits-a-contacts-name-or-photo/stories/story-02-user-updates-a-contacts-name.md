# User Updates a Contact's Name

**As a** user, **I can** change a contact's name and save, **so that** a typo or new information is reflected without recreating the contact.

## Acceptance Criteria

- [ ] Changing the Name field in the edit view and saving updates the contact with the new value
- [ ] The Name field accepts up to 100 characters, matching the add-contact rule
- [ ] Leading and trailing whitespace is trimmed before the update is saved

## Scenarios

Scenario: User corrects a misspelled name
GIVEN a contact exists with name "Jon Park"
WHEN the user opens the edit view, changes the name to "John Park", and saves
THEN the contact's name is "John Park"

Scenario: Whitespace is trimmed on save
GIVEN the user is editing a contact
WHEN the user enters "  Priya Chandra  " in the Name field and saves
THEN the contact's name is saved as "Priya Chandra"
