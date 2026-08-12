import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequest, errorResponse, forbidden, json, noContent, notFound, preflight } from '../_shared/http';
import { usersRepo } from '../_shared/usersRepo';
import { userService } from '../_shared/userService';
import { clearSessionCookieHeader, requireSessionCookieUserId, setSessionCookieHeader } from '../_shared/session';

// Direct port of backend/src/routes/session.js — one Lambda per route file,
// dispatching on method + sub-path the way Express's router did.
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/session/, '') || '/').replace(/\/+$/, '') || '/';

  try {
    if (event.httpMethod === 'POST' && sub === '/') return await login(event);
    if (event.httpMethod === 'POST' && sub === '/profiles') return await createProfile(event);
    if (event.httpMethod === 'GET' && sub === '/me') return await me(event);
    if (event.httpMethod === 'DELETE' && sub === '/') return logout();
    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};

async function login(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = event.body ? JSON.parse(event.body) : {};
  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
  if (!userId) throw badRequest('userId is required');

  const user = await usersRepo.findById(userId);
  if (!user) throw notFound('User not found');
  if (!user.active) throw forbidden('This account has been deactivated');

  const cookie = setSessionCookieHeader(user.id, Boolean(body.rememberMe));
  return json(200, user, { cookies: [cookie] });
}

/**
 * Self-service profile creation from the picker (S-1.7.4). Creating and
 * signing in are one step deliberately: a visitor with no profile has no other
 * way into the app, so splitting them would only ever be followed by an
 * immediate POST /session for the profile just created.
 */
async function createProfile(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = event.body ? JSON.parse(event.body) : {};
  const user = await userService.createProfile({ name: body.name });

  const cookie = setSessionCookieHeader(user.id, Boolean(body.rememberMe));
  return json(201, user, { cookies: [cookie] });
}

async function me(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = requireSessionCookieUserId(event);
  if (userId === null) return json(401, { error: 'No active session' });

  const user = await usersRepo.findById(userId);
  if (!user || !user.active) return json(401, { error: 'No active session' });
  return json(200, user);
}

function logout(): APIGatewayProxyResult {
  return noContent({ cookies: [clearSessionCookieHeader()] });
}
