import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-8.3.3 Admin Updates a User\'s Name or Email', () => {
  test("admin updates a user's name", async ({ facefile }) => {
    // GIVEN a user account exists
    await facefile.signsInAsTestUser();
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Jordan Lee', 'email: jordan.lee3@example.com');

    // WHEN the admin edits the account and changes the name, then saves
    await facefile.editsUsersName('name: Jordan Lee', 'name: Jordan Lee-Park');

    // THEN the account's name is updated
    await confirmThat(facefile).seesUserInList('name: Jordan Lee-Park');
    await confirmThat(facefile).doesNotSeeUserInList('name: Jordan Lee');
  });

  test("admin updates a user's email", async ({ facefile }) => {
    // GIVEN a user account exists
    await facefile.signsInAsTestUser();
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Robin Chase', 'email: robin.chase@example.com');

    // WHEN the admin edits the account and changes the email, then saves
    await facefile.editsUsersEmail('name: Robin Chase', 'email: robin.park@example.com');

    // THEN the account's email is updated
    await confirmThat(facefile).seesUserWithEmail('name: Robin Chase', 'email: robin.park@example.com');
  });

  test('clearing the email blocks the update', async ({ facefile }) => {
    // GIVEN the admin is editing a user account
    await facefile.signsInAsTestUser();
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Casey Kim', 'email: casey.kim@example.com');

    // WHEN the admin clears the email field and saves
    await facefile.attemptsToClearUsersEmail('name: Casey Kim');

    // THEN an inline error appears and the account's email is not changed
    await confirmThat(facefile).seesEmailRequiredErrorOnUserForm();
    await confirmThat(facefile).seesUserWithEmail('name: Casey Kim', 'email: casey.kim@example.com');
  });

  test('duplicate email blocks the update', async ({ facefile }) => {
    // GIVEN a user account exists with a given email
    await facefile.signsInAsTestUser();
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Sam Rivera', 'email: sam.rivera3@example.com');
    // AND a different account the admin is editing
    await facefile.createsUserWith('name: Alex Doe', 'email: alex.doe@example.com');

    // WHEN the admin changes the second account's email to the first account's email and saves
    await facefile.attemptsToUpdateUsersEmailToDuplicate('name: Alex Doe', 'email: sam.rivera3@example.com');

    // THEN an inline error appears and the account is not updated
    await confirmThat(facefile).seesDuplicateEmailErrorOnUserForm();
    await confirmThat(facefile).seesUserWithEmail('name: Alex Doe', 'email: alex.doe@example.com');
  });
});
