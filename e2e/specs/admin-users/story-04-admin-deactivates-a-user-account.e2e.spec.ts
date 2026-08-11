import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-8.3.4 Admin Deactivates a User Account', () => {
  test('admin deactivates an active account', async ({ facefile }) => {
    // GIVEN a user account is active
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Sam Rivera', 'email: sam.rivera4@example.com');

    // WHEN the admin deactivates the account
    await facefile.deactivatesUser('name: Sam Rivera');

    // THEN the account's status becomes deactivated
    await confirmThat(facefile).seesUserStatus('name: Sam Rivera', 'status: deactivated');
  });

  test('deactivated account cannot sign in', async ({ facefile }) => {
    test.skip(true, 'No sign-in / profile-picker flow exists yet (E-1.7 is specced but not implemented) — nothing to drive here.');

    // GIVEN a user account has been deactivated
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Sam Rivera', 'email: sam.rivera5@example.com');
    await facefile.deactivatesUser('name: Sam Rivera');

    // WHEN Sam Rivera attempts to select their profile
    // THEN access is denied
  });

  test('deactivated status is reflected in the account list', async ({ facefile }) => {
    // GIVEN a user account has been deactivated
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Sam Rivera', 'email: sam.rivera6@example.com');
    await facefile.deactivatesUser('name: Sam Rivera');

    // WHEN the admin views the user account list
    // (already on the list after deactivating)

    // THEN Sam Rivera is shown with a status of deactivated
    await confirmThat(facefile).seesUserStatus('name: Sam Rivera', 'status: deactivated');
  });

  test('deactivating an already-deactivated account is a no-op', async ({ facefile }) => {
    // GIVEN a user account is already deactivated
    // (the row only ever shows Deactivate OR Reactivate, so the redundant second call is
    // driven directly rather than through a button the UI no longer offers — see
    // deactivatesUserAgain in facefile.dsl.ts)
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Sam Rivera', 'email: sam.rivera7@example.com');
    await facefile.deactivatesUser('name: Sam Rivera');
    await confirmThat(facefile).seesUserStatus('name: Sam Rivera', 'status: deactivated');

    // WHEN the account is deactivated again
    await facefile.deactivatesUserAgain('email: sam.rivera7@example.com');

    // THEN the account remains deactivated with no error
    await confirmThat(facefile).seesUserStatus('name: Sam Rivera', 'status: deactivated');
  });
});
