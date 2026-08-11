import { APIRequestContext, Page, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:3001';

export class FacefileBrowserDriver {
  private readonly createdUserEmails = new Set<string>();

  constructor(
    private readonly page: Page,
    private readonly request: APIRequestContext,
  ) {}

  async navigateToTutorial(): Promise<void> {
    await this.page.goto('/tutorial');
  }

  async resetTutorialProgress(): Promise<void> {
    await this.request.put(`${BACKEND_URL}/api/tutorial/progress`, {
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
    await this.request.delete(`${BACKEND_URL}/api/contacts`);
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
    await this.request.post(`${BACKEND_URL}/api/admin/users/${user.id}/deactivate`);
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
    await this.request.post(`${BACKEND_URL}/api/admin/users/${user.id}/reactivate`);
  }

  private async findUserByEmail(email: string): Promise<{ id: number; name: string; email: string } | undefined> {
    const res = await this.request.get(`${BACKEND_URL}/api/admin/users`);
    const users = await res.json();
    return users.find((u: { id: number; name: string; email: string }) => u.email === email);
  }
}
