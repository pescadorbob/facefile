import { confirmThat, test } from '../../fixtures/facefile';

/**
 * Read-only smoke test for a deployed environment — run it with
 * playwright.prod.config.ts (`npm run test:e2e:prod` from e2e/).
 *
 * The profile picker is the app's front door: it is the one route reachable
 * without a session, and rendering it requires a credentialed cross-origin call
 * from Amplify Hosting to API Gateway. That call is the part most likely to
 * break on a deploy while the bundle itself serves perfectly well, so a green
 * page load alone proves very little.
 *
 * Creates no data and deletes none, so it is safe against an environment with
 * real users in it — which every deployed environment is, given the backend is
 * still single-user mode (see CLAUDE.md). Keep it that way: anything under
 * specs/smoke/ must stay read-only.
 */
test.describe('Deployment smoke — the profile picker', () => {
  test('serves the picker and loads its profiles from the live backend', async ({ facefile }) => {
    // GIVEN a visitor with no session
    // WHEN they open the app's front door
    await facefile.opensSelectProfile();

    // THEN the picker is served
    await confirmThat(facefile).seesProfilePicker();

    // AND it has real profile data behind it, not a load error
    await confirmThat(facefile).seesProfileListLoaded();

    // AND nothing it asked the backend for was blocked in transit
    await confirmThat(facefile).seesNoFailedBackendCalls();
  });
});
