import { parseParam } from '../support/parse-param';
import { FacefileDsl } from './facefile.dsl';

export class FacefileDslAssert {
  constructor(private readonly dsl: FacefileDsl) {}

  async seesStep(stepParam: string): Promise<void> {
    const step = parseInt(parseParam(stepParam, 'step'), 10);
    const padded = String(step).padStart(2, '0');
    await this.dsl.driver.expectStepCounterText(`${padded} / 07`);
  }

  async seesStepContent(): Promise<void> {
    await this.dsl.driver.expectAdvanceButtonVisible();
  }

  async seesAdvanceOption(): Promise<void> {
    await this.dsl.driver.expectAdvanceButtonVisible();
  }

  async seesCompletionConfirmation(): Promise<void> {
    await this.dsl.driver.expectCompletionVisible();
  }

  async doesNotSeeCompletionConfirmation(): Promise<void> {
    await this.dsl.driver.expectNoCompletionVisible();
  }

  async seesVisualExample(): Promise<void> {
    await this.dsl.driver.expectVisualExampleVisible();
  }

  // ── Guided wizard ──────────────────────────────────────────────────────────

  async isOnWizardStep(stepParam: string): Promise<void> {
    const step = parseInt(parseParam(stepParam, 'step'), 10);
    await this.dsl.driver.expectWizardStepCounter(step);
  }

  async seesNameRequiredError(): Promise<void> {
    await this.dsl.driver.expectNameRequiredErrorVisible();
  }

  async seesNameProminentlyOnStep3(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectProminentNameContains(name);
  }

  async seesNameImageTechniqueHints(): Promise<void> {
    await this.dsl.driver.expectTechniqueHintsVisible();
  }

  async landedOnQuizPage(): Promise<void> {
    await this.dsl.driver.expectOnQuizPage();
  }

  async seesPalaceInWizard(nameParam: string): Promise<void> {
    const name = parseParam(nameParam, 'palace');
    await this.dsl.driver.expectPalaceButtonVisible(name);
  }

  async seesNameImagePreservedAfterBack(imageParam: string): Promise<void> {
    const image = parseParam(imageParam, 'image');
    await this.dsl.driver.expectWizardNameImageFieldContains(image);
  }
}

export function confirmThat(facefile: FacefileDsl): FacefileDslAssert {
  return new FacefileDslAssert(facefile);
}
