# User Updates a Contact's Name

**As a** user, **I can** change a contact's first name, last name, or nickname and save, **so that** a typo or new information is reflected without recreating the contact.

## Acceptance Criteria

- [ ] Changing First Name, Last Name, and/or Nickname in the edit view and saving updates the contact with the new values
- [ ] Each name field accepts up to 100 characters, matching the add-contact rule
- [ ] Leading and trailing whitespace is trimmed before the update is saved
- [ ] Fields left unchanged keep their existing values after save
- [ ] Clearing Last Name or Nickname and saving removes that value from the contact, since both are optional

## Scenarios

Scenario: User corrects a misspelled name
GIVEN a contact exists with First Name "Jon"
WHEN the user opens the edit view, changes First Name to "John", and saves
THEN the contact's First Name is "John"

Scenario: User adds a nickname that wasn't captured at add time
GIVEN a contact exists with no Nickname
WHEN the user opens the edit view, enters Nickname "Jay", and saves
THEN the contact's Nickname is "Jay"

Scenario: User clears an optional name field
GIVEN a contact exists with Nickname "Jay"
WHEN the user opens the edit view, clears the Nickname field, and saves
THEN the contact no longer has a Nickname

Scenario: Whitespace is trimmed on save
GIVEN the user is editing a contact
WHEN the user enters "  Priya  " in the First Name field and saves
THEN the contact's First Name is saved as "Priya"
