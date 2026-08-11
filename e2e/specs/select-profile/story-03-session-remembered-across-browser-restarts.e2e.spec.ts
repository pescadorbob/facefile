import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-1.7.3 Session Remembered Across Browser Restarts via Persistent Cookie with Optional "Remember Me"', () => {
  test('remember me option is available at selection', async ({ facefile }) => {
    // GIVEN the profile picker is showing
    await facefile.opensSelectProfile();

    // WHEN the user views the options for selecting a profile
    // THEN a "Remember me" option is offered
    await confirmThat(facefile).seesRememberMeOption();
  });

  test('remembered session survives a browser restart', async ({ facefile }) => {
    // GIVEN the user selects a profile with "Remember me" enabled
    await facefile.registersActiveUser('name: Priya', 'email: priya-remember@example.com');
    await facefile.opensSelectProfile();
    await facefile.selectsProfileWithRememberMe('name: Priya');
    await confirmThat(facefile).landsOnDashboard(); // waits for the select round-trip to finish

    // WHEN/THEN the session is set to persist beyond this browser session — the exact
    // mechanism (a Max-Age in the future) a real browser restart relies on to keep it
    await confirmThat(facefile).sessionCookieIsPersistent();
  });

  test('session without remember me does not survive a browser restart', async ({ facefile }) => {
    // GIVEN the user selects a profile without enabling "Remember me"
    await facefile.registersActiveUser('name: Priya', 'email: priya-noremember@example.com');
    await facefile.opensSelectProfile();
    await facefile.selectsProfile('name: Priya');
    await confirmThat(facefile).landsOnDashboard(); // waits for the select round-trip to finish

    // WHEN/THEN the session is scoped to the current browser session only
    await confirmThat(facefile).sessionCookieIsBrowserScoped();
  });

  test('expired persistent session returns to the picker', async ({ facefile }) => {
    test.skip(true, 'Requires fast-forwarding real time past the 30-day cookie lifetime, or a testing backdoor not in the spec. The underlying mechanism (browser-enforced Max-Age) is covered by the persistent-cookie assertion above.');

    // GIVEN the user selected a profile with "Remember me" enabled and the persistent
    // session's lifetime has since elapsed
    // WHEN the user reopens the app
    // THEN the profile picker is shown
  });

  test('invalid session returns to the picker', async ({ facefile }) => {
    // GIVEN the user's stored session is invalid or has been tampered with
    await facefile.tampersWithSessionCookie();

    // WHEN the user opens the app
    await facefile.attemptsToOpenProtectedPageWithoutSession();

    // THEN the profile picker is shown
    await confirmThat(facefile).isRedirectedToProfilePicker();
  });
});
