import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-1.7.2 Session Persists Within the Current Browser Session — Refresh Stays, Switch Profile Ends It', () => {
  test('refresh does not re-prompt for a profile', async ({ facefile }) => {
    // GIVEN the user has an active session
    await facefile.signsInAsTestUser();
    await facefile.opensTheTutorial();

    // WHEN the user refreshes the page
    await facefile.refreshesPage();

    // THEN the user remains on their session without seeing the profile picker
    await confirmThat(facefile).seesStepContent();
  });

  test('navigating between pages keeps the session', async ({ facefile }) => {
    // GIVEN the user has an active session
    await facefile.signsInAsTestUser();
    await facefile.opensTheTutorial();

    // WHEN the user navigates to another protected page
    await facefile.opensGuidedWizard();

    // THEN the user stays on their session throughout, with no profile picker shown
    await confirmThat(facefile).isOnWizardStep('step: 1');
  });

  test('switching profile clears the session', async ({ facefile }) => {
    // GIVEN the user has an active session
    await facefile.signsInAsTestUser();
    await facefile.opensTheTutorial();

    // WHEN the user activates "Switch profile"
    await facefile.activatesSwitchProfile();

    // THEN the session is cleared and the user is returned to the profile picker
    await confirmThat(facefile).seesProfilePicker();
  });

  test('selecting a new profile after switching starts a fresh session', async ({ facefile }) => {
    // GIVEN the user has switched profiles and is viewing the profile picker
    await facefile.registersActiveUser('name: Sam', 'email: sam-switch@example.com');
    await facefile.signsInAsTestUser();
    await facefile.opensTheTutorial();
    await facefile.activatesSwitchProfile();

    // WHEN the user taps a different name
    await facefile.selectsProfile('name: Sam');

    // THEN a new session starts for them and they land on their dashboard
    await confirmThat(facefile).landsOnDashboard();
  });
});
