import { confirmThat, test, type FacefileDsl } from '../../fixtures/facefile';

async function aRevealedCard(facefile: FacefileDsl): Promise<void> {
  await facefile.opensTheQuiz();
  await facefile.choosesSessionType('type: face-to-name');
  await facefile.choosesAnswerFormat('format: typed');
  await facefile.startsPracticeAllSession();
  await facefile.answersWithAName('name: A Guess');
}

test.describe('S-4.4.2 User Sees Rating Explanation on First Use', () => {
  test('an explainer appears the first time the ratings are shown', async ({ facefile }) => {
    // GIVEN a user who has never rated their recall before
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');

    // WHEN they reach the reveal screen for the first time
    await aRevealedCard(facefile);

    // THEN the ratings are explained before they are asked to choose one
    await confirmThat(facefile).seesRatingExplanation();
  });

  test('each rating carries a one-line description of its own', async ({ facefile }) => {
    // GIVEN a user on the reveal screen
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await aRevealedCard(facefile);

    // WHEN they read the rating row
    // THEN each label explains what it means
    await confirmThat(facefile).seesRatingDescription('rating: good', 'text: recalled with some effort');
    await confirmThat(facefile).seesRatingDescription('rating: forgot', 'text: no recall');
  });

  test('the explainer can be dismissed and does not return on its own', async ({ facefile }) => {
    // GIVEN a two-question session with the explainer showing on the first reveal
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');
    await aRevealedCard(facefile);
    await confirmThat(facefile).seesRatingExplanation();

    // WHEN the user dismisses it and reaches the next reveal
    await facefile.dismissesRatingExplainer();
    await confirmThat(facefile).doesNotSeeRatingExplanation();
    await facefile.ratesRecall('rating: good');
    await facefile.answersWithAName('name: A Guess');

    // THEN it does not reappear
    await confirmThat(facefile).doesNotSeeRatingExplanation();
  });

  test('the explainer does not return in a later session either', async ({ facefile }) => {
    // GIVEN a user who dismissed the explainer during their first session
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await aRevealedCard(facefile);
    await facefile.dismissesRatingExplainer();
    await facefile.ratesRecall('rating: good');

    // WHEN they start a fresh session later
    await aRevealedCard(facefile);

    // THEN the ratings are shown without the explainer
    await confirmThat(facefile).seesAllFourRatings();
    await confirmThat(facefile).doesNotSeeRatingExplanation();
  });

  test('the explanation can be re-read at any time from the help icon', async ({ facefile }) => {
    // GIVEN a user who has already dismissed the explainer
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await aRevealedCard(facefile);
    await facefile.dismissesRatingExplainer();
    await confirmThat(facefile).seesRatingHelpOption();

    // WHEN they tap the help icon beside the rating row
    await facefile.opensRatingExplanation();

    // THEN the explanation is shown again
    await confirmThat(facefile).seesRatingExplanation();
  });
});
