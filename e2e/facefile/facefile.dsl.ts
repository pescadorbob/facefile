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

  // ── Admin: user management ──────────────────────────────────────────────────

  async opensAdminUsers(): Promise<void> {
    await this.driver.navigateToAdminUsers();
  }

  async createsUserWith(nameParam: string, emailParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    const email = this.ctx.aliasEmail(parseParam(emailParam, 'email'));
    await this.driver.clickAddUserButton();
    await this.driver.fillUserForm(name, email);
    await this.driver.clickSaveUserForm();
    this.driver.trackCreatedUserEmail(email);
  }

  async attemptsToCreateUserWithoutName(emailParam: string): Promise<void> {
    const email = this.ctx.aliasEmail(parseParam(emailParam, 'email'));
    await this.driver.clickAddUserButton();
    await this.driver.fillUserForm('', email);
    await this.driver.clickSaveUserForm();
  }

  async attemptsToCreateUserWithoutEmail(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.clickAddUserButton();
    await this.driver.fillUserForm(name, '');
    await this.driver.clickSaveUserForm();
  }

  /** emailParam must reuse a raw value already aliased earlier in this test (an existing user's email). */
  async attemptsToCreateUserWithDuplicateEmail(nameParam: string, emailParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    const email = this.ctx.aliasEmail(parseParam(emailParam, 'email'));
    await this.driver.clickAddUserButton();
    await this.driver.fillUserForm(name, email);
    await this.driver.clickSaveUserForm();
  }

  async editsUsersName(currentNameParam: string, newNameParam: string): Promise<void> {
    const currentName = this.ctx.alias(parseParam(currentNameParam, 'name'));
    const newName = this.ctx.alias(parseParam(newNameParam, 'name'));
    await this.driver.clickEditOnUserRow(currentName);
    await this.driver.fillUserFormName(newName);
    await this.driver.clickSaveUserForm();
  }

  async editsUsersEmail(nameParam: string, newEmailParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    const newEmail = this.ctx.aliasEmail(parseParam(newEmailParam, 'email'));
    await this.driver.clickEditOnUserRow(name);
    await this.driver.fillUserFormEmail(newEmail);
    await this.driver.clickSaveUserForm();
    this.driver.trackCreatedUserEmail(newEmail);
  }

  async attemptsToClearUsersEmail(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.clickEditOnUserRow(name);
    await this.driver.fillUserFormEmail('');
    await this.driver.clickSaveUserForm();
  }

  /** emailParam must reuse a raw value already aliased earlier in this test (another user's email). */
  async attemptsToUpdateUsersEmailToDuplicate(nameParam: string, emailParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    const email = this.ctx.aliasEmail(parseParam(emailParam, 'email'));
    await this.driver.clickEditOnUserRow(name);
    await this.driver.fillUserFormEmail(email);
    await this.driver.clickSaveUserForm();
  }

  async deactivatesUser(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.clickDeactivateOnUserRow(name);
  }

  async reactivatesUser(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.clickReactivateOnUserRow(name);
  }

  /** For idempotency checks: repeats a deactivate the row's button no longer offers (already deactivated). */
  async deactivatesUserAgain(emailParam: string): Promise<void> {
    const email = this.ctx.aliasEmail(parseParam(emailParam, 'email'));
    await this.driver.deactivateUserByEmail(email);
    await this.driver.navigateToAdminUsers();
  }

  /** For idempotency checks: repeats a reactivate the row's button no longer offers (already active). */
  async reactivatesUserAgain(emailParam: string): Promise<void> {
    const email = this.ctx.aliasEmail(parseParam(emailParam, 'email'));
    await this.driver.reactivateUserByEmail(email);
    await this.driver.navigateToAdminUsers();
  }
}
