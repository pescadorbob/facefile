import { DslContext } from '../support/dsl-context';
import { parseParam } from '../support/parse-param';
import { FacefileBrowserDriver } from './facefile.browser.driver';

export class FacefileDsl {
  constructor(
    readonly driver: FacefileBrowserDriver,
    readonly ctx: DslContext,
  ) {}

  async opensTheTutorial(): Promise<void> {
    await this.driver.resetTutorialProgress();
    await this.driver.navigateToTutorial();
  }

  async advancesStep(): Promise<void> {
    await this.driver.clickAdvanceButton();
  }

  /** Advances from step 1 to the given target step by clicking (target - 1) times. */
  async advancesToStep(stepParam: string): Promise<void> {
    const target = parseInt(parseParam(stepParam, 'step'), 10);
    await this.driver.clickAdvanceButtonNTimes(target - 1);
  }
}
