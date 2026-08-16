import { expect } from '@playwright/test';
import { parseListParam, parseParam } from '../support/parse-param';
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

  /**
   * The picker finished loading its profiles from the backend, rather than
   * falling back to "Unable to load profiles". Says nothing about *which*
   * profiles came back, so it holds against any environment's data.
   */
  async seesProfileListLoaded(): Promise<void> {
    await this.dsl.driver.expectProfileListSettled();
  }

  /** No call the page made to the backend was blocked or dropped by the browser. */
  async seesNoFailedBackendCalls(): Promise<void> {
    await this.dsl.driver.expectNoFailedXhrRequests();
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

  // ── Memory palaces ───────────────────────────────────────────────────────────

  async seesNewPalaceOption(): Promise<void> {
    await this.dsl.driver.expectNewPalaceActionVisible();
  }

  async seesPalaceInList(palaceParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(palaceParam, 'palace'));
    await this.dsl.driver.expectPalaceRowVisible(name);
  }

  /** Mirrors createsPalaceNamedExactly — no alias, so the name asserted is the name typed. */
  async seesPalaceNamedExactlyInList(palaceParam: string): Promise<void> {
    const name = parseParam(palaceParam, 'palace');
    await this.dsl.driver.expectPalaceRowVisible(name);
  }

  async doesNotSeePalaceInList(palaceParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(palaceParam, 'palace'));
    await this.dsl.driver.expectPalaceRowNotVisible(name);
  }

  async seesPalaceHoldsNoLoci(palaceParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(palaceParam, 'palace'));
    await this.dsl.driver.expectPalaceRowLociCount(name, 0);
  }

  async seesPalaceHoldsLoci(palaceParam: string, countParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(palaceParam, 'palace'));
    const count = parseInt(parseParam(countParam, 'count'), 10);
    await this.dsl.driver.expectPalaceRowLociCount(name, count);
  }

  /** Fails on a wrong order as well as a wrong set — locus order is the walking order. */
  async seesPalaceLociInOrder(palaceParam: string, lociParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(palaceParam, 'palace'));
    await this.dsl.driver.expectPalaceRowLociInOrder(name, parseListParam(lociParam, 'loci'));
  }

  /**
   * The placement step of the add-person flow offers the palace. Unlike seesPalaceInWizard
   * (which names a seeded palace verbatim) this one aliases, because the palace under test
   * was created by this run.
   */
  async seesPalaceOfferedForPlacement(palaceParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(palaceParam, 'palace'));
    await this.dsl.driver.expectPalaceButtonVisible(name);
  }

  async seesNewPalacePrompt(): Promise<void> {
    await this.dsl.driver.expectPalaceNameFieldVisible();
  }

  async seesPalaceGuidanceForAddPerson(): Promise<void> {
    await this.dsl.driver.expectPalaceGuidanceBannerVisible();
  }

  async doesNotSeeNewPalacePrompt(): Promise<void> {
    await this.dsl.driver.expectPalaceNameFieldNotVisible();
  }

  async seesNameTooShortErrorOnPalaceForm(): Promise<void> {
    await this.dsl.driver.expectPalaceFormErrorContains('at least 2 characters');
  }

  async seesDuplicateNameErrorOnPalaceForm(): Promise<void> {
    await this.dsl.driver.expectPalaceFormErrorContains('already');
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

  /**
   * The same assertion, but allowed the dashboard's own refresh interval to get there —
   * for cards that fall due (or get cleared) while the user is sitting on the page and
   * never reloads it (S-4.6.1).
   */
  async seesCardsDueCountEventually(countParam: string): Promise<void> {
    const count = parseInt(parseParam(countParam, 'count'), 10);
    await this.dsl.driver.expectCardsDueCountEventually(count);
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

  async seesCaughtUpMessage(): Promise<void> {
    await this.dsl.driver.expectCaughtUpMessageVisible();
  }

  async doesNotSeeCaughtUpMessage(): Promise<void> {
    await this.dsl.driver.expectCaughtUpMessageNotVisible();
  }

  async seesNextDueDateOnDashboard(): Promise<void> {
    await this.dsl.driver.expectNextDueDateVisible();
  }

  // ── Edit person (S-2.6) ─────────────────────────────────────────────────────

  async isOnEditPersonScreen(): Promise<void> {
    await this.dsl.driver.expectOnEditPersonPage();
  }

  async seesEditFormPrefilledWith(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectEditNameFieldValue(name);
  }

  async seesPhotoPreviewInEditForm(): Promise<void> {
    await this.dsl.driver.expectEditPhotoPreviewVisible();
  }

  async seesPhotoPlaceholderInEditForm(): Promise<void> {
    await this.dsl.driver.expectEditPhotoPlaceholderVisible();
  }

  async doesNotSeeRemovePhotoOption(): Promise<void> {
    await this.dsl.driver.expectRemovePhotoActionNotVisible();
  }

  async seesNameRequiredErrorOnEditForm(): Promise<void> {
    await this.dsl.driver.expectEditPersonNameRequiredErrorVisible();
  }

  async seesEditFormErrorContaining(textParam: string): Promise<void> {
    const text = parseParam(textParam, 'text');
    await this.dsl.driver.expectEditPersonFormErrorContains(text);
  }

  async seesNoPalaceOrLocusControlsInEditForm(): Promise<void> {
    await this.dsl.driver.expectTextAbsentFromPage('Palace');
    await this.dsl.driver.expectTextAbsentFromPage('Locus');
  }

  /** Reads the contact straight from the API — the durable record, not the screen. */
  async seesContactNameUnchanged(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    const contact = await this.dsl.driver.readContactViaApi(await this.dsl.driver.findContactIdByName(name));
    expect(contact.name).toBe(name);
  }

  /** Unaliased: proves the exact (trimmed) characters were saved, by finding the contact
   * under precisely that string — a lookup that fails outright if trimming didn't happen. */
  async seesContactSavedWithExactName(nameParam: string): Promise<void> {
    const name = parseParam(nameParam, 'name');
    await this.dsl.driver.findContactIdByName(name);
  }

  /** Pass the same param for both when the edit under test doesn't touch the name (e.g. a photo edit). */
  async seesContactPlacementUnchanged(originalNameParam: string, currentNameParam: string): Promise<void> {
    const originalName = this.dsl.ctx.alias(parseParam(originalNameParam, 'name'));
    const currentName = this.dsl.ctx.alias(parseParam(currentNameParam, 'name'));
    await this.dsl.driver.expectContactPlacementUnchanged(originalName, currentName);
  }

  // ── Quiz sessions ────────────────────────────────────────────────────────────

  async seesDueContactCount(countParam: string): Promise<void> {
    await this.dsl.driver.expectDueCountText(parseInt(parseParam(countParam, 'count'), 10));
  }

  async seesReviewDueOption(): Promise<void> {
    await this.dsl.driver.expectReviewDueButtonVisible();
  }

  async doesNotSeeReviewDueOption(): Promise<void> {
    await this.dsl.driver.expectReviewDueButtonNotVisible();
  }

  async seesPracticeAllOption(): Promise<void> {
    await this.dsl.driver.expectPracticeAllButtonVisible();
  }

  async seesNextDueDateWithCountdown(): Promise<void> {
    await this.dsl.driver.expectNextDuePanelVisible();
  }

  async seesSessionTypeSelected(typeParam: string): Promise<void> {
    await this.dsl.driver.expectModeSelected(parseParam(typeParam, 'type'));
  }

  async seesQuizDirection(directionParam: string): Promise<void> {
    const direction = parseParam(directionParam, 'direction');
    await this.dsl.driver.expectDirectionLabel(direction === 'face-to-name' ? 'Face → Name' : 'Name → Face');
  }

  /** In a mixed session the direction of any given card is not knowable in advance. */
  async seesAnyQuizDirection(): Promise<void> {
    await this.dsl.driver.expectDirectionLabelPresent();
  }

  /** The photo is on the card and the name appears nowhere on it (S-4.1.1). */
  async seesPhotoWithNoNameHint(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectPhotoPromptVisible();
    await this.dsl.driver.expectNamePromptNotVisible();
    await this.dsl.driver.expectTextAbsentFromPage(name);
  }

  async seesNamePrompt(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectNamePromptContains(name);
  }

  async seesPhotoOptions(countParam: string): Promise<void> {
    await this.dsl.driver.expectPhotoOptionCount(parseInt(parseParam(countParam, 'count'), 10));
  }

  async seesNameOptions(countParam: string): Promise<void> {
    await this.dsl.driver.expectNameOptionCount(parseInt(parseParam(countParam, 'count'), 10));
  }

  async seesNameEntryField(): Promise<void> {
    await this.dsl.driver.expectAnswerInputVisible();
  }

  /** A control for speaking the answer instead of a typed field or choice list (S-4.1.3). */
  async seesSpeakingControl(): Promise<void> {
    await this.dsl.driver.expectSpeakAnswerButtonVisible();
  }

  async seesNoSpokenAnsweringOption(): Promise<void> {
    await this.dsl.driver.expectAnswerFormatOptionHidden('spoken');
  }

  async seesWhatWasHeard(textParam: string): Promise<void> {
    await this.dsl.driver.expectSpokenTranscript(parseParam(textParam, 'text'));
  }

  async seesRevealedName(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectRevealedName(name);
  }

  async seesPositiveConfirmation(): Promise<void> {
    await this.dsl.driver.expectAnswerMarkedCorrect(true);
  }

  async seesAnswerMarkedIncorrect(): Promise<void> {
    await this.dsl.driver.expectAnswerMarkedCorrect(false);
  }

  /** The reveal corrects without scolding (S-4.1.2). */
  async seesNoNegativeLanguage(): Promise<void> {
    await this.dsl.driver.expectFeedbackFreeOfWords(['wrong', 'incorrect', 'failed', 'no.']);
  }

  async seesEncodingCuesOnReveal(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectRevealNameImageContains(`marquee tent for ${name}`);
    await this.dsl.driver.expectRevealAssociationSceneContains('coat rack');
  }

  async seesCorrectPhotoHighlighted(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectPhotoOptionMarkedCorrect(await this.dsl.driver.findContactIdByName(name));
  }

  async seesAllFourRatings(): Promise<void> {
    await this.dsl.driver.expectRatingButtonsVisible();
  }

  async seesRatingDescription(ratingParam: string, textParam: string): Promise<void> {
    await this.dsl.driver.expectRatingButtonContains(parseParam(ratingParam, 'rating'), parseParam(textParam, 'text'));
  }

  async seesRatingExplanation(): Promise<void> {
    await this.dsl.driver.expectRatingExplainerVisible();
  }

  async doesNotSeeRatingExplanation(): Promise<void> {
    await this.dsl.driver.expectRatingExplainerNotVisible();
  }

  async seesRatingHelpOption(): Promise<void> {
    await this.dsl.driver.expectRatingHelpVisible();
  }

  async isOnQuestion(currentParam: string, totalParam: string): Promise<void> {
    await this.dsl.driver.expectQuestionProgress(
      parseInt(parseParam(currentParam, 'question'), 10),
      parseInt(parseParam(totalParam, 'of'), 10),
    );
  }

  async seesSessionSummary(): Promise<void> {
    await this.dsl.driver.expectSessionSummaryVisible();
  }

  async seesSummaryCountFor(directionParam: string, countParam: string): Promise<void> {
    await this.dsl.driver.expectSummaryDirectionCount(
      parseParam(directionParam, 'direction'),
      parseInt(parseParam(countParam, 'count'), 10),
    );
  }

  async seesSummaryRows(countParam: string): Promise<void> {
    await this.dsl.driver.expectSummaryRowCount(parseInt(parseParam(countParam, 'count'), 10));
  }

  async seesUpdatedNextReviewFor(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectSummaryRowForContact(name);
    await this.dsl.driver.expectSummaryRowHasNextReview(name);
  }

  async seesSkipOption(): Promise<void> {
    await this.dsl.driver.expectSkipOptionVisible();
  }

  async doesNotSeeSkipOption(): Promise<void> {
    await this.dsl.driver.expectSkipOptionNotVisible();
  }

  async seesNothingToQuiz(): Promise<void> {
    await this.dsl.driver.expectQuizEmptyState();
  }

  /**
   * The durable record behind the rating (S-4.4.1, S-4.5.2). Polled rather than read
   * once: the history is served by an eventually-consistent query, so a read issued
   * immediately after the answer can legitimately not see it yet.
   */
  async seesReviewHistoryFor(nameParam: string, ratingParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    const rating = parseParam(ratingParam, 'rating');
    const contactId = await this.dsl.driver.findContactIdByName(name);
    await expect
      .poll(async () => (await this.dsl.driver.readReviewHistory(contactId)).map(entry => entry.rating))
      .toContain(rating);
    const history = await this.dsl.driver.readReviewHistory(contactId);
    expect(history.every(entry => Boolean(entry.answeredAt))).toBe(true);
  }

  async seesLapseLoggedFor(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    const contactId = await this.dsl.driver.findContactIdByName(name);
    await expect
      .poll(async () => (await this.dsl.driver.readReviewHistory(contactId)).some(entry => entry.lapse))
      .toBe(true);
  }

  /** Nothing was answered for this contact at all — a skipped prompt records no attempt. */
  async seesReviewHistoryIsEmptyFor(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    const history = await this.dsl.driver.readReviewHistory(await this.dsl.driver.findContactIdByName(name));
    expect(history).toEqual([]);
  }

  async seesNoLapseLoggedFor(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    const history = await this.dsl.driver.readReviewHistory(await this.dsl.driver.findContactIdByName(name));
    expect(history.some(entry => entry.lapse)).toBe(false);
  }

  async seesDueCountSettleAt(countParam: string): Promise<void> {
    const expected = parseInt(parseParam(countParam, 'count'), 10);
    await expect.poll(() => this.dsl.driver.readDueCountViaApi()).toBe(expected);
  }

  // ── Upcoming reviews ─────────────────────────────────────────────────────────

  async isOnUpcomingScreen(): Promise<void> {
    await this.dsl.driver.expectOnUpcomingPage();
  }

  async seesUpcomingDays(countParam: string): Promise<void> {
    await this.dsl.driver.expectUpcomingDayCount(parseInt(parseParam(countParam, 'count'), 10));
  }

  async seesContactInUpcoming(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectUpcomingListContains(name);
  }

  async doesNotSeeContactInUpcoming(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectUpcomingListDoesNotContain(name);
  }

  async seesDayHoldsContacts(countParam: string): Promise<void> {
    await this.dsl.driver.expectUpcomingListContains(`${parseParam(countParam, 'count')} contact`);
  }

  async seesContactListedForThatDay(nameParam: string): Promise<void> {
    const name = this.dsl.ctx.alias(parseParam(nameParam, 'name'));
    await this.dsl.driver.expectUpcomingDayContactRow(name);
  }

  async seesNothingUpcoming(): Promise<void> {
    await this.dsl.driver.expectUpcomingEmptyState();
  }

  // ── Review reminders ─────────────────────────────────────────────────────────

  async isOnReminderSettingsScreen(): Promise<void> {
    await this.dsl.driver.expectOnReminderSettingsPage();
  }

  async seesRemindersEnabled(): Promise<void> {
    await this.dsl.driver.expectRemindersToggleState(true);
  }

  async seesRemindersDisabled(): Promise<void> {
    await this.dsl.driver.expectRemindersToggleState(false);
  }

  async seesReminderTime(timeParam: string): Promise<void> {
    await this.dsl.driver.expectReminderTimeValue(parseParam(timeParam, 'time'));
  }

  /** The zone the chosen time is read in — named on screen, whatever it happens to be. */
  async seesReminderTimezone(): Promise<void> {
    await this.dsl.driver.expectReminderTimezoneShown();
  }

  async seesReviewReminder(): Promise<void> {
    await this.dsl.driver.expectReviewReminderVisible();
  }

  async doesNotSeeReviewReminder(): Promise<void> {
    await this.dsl.driver.expectReviewReminderNotVisible();
  }

  async seesReminderStating(countParam: string): Promise<void> {
    const count = parseParam(countParam, 'count');
    await this.dsl.driver.expectReviewReminderContains(count);
  }

  async receivedNoReminder(): Promise<void> {
    expect(await this.dsl.driver.readNotificationsViaApi()).toEqual([]);
  }

  async receivedAReminderLinkingToTheReviewSession(): Promise<void> {
    const notifications = await this.dsl.driver.readNotificationsViaApi();
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].link).toContain('/quiz');
  }

  async receivedExactlyOneReminder(): Promise<void> {
    expect(await this.dsl.driver.readNotificationsViaApi()).toHaveLength(1);
  }
}

export function confirmThat(facefile: FacefileDsl): FacefileDslAssert {
  return new FacefileDslAssert(facefile);
}
