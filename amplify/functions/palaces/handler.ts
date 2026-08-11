import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, json, preflight } from '../_shared/http';
import { palacesRepo } from '../_shared/palacesRepo';
import { resolveUserId } from '../_shared/session';

// Direct port of backend/src/routes/palaces.js (GET / only — the old
// palaceService.js was a one-line passthrough to the repository, so it's
// inlined here rather than carried over as its own layer).
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/palaces/, '') || '/').replace(/\/+$/, '') || '/';

  try {
    if (event.httpMethod === 'GET' && sub === '/') {
      const palaces = await palacesRepo.findAllByUser(resolveUserId(event));
      return json(200, palaces);
    }
    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};
