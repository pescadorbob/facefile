import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.6.1 User Sees Due Count on Login', () => {
  test('the due count is shown prominently on the home screen', async ({ facefile }) => {
    // GIVEN the user has three contacts due for review
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom');

    // WHEN they land on the dashboard
    await facefile.opensTheDashboard();

    // THEN the count of contacts due is on the screen, and highlighted
    await confirmThat(facefile).seesCardsDueCount('count: 3');
    await confirmThat(facefile).seesDueTileHighlighted();
  });

  test('the count reflects reviews completed since it was first shown', async ({ facefile }) => {
    // GIVEN a dashboard showing two contacts due
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesCardsDueCount('count: 2');

    // WHEN one of them is reviewed while the user is still active
    await facefile.completesReviewFor('name: Sam', 'rating: good');

    // THEN the dashboard settles on the new count without the user reloading it
    await confirmThat(facefile).seesCardsDueCountEventually('count: 1');
  });

  test('a caught-up user is told so, with the next due date', async ({ facefile }) => {
    // GIVEN a user whose only contact has just been reviewed
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.completesReviewFor('name: Priya', 'rating: good');

    // WHEN they view the dashboard
    await facefile.opensTheDashboard();

    // THEN they see a positive message rather than an empty zero, and when the next review lands
    await confirmThat(facefile).seesCardsDueCount('count: 0');
    await confirmThat(facefile).seesCaughtUpMessage();
    await confirmThat(facefile).seesNextDueDateOnDashboard();
  });

  test('no caught-up message is shown while reviews are still waiting', async ({ facefile }) => {
    // GIVEN the user has a contact due
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');

    // WHEN they view the dashboard
    await facefile.opensTheDashboard();

    // THEN they are not told they are caught up
    await confirmThat(facefile).doesNotSeeCaughtUpMessage();
  });

  test('tapping the count launches a session pre-loaded with the due contacts', async ({ facefile }) => {
    // GIVEN a dashboard showing one contact due and one already reviewed
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');
    await facefile.completesReviewFor('name: Sam', 'rating: good');
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesCardsDueCount('count: 1');

    // WHEN the user taps the count
    await facefile.startsReviewFromDueCount();

    // THEN a session opens holding just the due contact, with no start screen in between
    await confirmThat(facefile).isOnQuizScreen();
    await confirmThat(facefile).isOnQuestion('question: 1', 'of: 1');
  });
});
