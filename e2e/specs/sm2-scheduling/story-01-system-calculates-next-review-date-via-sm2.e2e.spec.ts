import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.5.1 System Calculates Next Review Date via SM-2', () => {
  test('answering a question stores a new schedule for that contact', async ({ facefile }) => {
    // GIVEN a newly added contact, due for review straight away
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsPracticeAllSession();
    await facefile.answersWithTheName('name: Priya');

    // WHEN the user rates their recall
    await facefile.ratesRecall('rating: good');

    // THEN a next review date has been computed and stored for her
    await confirmThat(facefile).seesUpdatedNextReviewFor('name: Priya');
  });

  test('the schedule is recalculated from the rating the user gave', async ({ facefile }) => {
    // GIVEN a contact due for review
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsPracticeAllSession();
    await facefile.answersWithTheName('name: Priya');

    // WHEN the user rates the recall as Easy
    await facefile.ratesRecall('rating: easy');

    // THEN the rating is on record and the card has been pushed out of today's queue
    await confirmThat(facefile).seesReviewHistoryFor('name: Priya', 'rating: easy');
    await confirmThat(facefile).seesDueCountSettleAt('count: 0');
  });

  test('the computed date feeds the due-review dashboard', async ({ facefile }) => {
    // GIVEN two contacts due for review
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesCardsDueCount('count: 2');

    // WHEN one of them is reviewed successfully
    await facefile.completesReviewFor('name: Sam', 'rating: good');

    // THEN the dashboard counts only the one still due
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesCardsDueCount('count: 1');
  });

  test('the schedule is kept per contact, not shared across them', async ({ facefile }) => {
    // GIVEN two contacts due for review
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');

    // WHEN only one of them is reviewed
    await facefile.completesReviewFor('name: Sam', 'rating: good');

    // THEN the other is still due, with a schedule of its own
    await facefile.opensTheQuiz();
    await confirmThat(facefile).seesDueContactCount('count: 1');
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsDueReviewSession();
    await facefile.answersWithTheName('name: Priya');
    await confirmThat(facefile).seesRevealedName('name: Priya');
  });

  // The idempotency criterion — replaying the same rating against the same card state
  // producing the same result — is exercised in e2e/unit/sm2-scheduling.unit.spec.ts,
  // which can hold the clock and the card state still. Through the browser, every
  // replay would start from the state the previous one wrote.
});
