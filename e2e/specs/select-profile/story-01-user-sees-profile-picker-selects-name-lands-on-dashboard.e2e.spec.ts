import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-1.7.1 User Sees the Profile Picker on Launch, Selects Their Name, and Lands on the Dashboard', () => {
  test('app launch with no session shows the profile picker', async ({ facefile }) => {
    // GIVEN the user has no active session
    // WHEN the user opens the app
    await facefile.attemptsToOpenProtectedPageWithoutSession();

    // THEN the profile picker is shown instead of the dashboard
    await confirmThat(facefile).seesProfilePicker();
  });

  test('protected page is unreachable without a session', async ({ facefile }) => {
    // GIVEN the user has no active session
    // WHEN the user navigates directly to a protected page
    await facefile.attemptsToOpenProtectedPageWithoutSession();

    // THEN the user is redirected to the profile picker
    await confirmThat(facefile).isRedirectedToProfilePicker();
  });

  test('profile picker lists registered users', async ({ facefile }) => {
    // GIVEN two users, "Priya" and "Sam", are registered
    await facefile.registersActiveUser('name: Priya', 'email: priya@example.com');
    await facefile.registersActiveUser('name: Sam', 'email: sam@example.com');

    // WHEN the user opens the profile picker
    await facefile.opensSelectProfile();

    // THEN both "Priya" and "Sam" are listed by name
    await confirmThat(facefile).seesProfileInPicker('name: Priya');
    await confirmThat(facefile).seesProfileInPicker('name: Sam');
  });

  test('selecting a profile starts a session and opens the dashboard', async ({ facefile }) => {
    // GIVEN the profile picker is showing a registered user
    await facefile.registersActiveUser('name: Priya', 'email: priya-select@example.com');
    await facefile.opensSelectProfile();

    // WHEN the user taps their name
    await facefile.selectsProfile('name: Priya');

    // THEN a session starts for them and they land on their dashboard
    await confirmThat(facefile).landsOnDashboard();
  });
});
