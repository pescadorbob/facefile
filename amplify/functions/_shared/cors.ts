// API Gateway's Lambda proxy integration does NOT apply the RestApi's
// defaultCorsPreflightOptions to actual (non-OPTIONS) responses — only to the
// preflight OPTIONS request API Gateway answers itself. Every handler response
// must attach these headers directly, and the origin must be a literal value
// (not "*") because the frontend sends credentialed (cookie) requests.
export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL ?? 'http://localhost:4200',
    'Access-Control-Allow-Credentials': 'true',
  };
}
