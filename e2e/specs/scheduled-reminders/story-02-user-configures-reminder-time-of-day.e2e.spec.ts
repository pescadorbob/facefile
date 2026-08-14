import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.7.2 User Configures Reminder Time of Day', () => {
  test('the settings offer a time picker for the hour and minute', async ({ facefile }) => {
    // GIVEN a user in notification settings
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();

    // WHEN they open the reminder settings
    await facefile.opensReminderSettings();

    // THEN a time of day can be chosen down to the minute
    await confirmThat(facefile).isOnReminderSettingsScreen();
    await confirmThat(facefile).seesReminderTime('time: 09:00');
  });

  test('a chosen time is saved and shown back', async ({ facefile }) => {
    // GIVEN a user in reminder settings
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.opensReminderSettings();

    // WHEN they pick 18:45
    await facefile.setsReminderTime('time: 18:45');

    // THEN that is the time their reminders are scheduled for
    await facefile.opensReminderSettings();
    await confirmThat(facefile).seesReminderTime('time: 18:45');
  });

  test('the settings state the timezone the time is read in', async ({ facefile }) => {
    // GIVEN a user in reminder settings
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.opensReminderSettings();

    // WHEN they set a time
    await facefile.setsReminderTime('time: 18:45');

    // THEN the timezone it will be honoured in is shown alongside it
    await confirmThat(facefile).seesReminderTimezone();
  });

  test('the sweep holds a reminder back until the configured time has passed', async ({ facefile }) => {
    // GIVEN a user with reminders on, contacts due, and a reminder time late in the day
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensReminderSettings();
    await facefile.setsReminderTime('time: 23:59');
    await facefile.enablesReminders();

    // WHEN the sweep runs before that time
    await facefile.theReminderSweepRuns();

    // THEN nothing has been sent yet
    await confirmThat(facefile).receivedNoReminder();
  });

  test('changing the time takes effect on the very next sweep', async ({ facefile }) => {
    // GIVEN a user whose reminder is being held back until late in the day
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensReminderSettings();
    await facefile.setsReminderTime('time: 23:59');
    await facefile.enablesReminders();
    await facefile.theReminderSweepRuns();
    await confirmThat(facefile).receivedNoReminder();

    // WHEN they move the time to midnight, which has already passed today
    await facefile.setsReminderTime('time: 00:00');
    await facefile.theReminderSweepRuns();

    // THEN the reminder goes out on that sweep
    await confirmThat(facefile).receivedExactlyOneReminder();
  });

  // That "09:00" means 09:00 where the user is, rather than 09:00 UTC, is exercised in
  // e2e/unit/review-reminders.unit.spec.ts, which can hold one instant still and read
  // it in two timezones at once. A browser run only ever sits in one zone.
});
