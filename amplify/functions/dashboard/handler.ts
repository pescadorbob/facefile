import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { contactsRepo } from '../_shared/contactsRepo';
import { errorResponse, json, preflight } from '../_shared/http';
import { quizResultsRepo } from '../_shared/quizResultsRepo';
import { reviewCardsRepo } from '../_shared/reviewCardsRepo';
import { resolveUserId } from '../_shared/session';
import { buildUpcomingReviews, DEFAULT_HORIZON_DAYS } from '../_shared/upcomingReviews';
import { userSettingsRepo } from '../_shared/userSettingsRepo';

/**
 * Descended from backend/src/routes/dashboard.js. The counts are unchanged; E-4.6
 * added `nextReviewAt` (so a caught-up dashboard can say when the next review lands
 * rather than only that there are none) and the `/upcoming` view.
 *
 *   GET /dashboard/metrics   the tile counts
 *   GET /dashboard/upcoming  reviews grouped by day for the next 14 days
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/dashboard/, '') || '/').replace(/\/+$/, '') || '/';

  try {
    if (event.httpMethod === 'GET' && sub === '/metrics') return await metrics(resolveUserId(event));
    if (event.httpMethod === 'GET' && sub === '/upcoming') {
      const days = Number(event.queryStringParameters?.days ?? DEFAULT_HORIZON_DAYS);
      return await upcoming(resolveUserId(event), Number.isInteger(days) && days > 0 ? days : DEFAULT_HORIZON_DAYS);
    }
    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};

async function metrics(userId: string): Promise<APIGatewayProxyResult> {
  const now = new Date();
  const [peopleAdded, cards, totalQuizAnswers, correctQuizAnswers] = await Promise.all([
    contactsRepo.countByUser(userId),
    // Fetched rather than counted: the same read yields both the due count and the
    // earliest upcoming review, so a second query would buy nothing.
    reviewCardsRepo.findAllByUser(userId),
    quizResultsRepo.countByUser(userId),
    quizResultsRepo.countByUser(userId, { minQuality: 3 }),
  ]);

  const nowIso = now.toISOString();
  const cardsDue = cards.filter((card) => card.nextReviewAt <= nowIso).length;
  const nextReviewAt = cards.map((card) => card.nextReviewAt).sort()[0] ?? null;
  const accuracyPercentage = totalQuizAnswers === 0 ? null : Math.round((100 * correctQuizAnswers) / totalQuizAnswers);

  return json(200, { peopleAdded, cardsDue, totalQuizAnswers, accuracyPercentage, nextReviewAt });
}

async function upcoming(userId: string, horizonDays: number): Promise<APIGatewayProxyResult> {
  const [contacts, cards, settings] = await Promise.all([
    contactsRepo.findAllByUser(userId),
    reviewCardsRepo.findAllByUser(userId),
    // Days are grouped in the user's own timezone — the same one their reminders use —
    // so "Thursday" means the same thing in both places.
    userSettingsRepo.findByUser(userId),
  ]);

  return json(
    200,
    buildUpcomingReviews({
      contacts: contacts.map((contact) => ({ id: contact.id, name: contact.name, photoPath: contact.photoPath })),
      cards: cards.map((card) => ({ contactId: card.contactId, nextReviewAt: card.nextReviewAt })),
      now: new Date(),
      timeZone: settings.reminderTimezone,
      horizonDays,
    }),
  );
}
