import { notificationsRepo, type NotificationRecord } from './notificationsRepo';
import { decideReminder, type SkipReason } from './reminderSchedule';
import { reviewCardsRepo } from './reviewCardsRepo';
import { userSettingsRepo } from './userSettingsRepo';

export interface DispatchOutcome {
  userId: string;
  sent: boolean;
  reason?: SkipReason;
  dueCount: number;
  channels: string[];
}

export interface DispatchSummary {
  ranAt: string;
  considered: number;
  sent: number;
  outcomes: DispatchOutcome[];
}

/**
 * The reminder sweep (E-4.7). Runs on a schedule in production and is reachable at
 * `POST /notifications/dispatch` as well, so the same code path can be driven directly
 * rather than only observed after a scheduler tick. Both entry points are safe to
 * repeat: `decideReminder` refuses a second send on the same local day, so an extra
 * run is a no-op rather than a duplicate message.
 *
 * Only users who have a stored settings row are considered at all — a user who has
 * never opened notification settings has opted into nothing.
 */
export const reminderService = {
  async dispatchDue(now = new Date()): Promise<DispatchSummary> {
    const everyoneWithSettings = await userSettingsRepo.findAll();
    const outcomes: DispatchOutcome[] = [];

    for (const settings of everyoneWithSettings) {
      // Counted per user rather than up front: it is the only per-user read that costs
      // anything, and most users are skipped before it matters.
      const dueCount =
        settings.remindersEnabled && settings.reminderChannels.length > 0
          ? await reviewCardsRepo.countDue(settings.userId, now)
          : 0;

      const decision = decideReminder({ settings, dueCount, now });

      if (!decision.send) {
        outcomes.push({ userId: settings.userId, sent: false, reason: decision.reason, dueCount, channels: settings.reminderChannels });
        continue;
      }

      await Promise.all(
        settings.reminderChannels.map((channel) =>
          notificationsRepo.create({
            userId: settings.userId,
            channel,
            message: decision.message,
            link: decision.link,
            dueCount,
            sentAt: now.toISOString(),
          }),
        ),
      );

      // Stamped only after delivery, so a failed send is retried on the next sweep
      // rather than silently counting as the day's reminder.
      await userSettingsRepo.save({ ...settings, lastReminderSentOn: decision.localDate });
      outcomes.push({ userId: settings.userId, sent: true, dueCount, channels: settings.reminderChannels });
    }

    return {
      ranAt: now.toISOString(),
      considered: outcomes.length,
      sent: outcomes.filter((outcome) => outcome.sent).length,
      outcomes,
    };
  },

  list(userId: string): Promise<NotificationRecord[]> {
    return notificationsRepo.findAllByUser(userId);
  },
};
