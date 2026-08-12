import { request } from '@playwright/test';
import { targetBaseUrl } from './target';

/**
 * globalSetup for playwright.prod.config.ts.
 *
 * The deployed frontend learns its own API endpoint by fetching
 * /amplify_outputs.json at runtime (frontend/src/app/services/api-config.service.ts,
 * served from frontend/public/ — see amplify.yml's preBuild). So that same file
 * is the authoritative answer to "which API is *this* deployment talking to",
 * and reading it from the target keeps the API Gateway id out of the repo,
 * where it would go stale the first time the stack is recreated.
 */
export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_API_URL) return;

  const base = targetBaseUrl();
  const context = await request.newContext();
  try {
    const response = await context.get(`${base}/amplify_outputs.json`);
    if (!response.ok()) {
      throw new Error(`GET ${base}/amplify_outputs.json returned ${response.status()} ${response.statusText()}`);
    }
    const outputs = (await response.json()) as { custom?: { API?: { facefileApi?: { endpoint?: string } } } };
    const endpoint = outputs.custom?.API?.facefileApi?.endpoint;
    if (!endpoint) {
      throw new Error(`${base}/amplify_outputs.json has no custom.API.facefileApi.endpoint.`);
    }
    process.env.E2E_API_URL = endpoint.replace(/\/+$/, '');
  } finally {
    await context.dispose();
  }
}
