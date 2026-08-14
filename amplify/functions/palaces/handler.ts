import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, json, noContent, preflight } from '../_shared/http';
import { palaceService } from '../_shared/palaceService';
import { resolveUserId } from '../_shared/session';

// Ported from backend/src/routes/palaces.js (GET / only at the time). Creating and
// removing a palace arrived with S-3.3.1, which is also what earned palaces a service
// layer — the rules (name length, per-user uniqueness, locus ordering) live in
// _shared/palaceService.ts, not here.
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/palaces/, '') || '/').replace(/\/+$/, '') || '/';
  const userId = resolveUserId(event);

  try {
    if (event.httpMethod === 'GET' && sub === '/') {
      return json(200, await palaceService.listForUser(userId));
    }
    if (event.httpMethod === 'POST' && sub === '/') {
      const body = event.body ? JSON.parse(event.body) : {};
      return json(201, await palaceService.create(userId, { name: body.name, loci: body.loci }));
    }
    if (event.httpMethod === 'DELETE' && sub !== '/') {
      await palaceService.delete(userId, sub.slice(1));
      return noContent();
    }
    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};
