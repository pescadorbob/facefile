import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-2.5.1 User Steps Through the Wizard to Add a New Person', () => {
  test('completing all five steps saves the contact and navigates to the quiz', async ({ facefile }) => {
    // GIVEN a registered user with at least one memory palace
    await facefile.signsInAsTestUserWithAPalace();
    await facefile.opensGuidedWizard();

    // WHEN the user opens the guided wizard, completes all five steps, and saves
    await facefile.completesAllFiveSteps('name: Margaret');

    // THEN the contact is saved with name, palace placement, name image, and association scene
    // AND the user is taken to the quiz
    await confirmThat(facefile).landedOnQuizPage();
  });

  test('clicking Continue without a name on step 1 shows a required-name error and stays on step 1', async ({ facefile }) => {
    // GIVEN a registered user on step 1 of the guided wizard
    await facefile.signsInAsTestUser();
    await facefile.opensGuidedWizard();

    // WHEN the user clicks Next without entering a name
    await facefile.attemptsToAdvanceWithoutName();

    // THEN an error is shown and the user stays on step 1
    await confirmThat(facefile).seesNameRequiredError();
    await confirmThat(facefile).isOnWizardStep('step: 1');
  });

  test('step 3 displays the entered name prominently and shows all three technique hints', async ({ facefile }) => {
    // GIVEN a registered user who has entered a name
    await facefile.signsInAsTestUserWithAPalace();
    await facefile.opensGuidedWizard();
    await facefile.completesStep1('name: Brian');
    await facefile.completesStep2();

    // WHEN the user reaches step 3 of the wizard
    await confirmThat(facefile).isOnWizardStep('step: 3');

    // THEN the step displays the name prominently
    await confirmThat(facefile).seesNameProminentlyOnStep3('name: Brian');

    // AND shows technique hints for sound-alike, meaning, and personal association
    await confirmThat(facefile).seesNameImageTechniqueHints();
  });

  test('step 2 shows the palaces that belong to the current user', async ({ facefile }) => {
    // GIVEN a registered user with palaces of their own
    await facefile.signsInAsTestUser();
    await facefile.registersPalace('palace: Childhood Home');
    await facefile.registersPalace('palace: Secondary School');
    await facefile.opensGuidedWizard();
    await facefile.completesStep1('name: Daniel');

    // WHEN the user reaches step 2
    await confirmThat(facefile).isOnWizardStep('step: 2');

    // THEN the user's own palaces appear in the palace picker
    await confirmThat(facefile).seesPalaceOfferedForPlacement('palace: Childhood Home');
    await confirmThat(facefile).seesPalaceOfferedForPlacement('palace: Secondary School');
  });

  test('clicking Back on step 3 returns to step 2, and the name image is preserved on return', async ({ facefile }) => {
    // GIVEN a registered user on step 3 of the guided wizard with a name image entered
    await facefile.signsInAsTestUserWithAPalace();
    await facefile.opensGuidedWizard();
    await facefile.completesStep1('name: Caroline');
    await facefile.completesStep2();
    await confirmThat(facefile).isOnWizardStep('step: 3');
    await facefile.entersNameImageOnStep3('image: a carousel horse');

    // WHEN the user clicks Back
    await facefile.navigatesBackInWizard();

    // THEN the user is returned to step 2
    await confirmThat(facefile).isOnWizardStep('step: 2');

    // AND the name image is preserved when they return to step 3
    await facefile.advancesWizardStep();
    await confirmThat(facefile).seesNameImagePreservedAfterBack('image: a carousel horse');
  });

  test('a user with no palaces is sent to create one, then resumes the wizard', async ({ facefile }) => {
    // GIVEN a registered user who has no memory palaces
    await facefile.signsInAsTestUser();
    await facefile.opensGuidedWizard();
    await facefile.completesStep1('name: Owen');

    // WHEN the user reaches step 2 of the guided wizard
    // THEN the user is taken to the new-palace form
    await confirmThat(facefile).seesNewPalacePrompt();
    // AND guidance explains that a palace is needed before a person can be placed
    await confirmThat(facefile).seesPalaceGuidanceForAddPerson();

    // AND once a palace is created, the user is returned to resume the guided wizard
    await facefile.createsPalace('palace: Reading Nook');
    await confirmThat(facefile).isOnWizardStep('step: 2');

    // AND the previously entered name was preserved across the detour
    await facefile.advancesWizardStep();
    await confirmThat(facefile).seesNameProminentlyOnStep3('name: Owen');
  });
});
