import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.8.1 User Is Prompted to Quiz After Saving Contact', () => {
  test('saving a contact leads straight to a quiz prompt', async ({ facefile }) => {
    // GIVEN a user completing the add-person wizard
    await facefile.signsInAsTestUserWithAPalace();
    await facefile.opensGuidedWizard();

    // WHEN they save the new contact
    await facefile.completesAllFiveSteps('name: Marcus');

    // THEN they are taken to a quiz prompt rather than back to a list
    await confirmThat(facefile).landedOnQuizPage();
    await confirmThat(facefile).seesAnyQuizDirection();
  });

  test('the prompt holds a single question about the contact just added', async ({ facefile }) => {
    // GIVEN a user who has just saved a contact
    await facefile.signsInAsTestUserWithAPalace();
    await facefile.opensGuidedWizard();
    await facefile.completesAllFiveSteps('name: Marcus');

    // WHEN the prompt appears
    await confirmThat(facefile).landedOnQuizPage();

    // THEN it is one question, and it is about them
    await confirmThat(facefile).isOnQuestion('question: 1', 'of: 1');
    await facefile.answersWithAName('name: A Guess');
    await confirmThat(facefile).seesRevealedName('name: Marcus');
  });

  test('the prompt uses the same reveal and rating flow as any session', async ({ facefile }) => {
    // GIVEN a user on the post-add quiz prompt
    await facefile.signsInAsTestUserWithAPalace();
    await facefile.opensGuidedWizard();
    await facefile.completesAllFiveSteps('name: Marcus');
    await confirmThat(facefile).landedOnQuizPage();

    // WHEN they answer the question
    await facefile.answersWithAName('name: A Guess');

    // THEN the name is revealed and the same four ratings are offered
    await confirmThat(facefile).seesRevealedName('name: Marcus');
    await confirmThat(facefile).seesAllFourRatings();
  });

  test('completing the prompt updates the contact’s review schedule', async ({ facefile }) => {
    // GIVEN a user on the post-add quiz prompt
    await facefile.signsInAsTestUserWithAPalace();
    await facefile.opensGuidedWizard();
    await facefile.completesAllFiveSteps('name: Marcus');
    await confirmThat(facefile).landedOnQuizPage();
    await facefile.answersWithAName('name: A Guess');

    // WHEN they rate their recall
    await facefile.ratesRecall('rating: good');

    // THEN the answer is on record and a new review date has been computed
    await confirmThat(facefile).seesReviewHistoryFor('name: Marcus', 'rating: good');
    await confirmThat(facefile).seesUpdatedNextReviewFor('name: Marcus');
  });
});
