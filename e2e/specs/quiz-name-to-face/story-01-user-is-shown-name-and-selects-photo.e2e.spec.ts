import { confirmThat, test, type FacefileDsl } from '../../fixtures/facefile';

/** Four contacts with photos — the minimum for a full set of options. */
async function aNameFirstQuestion(facefile: FacefileDsl): Promise<void> {
  await facefile.signsInAsTestUser();
  await facefile.opensTheDashboard();
  await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom, Ada');
  await facefile.opensTheQuiz();
  await facefile.choosesSessionType('type: name-to-face');
  await facefile.startsPracticeAllSession();
}

test.describe('S-4.2.1 User Is Shown Name and Selects Photo', () => {
  test('the quiz card shows a name and four photo options', async ({ facefile }) => {
    // GIVEN the user has four contacts with photos
    // WHEN they start a Name → Face session
    await aNameFirstQuestion(facefile);

    // THEN the card names someone and offers four faces to choose between
    await confirmThat(facefile).seesQuizDirection('direction: name-to-face');
    await confirmThat(facefile).seesPhotoOptions('count: 4');
  });

  test('exactly one option is the contact being asked about', async ({ facefile }) => {
    // GIVEN a Name → Face question about Priya
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Sam, Tom, Ada');
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.completesReviewFor('name: Sam', 'rating: good');
    await facefile.completesReviewFor('name: Tom', 'rating: good');
    await facefile.completesReviewFor('name: Ada', 'rating: good');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: name-to-face');

    // WHEN the session starts with only Priya due
    await facefile.startsDueReviewSession();

    // THEN her name is the prompt, and exactly one of the four faces is hers
    await confirmThat(facefile).seesNamePrompt('name: Priya');
    await facefile.picksThePhotoOf('name: Priya');
    await confirmThat(facefile).seesCorrectPhotoHighlighted('name: Priya');
  });

  test('tapping a photo locks in the selection and reveals the outcome', async ({ facefile }) => {
    // GIVEN a Name → Face question about Priya
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Sam, Tom, Ada');
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.completesReviewFor('name: Sam', 'rating: good');
    await facefile.completesReviewFor('name: Tom', 'rating: good');
    await facefile.completesReviewFor('name: Ada', 'rating: good');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: name-to-face');
    await facefile.startsDueReviewSession();

    // WHEN the user taps her photo
    await facefile.picksThePhotoOf('name: Priya');

    // THEN the selection is confirmed as the right one
    await confirmThat(facefile).seesPositiveConfirmation();
    await confirmThat(facefile).seesRevealedName('name: Priya');
  });

  test('the correct photo is highlighted even when another was chosen', async ({ facefile }) => {
    // GIVEN a Name → Face question about Priya
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Sam, Tom, Ada');
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.completesReviewFor('name: Sam', 'rating: good');
    await facefile.completesReviewFor('name: Tom', 'rating: good');
    await facefile.completesReviewFor('name: Ada', 'rating: good');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: name-to-face');
    await facefile.startsDueReviewSession();

    // WHEN the user taps somebody else's photo
    await facefile.picksAPhotoOtherThan('name: Priya');

    // THEN her photo is the one marked as the answer
    await confirmThat(facefile).seesAnswerMarkedIncorrect();
    await confirmThat(facefile).seesCorrectPhotoHighlighted('name: Priya');
  });
});
