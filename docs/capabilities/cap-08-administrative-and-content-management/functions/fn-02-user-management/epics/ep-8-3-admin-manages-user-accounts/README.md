# E-8.3: Admin Manages User Accounts

> Capability: [Administrative and Content Management](../../../../README.md) - Function: [User Management](../../README.md)

**As** an administrator
**I want to** create, view, update, and deactivate user accounts
**So that** I can control who has access to the system and keep account information current

## Acceptance Criteria (epic-level)

1. An admin can create a new user account with a name and email address.
2. An admin can view a list of all user accounts showing name, email, status, and creation date.
3. An admin can update a user's name or email address.
4. An admin can deactivate a user account so the user can no longer sign in.
5. An admin can reactivate a previously deactivated user account.

## Stories

| # | ID | Story | Why this order |
|---|----|-------|-----------------|
| 1 | S-8.3.1 | [Admin creates a new user account with name and email](./stories/story-01-admin-creates-a-new-user-account-with-name-and-email.md) | Highest user value — without user creation no other user management story delivers anything. |
| 2 | S-8.3.2 | [Admin views a list of all user accounts](./stories/story-02-admin-views-a-list-of-all-user-accounts.md) | Second-highest value — an admin needs to see who exists before updating or deactivating anyone. |
| 3 | S-8.3.3 | [Admin updates a user's name or email](./stories/story-03-admin-updates-a-users-name-or-email.md) | Moderate value — correcting account details is a common admin task. |
| 4 | S-8.3.4 | [Admin deactivates a user account](./stories/story-04-admin-deactivates-a-user-account.md) | Moderate value — needed for offboarding or revoking access. |
| 5 | S-8.3.5 | [Admin reactivates a previously deactivated user account](./stories/story-05-admin-reactivates-a-previously-deactivated-user-account.md) | Lowest value — reversal of deactivation; least common action. |
