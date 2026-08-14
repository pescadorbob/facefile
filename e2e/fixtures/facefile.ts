import { APIRequestContext, Page, test as base } from '@playwright/test';
import { FacefileBrowserDriver } from '../facefile/facefile.browser.driver';
import { FacefileDsl } from '../facefile/facefile.dsl';
import { DslContext } from '../support/dsl-context';
import { isLocalTarget } from '../support/target';

export { confirmThat } from '../facefile/facefile.dsl-assert';

type FacefileFixtures = {
  driver: FacefileBrowserDriver;
  facefile: FacefileDsl;
};

export const test = base.extend<FacefileFixtures>({
  driver: [
    async ({ page, request }: { page: Page; request: APIRequestContext }, use: (r: FacefileBrowserDriver) => Promise<void>) => {
      const driver = new FacefileBrowserDriver(page, request);
      await use(driver);

      // Only the read-only smoke specs run off localhost (see
      // support/target.ts), so there is nothing of this run's to clean up
      // there — and these calls would clear the deployed environment's real
      // data rather than a sandbox's. The first two would throw anyway; the
      // deactivations are skipped for the same reason, not because they are
      // unsafe.
      if (!isLocalTarget()) return;

      await driver.resetTutorialProgress();
      await driver.deleteAllContacts();
      // Before the users are deactivated — the palaces belong to them, and the lookup
      // this does goes through the still-active profile's session.
      await driver.deleteTrackedPalaces();
      await driver.deactivateTrackedUsers();
      await driver.deactivateTrackedProfiles();
    },
    { auto: true },
  ],

  facefile: async ({ driver }: { driver: FacefileBrowserDriver }, use: (r: FacefileDsl) => Promise<void>) => {
    const ctx = new DslContext();
    await use(new FacefileDsl(driver, ctx));
  },
});

export { expect } from '@playwright/test';
