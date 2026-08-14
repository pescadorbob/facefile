import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.7.3 User Disables Reminders Without Losing Schedule', () => {
  test('a single toggle stops all reminders immediately', async ({ facefile }) => {
    // GIVEN a user with reminders on and a contact due
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensReminderSettings();
    await facefile.setsReminderTime('time: 00:00');
    await facefile.enablesReminders();

    // WHEN they turn reminders off
    await facefile.disablesReminders();
    await facefile.theReminderSweepRuns();

    // THEN nothing is delivered
    await confirmThat(facefile).seesRemindersDisabled();
    await confirmThat(facefile).receivedNoReminder();
  });

  test('turning reminders off leaves the review schedule untouched', async ({ facefile }) => {
    // GIVEN a user with two contacts, one already reviewed and so not due
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');
    await facefile.completesReviewFor('name: Sam', 'rating: good');

    // WHEN they turn reminders off
    await facefile.opensReminderSettings();
    await facefile.enablesReminders();
    await facefile.disablesReminders();

    // THEN both contacts keep the schedule they had — one due, one not
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesCardsDueCount('count: 1');
    await facefile.opensUpcomingReviews();
    await confirmThat(facefile).seesContactInUpcoming('name: Sam');
  });

  test('the due-review dashboard keeps updating while reminders are off', async ({ facefile }) => {
    // GIVEN a user with reminders off and two contacts due
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam');
    await facefile.opensReminderSettings();
    await facefile.disablesReminders();
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesCardsDueCount('count: 2');

    // WHEN one of them is reviewed
    await facefile.completesReviewFor('name: Sam', 'rating: good');

    // THEN the dashboard count moves as normal
    await confirmThat(facefile).seesCardsDueCountEventually('count: 1');
  });

  test('re-enabling restores delivery at the previously configured time', async ({ facefile }) => {
    // GIVEN a user who configured 00:00 and then turned reminders off
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensReminderSettings();
    await facefile.setsReminderTime('time: 00:00');
    await facefile.enablesReminders();
    await facefile.disablesReminders();

    // WHEN they turn reminders back on without setting a time again
    await facefile.enablesReminders();

    // THEN their original time is still in place, and the next sweep delivers
    await confirmThat(facefile).seesReminderTime('time: 00:00');
    await facefile.theReminderSweepRuns();
    await confirmThat(facefile).receivedExactlyOneReminder();
  });
});
