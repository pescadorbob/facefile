import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.6.2 User Views Upcoming Reviews by Date', () => {
  test('the upcoming view is reachable from the dashboard', async ({ facefile }) => {
    // GIVEN a user on the dashboard
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();

    // WHEN they open the upcoming reviews
    await facefile.opensUpcomingReviewsFromDashboard();

    // THEN they land on that view
    await confirmThat(facefile).isOnUpcomingScreen();
  });

  test('reviews are grouped by the day they fall on', async ({ facefile }) => {
    // GIVEN two contacts reviewed successfully, so both fall due on the same future day
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');
    await facefile.completesReviewFor('name: Priya', 'rating: good');
    await facefile.completesReviewFor('name: Sam', 'rating: good');

    // WHEN the user views the upcoming reviews
    await facefile.opensUpcomingReviews();

    // THEN they are grouped into a single day carrying both
    await confirmThat(facefile).seesUpcomingDays('count: 1');
    await confirmThat(facefile).seesDayHoldsContacts('count: 2');
  });

  test('each day names the contacts due on it', async ({ facefile }) => {
    // GIVEN a contact scheduled for a future review
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.completesReviewFor('name: Priya', 'rating: good');

    // WHEN the user views the upcoming reviews
    await facefile.opensUpcomingReviews();

    // THEN her name is listed under that day
    await confirmThat(facefile).seesContactInUpcoming('name: Priya');
  });

  test('days with no reviews are left out of the list', async ({ facefile }) => {
    // GIVEN a single contact scheduled one day out, with nothing on the days after
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.completesReviewFor('name: Priya', 'rating: good');

    // WHEN the user views the upcoming reviews
    await facefile.opensUpcomingReviews();

    // THEN exactly one day is listed, not fourteen with thirteen of them empty
    await confirmThat(facefile).seesUpcomingDays('count: 1');
  });

  test('tapping a day shows which contacts are due on it', async ({ facefile }) => {
    // GIVEN two contacts scheduled for a future day
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');
    await facefile.completesReviewFor('name: Priya', 'rating: good');
    await facefile.completesReviewFor('name: Sam', 'rating: good');
    await facefile.opensUpcomingReviews();

    // WHEN the user taps that day
    await facefile.opensTheDayAtPosition('position: 1');

    // THEN each contact due on it is listed individually
    await confirmThat(facefile).seesContactListedForThatDay('name: Priya');
    await confirmThat(facefile).seesContactListedForThatDay('name: Sam');
  });

  test('a user with nothing scheduled is told the window is clear', async ({ facefile }) => {
    // GIVEN a user with no contacts at all
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();

    // WHEN they view the upcoming reviews
    await facefile.opensUpcomingReviews();

    // THEN they are told there is nothing scheduled rather than shown a blank list
    await confirmThat(facefile).seesNothingUpcoming();
  });
});
