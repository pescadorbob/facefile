import { confirmThat, test } from '../../fixtures/facefile';

test.describe("S-2.6.1 User Opens an Edit View Pre-Filled with the Contact's Current Name and Photo", () => {
  test('edit view opens pre-filled with the name and photo', async ({ facefile }) => {
    // GIVEN a contact exists with a saved photo
    await facefile.signsInAsTestUser();
    await facefile.registersFullyEncodedContact('name: Priya Chandra');
    await facefile.opensTheDashboard();

    // WHEN the user opens the edit view for that contact
    await facefile.opensEditViewFor('name: Priya Chandra');

    // THEN the Name field and the saved photo are shown
    await confirmThat(facefile).isOnEditPersonScreen();
    await confirmThat(facefile).seesEditFormPrefilledWith('name: Priya Chandra');
    await confirmThat(facefile).seesPhotoPreviewInEditForm();
  });

  test('edit view shows the placeholder for a contact with no photo', async ({ facefile }) => {
    // GIVEN a contact exists with no saved photo
    await facefile.signsInAsTestUser();
    await facefile.registersContact('name: Sam Rivera');
    await facefile.opensTheDashboard();

    // WHEN the user opens the edit view for that contact
    await facefile.opensEditViewFor('name: Sam Rivera');

    // THEN the placeholder is displayed in place of a photo
    await confirmThat(facefile).seesPhotoPlaceholderInEditForm();
  });

  test('cancelling the edit view discards changes', async ({ facefile }) => {
    // GIVEN the user has opened the edit view and changed the Name field
    await facefile.signsInAsTestUser();
    await facefile.registersContact('name: Jordan Lee');
    await facefile.opensTheDashboard();
    await facefile.opensEditViewAndChangesNameWithoutSaving('name: Jordan Lee', 'name: Jordan Lee-Park');

    // WHEN the user cancels instead of saving
    await facefile.cancelsTheEditForm();

    // THEN the contact's stored name is unchanged
    await confirmThat(facefile).landsOnDashboard();
    await confirmThat(facefile).seesContactInInventory('name: Jordan Lee');
    await confirmThat(facefile).doesNotSeeContactInInventory('name: Jordan Lee-Park');
  });
});
