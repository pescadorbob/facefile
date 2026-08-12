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

  async seesCreateProfileOption(): Promise<void> {
    await this.dsl.driver.expectCreateProfileActionVisible();
  }

  async doesNotSeeCreateProfilePrompt(): Promise<void> {
    await this.dsl.driver.expectProfileNameFieldNotVisible();
  }

  async seesNameRequiredErrorOnProfileForm(): Promise<void> {
    await this.dsl.driver.expectProfileFormError('A name is required.');
  }

  async seesDuplicateNameErrorOnProfileForm(): Promise<void> {
    await this.dsl.driver.expectProfileFormErrorContains('already in use');
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

  // ── Dashboard ────────────────────────────────────────────────────────────────

  async seesPeopleAddedCount(countParam: string): Promise<void> {
    const count = parseInt(parseParam(countParam, 'count'), 10);
    await this.dsl.driver.expectPeopleAddedCount(count);
  }

  async seesCardsDueCount(countParam: string): Promise<void> {
    const count = parseInt(parseParam(countParam, 'count'), 10);
    await this.dsl.driver.expectCardsDueCount(count);
  }

  async seesDueTileHighlighted(): Promise<void> {
    await this.dsl.driver.expectDueTileHighlighted();
  }

  async doesNotSeeDueTileHighlighted(): Promise<void> {
    await this.dsl.driver.expectDueTileNotHighlighted();
  }

  async seesQuizPromptBanner(): Promise<void> {
    await this.dsl.driver.expectQuizPromptBannerVisible();
  }

  async doesNotSeeQuizPromptBanner(): Promise<void> {
    await this.dsl.driver.expectQuizPromptBannerNotVisible();
  }

  async isOnQuizScreen(): Promise<void> {
    await this.dsl.driver.expectOnQuizPage();
  }

  async seesStandingActionBanners(): Promise<void> {
    await this.dsl.driver.expectStandingBannersVisible();
  }

  async isOnTeachModeScreen(): Promise<void> {
    await this.dsl.driver.expectOnTeachPage();
  }

  async isOnTutorialScreen(): Promise<void> {
    await this.dsl.driver.expectOnTutorialPage();
  }

  async isOnPalacesScreen(): Promise<void> {
    await this.dsl.driver.expectOnPalacesPage();
  }

  async isOnAddPersonScreen(): Promise<void> {
    await this.dsl.driver.expectOnAddPersonPage();
  }

  async isOnAdminUsersScreen(): Promise<void> {
    await this.dsl.driver.expectOnAdminUsersPage();
  }

  async isOnMeetingsScreen(): Promise<void> {
    await this.dsl.driver.expectOnMeetingsPage();
  }

  async seesContactInInventory(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectContactVisibleInInventory(name);
  }

  async doesNotSeeContactInInventory(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectContactNotVisibleInInventory(name);
  }

  async seesAddPersonShortcut(): Promise<void> {
    await this.dsl.driver.expectAddPersonShortcutVisible();
  }

  async seesEmptyInventoryMessage(): Promise<void> {
    await this.dsl.driver.expectEmptyInventoryMessage();
  }

  async seesAdminLink(): Promise<void> {
    await this.dsl.driver.expectAdminLinkVisible();
  }

  async seesMeetingsLink(): Promise<void> {
    await this.dsl.driver.expectMeetingsLinkVisible();
  }
}

export function confirmThat(facefile: FacefileDsl): FacefileDslAssert {
  return new FacefileDslAssert(facefile);
}
