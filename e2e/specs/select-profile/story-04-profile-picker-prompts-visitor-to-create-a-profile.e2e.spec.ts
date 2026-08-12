import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-1.7.4 Profile Picker Prompts the Visitor to Create a Profile When None Is Selected or None Exist', () => {
  /**
   * The "no profiles exist at all" scenarios (first launch shows the prompt instead of an
   * empty list; a protected page with no profiles routes to it) can't be driven here: every
   * environment keeps the seeded default profile, and teardown is forbidden from removing
   * real accounts. They are covered against an empty list in the component spec —
   * frontend/src/app/pages/select-profile/select-profile.component.spec.ts.
   */
  test.skip('first launch with no profiles prompts creation', () => {});

  test('picker with existing profiles still offers creation', async ({ facefile }) => {
    // GIVEN a profile exists and the visitor has no active session
    await facefile.registersActiveUser('name: Priya', 'email: priya-create@example.com');

    // WHEN the visitor opens the profile picker
    await facefile.opensSelectProfile();

    // THEN the profile is listed by name and a create-a-profile action is also offered
    await confirmThat(facefile).seesProfileInPicker('name: Priya');
    await confirmThat(facefile).seesCreateProfileOption();
  });

  test('creating a profile starts a session and opens the dashboard', async ({ facefile }) => {
    // GIVEN the visitor is on the create-a-profile prompt with no active session
    // (a profile exists, so the prompt is reached through the picker's create action
    // rather than the empty-list state — see the skipped scenario above)
    await facefile.registersActiveUser('name: Priya', 'email: priya-newsession@example.com');
    await facefile.opensSelectProfile();
    await facefile.opensCreateProfilePrompt();

    // WHEN the visitor enters a name and submits
    await facefile.createsProfile('name: Nadia');

    // THEN a session starts for the new profile and the visitor lands on its dashboard
    await confirmThat(facefile).landsOnDashboard();
  });

  test('creating a profile adds it to the picker', async ({ facefile }) => {
    // GIVEN the visitor has created a profile from the picker
    await facefile.registersActiveUser('name: Priya', 'email: priya-listed@example.com');
    await facefile.opensSelectProfile();
    await facefile.opensCreateProfilePrompt();
    await facefile.createsProfile('name: Yusuf');
    await confirmThat(facefile).landsOnDashboard();

    // WHEN the picker is opened again
    await facefile.activatesSwitchProfile();

    // THEN the new profile appears in it
    await confirmThat(facefile).seesProfileInPicker('name: Yusuf');
  });

  test('blank name blocks creation', async ({ facefile }) => {
    // GIVEN the visitor is on the create-a-profile prompt
    await facefile.registersActiveUser('name: Priya', 'email: priya-blank@example.com');
    await facefile.opensSelectProfile();
    await facefile.opensCreateProfilePrompt();

    // WHEN the visitor leaves the name blank and submits
    await facefile.attemptsToCreateProfileWithoutName();

    // THEN an inline error appears, no profile is created, and no session starts
    await confirmThat(facefile).seesNameRequiredErrorOnProfileForm();
    await confirmThat(facefile).seesProfilePicker();
  });

  test('duplicate name blocks creation', async ({ facefile }) => {
    // GIVEN a profile with that name already exists
    await facefile.registersActiveUser('name: Priya', 'email: priya-duplicate@example.com');
    await facefile.opensSelectProfile();
    await facefile.opensCreateProfilePrompt();

    // WHEN the visitor submits the prompt with the same name
    await facefile.attemptsToCreateProfileWithDuplicateName('name: Priya');

    // THEN an inline error appears, no duplicate is created, and no session starts
    await confirmThat(facefile).seesDuplicateNameErrorOnProfileForm();
    await confirmThat(facefile).seesProfilePicker();
  });

  test('abandoning creation leaves the picker unchanged', async ({ facefile }) => {
    // GIVEN a profile exists and the visitor has opened the create-a-profile prompt
    await facefile.registersActiveUser('name: Sam', 'email: sam-cancel@example.com');
    await facefile.opensSelectProfile();
    await facefile.opensCreateProfilePrompt();

    // WHEN the visitor cancels the prompt
    await facefile.abandonsCreateProfilePrompt();

    // THEN the picker is shown as before, with no profile created
    await confirmThat(facefile).doesNotSeeCreateProfilePrompt();
    await confirmThat(facefile).seesProfileInPicker('name: Sam');
  });
});
