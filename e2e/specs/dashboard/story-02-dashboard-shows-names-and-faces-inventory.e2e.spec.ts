import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-2.4.2 Dashboard Shows Names-and-Faces Inventory — Contact Grid with Add Shortcut', () => {
  test('inventory shows all contacts for the active profile', async ({ facefile }) => {
    // GIVEN the active profile has people stored
    await facefile.opensTheDashboard();
    await facefile.registersContact('name: Priya');
    await facefile.registersContact('name: Sam');

    // WHEN the user views the dashboard
    await facefile.opensTheDashboard();

    // THEN the names-and-faces inventory shows all of them as photo cards
    await confirmThat(facefile).seesContactInInventory('name: Priya');
    await confirmThat(facefile).seesContactInInventory('name: Sam');
  });

  test('add-person shortcut appears alongside the contact cards', async ({ facefile }) => {
    // GIVEN the active profile has at least one person stored
    await facefile.opensTheDashboard();
    await facefile.registersContact('name: Priya');

    // WHEN the user views the names-and-faces inventory
    await facefile.opensTheDashboard();

    // THEN an "Add person" shortcut card appears
    await confirmThat(facefile).seesAddPersonShortcut();
  });

  test('add-person shortcut starts the add-person flow', async ({ facefile }) => {
    // GIVEN the names-and-faces inventory is visible
    await facefile.opensTheDashboard();
    await facefile.registersContact('name: Priya');
    await facefile.opensTheDashboard();

    // WHEN the user taps the "Add person" shortcut card
    await facefile.startsAddPersonFlowFromShortcut();

    // THEN the add-person flow starts
    await confirmThat(facefile).isOnAddPersonScreen();
  });

  test('empty inventory shows a friendly prompt', async ({ facefile }) => {
    // GIVEN the active profile has no people stored
    await facefile.registersActiveUser('name: Empty Profile', 'email: empty-inventory@example.com');
    await facefile.opensSelectProfile();
    await facefile.selectsProfile('name: Empty Profile');
    await confirmThat(facefile).landsOnDashboard();

    // WHEN the user views the dashboard
    // THEN a friendly empty-state prompt appears instead of the grid, with a link to add
    // the first person
    await confirmThat(facefile).seesEmptyInventoryMessage();
    await facefile.startsAddPersonFlowFromEmptyState();
    await confirmThat(facefile).isOnAddPersonScreen();
  });

  test("inventory excludes other profiles' contacts", async ({ facefile }) => {
    // GIVEN another profile has people stored that this profile does not have
    // (both profiles registered up front so the picker's list already includes them
    // whenever it happens to load)
    await facefile.registersActiveUser('name: Other Profile', 'email: other-inventory@example.com');
    await facefile.registersActiveUser('name: Active Profile', 'email: active-inventory@example.com');
    await facefile.opensSelectProfile();
    await facefile.selectsProfile('name: Other Profile');
    await confirmThat(facefile).landsOnDashboard();
    await facefile.registersContact('name: Other Persons Contact');
    await facefile.activatesSwitchProfile();
    await confirmThat(facefile).seesProfilePicker();

    // WHEN the user views the dashboard for the active profile
    await facefile.selectsProfile('name: Active Profile');
    await confirmThat(facefile).landsOnDashboard();

    // THEN none of the other profile's contacts appear in the inventory
    await confirmThat(facefile).doesNotSeeContactInInventory('name: Other Persons Contact');
  });
});
