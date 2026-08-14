import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, json, preflight } from '../_shared/http';
import { quizService } from '../_shared/quizService';
import { resolveUserId } from '../_shared/session';

/**
 * The quiz routes (F-4.1 / F-4.2). There was no equivalent in the Express app — it
 * had the SM-2 module but nothing that ever called it — so this is new surface rather
 * than a port.
 *
 *   GET  /quiz/session   build a session (query: mode, scope, answerFormat, limit, contactId)
 *   POST /quiz/answer    record one answered question and reschedule its card
 *   GET  /quiz/history/{contactId}  that contact's review history
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/quiz/, '') || '/').replace(/\/+$/, '') || '/';
  const userId = resolveUserId(event);
  const query = event.queryStringParameters ?? {};

  try {
    if (event.httpMethod === 'GET' && sub === '/session') {
      return json(
        200,
        await quizService.startSession(userId, {
          mode: query.mode,
          scope: query.scope,
          answerFormat: query.answerFormat,
          limit: query.limit,
          contactId: query.contactId,
        }),
      );
    }

    if (event.httpMethod === 'POST' && sub === '/answer') {
      const body = event.body ? JSON.parse(event.body) : {};
      return json(201, await quizService.recordAnswer(userId, body));
    }

    if (event.httpMethod === 'GET' && sub.startsWith('/history/')) {
      return json(200, await quizService.history(userId, sub.slice('/history/'.length)));
    }

    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};
