# Admin Reactivates a Previously Deactivated User Account

**As an** administrator, **I can** reactivate a previously deactivated user account, **so that** a user's access can be restored without recreating their account.

## Acceptance Criteria

- [ ] An admin can reactivate a deactivated user account
- [ ] Once reactivated, the account's status shows as active in the user account list
- [ ] A reactivated user can sign in / select their profile again
- [ ] Reactivating an already-active account has no further effect

## Scenarios

Scenario: Admin reactivates a deactivated account
GIVEN a user account named "Sam Rivera" is deactivated
WHEN the admin reactivates the account
THEN the account's status becomes active

Scenario: Reactivated account can sign in again
GIVEN a user account named "Sam Rivera" has just been reactivated
WHEN Sam Rivera attempts to select their profile
THEN access is granted

Scenario: Active status is reflected in the account list
GIVEN a user account named "Sam Rivera" has just been reactivated
WHEN the admin views the user account list
THEN "Sam Rivera" is shown with a status of active

Scenario: Reactivating an already-active account is a no-op
GIVEN a user account named "Sam Rivera" is already active
WHEN the admin reactivates the account again
THEN the account remains active with no error
