import { readFileSync } from 'fs';
import { join } from 'path';
import { isLocalTarget, targetBaseUrl } from './target';

// Reads the deployed API Gateway endpoint out of amplify_outputs.json (repo
// root — see amplify/backend.ts's backend.addOutput). There's no local
// backend process to point at anymore (backend/ was retired when the
// Amplify/Lambda migration landed); e2e now always runs against a real
// deployed sandbox, same as the app itself does.
export function resolveApiUrl(): string {
  // Set by playwright.prod.config.ts's globalSetup, which reads it off the
  // deployed frontend itself. Also honoured if you export it by hand.
  const override = process.env.E2E_API_URL;
  if (override) return override.replace(/\/+$/, '');

  // The local file describes *your sandbox*. Falling back to it while the
  // browser is driving a deployed app would quietly split the run across two
  // backends — the driver seeding one, the app reading the other — and the
  // resulting failures look like app bugs rather than misconfiguration.
  if (!isLocalTarget()) {
    throw new Error(
      `E2E_API_URL is unset but this run targets ${targetBaseUrl()}. Run against a deployed ` +
        `environment via playwright.prod.config.ts, whose globalSetup resolves the API endpoint ` +
        `from the target's own /amplify_outputs.json.`,
    );
  }

  const outputsPath = join(__dirname, '..', '..', 'amplify_outputs.json');
  let outputs: { custom?: { API?: { facefileApi?: { endpoint?: string } } } };
  try {
    outputs = JSON.parse(readFileSync(outputsPath, 'utf-8'));
  } catch (err) {
    throw new Error(
      `Could not read ${outputsPath}. Run \`ampx sandbox\` from amplify/ first (see CLAUDE.md's dev commands) — e2e tests run against a real deployed backend, there's no local Express server to fall back to anymore.`,
      { cause: err },
    );
  }
  const endpoint = outputs.custom?.API?.facefileApi?.endpoint;
  if (!endpoint) throw new Error(`amplify_outputs.json at ${outputsPath} has no custom.API.facefileApi.endpoint.`);
  return endpoint.replace(/\/+$/, '');
}
