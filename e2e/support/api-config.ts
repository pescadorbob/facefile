import { readFileSync } from 'fs';
import { join } from 'path';

// Reads the deployed API Gateway endpoint out of amplify_outputs.json (repo
// root — see amplify/backend.ts's backend.addOutput). There's no local
// backend process to point at anymore (backend/ was retired when the
// Amplify/Lambda migration landed); e2e now always runs against a real
// deployed sandbox, same as the app itself does.
export function resolveApiUrl(): string {
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
