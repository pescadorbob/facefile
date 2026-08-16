import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-2.6.5 Clearing the Name Blocks the Update', () => {
  test('empty name blocks the save', async ({ facefile }) => {
    // GIVEN the user is editing a contact
    await facefile.signsInAsTestUser();
    await facefile.registersContact('name: Casey Kim');
    await facefile.opensTheDashboard();

    // WHEN the user clears the Name field and attempts to save
    await facefile.attemptsToClearContactsName('name: Casey Kim');

    // THEN the save is rejected, the field is highlighted as required, and the contact is not updated
    await confirmThat(facefile).seesNameRequiredErrorOnEditForm();
    await confirmThat(facefile).seesContactNameUnchanged('name: Casey Kim');
  });

  test('a rejected save does not discard other in-progress edits', async ({ facefile }) => {
    // GIVEN the user is editing a contact, has cleared the Name field, and has also chosen a new photo
    await facefile.signsInAsTestUser();
    await facefile.registersContact('name: Alex Doe');
    await facefile.opensTheDashboard();

    // WHEN the user attempts to save
    await facefile.attemptsToClearNameAfterChoosingNewPhoto('name: Alex Doe');

    // THEN the save is rejected and the newly chosen photo is still showing in the form
    await confirmThat(facefile).seesNameRequiredErrorOnEditForm();
    await confirmThat(facefile).seesPhotoPreviewInEditForm();
  });
});
