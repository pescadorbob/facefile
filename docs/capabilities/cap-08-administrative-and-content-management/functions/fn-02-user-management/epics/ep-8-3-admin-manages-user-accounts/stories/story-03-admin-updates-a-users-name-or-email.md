# Admin Updates a User's Name or Email

**As an** administrator, **I can** update a user's name or email address, **so that** account information stays accurate when a user's details change.

## Acceptance Criteria

- [ ] An admin can open an edit form for an existing user account, pre-filled with the current name and email
- [ ] Saving the form with a new name updates the account's name
- [ ] Saving the form with a new email updates the account's email
- [ ] Saving the form with the email cleared is rejected with an inline error, and the account is not updated
- [ ] Saving the form with an email already used by another account is rejected with an inline error, and the account is not updated

## Scenarios

Scenario: Admin updates a user's name
GIVEN a user account exists with name "Jordan Lee"
WHEN the admin edits the account and changes the name to "Jordan Lee-Park" and saves
THEN the account's name is updated to "Jordan Lee-Park"

Scenario: Admin updates a user's email
GIVEN a user account exists with email "jordan.lee@example.com"
WHEN the admin edits the account and changes the email to "jordan.park@example.com" and saves
THEN the account's email is updated to "jordan.park@example.com"

Scenario: Clearing the email blocks the update
GIVEN the admin is editing a user account
WHEN the admin clears the email field and saves
THEN an inline error appears and the account's email is not changed

Scenario: Duplicate email blocks the update
GIVEN a user account exists with email "sam.rivera@example.com"
WHEN the admin edits a different account and changes its email to "sam.rivera@example.com" and saves
THEN an inline error appears and the account is not updated
