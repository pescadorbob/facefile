import { APIRequestContext, Page, expect } from '@playwright/test';
import { resolveApiUrl } from '../support/api-config';

const BACKEND_URL = resolveApiUrl();

// Mirrors amplify/backend.ts's DEFAULT_USER_ID (the seeded stub user — see
// amplify/seed.ts). Ids are UUID strings now, not Prisma's autoincrement 1.
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export class FacefileBrowserDriver {
  private readonly createdUserEmails = new Set<string>();
  private sessionEstablished = false;

  constructor(
    private readonly page: Page,
    private readonly request: APIRequestContext,
  ) {}

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

  async resetTutorialProgress(): Promise<void> {
    await this.request.put(`${BACKEND_URL}/tutorial/progress`, {
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

  async deleteAllContacts(): Promise<void> {
    await this.request.delete(`${BACKEND_URL}/contacts`);
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

  async clickSaveUserForm(): Promise<void> {
    await this.page.getByRole('button', { name: /Create user|Save changes/ }).click();
  }

  async clickEditOnUserRow(name: string): Promise<void> {
    await this.page.getByRole('row', { name }).getByRole('button', { name: 'Edit' }).click();
  }

  async clickDeactivateOnUserRow(name: string): Promise<void> {
    await this.page.getByRole('row', { name }).getByRole('button', { name: 'Deactivate' }).click();
  }

  async clickReactivateOnUserRow(name: string): Promise<void> {
    await this.page.getByRole('row', { name }).getByRole('button', { name: 'Reactivate' }).click();
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
    await this.request.post(`${BACKEND_URL}/admin/users`, { data: { name, email } });
  }

  async clickProfileTile(name: string): Promise<void> {
    await this.page.getByRole('button', { name }).click();
  }

  async checkRememberMeOnPicker(): Promise<void> {
    await this.page.getByLabel(/Remember me/i).check();
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

  // ── Dashboard ────────────────────────────────────────────────────────────────

  async navigateToDashboard(): Promise<void> {
    await this.ensureAuthenticatedSession();
    await this.page.goto('/dashboard');
  }

  /**
   * Seeds a contact directly via the API — creating one also produces an immediately-due
   * ReviewCard. Uses page.request (not the standalone `request` fixture — see
   * ensureAuthenticatedSession) so the contact is scoped to whichever profile is
   * currently active in the browser's session cookie — callers must establish the
   * session (e.g. navigateToDashboard) before calling this.
   */
  async createContactViaApi(name: string): Promise<void> {
    await this.page.request.post(`${BACKEND_URL}/contacts`, { multipart: { name } });
  }

  async expectPeopleAddedCount(n: number): Promise<void> {
    await expect(this.page.getByTestId('people-added-tile')).toContainText(String(n));
  }

  async expectCardsDueCount(n: number): Promise<void> {
    await expect(this.page.getByTestId('due-review-tile')).toContainText(String(n));
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
}
