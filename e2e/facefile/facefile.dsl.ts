import { DslContext } from '../support/dsl-context';
import { parseListParam, parseParam } from '../support/parse-param';
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

  // ── Session & profile selection ─────────────────────────────────────────────

  async opensSelectProfile(): Promise<void> {
    await this.driver.navigateToSelectProfile();
  }

  async attemptsToOpenProtectedPageWithoutSession(): Promise<void> {
    await this.driver.navigateToProtectedPageWithoutSession();
  }

  async refreshesPage(): Promise<void> {
    await this.driver.reloadPage();
  }

  /**
   * GIVEN-step sign-in for any spec that just needs *a* signed-in user: creates its own
   * isolated account (aliased name/email, deactivated in fixture teardown) and signs in as
   * it, so the spec doesn't depend on the seeded profile being present and active.
   *
   * Specs that need the seeded starter palaces (the add-person wizard) must NOT use this —
   * a fresh account has no palaces. Those keep the seeded profile the driver signs in as.
   */
  async signsInAsTestUser(nameParam = 'name: Test User', emailParam = 'email: test-user@example.com'): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    const email = this.ctx.aliasEmail(parseParam(emailParam, 'email'));
    await this.driver.signInAsNewUserViaApi(name, email);
    this.driver.trackCreatedUserEmail(email);
  }

  async registersActiveUser(nameParam: string, emailParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    const email = this.ctx.aliasEmail(parseParam(emailParam, 'email'));
    await this.driver.createActiveUserViaApi(name, email);
    this.driver.trackCreatedUserEmail(email);
  }

  async selectsProfile(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.clickProfileTile(name);
  }

  async selectsProfileWithRememberMe(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.checkRememberMeOnPicker();
    await this.driver.clickProfileTile(name);
  }

  async opensCreateProfilePrompt(): Promise<void> {
    await this.driver.clickCreateProfileAction();
  }

  async createsProfile(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.fillProfileNameField(name);
    await this.driver.clickCreateProfileSubmit();
    this.driver.trackCreatedUserName(name);
  }

  async attemptsToCreateProfileWithoutName(): Promise<void> {
    await this.driver.fillProfileNameField('');
    await this.driver.clickCreateProfileSubmit();
  }

  /** nameParam must reuse a raw value already aliased earlier in this test (an existing profile's name). */
  async attemptsToCreateProfileWithDuplicateName(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.fillProfileNameField(name);
    await this.driver.clickCreateProfileSubmit();
  }

  async abandonsCreateProfilePrompt(): Promise<void> {
    await this.driver.clickCancelOnProfileForm();
  }

  async activatesSwitchProfile(): Promise<void> {
    await this.driver.clickSwitchProfile();
  }

  async tampersWithSessionCookie(): Promise<void> {
    await this.driver.setTamperedSessionCookie();
  }

  // ── Memory palaces ───────────────────────────────────────────────────────────

  async opensThePalaces(): Promise<void> {
    await this.driver.navigateToPalaces();
  }

  /** GIVEN-step palace, created straight through the API rather than the form. */
  async registersPalace(palaceParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(palaceParam, 'palace'));
    await this.driver.createPalaceViaApi(name);
    this.driver.trackCreatedPalaceName(name);
  }

  async opensNewPalacePrompt(): Promise<void> {
    await this.driver.clickNewPalaceAction();
  }

  async createsPalace(palaceParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(palaceParam, 'palace'));
    await this.driver.fillPalaceNameField(name);
    await this.driver.clickCreatePalaceSubmit();
    this.driver.trackCreatedPalaceName(name);
  }

  /**
   * Names the loci alongside the palace, in the order given. Locus names are not aliased:
   * every assertion on them is scoped to the (aliased) palace that holds them, so they
   * cannot collide across runs, and leaving them literal keeps the ordering assertion exact.
   */
  async createsPalaceWithLoci(palaceParam: string, lociParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(palaceParam, 'palace'));
    await this.driver.fillPalaceNameField(name);
    const loci = parseListParam(lociParam, 'loci');
    for (const [index, locus] of loci.entries()) {
      await this.driver.addLocusToPalaceForm(index + 1, locus);
    }
    await this.driver.clickCreatePalaceSubmit();
    this.driver.trackCreatedPalaceName(name);
  }

  /**
   * Submits the name exactly as written, with no alias suffix — the only verb that does.
   * The minimum-length rule is measured on the characters the user actually types, so
   * aliasing "Ox" into "Ox1a3f2" would stop the boundary case testing the boundary. Run
   * isolation still holds: palace names are unique per user, and every spec using this
   * signs in as its own throwaway account. Mirrored by seesPalaceNamedExactlyInList.
   */
  async createsPalaceNamedExactly(palaceParam: string): Promise<void> {
    const name = parseParam(palaceParam, 'palace');
    await this.driver.fillPalaceNameField(name);
    await this.driver.clickCreatePalaceSubmit();
    this.driver.trackCreatedPalaceName(name);
  }

  /** Unaliased for the same reason as createsPalaceNamedExactly — the length is the point. */
  async attemptsToCreatePalaceNamed(palaceParam: string): Promise<void> {
    const name = parseParam(palaceParam, 'palace');
    await this.driver.fillPalaceNameField(name);
    await this.driver.clickCreatePalaceSubmit();
  }

  async attemptsToCreatePalaceWithoutName(): Promise<void> {
    await this.driver.fillPalaceNameField('');
    await this.driver.clickCreatePalaceSubmit();
  }

  /** palaceParam must reuse a raw value already aliased earlier in this test (an existing palace). */
  async attemptsToCreatePalaceWithDuplicateName(palaceParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(palaceParam, 'palace'));
    await this.driver.fillPalaceNameField(name);
    await this.driver.clickCreatePalaceSubmit();
  }

  async entersPalaceName(palaceParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(palaceParam, 'palace'));
    await this.driver.fillPalaceNameField(name);
  }

  async abandonsNewPalacePrompt(): Promise<void> {
    await this.driver.clickCancelOnPalaceForm();
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────

  async opensTheDashboard(): Promise<void> {
    await this.driver.navigateToDashboard();
  }

  async registersContact(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.createContactViaApi(name);
  }

  /**
   * A contact complete enough to be quizzed either way round: a face to recognise and
   * the encoding cues the reveal screen shows back. Name → Face questions cannot be
   * built from contacts without photos, so any spec touching that direction needs this.
   */
  async registersFullyEncodedContact(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.createContactViaApi(name, {
      withPhoto: true,
      nameImage: `a marquee tent for ${name}`,
      associationScene: `${name} juggling on the coat rack`,
    });
  }

  async registersFullyEncodedContacts(namesParam: string): Promise<void> {
    for (const name of parseListParam(namesParam, 'names')) {
      await this.registersFullyEncodedContact(`name: ${name}`);
    }
  }

  /**
   * Answers a contact's card outright, which is how a card stops being due — a
   * successful recall pushes its next review at least a day out. Used as a GIVEN
   * when a spec needs a contact that exists but is not due yet.
   */
  async completesReviewFor(nameParam: string, ratingParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    const rating = parseParam(ratingParam, 'rating');
    await this.driver.submitQuizAnswerViaApi(await this.driver.findContactIdByName(name), rating);
  }

  async startsReviewFromDueCount(): Promise<void> {
    await this.driver.clickDueReviewTile();
  }

  async opensUpcomingReviewsFromDashboard(): Promise<void> {
    await this.driver.clickUpcomingLink();
  }

  async opensReminderSettingsFromDashboard(): Promise<void> {
    await this.driver.clickRemindersLink();
  }

  // ── Edit person (S-2.6) ─────────────────────────────────────────────────────

  async opensEditViewFor(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.clickEditOnContactCard(name);
  }

  async editsContactsName(currentNameParam: string, newNameParam: string): Promise<void> {
    const newName = this.ctx.alias(parseParam(newNameParam, 'name'));
    await this.opensEditViewFor(currentNameParam);
    await this.driver.fillEditNameField(newName);
    await this.driver.clickSaveEditPersonForm();
  }

  /**
   * Bypasses the "key: value" tag parser deliberately for the literal padding: parseParam
   * trims before the DSL ever sees the value, which would defeat the one thing this
   * scenario needs to prove (S-2.6.2's whitespace-trim rule). `literalPaddedName` is typed
   * into the field exactly as given, spaces and all.
   */
  async savesNameWithSurroundingWhitespace(currentNameParam: string, literalPaddedName: string): Promise<void> {
    await this.opensEditViewFor(currentNameParam);
    await this.driver.fillEditNameField(literalPaddedName);
    await this.driver.clickSaveEditPersonForm();
  }

  async replacesContactsPhoto(nameParam: string): Promise<void> {
    await this.opensEditViewFor(nameParam);
    await this.driver.choosesNewPhotoInEditForm();
    await this.driver.clickSaveEditPersonForm();
  }

  async attemptsToReplacePhotoWithOversizedFile(nameParam: string): Promise<void> {
    await this.opensEditViewFor(nameParam);
    await this.driver.attemptsToChooseOversizedPhotoInEditForm();
    await this.driver.clickSaveEditPersonForm();
  }

  async attemptsToReplacePhotoWithUnsupportedFile(nameParam: string): Promise<void> {
    await this.opensEditViewFor(nameParam);
    await this.driver.attemptsToChooseUnsupportedFileInEditForm();
    await this.driver.clickSaveEditPersonForm();
  }

  async removesContactsPhoto(nameParam: string): Promise<void> {
    await this.opensEditViewFor(nameParam);
    await this.driver.clickRemovePhotoInEditForm();
    await this.driver.clickSaveEditPersonForm();
  }

  async attemptsToClearContactsName(nameParam: string): Promise<void> {
    await this.opensEditViewFor(nameParam);
    await this.driver.fillEditNameField('');
    await this.driver.clickSaveEditPersonForm();
  }

  async attemptsToClearNameAfterChoosingNewPhoto(nameParam: string): Promise<void> {
    await this.opensEditViewFor(nameParam);
    await this.driver.choosesNewPhotoInEditForm();
    await this.driver.fillEditNameField('');
    await this.driver.clickSaveEditPersonForm();
  }

  async opensEditViewAndChangesNameWithoutSaving(nameParam: string, attemptedNameParam: string): Promise<void> {
    const attempted = this.ctx.alias(parseParam(attemptedNameParam, 'name'));
    await this.opensEditViewFor(nameParam);
    await this.driver.fillEditNameField(attempted);
  }

  async cancelsTheEditForm(): Promise<void> {
    await this.driver.clickCancelEditPersonForm();
  }

  /** GIVEN-step palace+locus, created straight through the API, with a contact placed in it. */
  async registersContactInANamedPalaceAndLocus(nameParam: string, palaceParam: string, locusParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    const palace = this.ctx.alias(parseParam(palaceParam, 'palace'));
    const locus = parseParam(locusParam, 'locus');
    const { palaceId, locusId } = await this.driver.createPalaceWithLocusViaApi(palace, locus);
    this.driver.trackCreatedPalaceName(palace);
    await this.driver.createContactInLocusViaApi(name, palaceId, locusId);
  }

  // ── Quiz sessions ────────────────────────────────────────────────────────────

  async opensTheQuiz(): Promise<void> {
    await this.driver.navigateToQuiz();
  }

  /** The prompt shown straight after saving a contact (E-4.8). */
  async isPromptedToQuiz(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.navigateToQuizForContact(await this.driver.findContactIdByName(name));
  }

  async choosesSessionType(typeParam: string): Promise<void> {
    await this.driver.clickModeOption(parseParam(typeParam, 'type'));
  }

  async choosesAnswerFormat(formatParam: string): Promise<void> {
    await this.driver.clickAnswerFormatOption(parseParam(formatParam, 'format'));
  }

  async startsDueReviewSession(): Promise<void> {
    await this.driver.clickReviewDueButton();
  }

  async startsPracticeAllSession(): Promise<void> {
    await this.driver.clickPracticeAllButton();
  }

  async answersWithTheName(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.fillAnswerInput(name);
    await this.driver.clickSubmitAnswer();
  }

  async answersWithAName(nameParam: string): Promise<void> {
    await this.driver.fillAnswerInput(parseParam(nameParam, 'name'));
    await this.driver.clickSubmitAnswer();
  }

  /**
   * Stubs what the (mocked) microphone will report the next time the user speaks an
   * answer (S-4.1.3). Playwright has no real microphone, so this replaces the
   * browser's speech recognition before the app loads — call it before the first
   * navigation of the test.
   */
  async theMicrophoneWillHear(transcriptParam: string): Promise<void> {
    await this.driver.mockSpeechRecognitionResult(parseParam(transcriptParam, 'transcript'));
  }

  /** A near-miss of an aliased name — close enough to count as recalled, not identical. */
  async theMicrophoneWillHearACloseVariantOf(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.mockSpeechRecognitionResult(this.nearMissOf(name));
  }

  /** Simulates a browser with no speech recognition support at all (S-4.1.3). */
  async hasNoVoiceInputSupport(): Promise<void> {
    await this.driver.disableSpeechRecognitionSupport();
  }

  /** Taps the mic control and waits for the (mocked) spoken answer to be graded. */
  async speaksTheAnswer(): Promise<void> {
    await this.driver.clickSpeakAnswerButton();
  }

  /** Drops one character from the middle of a name — a small, deliberate mishearing. */
  private nearMissOf(name: string): string {
    const middle = Math.floor(name.length / 2);
    return name.slice(0, middle) + name.slice(middle + 1);
  }

  async picksTheNameOf(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.clickNameOptionByText(name);
  }

  async picksThePhotoOf(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.clickPhotoOptionForContact(await this.driver.findContactIdByName(name));
  }

  async picksAPhotoOtherThan(nameParam: string): Promise<void> {
    const name = this.ctx.alias(parseParam(nameParam, 'name'));
    await this.driver.clickPhotoOptionOtherThan(await this.driver.findContactIdByName(name));
  }

  async ratesRecall(ratingParam: string): Promise<void> {
    await this.driver.clickRatingButton(parseParam(ratingParam, 'rating'));
  }

  async dismissesRatingExplainer(): Promise<void> {
    await this.driver.clickDismissExplainer();
  }

  async opensRatingExplanation(): Promise<void> {
    await this.driver.clickRatingHelp();
  }

  async skipsTheQuiz(): Promise<void> {
    await this.driver.clickSkipQuiz();
  }

  async finishesTheSession(): Promise<void> {
    await this.driver.clickFinishSession();
  }

  // ── Upcoming reviews ─────────────────────────────────────────────────────────

  async opensUpcomingReviews(): Promise<void> {
    await this.driver.navigateToUpcomingReviews();
  }

  async opensTheDayAtPosition(positionParam: string): Promise<void> {
    await this.driver.clickUpcomingDayAtPosition(parseInt(parseParam(positionParam, 'position'), 10));
  }

  // ── Review reminders ─────────────────────────────────────────────────────────

  async opensReminderSettings(): Promise<void> {
    await this.driver.navigateToReminderSettings();
  }

  async enablesReminders(): Promise<void> {
    await this.driver.setRemindersEnabled(true);
  }

  async disablesReminders(): Promise<void> {
    await this.driver.setRemindersEnabled(false);
  }

  /** Times are wall-clock strings the user types, never aliased. */
  async setsReminderTime(timeParam: string): Promise<void> {
    await this.driver.setReminderTime(parseParam(timeParam, 'time'));
  }

  async turnsOffEveryReminderChannel(): Promise<void> {
    await this.driver.setChannelEnabled('in-app', false);
  }

  async turnsOnTheInAppReminderChannel(): Promise<void> {
    await this.driver.setChannelEnabled('in-app', true);
  }

  /**
   * Runs the reminder sweep the schedule would otherwise run unattended. Same code
   * path, driven on demand so a spec can assert on the outcome.
   */
  async theReminderSweepRuns(): Promise<void> {
    await this.driver.runReminderSweepViaApi();
  }

  async opensTheReviewReminder(): Promise<void> {
    await this.driver.clickReviewReminder();
  }

  async startsQuizFromBanner(): Promise<void> {
    await this.driver.clickStartQuizBanner();
  }

  async startsAddPersonFlowFromShortcut(): Promise<void> {
    await this.driver.clickAddPersonShortcut();
  }

  async startsAddPersonFlowFromEmptyState(): Promise<void> {
    await this.driver.clickAddFirstPersonLink();
  }

  async launchesTeachModeBanner(): Promise<void> {
    await this.driver.clickTeachModeBanner();
  }

  async opensTutorialFromDashboard(): Promise<void> {
    await this.driver.clickTutorialBanner();
  }

  async navigatesToPalacesFromDashboard(): Promise<void> {
    await this.driver.clickPalacesBanner();
  }

  async activatesAdminLink(): Promise<void> {
    await this.driver.clickAdminLink();
  }

  async activatesMeetingsLink(): Promise<void> {
    await this.driver.clickMeetingsLink();
  }
}
