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
}

export function confirmThat(facefile: FacefileDsl): FacefileDslAssert {
  return new FacefileDslAssert(facefile);
}
