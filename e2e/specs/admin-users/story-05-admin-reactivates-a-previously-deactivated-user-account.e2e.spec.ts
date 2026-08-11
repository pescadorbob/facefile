import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-8.3.5 Admin Reactivates a Previously Deactivated User Account', () => {
  test('admin reactivates a deactivated account', async ({ facefile }) => {
    // GIVEN a user account is deactivated
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Sam Rivera', 'email: sam.rivera8@example.com');
    await facefile.deactivatesUser('name: Sam Rivera');
    await confirmThat(facefile).seesUserStatus('name: Sam Rivera', 'status: deactivated');

    // WHEN the admin reactivates the account
    await facefile.reactivatesUser('name: Sam Rivera');

    // THEN the account's status becomes active
    await confirmThat(facefile).seesUserStatus('name: Sam Rivera', 'status: active');
  });

  test('reactivated account can sign in again', async ({ facefile }) => {
    // GIVEN a user account has just been reactivated
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Sam Rivera', 'email: sam.rivera9@example.com');
    await facefile.deactivatesUser('name: Sam Rivera');
    await facefile.reactivatesUser('name: Sam Rivera');

    // WHEN Sam Rivera attempts to select their profile
    await facefile.opensSelectProfile();
    await facefile.selectsProfile('name: Sam Rivera');

    // THEN access is granted — the user lands on their dashboard
    await confirmThat(facefile).landsOnDashboard();
  });

  test('active status is reflected in the account list', async ({ facefile }) => {
    // GIVEN a user account has just been reactivated
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Sam Rivera', 'email: sam.rivera10@example.com');
    await facefile.deactivatesUser('name: Sam Rivera');
    await facefile.reactivatesUser('name: Sam Rivera');

    // WHEN the admin views the user account list
    // (already on the list after reactivating)

    // THEN Sam Rivera is shown with a status of active
    await confirmThat(facefile).seesUserStatus('name: Sam Rivera', 'status: active');
  });

  test('reactivating an already-active account is a no-op', async ({ facefile }) => {
    // GIVEN a user account is already active
    // (the row only ever shows Deactivate OR Reactivate, so the redundant second call is
    // driven directly rather than through a button the UI no longer offers — see
    // reactivatesUserAgain in facefile.dsl.ts)
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Sam Rivera', 'email: sam.rivera11@example.com');
    await confirmThat(facefile).seesUserStatus('name: Sam Rivera', 'status: active');

    // WHEN the account is reactivated again
    await facefile.reactivatesUserAgain('email: sam.rivera11@example.com');

    // THEN the account remains active with no error
    await confirmThat(facefile).seesUserStatus('name: Sam Rivera', 'status: active');
  });
});
