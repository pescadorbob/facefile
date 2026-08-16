import { confirmThat, test } from '../../fixtures/facefile';

test.describe("S-2.6.6 Editing a Contact Leaves Its Review Schedule Untouched", () => {
  test('name edit does not reschedule review', async ({ facefile }) => {
    // GIVEN a contact is not due for review (a recent successful recall pushed it out)
    await facefile.signsInAsTestUser();
    await facefile.registersContact('name: Priya Chandra');
    await facefile.opensTheDashboard();
    await facefile.completesReviewFor('name: Priya Chandra', 'rating: easy');
    await confirmThat(facefile).seesDueCountSettleAt('count: 0');

    // WHEN the user edits and saves only the contact's name
    await facefile.editsContactsName('name: Priya Chandra', 'name: Priya P. Chandra');

    // THEN the contact is still not due for review
    await confirmThat(facefile).seesDueCountSettleAt('count: 0');
  });

  test('photo edit does not reschedule review', async ({ facefile }) => {
    // GIVEN a contact is not due for review
    await facefile.signsInAsTestUser();
    await facefile.registersFullyEncodedContact('name: Sam Rivera');
    await facefile.opensTheDashboard();
    await facefile.completesReviewFor('name: Sam Rivera', 'rating: easy');
    await confirmThat(facefile).seesDueCountSettleAt('count: 0');

    // WHEN the user edits and saves only the contact's photo
    await facefile.replacesContactsPhoto('name: Sam Rivera');

    // THEN the contact is still not due for review
    await confirmThat(facefile).seesDueCountSettleAt('count: 0');
  });

  test('edit does not erase review history', async ({ facefile }) => {
    // GIVEN a contact has been quizzed and answered
    await facefile.signsInAsTestUser();
    await facefile.registersContact('name: Jordan Lee');
    await facefile.opensTheDashboard();
    await facefile.completesReviewFor('name: Jordan Lee', 'rating: good');
    await confirmThat(facefile).seesReviewHistoryFor('name: Jordan Lee', 'rating: good');

    // WHEN the user edits the contact's name and saves
    await facefile.editsContactsName('name: Jordan Lee', 'name: Jordan A. Lee');

    // THEN the prior quiz result is still present in its review history
    await confirmThat(facefile).seesReviewHistoryFor('name: Jordan A. Lee', 'rating: good');
  });
});
