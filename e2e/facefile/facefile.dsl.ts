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

  // ── Guided wizard ──────────────────────────────────────────────────────────

  async opensGuidedWizard(): Promise<void> {
    await this.driver.navigateToAddPerson();
  }

  async completesStep1(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.fillWizardNameField(name);
    await this.driver.clickWizardContinueButton();
  }

  async completesStep2(): Promise<void> {
    await this.driver.clickFirstSeedPalace();
    await this.driver.clickFirstSeedLocus();
    await this.driver.clickWizardContinueButton();
  }

  async completesStep3(imageParam: string): Promise<void> {
    const image = parseParam(imageParam, 'image');
    await this.driver.fillWizardNameImageField(image);
    await this.driver.clickWizardContinueButton();
  }

  async completesStep4(sceneParam: string): Promise<void> {
    const scene = parseParam(sceneParam, 'scene');
    await this.driver.fillWizardAssociationSceneField(scene);
    await this.driver.clickWizardContinueButton();
  }

  async completesAllFiveSteps(nameParam: string): Promise<void> {
    await this.completesStep1(nameParam);
    await this.completesStep2();
    await this.completesStep3('image: a giant marquee tent');
    await this.completesStep4('scene: swinging from the coat rack');
    await this.driver.clickWizardContinueButton(); // step 5 → save
  }

  async attemptsToAdvanceWithoutName(): Promise<void> {
    await this.driver.clickWizardContinueButton();
  }

  async advancesWizardStep(): Promise<void> {
    await this.driver.clickWizardContinueButton();
  }

  async navigatesBackInWizard(): Promise<void> {
    await this.driver.clickWizardBackButton();
  }

  async entersNameImageOnStep3(imageParam: string): Promise<void> {
    const image = parseParam(imageParam, 'image');
    await this.driver.fillWizardNameImageField(image);
  }
}
