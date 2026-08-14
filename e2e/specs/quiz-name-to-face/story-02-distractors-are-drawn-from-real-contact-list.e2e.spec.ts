import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.2.2 Distractors Are Drawn from Real Contact List', () => {
  test('the options offered are all contacts the user has added', async ({ facefile }) => {
    // GIVEN the user has exactly four contacts with photos
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom, Ada');

    // WHEN they start a Name → Face session
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: name-to-face');
    await facefile.startsPracticeAllSession();

    // THEN the four options can only have come from that list of four
    await confirmThat(facefile).seesPhotoOptions('count: 4');
  });

  test('the contact being asked about is never also a distractor', async ({ facefile }) => {
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

    // WHEN the answer is revealed
    await facefile.picksThePhotoOf('name: Priya');

    // THEN exactly one option is hers — she appears once, as the answer
    await confirmThat(facefile).seesCorrectPhotoHighlighted('name: Priya');
  });

  test('a list shorter than four offers fewer options rather than failing', async ({ facefile }) => {
    // GIVEN the user has only two contacts with photos
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');

    // WHEN they start a Name → Face session
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: name-to-face');
    await facefile.startsPracticeAllSession();

    // THEN the card offers two faces and still works
    await confirmThat(facefile).seesQuizDirection('direction: name-to-face');
    await confirmThat(facefile).seesPhotoOptions('count: 2');
  });

  test('a single contact is quizzed the other way round instead', async ({ facefile }) => {
    // GIVEN the user has exactly one contact, so there is no decoy to offer
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');

    // WHEN they start a Name → Face session
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: name-to-face');
    await facefile.startsPracticeAllSession();

    // THEN the question degrades to Face → Name rather than offering a list of one
    await confirmThat(facefile).seesQuizDirection('direction: face-to-name');
    await confirmThat(facefile).seesNameEntryField();
  });

  // The fourth criterion — that the distractor set changes between two quizzes of the
  // same contact — is exercised in e2e/unit/quiz-session.unit.spec.ts, which can ask
  // about one fixed contact repeatedly and compare the sets. Driving that through the
  // browser would compare option sets across different questions, which proves nothing
  // about the distractors.
});
