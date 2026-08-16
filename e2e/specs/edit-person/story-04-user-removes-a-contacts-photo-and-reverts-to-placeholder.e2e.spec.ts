import { confirmThat, test } from '../../fixtures/facefile';

test.describe("S-2.6.4 User Removes a Contact's Photo and Reverts to the Placeholder", () => {
  test("user removes a contact's photo", async ({ facefile }) => {
    // GIVEN a contact has a saved photo
    await facefile.signsInAsTestUser();
    await facefile.registersFullyEncodedContact('name: Priya Chandra');
    await facefile.opensTheDashboard();

    // WHEN the user opens the edit view, chooses "Remove Photo", and saves
    await facefile.removesContactsPhoto('name: Priya Chandra');

    // THEN the contact has no saved photo and displays the placeholder
    await confirmThat(facefile).landsOnDashboard();
    await facefile.opensEditViewFor('name: Priya Chandra');
    await confirmThat(facefile).seesPhotoPlaceholderInEditForm();
  });

  test('remove action is unavailable with no photo to remove', async ({ facefile }) => {
    // GIVEN a contact has no saved photo
    await facefile.signsInAsTestUser();
    await facefile.registersContact('name: Sam Rivera');
    await facefile.opensTheDashboard();

    // WHEN the user opens the edit view
    await facefile.opensEditViewFor('name: Sam Rivera');

    // THEN no "Remove Photo" action is offered
    await confirmThat(facefile).doesNotSeeRemovePhotoOption();
  });
});
