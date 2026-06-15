import { APIRequestContext, Page, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:3001';

export class FacefileBrowserDriver {
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
    await this.page.getByRole('button', { name: /Next step|Complete tutorial/i }).click();
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
    await expect(
      this.page.getByRole('button', { name: /Next step|Complete tutorial/i }),
    ).toBeVisible();
  }

  async expectCompletionVisible(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Fundamentals Complete' }),
    ).toBeVisible();
  }

  async expectNoCompletionVisible(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Fundamentals Complete' }),
    ).not.toBeVisible();
  }

  async expectVisualExampleVisible(): Promise<void> {
    await expect(this.page.getByText('Visual Example')).toBeVisible();
  }
}
