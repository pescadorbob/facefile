import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-2.4.3 Dashboard Action Banners Launch Teach Mode, Tutorial, and Palaces', () => {
  test('standing banners are visible with no cards due', async ({ facefile }) => {
    // GIVEN the active profile has 0 cards due for review
    await facefile.registersActiveUser('name: Fresh Profile', 'email: fresh-banners@example.com');
    await facefile.opensSelectProfile();
    await facefile.selectsProfile('name: Fresh Profile');
    await confirmThat(facefile).landsOnDashboard();

    // WHEN the user views the dashboard
    // THEN the teach-mode, tutorial, and memory-palaces banners are all visible
    await confirmThat(facefile).seesStandingActionBanners();
  });

  test('standing banners are visible with cards due', async ({ facefile }) => {
    // GIVEN the active profile has cards due for review and the quiz-prompt banner is showing
    await facefile.opensTheDashboard();
    await facefile.registersContact('name: Priya');
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesQuizPromptBanner();

    // WHEN the user views the dashboard
    // THEN the teach-mode, tutorial, and memory-palaces banners are still all visible
    await confirmThat(facefile).seesStandingActionBanners();
  });

  test('launching teach mode', async ({ facefile }) => {
    // GIVEN the dashboard is visible
    await facefile.opensTheDashboard();

    // WHEN the user taps the teach-mode banner
    await facefile.launchesTeachModeBanner();

    // THEN teach mode starts
    await confirmThat(facefile).isOnTeachModeScreen();
  });

  test('opening the tutorial', async ({ facefile }) => {
    // GIVEN the dashboard is visible
    await facefile.opensTheDashboard();

    // WHEN the user taps the tutorial banner
    await facefile.opensTutorialFromDashboard();

    // THEN the tutorial opens
    await confirmThat(facefile).isOnTutorialScreen();
  });

  test('navigating to palaces', async ({ facefile }) => {
    // GIVEN the dashboard is visible
    await facefile.opensTheDashboard();

    // WHEN the user taps the memory-palaces banner
    await facefile.navigatesToPalacesFromDashboard();

    // THEN the user is taken to the palaces view
    await confirmThat(facefile).isOnPalacesScreen();
  });
});
