import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.1.1 User Is Shown Photo and Recalls Name', () => {
  test('the quiz card shows the photo and no name hint', async ({ facefile }) => {
    // GIVEN the user has contacts with photos on file
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom, Ada');

    // WHEN they start a Face → Name session
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsPracticeAllSession();

    // THEN the card shows a face alone, with the name nowhere on it
    await confirmThat(facefile).seesQuizDirection('direction: face-to-name');
    await confirmThat(facefile).seesPhotoWithNoNameHint('name: Priya');
  });

  test('the user can type the name they recall', async ({ facefile }) => {
    // GIVEN a session set to typed answering
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom, Ada');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');

    // WHEN the session starts
    await facefile.startsPracticeAllSession();

    // THEN a field is offered for the recalled name
    await confirmThat(facefile).seesNameEntryField();
  });

  test('the user can select from a multiple-choice list instead', async ({ facefile }) => {
    // GIVEN a session set to multiple-choice answering
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom, Ada');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: choice');

    // WHEN the session starts
    await facefile.startsPracticeAllSession();

    // THEN four names are offered to choose between
    await confirmThat(facefile).seesNameOptions('count: 4');
  });

  test('submitting a correct answer reveals the name and confirms it', async ({ facefile }) => {
    // GIVEN a single-contact session in the face-first direction
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsPracticeAllSession();

    // WHEN the user types the right name and submits it
    await facefile.answersWithTheName('name: Priya');

    // THEN the answer is confirmed and the name is shown
    await confirmThat(facefile).seesPositiveConfirmation();
    await confirmThat(facefile).seesRevealedName('name: Priya');
  });

  test('submitting a wrong answer still reveals the correct name', async ({ facefile }) => {
    // GIVEN a single-contact session in the face-first direction
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsPracticeAllSession();

    // WHEN the user types someone else's name
    await facefile.answersWithAName('name: Someone Else Entirely');

    // THEN the answer is marked as not recalled, and the real name is shown anyway
    await confirmThat(facefile).seesAnswerMarkedIncorrect();
    await confirmThat(facefile).seesRevealedName('name: Priya');
  });

  test('the session moves to the next card once the reveal is acknowledged', async ({ facefile }) => {
    // GIVEN a two-question session, with the first card revealed
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsPracticeAllSession();
    await confirmThat(facefile).isOnQuestion('question: 1', 'of: 2');
    await facefile.answersWithAName('name: A Guess');

    // WHEN the user acknowledges the reveal by rating their recall
    await facefile.ratesRecall('rating: good');

    // THEN the second card is shown
    await confirmThat(facefile).isOnQuestion('question: 2', 'of: 2');
  });
});
