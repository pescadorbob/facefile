import { APIRequestContext, Locator, Page, expect } from '@playwright/test';
import { resolveApiUrl } from '../support/api-config';
import { assertLocalTarget } from '../support/target';

const BACKEND_URL = resolveApiUrl();

// Mirrors amplify/backend.ts's DEFAULT_USER_ID (the seeded stub user — see
// amplify/seed.ts). Ids are UUID strings now, not Prisma's autoincrement 1.
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export class FacefileBrowserDriver {
  private readonly createdUserEmails = new Set<string>();
  private readonly createdUserNames = new Set<string>();
  private readonly createdPalaceNames = new Set<string>();
  private sessionEstablished = false;
  private readonly failedXhr: string[] = [];

  constructor(
    private readonly page: Page,
    private readonly request: APIRequestContext,
  ) {
    // Recorded from construction because the interesting failures happen during
    // the very first navigation, before any spec could ask for them. Limited to
    // xhr/fetch so a blocked font or a missing favicon can't fail a run — the
    // app's own calls to the API are the contract under test.
    page.on('requestfailed', req => {
      const type = req.resourceType();
      if (type !== 'xhr' && type !== 'fetch') return;
      this.failedXhr.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText ?? 'failed'}`);
    });
  }

  /**
   * Every protected route now requires a session. Existing specs never establish one
   * explicitly (that predates this feature), so each of their navigation methods
   * establishes a default session as a side effect — via page.request, which (unlike
   * the standalone `request` fixture) shares the page's cookie jar.
   *
   * Calls BACKEND_URL directly (the real API Gateway origin) rather than going through
   * a dev-server proxy — there is no proxy anymore now that frontend and API are
   * genuinely different origins (Amplify Hosting vs. API Gateway). The session cookie
   * is SameSite=None; Secure (see functions/_shared/session.ts) specifically so this
   * cross-origin flow works; page.request shares the page's real network/cookie stack,
   * so it behaves exactly like the app's own credentialed fetch calls would.
   *
   * Checks the real cookie jar rather than only a "have I called this before" flag: specs
   * that establish a specific profile's session through the real picker flow (not through
   * this method) must be able to revisit a protected page afterwards without this silently
   * re-logging-in as the default user and clobbering that profile's session.
   */
  private async ensureAuthenticatedSession(): Promise<void> {
    if (this.sessionEstablished) return;
    const cookies = await this.page.context().cookies();
    if (cookies.some(c => c.name === 'facefile_user_id')) {
      this.sessionEstablished = true;
      return;
    }
    await this.page.request.post(`${BACKEND_URL}/session`, { data: { userId: DEFAULT_USER_ID } });
    this.sessionEstablished = true;
  }

  async navigateToTutorial(): Promise<void> {
    await this.ensureAuthenticatedSession();
    await this.page.goto('/tutorial');
  }

  async reloadPage(): Promise<void> {
    await this.page.reload();
  }

  /**
   * page.request, so this follows whichever profile the session cookie currently holds — a
   * spec that signed in as its own test user must reset/clean that user's data, not the
   * seeded profile's. With no cookie set it resolves to the seeded profile exactly as before.
   */
  async resetTutorialProgress(): Promise<void> {
    assertLocalTarget('resetTutorialProgress');
    await this.page.request.put(`${BACKEND_URL}/tutorial/progress`, {
      data: { currentStep: 1, completed: false },
    });
  }

  async clickAdvanceButton(): Promise<void> {
    await this.page.getByTestId('advance-btn').click();
  }

  async clickAdvanceButtonNTimes(n: number): Promise<void> {
    for (let i = 0; i < n; i++) {
      await this.clickAdvanceButton();
    }
  }

  async expectStepCounterText(text: string): Promise<void> {
    await expect(this.page.getByText(text, { exact: true })).toBeVisible();
  }

  async expectAdvanceButtonVisible(): Promise<void> {
    await expect(this.page.getByTestId('advance-btn')).toBeVisible();
  }

  async expectCompletionVisible(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'The Foundation Is Laid' }),
    ).toBeVisible();
  }

  async expectNoCompletionVisible(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'The Foundation Is Laid' }),
    ).not.toBeVisible();
  }

  async expectVisualExampleVisible(): Promise<void> {
    await expect(this.page.getByText(/Fig\. I/i)).toBeVisible();
  }

  // ── Guided wizard ──────────────────────────────────────────────────────────

  async navigateToAddPerson(): Promise<void> {
    await this.ensureAuthenticatedSession();
    await this.page.goto('/persons/new');
  }

  async fillWizardNameField(name: string): Promise<void> {
    await this.page.getByPlaceholder(/Margaret Holloway/i).fill(name);
  }

  async clickWizardContinueButton(): Promise<void> {
    await this.page.getByTestId('wizard-continue-btn').click();
  }

  async clickWizardBackButton(): Promise<void> {
    await this.page.getByTestId('wizard-back-btn').click();
  }

  async clickFirstSeedPalace(): Promise<void> {
    await this.page.getByRole('button', { name: /Childhood Home/i }).click();
  }

  async clickFirstSeedLocus(): Promise<void> {
    await this.page.getByRole('button', { name: /Front doorstep/i }).click();
  }

  async fillWizardNameImageField(text: string): Promise<void> {
    await this.page.getByPlaceholder(/concrete image/i).fill(text);
  }

  async fillWizardAssociationSceneField(text: string): Promise<void> {
    await this.page.getByPlaceholder(/juggling glowing marquee/i).fill(text);
  }

  /** page.request for the same reason as resetTutorialProgress — clean the active profile. */
  async deleteAllContacts(): Promise<void> {
    assertLocalTarget('deleteAllContacts');
    await this.page.request.delete(`${BACKEND_URL}/contacts`);
  }

  async expectWizardStepCounter(step: number): Promise<void> {
    const padded = String(step).padStart(2, '0');
    await expect(this.page.getByText(`${padded} / 05`, { exact: true })).toBeVisible();
  }

  async expectNameRequiredErrorVisible(): Promise<void> {
    await expect(this.page.getByText('A name is required to continue.')).toBeVisible();
  }

  async expectProminentNameContains(name: string): Promise<void> {
    await expect(this.page.getByTestId('prominent-name')).toContainText(name);
  }

  async expectTechniqueHintsVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: /Sound-alike/i })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Meaning/i })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Personal association/i })).toBeVisible();
  }

  async expectOnQuizPage(): Promise<void> {
    await this.page.waitForURL(/\/quiz/);
  }

  async expectPalaceButtonVisible(name: string): Promise<void> {
    await expect(this.page.getByRole('button', { name: new RegExp(name, 'i') })).toBeVisible();
  }

  async expectWizardNameImageFieldContains(text: string): Promise<void> {
    await expect(this.page.getByPlaceholder(/concrete image/i)).toHaveValue(text);
  }

  // ── Admin: user management ──────────────────────────────────────────────────

  async navigateToAdminUsers(): Promise<void> {
    await this.ensureAuthenticatedSession();
    await this.page.goto('/admin/users');
  }

  async clickAddUserButton(): Promise<void> {
    await this.page.getByRole('button', { name: /Add user/i }).click();
  }

  async fillUserForm(name: string, email: string): Promise<void> {
    await this.fillUserFormName(name);
    await this.fillUserFormEmail(email);
  }

  async fillUserFormName(name: string): Promise<void> {
    await this.page.getByPlaceholder('e.g. Jordan Lee').fill(name);
  }

  async fillUserFormEmail(email: string): Promise<void> {
    await this.page.getByPlaceholder('e.g. jordan.lee@example.com').fill(email);
  }

  /**
   * Clicks save and waits for it to settle: the form closes on success, or an inline error
   * renders when the save is rejected. Returning while the request is still in flight lets
   * the next action open a form that the arriving response then closes out from under it —
   * which surfaces as a detached-element failure several steps later.
   */
  async clickSaveUserForm(): Promise<void> {
    await this.page.getByRole('button', { name: /Create user|Save changes/ }).click();
    // Keyed on the form's own field, not the save button: the button relabels to "Saving…"
    // for the duration of the request, so waiting on it would return while still in flight.
    const formField = this.page.getByPlaceholder('e.g. Jordan Lee');
    await expect
      .poll(async () => (await formField.count()) === 0 || (await this.page.getByTestId('user-form-error').count()) > 0)
      .toBe(true);
  }

  async clickEditOnUserRow(name: string): Promise<void> {
    await this.page.getByRole('row', { name }).getByRole('button', { name: 'Edit' }).click();
  }

  /**
   * Both of these wait for the row's action to flip before returning — the row offers only
   * whichever action currently applies, so the opposite button appearing is the signal that
   * the request landed. Without it a following step (navigating to the picker, say) can run
   * against the pre-change state.
   */
  async clickDeactivateOnUserRow(name: string): Promise<void> {
    const row = this.page.getByRole('row', { name });
    await row.getByRole('button', { name: 'Deactivate' }).click();
    await expect(row.getByRole('button', { name: 'Reactivate' })).toBeVisible();
  }

  async clickReactivateOnUserRow(name: string): Promise<void> {
    const row = this.page.getByRole('row', { name });
    await row.getByRole('button', { name: 'Reactivate' }).click();
    await expect(row.getByRole('button', { name: 'Deactivate' })).toBeVisible();
  }

  async expectUserRowVisible(name: string): Promise<void> {
    await expect(this.page.getByRole('row', { name })).toBeVisible();
  }

  async expectUserRowNotVisible(name: string): Promise<void> {
    await expect(this.page.getByRole('row', { name })).toHaveCount(0);
  }

  async expectUserRowContainsEmail(name: string, email: string): Promise<void> {
    await expect(this.page.getByRole('row', { name })).toContainText(email);
  }

  async expectUserRowStatus(name: string, status: string): Promise<void> {
    const label = status.trim().toLowerCase() === 'active' ? 'Active' : 'Deactivated';
    await expect(this.page.getByRole('row', { name })).toContainText(label);
  }

  async expectEmptyUsersListMessage(): Promise<void> {
    await expect(this.page.getByText('No user accounts yet.')).toBeVisible();
  }

  async expectUserFormError(text: string): Promise<void> {
    await expect(this.page.getByText(text, { exact: true })).toBeVisible();
  }

  async expectUserFormErrorContains(text: string): Promise<void> {
    await expect(this.page.getByText(new RegExp(text, 'i'))).toBeVisible();
  }

  /** Records an email created/renamed-to during this test so it can be deactivated in teardown. */
  trackCreatedUserEmail(email: string): void {
    if (email) this.createdUserEmails.add(email);
  }

  /** Deactivates (never deletes) every user this test created. Never touches "Brent Fisher". */
  async deactivateTrackedUsers(): Promise<void> {
    for (const email of this.createdUserEmails) {
      await this.deactivateUserByEmail(email);
    }
    this.createdUserEmails.clear();
  }

  async deactivateUserByEmail(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    if (!user || user.name === 'Brent Fisher') return;
    await this.request.post(`${BACKEND_URL}/admin/users/${user.id}/deactivate`);
  }

  /** Records a name-only profile (created through the picker, so it has no email to track by). */
  trackCreatedUserName(name: string): void {
    if (name) this.createdUserNames.add(name);
  }

  /** Deactivates (never deletes) every name-only profile this test created. Never touches "Brent Fisher". */
  async deactivateTrackedProfiles(): Promise<void> {
    for (const name of this.createdUserNames) {
      const user = await this.findUserByName(name);
      if (!user || user.name === 'Brent Fisher') continue;
      await this.request.post(`${BACKEND_URL}/admin/users/${user.id}/deactivate`);
    }
    this.createdUserNames.clear();
  }

  private async findUserByName(name: string): Promise<{ id: string; name: string } | undefined> {
    const res = await this.request.get(`${BACKEND_URL}/admin/users`);
    const users = await res.json();
    return users.find((u: { id: string; name: string }) => u.name === name);
  }

  /**
   * Repeats the deactivate/reactivate action directly against the backend, bypassing the
   * UI. The row only ever exposes whichever single action currently applies (Deactivate OR
   * Reactivate), so a redundant second call — a legitimate case: retry, double-click race,
   * a second admin tab — can't be driven through the button. This exercises the same
   * idempotency guarantee the UI action would hit.
   */
  async reactivateUserByEmail(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    if (!user) return;
    await this.request.post(`${BACKEND_URL}/admin/users/${user.id}/reactivate`);
  }

  private async findUserByEmail(email: string): Promise<{ id: string; name: string; email: string } | undefined> {
    const res = await this.request.get(`${BACKEND_URL}/admin/users`);
    const users = await res.json();
    return users.find((u: { id: string; name: string; email: string }) => u.email === email);
  }

  // ── Session & profile selection ─────────────────────────────────────────────

  /** Deliberately does NOT establish a session first — this route doesn't require one. */
  async navigateToSelectProfile(): Promise<void> {
    await this.page.goto('/select-profile');
  }

  /** Deliberately does NOT establish a session first — used to exercise the guard's redirect. */
  async navigateToProtectedPageWithoutSession(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async createActiveUserViaApi(name: string, email: string): Promise<void> {
    await this.createUserOrThrow(name, email);
  }

  /**
   * A failed create used to be swallowed: `.json()` on the error body yields `{error}`,
   * whose `id` is undefined, and the caller carried on to log in as nobody. The session
   * then never existed and the route guard bounced the test to the profile picker — which
   * surfaced 30 seconds later as a timeout on whatever locator came next, nowhere near
   * the cause. Fail here instead, where the reason is still in hand.
   */
  private async createUserOrThrow(name: string, email: string): Promise<{ id: string }> {
    const res = await this.request.post(`${BACKEND_URL}/admin/users`, { data: { name, email } });
    const body = await res.json();
    if (!res.ok() || !body?.id) {
      throw new Error(`Could not create the test account <${email}>: ${res.status()} ${JSON.stringify(body)}`);
    }
    return body;
  }

  /**
   * Creates an active account through the admin API and establishes the browser session as
   * it. Uses page.request for the login (not the standalone `request` fixture) so the cookie
   * lands in the page's own jar — see ensureAuthenticatedSession, which this then satisfies,
   * so later navigations don't fall back to the seeded profile and clobber this session.
   */
  async signInAsNewUserViaApi(name: string, email: string): Promise<void> {
    const user = await this.createUserOrThrow(name, email);
    await this.page.request.post(`${BACKEND_URL}/session`, { data: { userId: user.id } });
    this.sessionEstablished = true;
  }

  async clickProfileTile(name: string): Promise<void> {
    await this.page.getByRole('button', { name }).click();
  }

  async checkRememberMeOnPicker(): Promise<void> {
    await this.page.getByLabel(/Remember me/i).check();
  }

  async clickCreateProfileAction(): Promise<void> {
    await this.page.getByRole('button', { name: /Create a profile/i }).click();
  }

  async fillProfileNameField(name: string): Promise<void> {
    await this.page.getByLabel('Name', { exact: true }).fill(name);
  }

  async clickCreateProfileSubmit(): Promise<void> {
    // Exact accessible name — the picker's "+ Create a profile" opener must not match.
    await this.page.getByRole('button', { name: 'Create profile' }).click();
  }

  async clickCancelOnProfileForm(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  async expectCreateProfileActionVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: /Create a profile/i })).toBeVisible();
  }

  async expectProfileNameFieldNotVisible(): Promise<void> {
    await expect(this.page.getByLabel('Name', { exact: true })).toHaveCount(0);
  }

  async expectProfileFormError(text: string): Promise<void> {
    await expect(this.page.getByText(text, { exact: true })).toBeVisible();
  }

  async expectProfileFormErrorContains(text: string): Promise<void> {
    await expect(this.page.getByText(new RegExp(text, 'i'))).toBeVisible();
  }

  async clickSwitchProfile(): Promise<void> {
    await this.page.getByRole('button', { name: 'Switch profile' }).click();
  }

  /** Sets a bogus value under the session cookie's name — not a validly-signed cookie. */
  async setTamperedSessionCookie(): Promise<void> {
    await this.page.context().addCookies([
      { name: 'facefile_user_id', value: 'garbage-tampered-value', url: 'http://localhost:4200' },
    ]);
  }

  async expectOnSelectProfilePage(): Promise<void> {
    await this.page.waitForURL(/\/select-profile/);
  }

  /**
   * Waits for the picker to reach a settled state and requires that state not
   * be the failure one. The page renders exactly one of three outcomes once its
   * profile request resolves — the "who's using" heading (profiles came back),
   * the empty-state prompt (none came back), or the load error — so waiting on
   * all three and then rejecting the error reports a real failure immediately
   * instead of burning the full timeout on an element that will never appear.
   */
  async expectProfileListSettled(): Promise<void> {
    const withProfiles = this.page.getByRole('heading', { name: /who.s using facefile\?/i });
    const empty = this.page.getByText('No profiles yet.');
    const failed = this.page.getByText('Unable to load profiles');

    await expect(withProfiles.or(empty).or(failed)).toBeVisible();
    await expect(failed).toHaveCount(0);
  }

  async expectNoFailedXhrRequests(): Promise<void> {
    expect(this.failedXhr, `the page's own xhr/fetch calls failed:\n  ${this.failedXhr.join('\n  ')}`).toEqual([]);
  }

  /** "Home" is the real dashboard now — this used to be a /tutorial stand-in before E-2.4 existed. */
  async expectLandedOnHomePage(): Promise<void> {
    await this.page.waitForURL(/\/dashboard/);
  }

  async expectProfileTileVisible(name: string): Promise<void> {
    await expect(this.page.getByRole('button', { name })).toBeVisible();
  }

  async expectProfileTileNotVisible(name: string): Promise<void> {
    await expect(this.page.getByRole('button', { name })).toHaveCount(0);
  }

  async expectRememberMeOptionVisible(): Promise<void> {
    await expect(this.page.getByLabel(/Remember me/i)).toBeVisible();
  }

  /**
   * Rather than literally closing/reopening a browser context (fragile, and Playwright
   * has no clean mid-test way to swap the page under a running test), these two check the
   * cookie attribute that is the entire mechanism by which a real restart would or
   * wouldn't preserve the session: a Max-Age in the future vs. a browser-session-scoped
   * cookie (expires: -1 is Playwright's representation of "no Max-Age/Expires set").
   */
  async expectSessionCookiePersistent(): Promise<void> {
    const cookies = await this.page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'facefile_user_id');
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie!.expires).toBeGreaterThan(0);
  }

  async expectSessionCookieIsBrowserScoped(): Promise<void> {
    const cookies = await this.page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'facefile_user_id');
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie!.expires).toBe(-1);
  }

  // ── Memory palaces ───────────────────────────────────────────────────────────

  async navigateToPalaces(): Promise<void> {
    await this.ensureAuthenticatedSession();
    await this.page.goto('/palaces');
  }

  /** page.request so the palace is scoped to whichever profile the session cookie holds. */
  async createPalaceViaApi(name: string): Promise<void> {
    await this.page.request.post(`${BACKEND_URL}/palaces`, { data: { name } });
  }

  async clickNewPalaceAction(): Promise<void> {
    await this.page.getByRole('button', { name: /New palace/i }).click();
  }

  async fillPalaceNameField(name: string): Promise<void> {
    await this.page.getByLabel('Name', { exact: true }).fill(name);
  }

  /**
   * Adds one more locus row to the open form and names it. Addressed by the row's own
   * 1-based label rather than "the last field on screen": `.last()` resolves against
   * whatever is in the DOM at that moment, which can still be the previous row if the
   * click hasn't rendered yet — the fill then lands on the wrong row and silently
   * overwrites it. Naming the row makes fill() wait for the right one to exist.
   */
  async addLocusToPalaceForm(position: number, name: string): Promise<void> {
    await this.page.getByRole('button', { name: /Add locus/i }).click();
    await this.page.getByLabel(`Locus ${position}`, { exact: true }).fill(name);
  }

  /**
   * Clicks create and waits for it to settle: the form closes on success, or an inline
   * error renders when it is rejected. Returning while the request is still in flight
   * lets the next step navigate away and abort it — which surfaces much later as a
   * palace that was never actually saved. Same guard, and same reason, as
   * clickSaveUserForm. Keyed on the form's own field rather than the button, which
   * relabels to "Creating…" while the request runs.
   */
  async clickCreatePalaceSubmit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Create palace' }).click();
    const nameField = this.page.getByLabel('Name', { exact: true });
    await expect
      .poll(async () => (await nameField.count()) === 0 || (await this.page.getByTestId('palace-form-error').count()) > 0)
      .toBe(true);
  }

  async clickCancelOnPalaceForm(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  /** Rows carry no accessible role of their own, so they are keyed by test id and filtered by name. */
  private palaceRow(name: string) {
    return this.page.getByTestId('palace-row').filter({ hasText: name });
  }

  async expectNewPalaceActionVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: /New palace/i })).toBeVisible();
  }

  async expectPalaceRowVisible(name: string): Promise<void> {
    await expect(this.palaceRow(name)).toBeVisible();
  }

  async expectPalaceRowNotVisible(name: string): Promise<void> {
    await expect(this.palaceRow(name)).toHaveCount(0);
  }

  async expectPalaceRowLociCount(name: string, count: number): Promise<void> {
    await expect(this.palaceRow(name)).toContainText(`${count} loci`);
  }

  /** Array form of toHaveText asserts the count and the order in one go. */
  async expectPalaceRowLociInOrder(name: string, loci: string[]): Promise<void> {
    await expect(this.palaceRow(name).getByTestId('locus-name')).toHaveText(loci);
  }

  async expectPalaceNameFieldVisible(): Promise<void> {
    await expect(this.page.getByLabel('Name', { exact: true })).toBeVisible();
  }

  async expectPalaceNameFieldNotVisible(): Promise<void> {
    await expect(this.page.getByLabel('Name', { exact: true })).toHaveCount(0);
  }

  async expectPalaceFormErrorContains(text: string): Promise<void> {
    await expect(this.page.getByText(new RegExp(text, 'i'))).toBeVisible();
  }

  /** Banner shown only when the palace page was reached via a returnTo redirect (S-2.5.1 scenario 6). */
  async expectPalaceGuidanceBannerVisible(): Promise<void> {
    await expect(this.page.getByTestId('palace-guidance-banner')).toBeVisible();
  }

  /** Records a palace created during this test so it can be removed in teardown. */
  trackCreatedPalaceName(name: string): void {
    if (name) this.createdPalaceNames.add(name);
  }

  /**
   * Removes every palace this test created, looked up by name on the active profile.
   * Only ever touches this run's own rows, so unlike deleteAllContacts it needs no
   * local-target guard of its own — the fixture already skips teardown off localhost.
   */
  async deleteTrackedPalaces(): Promise<void> {
    for (const name of this.createdPalaceNames) {
      const palace = await this.findPalaceByName(name);
      if (!palace) continue;
      await this.page.request.delete(`${BACKEND_URL}/palaces/${palace.id}`);
    }
    this.createdPalaceNames.clear();
  }

  private async findPalaceByName(name: string): Promise<{ id: string; name: string } | undefined> {
    const res = await this.page.request.get(`${BACKEND_URL}/palaces`);
    if (!res.ok()) return undefined;
    const palaces = await res.json();
    return palaces.find((p: { id: string; name: string }) => p.name === name);
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────

  async navigateToDashboard(): Promise<void> {
    await this.ensureAuthenticatedSession();
    await this.page.goto('/dashboard');
  }

  async expectPeopleAddedCount(n: number): Promise<void> {
    await expect(this.page.getByTestId('people-added-tile')).toContainText(String(n));
  }

  async expectCardsDueCount(n: number): Promise<void> {
    await expect(this.page.getByTestId('due-review-tile')).toContainText(String(n));
  }

  /**
   * Waits out the dashboard's refresh interval rather than only checking what is on
   * screen right now. Generous on purpose: the page polls every 15 seconds, so the
   * default expect timeout would expire before the first refresh could land.
   */
  async expectCardsDueCountEventually(n: number): Promise<void> {
    await expect(this.page.getByTestId('due-review-tile')).toContainText(String(n), { timeout: 25_000 });
  }

  async expectDueTileHighlighted(): Promise<void> {
    await expect(this.page.getByTestId('due-review-tile')).toHaveAttribute('data-highlighted', 'true');
  }

  async expectDueTileNotHighlighted(): Promise<void> {
    await expect(this.page.getByTestId('due-review-tile')).toHaveAttribute('data-highlighted', 'false');
  }

  async expectQuizPromptBannerVisible(): Promise<void> {
    await expect(this.page.getByTestId('quiz-prompt-banner')).toBeVisible();
  }

  async expectQuizPromptBannerNotVisible(): Promise<void> {
    await expect(this.page.getByTestId('quiz-prompt-banner')).toHaveCount(0);
  }

  async clickStartQuizBanner(): Promise<void> {
    await this.page.getByTestId('quiz-prompt-banner').click();
  }

  async expectStandingBannersVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Teach mode' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Tutorial' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Memory palaces' })).toBeVisible();
  }

  async clickTeachModeBanner(): Promise<void> {
    await this.page.getByRole('button', { name: 'Teach mode' }).click();
  }

  async clickTutorialBanner(): Promise<void> {
    await this.page.getByRole('button', { name: 'Tutorial' }).click();
  }

  async clickPalacesBanner(): Promise<void> {
    await this.page.getByRole('button', { name: 'Memory palaces' }).click();
  }

  async expectOnTeachPage(): Promise<void> {
    await this.page.waitForURL(/\/teach/);
  }

  async expectOnTutorialPage(): Promise<void> {
    await this.page.waitForURL(/\/tutorial/);
  }

  async expectOnPalacesPage(): Promise<void> {
    await this.page.waitForURL(/\/palaces/);
  }

  async expectOnAddPersonPage(): Promise<void> {
    await this.page.waitForURL(/\/persons\/new/);
  }

  async expectOnAdminUsersPage(): Promise<void> {
    await this.page.waitForURL(/\/admin\/users/);
  }

  async expectOnMeetingsPage(): Promise<void> {
    await this.page.waitForURL(/\/meetings/);
  }

  async expectContactVisibleInInventory(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true })).toBeVisible();
  }

  async expectContactNotVisibleInInventory(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);
  }

  async expectAddPersonShortcutVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Add person' })).toBeVisible();
  }

  async clickAddPersonShortcut(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add person' }).click();
  }

  async expectEmptyInventoryMessage(): Promise<void> {
    await expect(this.page.getByText('No one stored here yet.')).toBeVisible();
  }

  async clickAddFirstPersonLink(): Promise<void> {
    await this.page.getByRole('button', { name: /Add the first person/i }).click();
  }

  async expectAdminLinkVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Admin' })).toBeVisible();
  }

  async clickAdminLink(): Promise<void> {
    await this.page.getByRole('button', { name: 'Admin' }).click();
  }

  async expectMeetingsLinkVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Meetings' })).toBeVisible();
  }

  async clickMeetingsLink(): Promise<void> {
    await this.page.getByRole('button', { name: 'Meetings' }).click();
  }

  async clickUpcomingLink(): Promise<void> {
    await this.page.getByTestId('upcoming-link').click();
  }

  async clickRemindersLink(): Promise<void> {
    await this.page.getByTestId('reminders-link').click();
  }

  async clickDueReviewTile(): Promise<void> {
    await this.page.getByTestId('due-review-tile').click();
  }

  async expectCaughtUpMessageVisible(): Promise<void> {
    await expect(this.page.getByTestId('caught-up-message')).toBeVisible();
  }

  async expectCaughtUpMessageNotVisible(): Promise<void> {
    await expect(this.page.getByTestId('caught-up-message')).toHaveCount(0);
  }

  async expectNextDueDateVisible(): Promise<void> {
    await expect(this.page.getByTestId('next-due-date')).toBeVisible();
  }

  // ── Quiz sessions ────────────────────────────────────────────────────────────

  async navigateToQuiz(): Promise<void> {
    await this.ensureAuthenticatedSession();
    await this.page.goto('/quiz');
  }

  /** The post-add entry point: one question about the contact just saved. */
  async navigateToQuizForContact(contactId: string): Promise<void> {
    await this.ensureAuthenticatedSession();
    await this.page.goto(`/quiz?contactId=${encodeURIComponent(contactId)}`);
  }

  /**
   * A 1×1 PNG. Name → Face questions need a photo to point at and photos to use as
   * decoys, so any spec exercising that direction has to create contacts that have
   * one — the image's content is irrelevant, only its presence.
   */
  private static readonly PIXEL_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );

  /** page.request, so the contact lands on whichever profile the session cookie holds. */
  async createContactViaApi(
    name: string,
    options: { withPhoto?: boolean; nameImage?: string; associationScene?: string } = {},
  ): Promise<string> {
    const multipart: Record<string, string | { name: string; mimeType: string; buffer: Buffer }> = { name };
    if (options.nameImage) multipart.nameImage = options.nameImage;
    if (options.associationScene) multipart.associationScene = options.associationScene;
    if (options.withPhoto) {
      multipart.photo = { name: 'face.png', mimeType: 'image/png', buffer: FacefileBrowserDriver.PIXEL_PNG };
    }
    const res = await this.page.request.post(`${BACKEND_URL}/contacts`, { multipart });
    const body = await res.json();
    if (!res.ok() || !body?.id) {
      throw new Error(`Could not create the contact "${name}": ${res.status()} ${JSON.stringify(body)}`);
    }
    return body.id as string;
  }

  async findContactIdByName(name: string): Promise<string> {
    const res = await this.page.request.get(`${BACKEND_URL}/contacts`);
    const contacts = (await res.json()) as { id: string; name: string }[];
    const match = contacts.find(contact => contact.name === name);
    if (!match) throw new Error(`No contact named "${name}" on the active profile`);
    return match.id;
  }

  /**
   * Answers one question straight through the API. Used to push a card's next review
   * into the future without reaching into the database — a rated answer is exactly how
   * a card stops being due, so the state a spec sets up is one the app can really reach.
   */
  async submitQuizAnswerViaApi(contactId: string, rating: string): Promise<void> {
    const res = await this.page.request.post(`${BACKEND_URL}/quiz/answer`, {
      data: { contactId, direction: 'face-to-name', rating, correct: rating !== 'forgot' },
    });
    if (!res.ok()) throw new Error(`Could not record an answer for ${contactId}: ${res.status()}`);
  }

  async clickReviewDueButton(): Promise<void> {
    await this.page.getByTestId('review-due-btn').click();
  }

  async clickPracticeAllButton(): Promise<void> {
    await this.page.getByTestId('practice-all-btn').click();
  }

  async clickModeOption(mode: string): Promise<void> {
    await this.page.getByTestId(`mode-${mode}`).click();
  }

  async clickAnswerFormatOption(format: string): Promise<void> {
    await this.page.getByTestId(`answer-format-${format}`).click();
  }

  async fillAnswerInput(value: string): Promise<void> {
    await this.page.getByTestId('answer-input').fill(value);
  }

  async clickSubmitAnswer(): Promise<void> {
    await this.page.getByTestId('submit-answer-btn').click();
  }

  async clickNameOptionByText(name: string): Promise<void> {
    await this.page.getByTestId('name-option').filter({ hasText: name }).first().click();
  }

  /** Options carry their contact id, so "the right one" and "any other one" are both addressable. */
  async clickPhotoOptionForContact(contactId: string): Promise<void> {
    await this.page.locator(`[data-testid="photo-option"][data-contact-id="${contactId}"]`).click();
  }

  async clickPhotoOptionOtherThan(contactId: string): Promise<void> {
    await this.page.locator(`[data-testid="photo-option"]:not([data-contact-id="${contactId}"])`).first().click();
  }

  /**
   * Clicks a rating and waits for it to settle. The reveal panel stays up until the
   * answer has been recorded and the session has moved on, so its disappearance is the
   * signal the write landed — returning while the request is still in flight lets the
   * next step read a review history that has not been written yet. Same guard, and same
   * reason, as clickSaveUserForm.
   */
  async clickRatingButton(rating: string): Promise<void> {
    await this.page.getByTestId(`rating-${rating}`).click();
    await expect(this.page.getByTestId('reveal-panel')).toHaveCount(0);
  }

  async clickDismissExplainer(): Promise<void> {
    await this.page.getByTestId('dismiss-explainer').click();
  }

  async clickRatingHelp(): Promise<void> {
    await this.page.getByTestId('rating-help').click();
  }

  async clickSkipQuiz(): Promise<void> {
    await this.page.getByTestId('skip-quiz-btn').click();
  }

  async clickFinishSession(): Promise<void> {
    await this.page.getByTestId('finish-session-btn').click();
  }

  async expectDueCountText(count: number): Promise<void> {
    await expect(this.page.getByTestId('due-count')).toHaveText(String(count));
  }

  async expectReviewDueButtonVisible(): Promise<void> {
    await expect(this.page.getByTestId('review-due-btn')).toBeVisible();
  }

  async expectReviewDueButtonNotVisible(): Promise<void> {
    await expect(this.page.getByTestId('review-due-btn')).toHaveCount(0);
  }

  async expectPracticeAllButtonVisible(): Promise<void> {
    await expect(this.page.getByTestId('practice-all-btn')).toBeVisible();
  }

  async expectNextDuePanelVisible(): Promise<void> {
    await expect(this.page.getByTestId('next-due-date')).toBeVisible();
    await expect(this.page.getByTestId('next-due-countdown')).toBeVisible();
  }

  async expectModeSelected(mode: string): Promise<void> {
    await expect(this.page.getByTestId(`mode-${mode}`)).toHaveAttribute('data-selected', 'true');
  }

  async expectPhotoPromptVisible(): Promise<void> {
    await expect(this.page.getByTestId('prompt-photo')).toBeVisible();
  }

  async expectNamePromptContains(name: string): Promise<void> {
    await expect(this.page.getByTestId('prompt-name')).toContainText(name);
  }

  async expectNamePromptNotVisible(): Promise<void> {
    await expect(this.page.getByTestId('prompt-name')).toHaveCount(0);
  }

  /** The strong form of "no name hint": the text is nowhere on the page, not merely out of the prompt. */
  async expectTextAbsentFromPage(text: string): Promise<void> {
    await expect(this.page.getByText(text, { exact: false })).toHaveCount(0);
  }

  async expectDirectionLabel(label: string): Promise<void> {
    await expect(this.page.getByTestId('direction-label')).toContainText(label);
  }

  /** For a mixed session, where which of the two it is cannot be predicted. */
  async expectDirectionLabelPresent(): Promise<void> {
    await expect(this.page.getByTestId('direction-label')).toHaveText(/Face → Name|Name → Face/);
  }

  async expectPhotoOptionCount(count: number): Promise<void> {
    await expect(this.page.getByTestId('photo-option')).toHaveCount(count);
  }

  async expectNameOptionCount(count: number): Promise<void> {
    await expect(this.page.getByTestId('name-option')).toHaveCount(count);
  }

  async expectAnswerInputVisible(): Promise<void> {
    await expect(this.page.getByTestId('answer-input')).toBeVisible();
  }

  async expectRevealedName(name: string): Promise<void> {
    await expect(this.page.getByTestId('reveal-name')).toContainText(name);
  }

  async expectAnswerMarkedCorrect(correct: boolean): Promise<void> {
    await expect(this.page.getByTestId('answer-feedback')).toHaveAttribute('data-correct', String(correct));
  }

  /** Reads the feedback line and fails if it uses any of the words the story rules out. */
  async expectFeedbackFreeOfWords(words: string[]): Promise<void> {
    const feedback = (await this.page.getByTestId('answer-feedback').innerText()).toLowerCase();
    for (const word of words) {
      expect(feedback, `the reveal used "${word}": ${feedback}`).not.toContain(word.toLowerCase());
    }
  }

  async expectRevealNameImageContains(text: string): Promise<void> {
    await expect(this.page.getByTestId('reveal-name-image')).toContainText(text);
  }

  async expectRevealAssociationSceneContains(text: string): Promise<void> {
    await expect(this.page.getByTestId('reveal-association-scene')).toContainText(text);
  }

  /** Exactly one option is flagged as the answer, and it is the contact asked about. */
  async expectPhotoOptionMarkedCorrect(contactId: string): Promise<void> {
    const marked = this.page.locator('[data-testid="photo-option"][data-correct="true"]');
    await expect(marked).toHaveCount(1);
    await expect(marked).toHaveAttribute('data-contact-id', contactId);
  }

  async expectRatingButtonsVisible(): Promise<void> {
    for (const rating of ['forgot', 'hard', 'good', 'easy']) {
      await expect(this.page.getByTestId(`rating-${rating}`)).toBeVisible();
    }
  }

  async expectRatingButtonContains(rating: string, text: string): Promise<void> {
    await expect(this.page.getByTestId(`rating-${rating}`)).toContainText(text);
  }

  async expectRatingExplainerVisible(): Promise<void> {
    await expect(this.page.getByTestId('rating-explainer')).toBeVisible();
  }

  async expectRatingExplainerNotVisible(): Promise<void> {
    await expect(this.page.getByTestId('rating-explainer')).toHaveCount(0);
  }

  async expectRatingHelpVisible(): Promise<void> {
    await expect(this.page.getByTestId('rating-help')).toBeVisible();
  }

  async expectQuestionProgress(current: number, total: number): Promise<void> {
    const pad = (n: number) => String(n).padStart(2, '0');
    await expect(this.page.getByTestId('question-progress')).toHaveText(`${pad(current)} / ${pad(total)}`);
  }

  async expectSessionSummaryVisible(): Promise<void> {
    await expect(this.page.getByTestId('session-summary')).toBeVisible();
  }

  async expectSummaryDirectionCount(direction: string, count: number): Promise<void> {
    await expect(this.page.getByTestId(`summary-${direction}`)).toContainText(String(count));
  }

  async expectSummaryRowCount(count: number): Promise<void> {
    await expect(this.page.getByTestId('summary-row')).toHaveCount(count);
  }

  async expectSummaryRowForContact(name: string): Promise<void> {
    await expect(this.page.getByTestId('summary-row').filter({ hasText: name })).toBeVisible();
  }

  /** The schedule column is only meaningful when it holds a date rather than the em dash placeholder. */
  async expectSummaryRowHasNextReview(name: string): Promise<void> {
    const row = this.page.getByTestId('summary-row').filter({ hasText: name });
    await expect(row.getByTestId('summary-next-review')).not.toHaveText('—');
  }

  async expectSkipOptionVisible(): Promise<void> {
    await expect(this.page.getByTestId('skip-quiz-btn')).toBeVisible();
  }

  async expectSkipOptionNotVisible(): Promise<void> {
    await expect(this.page.getByTestId('skip-quiz-btn')).toHaveCount(0);
  }

  async expectQuizEmptyState(): Promise<void> {
    await expect(this.page.getByTestId('quiz-empty-state')).toBeVisible();
  }

  /** Reads the review history back from the API — the durable record, not the screen. */
  async readReviewHistory(contactId: string): Promise<{ rating: string; answeredAt: string; lapse: boolean }[]> {
    const res = await this.page.request.get(`${BACKEND_URL}/quiz/history/${contactId}`);
    if (!res.ok()) return [];
    return (await res.json()) as { rating: string; answeredAt: string; lapse: boolean }[];
  }

  async readDueCountViaApi(): Promise<number> {
    const res = await this.page.request.get(`${BACKEND_URL}/dashboard/metrics`);
    const metrics = (await res.json()) as { cardsDue: number };
    return metrics.cardsDue;
  }

  // ── Upcoming reviews ─────────────────────────────────────────────────────────

  async navigateToUpcomingReviews(): Promise<void> {
    await this.ensureAuthenticatedSession();
    await this.page.goto('/reviews/upcoming');
  }

  async clickUpcomingDayAtPosition(position: number): Promise<void> {
    await this.page.getByTestId('upcoming-day-header').nth(position - 1).click();
  }

  async expectUpcomingDayCount(count: number): Promise<void> {
    await expect(this.page.getByTestId('upcoming-day')).toHaveCount(count);
  }

  async expectUpcomingListContains(text: string): Promise<void> {
    await expect(this.page.getByTestId('upcoming-list')).toContainText(text);
  }

  async expectUpcomingListDoesNotContain(text: string): Promise<void> {
    await expect(this.page.getByTestId('upcoming-list')).not.toContainText(text);
  }

  async expectUpcomingDayContactRow(name: string): Promise<void> {
    await expect(this.page.getByTestId('upcoming-contact-row').filter({ hasText: name })).toBeVisible();
  }

  async expectUpcomingEmptyState(): Promise<void> {
    await expect(this.page.getByTestId('upcoming-empty')).toBeVisible();
  }

  async expectOnUpcomingPage(): Promise<void> {
    await this.page.waitForURL(/\/reviews\/upcoming/);
  }

  // ── Reminders ────────────────────────────────────────────────────────────────

  async navigateToReminderSettings(): Promise<void> {
    await this.ensureAuthenticatedSession();
    await this.page.goto('/settings/notifications');
  }

  async expectOnReminderSettingsPage(): Promise<void> {
    await this.page.waitForURL(/\/settings\/notifications/);
  }

  /**
   * These all wait for their own save to land before returning: every control here
   * writes straight through, and a following step that navigates away — or runs the
   * reminder sweep — would otherwise race a request still in flight.
   *
   * The settle signal is the save *counter*, not the presence of the "Saved" marker.
   * The marker never goes away once shown, so after the first save merely waiting for
   * it to be visible returns instantly and proves nothing about the current write.
   */
  async setRemindersEnabled(enabled: boolean): Promise<void> {
    await this.setCheckboxState(this.page.getByTestId('reminders-toggle'), enabled);
  }

  async setReminderTime(value: string): Promise<void> {
    const before = await this.readSaveCount();
    await this.page.getByTestId('reminder-time').fill(value);
    await this.expectSaveLandedAfter(before);
  }

  private async readSaveCount(): Promise<number> {
    const marker = this.page.getByTestId('settings-saved');
    if ((await marker.count()) === 0) return 0;
    return Number(await marker.getAttribute('data-save-count')) || 0;
  }

  private async expectSaveLandedAfter(before: number): Promise<void> {
    await expect.poll(() => this.readSaveCount()).toBeGreaterThan(before);
  }

  async setChannelEnabled(channel: string, enabled: boolean): Promise<void> {
    await this.setCheckboxState(this.page.getByTestId(`channel-${channel}`), enabled);
  }

  /**
   * Drives a checkbox to a state rather than toggling it. Playwright's check()/uncheck()
   * are no-ops when the box already holds the target value — no change event, so no save,
   * so waiting for the "Saved" marker would hang on a setting that was already correct.
   * A caller asking for a state it already has has nothing to wait for.
   */
  private async setCheckboxState(box: Locator, enabled: boolean): Promise<void> {
    if ((await box.isChecked()) === enabled) return;
    const before = await this.readSaveCount();
    // click(), not check()/uncheck(): those re-read the box afterwards and fail if the
    // state has not settled yet. The save counter below is the real confirmation, and
    // the desired state is asserted once the write has actually landed.
    await box.click();
    await this.expectSaveLandedAfter(before);
    await expect(box).toBeChecked({ checked: enabled });
  }

  async expectRemindersToggleState(enabled: boolean): Promise<void> {
    const toggle = this.page.getByTestId('reminders-toggle');
    if (enabled) await expect(toggle).toBeChecked();
    else await expect(toggle).not.toBeChecked();
  }

  async expectReminderTimeValue(value: string): Promise<void> {
    await expect(this.page.getByTestId('reminder-time')).toHaveValue(value);
  }

  /** Matches an IANA zone name or the UTC fallback, rather than pinning the runner's own. */
  async expectReminderTimezoneShown(): Promise<void> {
    await expect(this.page.getByTestId('reminder-timezone')).toHaveText(/^([A-Za-z_]+\/[A-Za-z_+\-0-9\/]+|UTC)$/);
  }

  /**
   * Runs the reminder sweep on demand. Production runs the identical sweep on an
   * EventBridge schedule (see functions/notifications/handler.ts) — driving it through
   * its HTTP entry point is what lets a spec observe the outcome without waiting for a
   * scheduler tick.
   */
  async runReminderSweepViaApi(): Promise<void> {
    const res = await this.page.request.post(`${BACKEND_URL}/notifications/dispatch`);
    if (!res.ok()) throw new Error(`The reminder sweep failed: ${res.status()}`);
  }

  async readNotificationsViaApi(): Promise<{ id: string; message: string; link: string }[]> {
    const res = await this.page.request.get(`${BACKEND_URL}/notifications`);
    if (!res.ok()) return [];
    return (await res.json()) as { id: string; message: string; link: string }[];
  }

  async expectReviewReminderVisible(): Promise<void> {
    await expect(this.page.getByTestId('review-reminder').first()).toBeVisible();
  }

  async expectReviewReminderNotVisible(): Promise<void> {
    await expect(this.page.getByTestId('review-reminder')).toHaveCount(0);
  }

  async expectReviewReminderContains(text: string): Promise<void> {
    await expect(this.page.getByTestId('review-reminder').first()).toContainText(text);
  }

  async clickReviewReminder(): Promise<void> {
    await this.page.getByTestId('review-reminder').first().click();
  }

  /** page.request for the same reason as resetTutorialProgress — clean the active profile. */
  async deleteAllNotifications(): Promise<void> {
    assertLocalTarget('deleteAllNotifications');
    await this.page.request.delete(`${BACKEND_URL}/notifications`);
  }

  /** Returns preferences to their shipped defaults, so one spec's overrides can't leak into the next. */
  async resetUserSettings(): Promise<void> {
    assertLocalTarget('resetUserSettings');
    await this.page.request.put(`${BACKEND_URL}/settings`, {
      data: {
        quizMode: 'mixed',
        quizAnswerFormat: 'choice',
        ratingExplainerSeen: false,
        remindersEnabled: false,
        reminderHour: 9,
        reminderMinute: 0,
        reminderTimezone: 'UTC',
        reminderChannels: ['in-app'],
      },
    });
  }
}
