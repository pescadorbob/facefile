import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.5.2 System Resets Interval on Forgot Rating', () => {
  test('a forgot rating moves the next review to the following day', async ({ facefile }) => {
    // GIVEN a contact reviewed successfully several times, so its interval has widened
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.completesReviewFor('name: Priya', 'rating: good');
    await facefile.completesReviewFor('name: Priya', 'rating: good');
    await facefile.completesReviewFor('name: Priya', 'rating: good');

    // WHEN the user forgets her on the next review
    await facefile.completesReviewFor('name: Priya', 'rating: forgot');

    // THEN she is not due today, but is scheduled again tomorrow rather than weeks out
    await confirmThat(facefile).seesDueCountSettleAt('count: 0');
    await facefile.opensUpcomingReviews();
    await confirmThat(facefile).seesUpcomingDays('count: 1');
    await confirmThat(facefile).seesContactInUpcoming('name: Priya');
  });

  test('the lapse is logged in the contact’s review history', async ({ facefile }) => {
    // GIVEN a contact due for review
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsPracticeAllSession();
    await facefile.answersWithAName('name: A Guess');

    // WHEN the user rates their recall as Forgot
    await facefile.ratesRecall('rating: forgot');

    // THEN the lapse is on her history, available for later analysis
    await confirmThat(facefile).seesReviewHistoryFor('name: Priya', 'rating: forgot');
    await confirmThat(facefile).seesLapseLoggedFor('name: Priya');
  });

  test('a successful recall logs no lapse', async ({ facefile }) => {
    // GIVEN a contact due for review
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');

    // WHEN the user recalls her successfully
    await facefile.completesReviewFor('name: Priya', 'rating: good');

    // THEN nothing is recorded as a lapse
    await confirmThat(facefile).seesReviewHistoryFor('name: Priya', 'rating: good');
    await confirmThat(facefile).seesNoLapseLoggedFor('name: Priya');
  });

  // The two remaining criteria — the easiness factor dropping by 0.2 but never below
  // 1.3, and the repetition count resetting to zero — are internal scheduling
  // parameters with no representation on any screen. They are exercised directly in
  // e2e/unit/sm2-scheduling.unit.spec.ts.
});
