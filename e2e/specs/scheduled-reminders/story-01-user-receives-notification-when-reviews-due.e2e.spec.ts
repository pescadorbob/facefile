import { confirmThat, test, type FacefileDsl } from '../../fixtures/facefile';

/**
 * Reminders go out at or after the user's configured time, so every scenario here sets
 * that time to midnight — any moment of any day is "after" it. The time-of-day rule
 * itself is the subject of story 02.
 */
async function remindersOnFromMidnight(facefile: FacefileDsl): Promise<void> {
  await facefile.opensReminderSettings();
  await facefile.setsReminderTime('time: 00:00');
  await facefile.enablesReminders();
}

test.describe('S-4.7.1 User Receives Notification When Reviews Due', () => {
  test('a reminder is sent on a day with contacts due', async ({ facefile }) => {
    // GIVEN a user with reminders on and a contact due for review
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await remindersOnFromMidnight(facefile);

    // WHEN the reminder sweep runs
    await facefile.theReminderSweepRuns();

    // THEN a reminder is waiting for them
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesReviewReminder();
  });

  test('the reminder states how many contacts are due', async ({ facefile }) => {
    // GIVEN a user with reminders on and three contacts due
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContacts('names: Priya, Sam, Tom');
    await remindersOnFromMidnight(facefile);

    // WHEN the reminder sweep runs
    await facefile.theReminderSweepRuns();

    // THEN the message names that number
    await facefile.opensTheDashboard();
    await confirmThat(facefile).seesReminderStating('count: 3');
  });

  test('the reminder leads straight into the review session', async ({ facefile }) => {
    // GIVEN a user with a reminder waiting
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await remindersOnFromMidnight(facefile);
    await facefile.theReminderSweepRuns();
    await facefile.opensTheDashboard();
    await confirmThat(facefile).receivedAReminderLinkingToTheReviewSession();

    // WHEN they open it
    await facefile.opensTheReviewReminder();

    // THEN they land in a review session
    await confirmThat(facefile).isOnQuizScreen();
  });

  test('no reminder is sent once the day’s reviews are all done', async ({ facefile }) => {
    // GIVEN a user with reminders on whose only contact has already been reviewed
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.completesReviewFor('name: Priya', 'rating: good');
    await remindersOnFromMidnight(facefile);

    // WHEN the reminder sweep runs
    await facefile.theReminderSweepRuns();

    // THEN nothing is sent
    await confirmThat(facefile).receivedNoReminder();
  });

  test('a user with no channel enabled is skipped without error', async ({ facefile }) => {
    // GIVEN a user with reminders on, contacts due, but every delivery channel turned off
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await remindersOnFromMidnight(facefile);
    await facefile.turnsOffEveryReminderChannel();

    // WHEN the reminder sweep runs
    await facefile.theReminderSweepRuns();

    // THEN it completes, having quietly sent them nothing
    await confirmThat(facefile).receivedNoReminder();
    await facefile.opensTheDashboard();
    await confirmThat(facefile).doesNotSeeReviewReminder();
  });

  test('a second sweep on the same day does not send a second reminder', async ({ facefile }) => {
    // GIVEN a user who has already been reminded today
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await remindersOnFromMidnight(facefile);
    await facefile.theReminderSweepRuns();
    await confirmThat(facefile).receivedExactlyOneReminder();

    // WHEN the sweep runs again
    await facefile.theReminderSweepRuns();

    // THEN they still have exactly the one reminder
    await confirmThat(facefile).receivedExactlyOneReminder();
  });
});
