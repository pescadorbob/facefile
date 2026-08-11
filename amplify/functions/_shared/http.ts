import type { APIGatewayProxyResult } from 'aws-lambda';
import { corsHeaders } from './cors';

/** Mirrors the `Object.assign(new Error(...), { status })` pattern from the
 * old Express services (userService.js) so the route-level error handling
 * ports over unchanged: `catch (err) { return errorResponse(err) }`. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (message: string) => new ApiError(400, message);
export const unauthorized = (message: string) => new ApiError(401, message);
export const forbidden = (message: string) => new ApiError(403, message);
export const notFound = (message: string) => new ApiError(404, message);
export const conflict = (message: string) => new ApiError(409, message);

export function json(
  statusCode: number,
  body?: unknown,
  opts: { headers?: Record<string, string>; cookies?: string[] } = {},
): APIGatewayProxyResult {
  const result: APIGatewayProxyResult = {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(), ...opts.headers },
    body: body === undefined ? '' : JSON.stringify(body),
  };
  if (opts.cookies?.length) {
    (result as APIGatewayProxyResult & { multiValueHeaders: Record<string, string[]> }).multiValueHeaders = {
      'Set-Cookie': opts.cookies,
    };
  }
  return result;
}

export function noContent(opts: { cookies?: string[] } = {}): APIGatewayProxyResult {
  return json(204, undefined, opts);
}

export function errorResponse(err: unknown): APIGatewayProxyResult {
  if (err instanceof ApiError) return json(err.status, { error: err.message });
  console.error(err);
  return json(500, { error: err instanceof Error ? err.message : 'Internal server error' });
}

export function preflight(): APIGatewayProxyResult {
  return { statusCode: 204, headers: corsHeaders(), body: '' };
}
