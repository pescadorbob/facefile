import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-8.3.1 Admin Creates a New User Account with Name and Email', () => {
  test('admin creates an account with valid details', async ({ facefile }) => {
    // GIVEN the admin is on the create-user form
    await facefile.opensAdminUsers();

    // WHEN the admin enters a name and email and submits
    await facefile.createsUserWith('name: Jordan Lee', 'email: jordan.lee@example.com');

    // THEN a new active user account is created for Jordan Lee
    await confirmThat(facefile).seesUserInList('name: Jordan Lee');
    await confirmThat(facefile).seesUserStatus('name: Jordan Lee', 'status: active');
  });

  test('missing name blocks creation', async ({ facefile }) => {
    // GIVEN the admin is on the create-user form
    await facefile.opensAdminUsers();

    // WHEN the admin leaves the name blank and submits
    await facefile.attemptsToCreateUserWithoutName('email: noname@example.com');

    // THEN an inline error appears and no account is created
    await confirmThat(facefile).seesNameRequiredErrorOnUserForm();
  });

  test('missing email blocks creation', async ({ facefile }) => {
    // GIVEN the admin is on the create-user form
    await facefile.opensAdminUsers();

    // WHEN the admin leaves the email blank and submits
    await facefile.attemptsToCreateUserWithoutEmail('name: No Email');

    // THEN an inline error appears and no account is created
    await confirmThat(facefile).seesEmailRequiredErrorOnUserForm();
  });

  test('duplicate email blocks creation', async ({ facefile }) => {
    // GIVEN a user account already exists with a given email
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Original Owner', 'email: taken@example.com');

    // WHEN the admin submits a new account using the same email address
    await facefile.attemptsToCreateUserWithDuplicateEmail('name: Second Owner', 'email: taken@example.com');

    // THEN an inline error appears and no duplicate account is created
    await confirmThat(facefile).seesDuplicateEmailErrorOnUserForm();
    await confirmThat(facefile).doesNotSeeUserInList('name: Second Owner');
  });
});
