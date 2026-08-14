import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.3.1 Session Mixes Both Quiz Directions', () => {
  test('mixed is the session type a user starts on by default', async ({ facefile }) => {
    // GIVEN a user who has never changed their session preference
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom, Ada');

    // WHEN they open the quiz
    await facefile.opensTheQuiz();

    // THEN mixed mode is the one already selected
    await confirmThat(facefile).seesSessionTypeSelected('type: mixed');
  });

  test('an overridden preference is honoured over the default', async ({ facefile }) => {
    // GIVEN a user on the quiz start screen
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom, Ada');
    await facefile.opensTheQuiz();

    // WHEN they choose a single direction instead
    await facefile.choosesSessionType('type: name-to-face');
    await facefile.startsPracticeAllSession();

    // THEN the session runs in that direction, not the mix
    await confirmThat(facefile).seesQuizDirection('direction: name-to-face');
  });

  test('every card states its task direction before the user answers', async ({ facefile }) => {
    // GIVEN a mixed-mode session
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom, Ada');
    await facefile.opensTheQuiz();

    // WHEN the session starts
    await facefile.startsPracticeAllSession();

    // THEN the card says which way round it is being asked
    await confirmThat(facefile).seesAnyQuizDirection();
  });

  test('the summary reports how many questions of each type were asked', async ({ facefile }) => {
    // GIVEN a two-question session with one card in each direction
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom, Ada');

    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsPracticeAllSession();

    // WHEN every question has been answered and rated
    for (let i = 0; i < 4; i++) {
      await facefile.answersWithAName('name: A Guess');
      await facefile.ratesRecall('rating: good');
    }

    // THEN the summary breaks the session down by question type
    await confirmThat(facefile).seesSessionSummary();
    await confirmThat(facefile).seesSummaryCountFor('direction: face-to-name', 'count: 4');
    await confirmThat(facefile).seesSummaryCountFor('direction: name-to-face', 'count: 0');
  });

  // That the mix itself is drawn with roughly equal probability is a statistical
  // property, exercised over hundreds of questions in
  // e2e/unit/quiz-session.unit.spec.ts rather than through the browser, where a
  // session is far too short to distinguish a fair coin from a biased one.
});
