import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, json, preflight } from '../_shared/http';
import { userService } from '../_shared/userService';

// Direct port of backend/src/routes/adminUsers.js — mounted at /admin/users.
// Unlike the other five functions, this one has no per-user scoping (it
// manages the full user list), so it never touches the session cookie.
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/admin\/users/, '') || '/').replace(/\/+$/, '') || '/';
  const idMatch = sub.match(/^\/([^/]+)$/);
  const deactivateMatch = sub.match(/^\/([^/]+)\/deactivate$/);
  const reactivateMatch = sub.match(/^\/([^/]+)\/reactivate$/);

  try {
    if (event.httpMethod === 'GET' && sub === '/') {
      const users = await userService.listAll({ status: event.queryStringParameters?.status });
      return json(200, users);
    }
    if (event.httpMethod === 'POST' && sub === '/') {
      const body = event.body ? JSON.parse(event.body) : {};
      const user = await userService.create(body);
      return json(201, user);
    }
    if (event.httpMethod === 'PATCH' && idMatch) {
      const body = event.body ? JSON.parse(event.body) : {};
      const user = await userService.update(idMatch[1], body);
      return json(200, user);
    }
    if (event.httpMethod === 'POST' && deactivateMatch) {
      const user = await userService.deactivate(deactivateMatch[1]);
      return json(200, user);
    }
    if (event.httpMethod === 'POST' && reactivateMatch) {
      const user = await userService.reactivate(reactivateMatch[1]);
      return json(200, user);
    }
    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};
