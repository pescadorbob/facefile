import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-1.1.1 New User Walks Through the 7-Step Fundamentals Tutorial', () => {
  test('opens to step 1 of 7 with educational content and advance option visible', async ({ facefile }) => {
    // GIVEN a new user has not started the tutorial
    // WHEN they open the tutorial
    await facefile.opensTheTutorial();

    // THEN they see step 1 of 7 with its educational content displayed before the next step option
    await confirmThat(facefile).seesStep('step: 1');
    await confirmThat(facefile).seesStepContent();
    await confirmThat(facefile).seesAdvanceOption();
  });

  test('completing step 7 shows fundamentals complete confirmation', async ({ facefile }) => {
    // GIVEN a user is on step 7 and has viewed its content
    await facefile.opensTheTutorial();
    await facefile.advancesToStep('step: 7');
    await confirmThat(facefile).seesStep('step: 7');

    // WHEN they advance past step 7
    await facefile.advancesStep();

    // THEN they see a fundamentals complete confirmation
    await confirmThat(facefile).seesCompletionConfirmation();
  });

  test('completing step 6 advances to step 7 without showing completion', async ({ facefile }) => {
    // GIVEN a user is on step 6
    await facefile.opensTheTutorial();
    await facefile.advancesToStep('step: 6');

    // WHEN they complete step 6 (advance to step 7)
    await facefile.advancesStep();

    // THEN they are on step 7 and do not yet see a fundamentals complete confirmation
    await confirmThat(facefile).seesStep('step: 7');
    await confirmThat(facefile).doesNotSeeCompletionConfirmation();
  });

  test('step 4 contains a visual example of memory palace structure', async ({ facefile }) => {
    // GIVEN a user is progressing through the tutorial
    await facefile.opensTheTutorial();
    await facefile.advancesToStep('step: 4');

    // THEN step 4 contains a visual example of a memory palace structure or person placement
    await confirmThat(facefile).seesVisualExample();
  });
});
