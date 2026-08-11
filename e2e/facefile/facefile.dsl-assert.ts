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

  // ── Admin: user management ──────────────────────────────────────────────────

  async seesUserInList(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectUserRowVisible(name);
  }

  async doesNotSeeUserInList(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectUserRowNotVisible(name);
  }

  async seesUserWithEmail(nameParam: string, emailParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    const email = this.dsl.ctx.aliasEmail(parseParam(emailParam, 'email'));
    await this.dsl.driver.expectUserRowContainsEmail(name, email);
  }

  async seesUserStatus(nameParam: string, statusParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    const status = parseParam(statusParam, 'status');
    await this.dsl.driver.expectUserRowStatus(name, status);
  }

  async seesEmptyUsersListMessage(): Promise<void> {
    await this.dsl.driver.expectEmptyUsersListMessage();
  }

  async seesNameRequiredErrorOnUserForm(): Promise<void> {
    await this.dsl.driver.expectUserFormError('A name is required.');
  }

  async seesEmailRequiredErrorOnUserForm(): Promise<void> {
    await this.dsl.driver.expectUserFormError('An email address is required.');
  }

  async seesDuplicateEmailErrorOnUserForm(): Promise<void> {
    await this.dsl.driver.expectUserFormErrorContains('already in use');
  }

  // ── Session & profile selection ─────────────────────────────────────────────

  async seesProfilePicker(): Promise<void> {
    await this.dsl.driver.expectOnSelectProfilePage();
  }

  async isRedirectedToProfilePicker(): Promise<void> {
    await this.dsl.driver.expectOnSelectProfilePage();
  }

  async landsOnDashboard(): Promise<void> {
    await this.dsl.driver.expectLandedOnHomePage();
  }

  async seesProfileInPicker(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectProfileTileVisible(name);
  }

  async doesNotSeeProfileInPicker(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectProfileTileNotVisible(name);
  }

  async seesRememberMeOption(): Promise<void> {
    await this.dsl.driver.expectRememberMeOptionVisible();
  }

  async sessionCookieIsPersistent(): Promise<void> {
    await this.dsl.driver.expectSessionCookiePersistent();
  }

  async sessionCookieIsBrowserScoped(): Promise<void> {
    await this.dsl.driver.expectSessionCookieIsBrowserScoped();
  }
}

export function confirmThat(facefile: FacefileDsl): FacefileDslAssert {
  return new FacefileDslAssert(facefile);
}
