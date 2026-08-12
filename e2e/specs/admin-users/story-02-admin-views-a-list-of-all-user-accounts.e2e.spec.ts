import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-8.3.2 Admin Views a List of All User Accounts', () => {
  test('list shows all accounts with their details', async ({ facefile }) => {
    // GIVEN several user accounts exist
    await facefile.signsInAsTestUser();
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Priya Shah', 'email: priya.shah@example.com');
    await facefile.createsUserWith('name: Sam Rivera', 'email: sam.rivera@example.com');

    // WHEN the admin opens the user account list
    // (already on the list after each creation)

    // THEN both accounts are shown with their details
    await confirmThat(facefile).seesUserInList('name: Priya Shah');
    await confirmThat(facefile).seesUserWithEmail('name: Priya Shah', 'email: priya.shah@example.com');
    await confirmThat(facefile).seesUserInList('name: Sam Rivera');
    await confirmThat(facefile).seesUserWithEmail('name: Sam Rivera', 'email: sam.rivera@example.com');
  });

  test('list includes deactivated accounts', async ({ facefile }) => {
    // GIVEN a user account has been deactivated
    await facefile.signsInAsTestUser();
    await facefile.opensAdminUsers();
    await facefile.createsUserWith('name: Sam Rivera', 'email: sam.rivera2@example.com');
    await facefile.deactivatesUser('name: Sam Rivera');

    // WHEN the admin opens the user account list
    // (already on the list after deactivating)

    // THEN the deactivated account still appears, marked deactivated
    await confirmThat(facefile).seesUserInList('name: Sam Rivera');
    await confirmThat(facefile).seesUserStatus('name: Sam Rivera', 'status: deactivated');
  });

  // NOTE: A genuinely empty list can't be reached safely in this environment —
  // the seeded default account always exists and e2e conventions forbid deleting
  // real user accounts. The empty-state rendering is covered instead by the Karma
  // unit test in admin-users.component.spec.ts, which stubs the service response.
});
