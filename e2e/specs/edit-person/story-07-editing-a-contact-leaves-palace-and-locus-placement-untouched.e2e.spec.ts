import { confirmThat, test } from '../../fixtures/facefile';

test.describe("S-2.6.7 Editing a Contact Leaves Its Palace and Locus Placement Untouched", () => {
  test('name edit leaves locus assignment unchanged', async ({ facefile }) => {
    // GIVEN a contact is assigned to a specific locus in a palace
    await facefile.signsInAsTestUser();
    await facefile.registersContactInANamedPalaceAndLocus('name: Priya Chandra', 'palace: Office', 'locus: Front Desk');
    await facefile.opensTheDashboard();

    // WHEN the user edits and saves the contact's name
    await facefile.editsContactsName('name: Priya Chandra', 'name: Priya P. Chandra');

    // THEN the contact remains assigned to the same locus in the same palace
    await confirmThat(facefile).seesContactPlacementUnchanged('name: Priya Chandra', 'name: Priya P. Chandra');
  });

  test('photo edit leaves palace assignment unchanged', async ({ facefile }) => {
    // GIVEN a contact belongs to a specific palace
    await facefile.signsInAsTestUser();
    await facefile.registersContactInANamedPalaceAndLocus('name: Sam Rivera', 'palace: Studio', 'locus: Doorway');
    await facefile.opensTheDashboard();

    // WHEN the user edits and saves the contact's photo
    await facefile.replacesContactsPhoto('name: Sam Rivera');

    // THEN the contact still belongs to the same palace
    await confirmThat(facefile).seesContactPlacementUnchanged('name: Sam Rivera', 'name: Sam Rivera');
  });

  test('edit view has no palace or locus controls', async ({ facefile }) => {
    // GIVEN the user has opened the edit view for a contact
    await facefile.signsInAsTestUser();
    await facefile.registersContactInANamedPalaceAndLocus('name: Jordan Lee', 'palace: Loft', 'locus: Hallway');
    await facefile.opensTheDashboard();
    await facefile.opensEditViewFor('name: Jordan Lee');

    // WHEN they look for a way to change the contact's palace or locus
    // THEN no such control is present in the edit view
    await confirmThat(facefile).seesNoPalaceOrLocusControlsInEditForm();
  });
});
