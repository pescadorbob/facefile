# Admin Creates a New User Account with Name and Email

**As an** administrator, **I can** create a new user account by entering a name and email address, **so that** a new person can be given access to the system.

## Acceptance Criteria

- [ ] An admin can open a form to create a new user account
- [ ] The form requires a name and an email address
- [ ] Submitting the form with a name and a valid email address creates a new, active user account
- [ ] Submitting the form with a missing name or email is rejected with an inline error, and no account is created
- [ ] Submitting the form with an email address already in use is rejected with an inline error, and no account is created

## Scenarios

Scenario: Admin creates an account with valid details
GIVEN the admin is on the create-user form
WHEN the admin enters name "Jordan Lee" and email "jordan.lee@example.com" and submits
THEN a new active user account is created for Jordan Lee

Scenario: Missing name blocks creation
GIVEN the admin is on the create-user form
WHEN the admin leaves the name blank and submits
THEN an inline error appears and no account is created

Scenario: Missing email blocks creation
GIVEN the admin is on the create-user form
WHEN the admin leaves the email blank and submits
THEN an inline error appears and no account is created

Scenario: Duplicate email blocks creation
GIVEN a user account already exists with email "jordan.lee@example.com"
WHEN the admin submits a new account using the same email address
THEN an inline error appears and no duplicate account is created
