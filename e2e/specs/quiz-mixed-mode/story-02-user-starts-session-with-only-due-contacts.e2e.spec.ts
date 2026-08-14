import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.3.2 User Starts Session with Only Due Contacts', () => {
  test('the start screen shows how many contacts are currently due', async ({ facefile }) => {
    // GIVEN the user has three contacts, all newly added and so all due
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom');

    // WHEN they open the quiz
    await facefile.opensTheQuiz();

    // THEN the count of contacts due is shown
    await confirmThat(facefile).seesDueContactCount('count: 3');
  });

  test('Review Due starts a session holding only the due contacts', async ({ facefile }) => {
    // GIVEN two contacts, one of which has just been reviewed and so is not due again
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');
    await facefile.completesReviewFor('name: Sam', 'rating: good');
    await facefile.opensTheQuiz();
    await confirmThat(facefile).seesDueContactCount('count: 1');

    // WHEN the user taps Review Due
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsDueReviewSession();

    // THEN the session holds the one due contact and no more
    await confirmThat(facefile).isOnQuestion('question: 1', 'of: 1');
    await facefile.answersWithTheName('name: Priya');
    await confirmThat(facefile).seesRevealedName('name: Priya');
  });

  test('with nothing due, the button is replaced by the next due date and a countdown', async ({ facefile }) => {
    // GIVEN a user whose only contact has just been reviewed
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.completesReviewFor('name: Priya', 'rating: good');

    // WHEN they open the quiz
    await facefile.opensTheQuiz();

    // THEN there is nothing to review, and they are told when there will be
    await confirmThat(facefile).seesDueContactCount('count: 0');
    await confirmThat(facefile).doesNotSeeReviewDueOption();
    await confirmThat(facefile).seesNextDueDateWithCountdown();
  });

  test('Practice All is offered for drilling beyond the schedule', async ({ facefile }) => {
    // GIVEN a user whose only contact has just been reviewed, so nothing is due
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.completesReviewFor('name: Priya', 'rating: good');
    await facefile.opensTheQuiz();
    await confirmThat(facefile).seesPracticeAllOption();

    // WHEN they choose to practise everything anyway
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsPracticeAllSession();

    // THEN the contact is quizzed despite not being due
    await confirmThat(facefile).isOnQuestion('question: 1', 'of: 1');
    await facefile.answersWithTheName('name: Priya');
    await confirmThat(facefile).seesRevealedName('name: Priya');
  });
});
