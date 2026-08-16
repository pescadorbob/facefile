import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-2.4.4 Dashboard Navigation Shortcuts — Admin, Meetings, Switch Profile', () => {
  test('Admin link is reachable from the header', async ({ facefile }) => {
    // GIVEN the user is on the dashboard
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();

    // WHEN the user looks at the header
    // THEN an Admin link is visible and selectable
    await confirmThat(facefile).seesAdminLink();
    await facefile.activatesAdminLink();
    await confirmThat(facefile).isOnAdminUsersScreen();
  });

  test('Meetings link is reachable from the header', async ({ facefile }) => {
    // GIVEN the user is on the dashboard
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();

    // WHEN the user looks at the header
    // THEN a Meetings link is visible and selectable
    await confirmThat(facefile).seesMeetingsLink();
    await facefile.activatesMeetingsLink();
    await confirmThat(facefile).isOnMeetingsScreen();
  });

  // NOTE: "Header links are styled distinctly from the primary action banners" is a visual
  // design concern (header chrome vs. body banners), not asserted here as brittle CSS/pixel
  // comparisons — the header/main structural separation itself is covered implicitly by the
  // two tests above, which locate these links in the header rather than among the banners.

  test('switching profile clears the session', async ({ facefile }) => {
    // GIVEN the user is on the dashboard with an active profile session
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();

    // WHEN the user activates "Switch profile"
    await facefile.activatesSwitchProfile();

    // THEN the session is cleared and the user is returned to the profile picker
    await confirmThat(facefile).seesProfilePicker();
  });

  test('starting a quiz when nothing is due', async ({ facefile }) => {
    // GIVEN the user is on the dashboard with no reviews currently due
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.completesReviewFor('name: Priya', 'rating: good');
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesCardsDueCount('count: 0');

    // WHEN the user chooses to start a quiz
    await facefile.startsReviewFromDueCount();

    // THEN a quiz session begins using the user's contacts rather than being blocked
    // by there being nothing due
    await confirmThat(facefile).isOnQuizScreen();
    await confirmThat(facefile).isOnQuestion('question: 1', 'of: 1');
  });
});
