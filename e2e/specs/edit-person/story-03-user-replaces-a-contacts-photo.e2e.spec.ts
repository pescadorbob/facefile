import { confirmThat, test } from '../../fixtures/facefile';

test.describe("S-2.6.3 User Replaces a Contact's Photo", () => {
  test('user replaces an existing photo', async ({ facefile }) => {
    // GIVEN a contact has a saved photo
    await facefile.signsInAsTestUser();
    await facefile.registersFullyEncodedContact('name: Priya Chandra');
    await facefile.opensTheDashboard();

    // WHEN the user opens the edit view, chooses a new photo, and saves
    await facefile.replacesContactsPhoto('name: Priya Chandra');

    // THEN the contact's photo is the newly chosen one
    await confirmThat(facefile).landsOnDashboard();
    await facefile.opensEditViewFor('name: Priya Chandra');
    await confirmThat(facefile).seesPhotoPreviewInEditForm();
  });

  test('user adds a photo to a contact that had none', async ({ facefile }) => {
    // GIVEN a contact has no saved photo
    await facefile.signsInAsTestUser();
    await facefile.registersContact('name: Sam Rivera');
    await facefile.opensTheDashboard();

    // WHEN the user opens the edit view, chooses a photo, and saves
    await facefile.replacesContactsPhoto('name: Sam Rivera');

    // THEN the contact's photo is the one just chosen
    await confirmThat(facefile).landsOnDashboard();
    await facefile.opensEditViewFor('name: Sam Rivera');
    await confirmThat(facefile).seesPhotoPreviewInEditForm();
  });

  test('oversized replacement photo is rejected', async ({ facefile }) => {
    // GIVEN a contact has a saved photo
    await facefile.signsInAsTestUser();
    await facefile.registersFullyEncodedContact('name: Casey Kim');
    await facefile.opensTheDashboard();

    // WHEN the user chooses a replacement photo larger than 5 MB and attempts to save
    await facefile.attemptsToReplacePhotoWithOversizedFile('name: Casey Kim');

    // THEN an error states the size limit and the contact's original photo is unchanged
    await confirmThat(facefile).seesEditFormErrorContaining('text: 5 MB');
    await facefile.opensTheDashboard();
    await facefile.opensEditViewFor('name: Casey Kim');
    await confirmThat(facefile).seesPhotoPreviewInEditForm();
  });

  test('unsupported file format is rejected', async ({ facefile }) => {
    // GIVEN a contact has a saved photo
    await facefile.signsInAsTestUser();
    await facefile.registersFullyEncodedContact('name: Alex Doe');
    await facefile.opensTheDashboard();

    // WHEN the user chooses a replacement file that is not an image and attempts to save
    await facefile.attemptsToReplacePhotoWithUnsupportedFile('name: Alex Doe');

    // THEN an error lists the accepted formats and the contact's original photo is unchanged
    await confirmThat(facefile).seesEditFormErrorContaining('text: image');
    await facefile.opensTheDashboard();
    await facefile.opensEditViewFor('name: Alex Doe');
    await confirmThat(facefile).seesPhotoPreviewInEditForm();
  });
});
