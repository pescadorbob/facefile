import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, json, preflight } from '../_shared/http';
import { resolveUserId } from '../_shared/session';
import { userSettingsService } from '../_shared/userSettingsService';

/**
 * The user's own preferences (E-4.4, E-4.7):
 *
 *   GET /settings   read them (defaults for a user who has never saved any)
 *   PUT /settings   merge a partial update in
 *
 * PUT rather than PATCH because the resource is a single settings document and the
 * request describes its desired state; the merge semantics are documented on
 * userSettingsService.update, which is where they matter (S-4.7.3).
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/settings/, '') || '/').replace(/\/+$/, '') || '/';
  const userId = resolveUserId(event);

  try {
    if (event.httpMethod === 'GET' && sub === '/') {
      return json(200, await userSettingsService.get(userId));
    }
    if (event.httpMethod === 'PUT' && sub === '/') {
      const body = event.body ? JSON.parse(event.body) : {};
      return json(200, await userSettingsService.update(userId, body));
    }
    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};
