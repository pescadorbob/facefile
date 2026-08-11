import { createHmac, timingSafeEqual } from 'crypto';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export const SESSION_COOKIE_NAME = 'facefile_user_id';

// Prisma's DEFAULT_USER_ID = 1 (an autoincrement int) has no DynamoDB
// equivalent now that ids are UUIDs (see _shared/ids.ts) — the seeded
// default user's fixed id is read from an env var instead so it can be set
// once seed data exists, rather than hardcoding a value that can't be right.
function defaultUserId(): string {
  const value = process.env.DEFAULT_USER_ID;
  if (!value) throw new Error('Missing required environment variable: DEFAULT_USER_ID');
  return value;
}

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

function secret(): string {
  const value = process.env.SESSION_COOKIE_SECRET;
  if (!value) throw new Error('Missing required environment variable: SESSION_COOKIE_SECRET');
  return value;
}

function sign(value: string): string {
  return `${value}.${createHmac('sha256', secret()).update(value).digest('base64url')}`;
}

function verify(signed: string): string | null {
  const dot = signed.lastIndexOf('.');
  if (dot === -1) return null;
  const value = signed.slice(0, dot);
  const expected = Buffer.from(createHmac('sha256', secret()).update(value).digest('base64url'));
  const actual = Buffer.from(signed.slice(dot + 1));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return value;
}

function parseCookies(event: APIGatewayProxyEvent): Record<string, string> {
  const header = event.headers?.Cookie ?? event.headers?.cookie ?? '';
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key) out[key] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

function sessionCookieUserId(event: APIGatewayProxyEvent): string | null {
  const raw = parseCookies(event)[SESSION_COOKIE_NAME];
  if (!raw) return null;
  return verify(raw);
}

/**
 * Port of middleware/session.js's sessionMiddleware: resolves the caller's
 * userId from the signed session cookie, falling back to a `userId` query
 * param for backward compatibility, and finally to the seeded default user —
 * matching every route's `req.userId ?? DEFAULT_USER_ID` from the old app.
 */
export function resolveUserId(event: APIGatewayProxyEvent): string {
  const fromCookie = sessionCookieUserId(event);
  if (fromCookie !== null) return fromCookie;
  const fromQuery = event.queryStringParameters?.userId;
  if (fromQuery) return fromQuery;
  return defaultUserId();
}

/**
 * Strict cookie-only read used by GET /session/me and nowhere else — mirrors
 * session.js reading `req.signedCookies` directly instead of the middleware's
 * query-param fallback, so an unauthenticated visitor gets 401 rather than
 * silently resolving to the default user.
 */
export function requireSessionCookieUserId(event: APIGatewayProxyEvent): string | null {
  return sessionCookieUserId(event);
}

// Frontend (Amplify Hosting) and API (API Gateway) are different registrable
// domains, so the cookie must be SameSite=None; Secure to be sent at all —
// SameSite=Lax (the old same-origin-dev-proxy setting) is silently dropped
// on cross-site fetch/XHR requests, only Lax's own-navigation carve-out.
function serializeCookie(value: string, maxAgeSeconds?: number): string {
  const parts = [`${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'Secure', 'SameSite=None'];
  if (maxAgeSeconds !== undefined) parts.push(`Max-Age=${maxAgeSeconds}`);
  return parts.join('; ');
}

export function setSessionCookieHeader(userId: string, rememberMe: boolean): string {
  return serializeCookie(sign(userId), rememberMe ? THIRTY_DAYS_SECONDS : undefined);
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`;
}
