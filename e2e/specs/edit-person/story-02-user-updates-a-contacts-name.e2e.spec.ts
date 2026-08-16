import { confirmThat, test } from '../../fixtures/facefile';

test.describe("S-2.6.2 User Updates a Contact's Name", () => {
  test('user corrects a misspelled name', async ({ facefile }) => {
    // GIVEN a contact exists
    await facefile.signsInAsTestUser();
    await facefile.registersContact('name: Jon Park');
    await facefile.opensTheDashboard();

    // WHEN the user opens the edit view, changes the name, and saves
    await facefile.editsContactsName('name: Jon Park', 'name: John Park');

    // THEN the contact's name is updated
    await confirmThat(facefile).landsOnDashboard();
    await confirmThat(facefile).seesContactInInventory('name: John Park');
    await confirmThat(facefile).doesNotSeeContactInInventory('name: Jon Park');
  });

  test('whitespace is trimmed on save', async ({ facefile }) => {
    // GIVEN the user is editing a contact
    await facefile.signsInAsTestUser();
    await facefile.registersContact('name: Priya Chandra');
    await facefile.opensTheDashboard();

    // WHEN the user enters a name padded with whitespace and saves
    await facefile.savesNameWithSurroundingWhitespace('name: Priya Chandra', '  Priya Trimmed  ');

    // THEN the contact's name is saved trimmed
    await confirmThat(facefile).seesContactSavedWithExactName('name: Priya Trimmed');
  });
});
