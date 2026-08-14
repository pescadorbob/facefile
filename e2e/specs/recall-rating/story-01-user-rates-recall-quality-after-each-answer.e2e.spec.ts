import { confirmThat, test, type FacefileDsl } from '../../fixtures/facefile';

/** A revealed Face → Name card, which is where the rating row lives. */
async function aRevealedCard(facefile: FacefileDsl, names: string): Promise<void> {
  await facefile.signsInAsTestUser();
  await facefile.opensTheDashboard();
  await facefile.registersFullyEncodedContacts(`names: ${names}`);
  await facefile.opensTheQuiz();
  await facefile.choosesSessionType('type: face-to-name');
  await facefile.choosesAnswerFormat('format: typed');
  await facefile.startsPracticeAllSession();
  await facefile.answersWithAName('name: A Guess');
}

test.describe('S-4.4.1 User Rates Recall Quality After Each Answer', () => {
  test('all four ratings are offered on the reveal screen', async ({ facefile }) => {
    // GIVEN the user has answered a question
    await aRevealedCard(facefile, 'Priya');

    // WHEN the reveal screen is shown
    // THEN Forgot, Hard, Good and Easy are all available
    await confirmThat(facefile).seesAllFourRatings();
  });

  test('choosing a rating advances straight to the next question', async ({ facefile }) => {
    // GIVEN a two-question session with the first card revealed
    await aRevealedCard(facefile, 'Priya, Sam');
    await confirmThat(facefile).isOnQuestion('question: 1', 'of: 2');

    // WHEN the user rates their recall
    await facefile.ratesRecall('rating: good');

    // THEN the next question is shown, with no further step in between
    await confirmThat(facefile).isOnQuestion('question: 2', 'of: 2');
  });

  test('the rating is recorded in the contact’s review history with a timestamp', async ({ facefile }) => {
    // GIVEN the user has answered a question about Priya
    await aRevealedCard(facefile, 'Priya');

    // WHEN they rate their recall as Hard
    await facefile.ratesRecall('rating: hard');

    // THEN that rating is on her review history, stamped with when it happened
    await confirmThat(facefile).seesReviewHistoryFor('name: Priya', 'rating: hard');
  });

  test('the chosen rating is reflected in the next review date at session end', async ({ facefile }) => {
    // GIVEN the user has answered the only question in the session
    await aRevealedCard(facefile, 'Priya');

    // WHEN they rate their recall and the session ends
    await facefile.ratesRecall('rating: good');

    // THEN the summary shows Priya's newly computed next review date
    await confirmThat(facefile).seesSessionSummary();
    await confirmThat(facefile).seesUpdatedNextReviewFor('name: Priya');
  });
});
