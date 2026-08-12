import { APIRequestContext, Page, test as base } from '@playwright/test';
import { FacefileBrowserDriver } from '../facefile/facefile.browser.driver';
import { FacefileDsl } from '../facefile/facefile.dsl';
import { DslContext } from '../support/dsl-context';

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
      await driver.resetTutorialProgress();
      await driver.deleteAllContacts();
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
