# Admin Deactivates a User Account

**As an** administrator, **I can** deactivate a user account, **so that** the user can no longer access the system once their access should be revoked.

## Acceptance Criteria

- [ ] An admin can deactivate an active user account
- [ ] Once deactivated, the account's status shows as deactivated in the user account list
- [ ] A deactivated user can no longer sign in / select their profile
- [ ] Deactivating an already-deactivated account has no further effect

## Scenarios

Scenario: Admin deactivates an active account
GIVEN a user account named "Sam Rivera" is active
WHEN the admin deactivates the account
THEN the account's status becomes deactivated

Scenario: Deactivated account cannot sign in
GIVEN a user account named "Sam Rivera" has been deactivated
WHEN Sam Rivera attempts to select their profile
THEN access is denied

Scenario: Deactivated status is reflected in the account list
GIVEN a user account named "Sam Rivera" has been deactivated
WHEN the admin views the user account list
THEN "Sam Rivera" is shown with a status of deactivated

Scenario: Deactivating an already-deactivated account is a no-op
GIVEN a user account named "Sam Rivera" is already deactivated
WHEN the admin deactivates the account again
THEN the account remains deactivated with no error
