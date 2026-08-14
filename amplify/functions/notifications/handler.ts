import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, json, noContent, preflight } from '../_shared/http';
import { notificationsRepo } from '../_shared/notificationsRepo';
import { reminderService } from '../_shared/reminderService';
import { resolveUserId } from '../_shared/session';

/**
 * Review reminders (E-4.7). This one Lambda answers two different callers:
 *
 *   • API Gateway — GET /notifications, POST /notifications/{id}/read,
 *     DELETE /notifications, POST /notifications/dispatch
 *   • EventBridge — a scheduled event carrying no `httpMethod`, which runs the
 *     same sweep `POST /notifications/dispatch` runs.
 *
 * Keeping the schedule and the endpoint on one implementation means the sweep that
 * production runs unattended is exactly the one anything else can trigger — the
 * alternative (a separate function for the cron) would leave the scheduled path
 * with no way to be exercised except by waiting for it.
 */
export const handler = async (event: APIGatewayProxyEvent | ScheduledEvent): Promise<APIGatewayProxyResult | unknown> => {
  if (!isApiGatewayEvent(event)) return reminderService.dispatchDue();

  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/notifications/, '') || '/').replace(/\/+$/, '') || '/';
  const userId = resolveUserId(event);

  try {
    if (event.httpMethod === 'GET' && sub === '/') {
      return json(200, await reminderService.list(userId));
    }
    if (event.httpMethod === 'POST' && sub === '/dispatch') {
      return json(200, await reminderService.dispatchDue());
    }
    if (event.httpMethod === 'POST' && sub.endsWith('/read')) {
      await notificationsRepo.markRead(userId, sub.slice(1, -'/read'.length));
      return noContent();
    }
    if (event.httpMethod === 'DELETE' && sub === '/') {
      await notificationsRepo.deleteAllForUser(userId);
      return noContent();
    }
    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};

interface ScheduledEvent {
  source?: string;
}

function isApiGatewayEvent(event: APIGatewayProxyEvent | ScheduledEvent): event is APIGatewayProxyEvent {
  return typeof (event as APIGatewayProxyEvent).httpMethod === 'string';
}
