import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.8.2 User Can Skip the Immediate Quiz', () => {
  test('a skip option is clearly offered on the prompt', async ({ facefile }) => {
    // GIVEN a user who has just saved a new contact
    await facefile.signsInAsTestUserWithAPalace();
    await facefile.opensGuidedWizard();
    await facefile.completesAllFiveSteps('name: Marcus');

    // WHEN the quiz prompt appears
    await confirmThat(facefile).landedOnQuizPage();

    // THEN they can decline it
    await confirmThat(facefile).seesSkipOption();
  });

  test('skipping returns the user to where they were before adding', async ({ facefile }) => {
    // GIVEN a user on the post-add quiz prompt
    await facefile.signsInAsTestUserWithAPalace();
    await facefile.opensGuidedWizard();
    await facefile.completesAllFiveSteps('name: Marcus');
    await confirmThat(facefile).landedOnQuizPage();

    // WHEN they skip for now
    await facefile.skipsTheQuiz();

    // THEN they are back on the dashboard with their contacts
    await confirmThat(facefile).landsOnDashboard();
    await confirmThat(facefile).seesContactInInventory('name: Marcus');
  });

  test('skipping leaves the contact in the review queue', async ({ facefile }) => {
    // GIVEN a user who has just added a contact
    await facefile.signsInAsTestUserWithAPalace();
    await facefile.opensGuidedWizard();
    await facefile.completesAllFiveSteps('name: Marcus');
    await confirmThat(facefile).landedOnQuizPage();

    // WHEN they skip the prompt
    await facefile.skipsTheQuiz();
    await confirmThat(facefile).landsOnDashboard();

    // THEN the contact is still waiting to be reviewed, with no answer recorded
    await confirmThat(facefile).seesReviewHistoryIsEmptyFor('name: Marcus');
    await facefile.opensTheQuiz();
    await confirmThat(facefile).seesReviewDueOption();
  });

  test('a skipped contact comes round again in a due-review session', async ({ facefile }) => {
    // GIVEN a user who skipped the prompt for a newly added contact
    await facefile.signsInAsTestUserWithAPalace();
    await facefile.opensGuidedWizard();
    await facefile.completesAllFiveSteps('name: Marcus');
    await confirmThat(facefile).landedOnQuizPage();
    await facefile.skipsTheQuiz();

    // WHEN they later start a session of the contacts that are due
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');
    await facefile.startsDueReviewSession();

    // THEN the skipped contact is among them
    await facefile.answersWithTheName('name: Marcus');
    await confirmThat(facefile).seesRevealedName('name: Marcus');
  });

  test('a regular session offers no skip option', async ({ facefile }) => {
    // GIVEN a user in an ordinary review session rather than the post-add prompt
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: typed');

    // WHEN the session starts
    await facefile.startsPracticeAllSession();

    // THEN there is nothing to skip — the session is the thing they chose to start
    await confirmThat(facefile).doesNotSeeSkipOption();
  });
});
