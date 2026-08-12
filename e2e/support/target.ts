/**
 * Single source of truth for *which deployment* a run is pointed at.
 *
 * Both Playwright configs derive `baseURL` from here, and the fixtures and
 * driver use it to decide whether destructive cleanup may run at all. The
 * backend is still single-user mode (see CLAUDE.md) — every deployment has one
 * shared seeded user, so the table-wiping teardown that is routine against a
 * personal sandbox would delete somebody's real data against a deployed
 * environment.
 */

const DEFAULT_BASE_URL = 'http://localhost:4200';

// `new URL(...).hostname` keeps the brackets on an IPv6 literal.
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

export function targetBaseUrl(): string {
  return (process.env.E2E_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
}

export function isLocalTarget(): boolean {
  return LOCAL_HOSTNAMES.has(new URL(targetBaseUrl()).hostname);
}

/**
 * Hard stop for driver methods that delete data belonging to the shared user
 * rather than data the current test created. Loud on purpose: silently skipping
 * these would leave a spec asserting against whatever the last run left behind.
 */
export function assertLocalTarget(operation: string): void {
  if (isLocalTarget()) return;
  throw new Error(
    `Refusing to run "${operation}" against ${targetBaseUrl()}. It clears data for the shared ` +
      `default user, which off localhost is real data this run did not create. Only the ` +
      `read-only specs under specs/smoke/ are meant to run against a deployed environment.`,
  );
}
