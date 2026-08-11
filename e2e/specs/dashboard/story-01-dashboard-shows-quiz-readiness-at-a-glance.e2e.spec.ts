import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-2.4.1 Dashboard Shows Quiz Readiness at a Glance — Metrics Row and Due-Review Banner', () => {
  test('unauthenticated navigation redirects to profile picker', async ({ facefile }) => {
    // GIVEN no profile session is active
    // WHEN the user navigates to the dashboard
    await facefile.attemptsToOpenProtectedPageWithoutSession();

    // THEN the user is redirected to the profile picker
    await confirmThat(facefile).isRedirectedToProfilePicker();
  });

  test('metrics row reflects current profile counts', async ({ facefile }) => {
    // GIVEN the active profile has 2 people added, each producing an immediately-due card
    // (there is no quiz-taking flow yet to ever produce a QuizResult, so quiz answers/accuracy
    // are legitimately 0 / — here rather than the story's illustrative "40 answers, 85%")
    await facefile.opensTheDashboard();
    await facefile.registersContact('name: Priya');
    await facefile.registersContact('name: Sam');

    // WHEN the user views the dashboard
    await facefile.opensTheDashboard();

    // THEN the metrics row shows those exact counts
    await confirmThat(facefile).seesPeopleAddedCount('count: 2');
    await confirmThat(facefile).seesCardsDueCount('count: 2');
  });

  test('due-review tile is highlighted when cards are due', async ({ facefile }) => {
    // GIVEN the active profile has a card due for review
    await facefile.opensTheDashboard();
    await facefile.registersContact('name: Priya');

    // WHEN the user views the dashboard
    await facefile.opensTheDashboard();

    // THEN the "due for review" tile is visually highlighted
    await confirmThat(facefile).seesDueTileHighlighted();
  });

  test('due-review tile is not highlighted when nothing is due', async ({ facefile }) => {
    // GIVEN a freshly-registered profile with 0 cards due
    await facefile.registersActiveUser('name: Fresh Profile', 'email: fresh-dashboard@example.com');
    await facefile.opensSelectProfile();
    await facefile.selectsProfile('name: Fresh Profile');
    await confirmThat(facefile).landsOnDashboard();

    // WHEN the user views the dashboard
    // (already there)

    // THEN the "due for review" tile is not visually highlighted
    await confirmThat(facefile).doesNotSeeDueTileHighlighted();
  });

  test('quiz-prompt banner appears when cards are due', async ({ facefile }) => {
    // GIVEN the active profile has a card due for review
    await facefile.opensTheDashboard();
    await facefile.registersContact('name: Priya');

    // WHEN the user views the dashboard
    await facefile.opensTheDashboard();

    // THEN a quiz-prompt banner appears above the action banners
    await confirmThat(facefile).seesQuizPromptBanner();
  });

  test('quiz-prompt banner is absent when nothing is due', async ({ facefile }) => {
    // GIVEN a freshly-registered profile with 0 cards due
    await facefile.registersActiveUser('name: Fresh Profile', 'email: fresh-dashboard2@example.com');
    await facefile.opensSelectProfile();
    await facefile.selectsProfile('name: Fresh Profile');
    await confirmThat(facefile).landsOnDashboard();

    // WHEN the user views the dashboard
    // THEN no quiz-prompt banner appears
    await confirmThat(facefile).doesNotSeeQuizPromptBanner();
  });

  test('starting quiz from the banner', async ({ facefile }) => {
    // GIVEN the quiz-prompt banner is visible
    await facefile.opensTheDashboard();
    await facefile.registersContact('name: Priya');
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesQuizPromptBanner();

    // WHEN the user taps "Start Quiz →"
    await facefile.startsQuizFromBanner();

    // THEN the user is taken to the quiz screen
    await confirmThat(facefile).isOnQuizScreen();
  });

  test('metrics are scoped to the active profile', async ({ facefile }) => {
    // GIVEN another profile has different people and due cards
    await facefile.registersActiveUser('name: Other Profile', 'email: other-profile@example.com');
    await facefile.opensSelectProfile();
    await facefile.selectsProfile('name: Other Profile');
    await confirmThat(facefile).landsOnDashboard();
    await facefile.registersContact('name: Other Persons Contact');
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesPeopleAddedCount('count: 1');

    // WHEN the user views the dashboard for a different, freshly-registered active profile
    // (registered before switching so the picker's list already includes them when it loads)
    await facefile.registersActiveUser('name: Active Profile', 'email: active-profile@example.com');
    await facefile.activatesSwitchProfile();
    await confirmThat(facefile).seesProfilePicker();
    await facefile.selectsProfile('name: Active Profile');
    await confirmThat(facefile).landsOnDashboard();

    // THEN only the active profile's counts are shown, never another profile's data
    await confirmThat(facefile).seesPeopleAddedCount('count: 0');
    await confirmThat(facefile).doesNotSeeContactInInventory('name: Other Persons Contact');
  });
});
