# Admin Views a List of All User Accounts

**As an** administrator, **I can** view a list of all user accounts, **so that** I can see who has access to the system before updating or deactivating anyone.

## Acceptance Criteria

- [ ] An admin can open a list showing every user account in the system
- [ ] Each row in the list shows the user's name, email, status, and creation date
- [ ] The list includes both active and deactivated accounts
- [ ] When no user accounts exist, the list shows an empty-state message instead of an empty table

## Scenarios

Scenario: List shows all accounts with their details
GIVEN 3 user accounts exist, some active and some deactivated
WHEN the admin opens the user account list
THEN all 3 accounts are shown, each with its name, email, status, and creation date

Scenario: List includes deactivated accounts
GIVEN a user account named "Sam Rivera" has been deactivated
WHEN the admin opens the user account list
THEN "Sam Rivera" appears in the list with a status of deactivated

Scenario: Empty list shows a helpful message
GIVEN no user accounts exist yet
WHEN the admin opens the user account list
THEN an empty-state message is shown instead of an empty table
