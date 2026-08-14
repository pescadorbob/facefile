import { confirmThat, test } from '../../fixtures/facefile';

/**
 * One test per scenario in:
 * docs/capabilities/cap-03-creating-and-refining-name-images/functions/fn-02-locus-assignment/
 *   epics/ep-3-3-palace-and-locus-selection/stories/story-01-user-creates-a-named-palace.md
 */

test.describe('S-3.3.1 User Creates a Named Palace', () => {
  test('palaces section offers a new-palace action', async ({ facefile }) => {
    // GIVEN the user is in the palaces section
    await facefile.signsInAsTestUser();
    await facefile.opensThePalaces();

    // THEN a new-palace action is offered
    await confirmThat(facefile).seesNewPalaceOption();
  });

  test('creating a palace adds it to the palace list', async ({ facefile }) => {
    // GIVEN the user has opened the new-palace form
    await facefile.signsInAsTestUser();
    await facefile.opensThePalaces();
    await facefile.opensNewPalacePrompt();

    // WHEN the user enters a name and submits
    await facefile.createsPalace('palace: Weekly Meeting Room');

    // THEN the palace appears in the list, with no reload of the page
    await confirmThat(facefile).seesPalaceInList('palace: Weekly Meeting Room');
  });

  test('a palace can be created with its loci named up front', async ({ facefile }) => {
    // GIVEN the user has opened the new-palace form
    await facefile.signsInAsTestUser();
    await facefile.opensThePalaces();
    await facefile.opensNewPalacePrompt();

    // WHEN the user names the palace together with three loci and submits
    await facefile.createsPalaceWithLoci(
      'palace: My Office',
      'loci: Front doorstep, Coat rack, Kitchen table',
    );

    // THEN the palace is created holding those three loci
    await confirmThat(facefile).seesPalaceInList('palace: My Office');
    await confirmThat(facefile).seesPalaceHoldsLoci('palace: My Office', 'count: 3');
  });

  test('loci keep the order they were entered', async ({ facefile }) => {
    // GIVEN the user has created a palace with three loci
    await facefile.signsInAsTestUser();
    await facefile.opensThePalaces();
    await facefile.opensNewPalacePrompt();
    await facefile.createsPalaceWithLoci(
      'palace: My Office',
      'loci: Front doorstep, Coat rack, Kitchen table',
    );

    // THEN they are listed in that same order, not sorted
    await confirmThat(facefile).seesPalaceLociInOrder(
      'palace: My Office',
      'loci: Front doorstep, Coat rack, Kitchen table',
    );
  });

  test('naming loci is optional', async ({ facefile }) => {
    // GIVEN the user has opened the new-palace form
    await facefile.signsInAsTestUser();
    await facefile.opensThePalaces();
    await facefile.opensNewPalacePrompt();

    // WHEN the user submits a name without naming any loci
    await facefile.createsPalace('palace: My Office');

    // THEN the palace is created and listed as holding none
    await confirmThat(facefile).seesPalaceInList('palace: My Office');
    await confirmThat(facefile).seesPalaceHoldsNoLoci('palace: My Office');
  });

  test('a new palace can be used for placement straight away', async ({ facefile }) => {
    // GIVEN the user has created a palace
    await facefile.signsInAsTestUser();
    await facefile.opensThePalaces();
    await facefile.opensNewPalacePrompt();
    await facefile.createsPalace('palace: Weekly Meeting Room');

    // WHEN the user goes to place a contact into a locus
    await facefile.opensGuidedWizard();
    await facefile.completesStep1('name: Marcus');

    // THEN the new palace is offered as a placement option
    await confirmThat(facefile).seesPalaceOfferedForPlacement('palace: Weekly Meeting Room');
  });

  test('a blank name blocks creation', async ({ facefile }) => {
    // GIVEN the user has opened the new-palace form
    await facefile.signsInAsTestUser();
    await facefile.opensThePalaces();
    await facefile.opensNewPalacePrompt();

    // WHEN the user submits it with no name
    await facefile.attemptsToCreatePalaceWithoutName();

    // THEN an inline error appears and the form stays open, with no palace created
    await confirmThat(facefile).seesNameTooShortErrorOnPalaceForm();
    await confirmThat(facefile).seesNewPalacePrompt();
  });

  test('a one-character name blocks creation', async ({ facefile }) => {
    // GIVEN the user has opened the new-palace form
    await facefile.signsInAsTestUser();
    await facefile.opensThePalaces();
    await facefile.opensNewPalacePrompt();

    // WHEN the user submits a name one character short of the minimum
    await facefile.attemptsToCreatePalaceNamed('palace: A');

    // THEN an inline error appears and the form stays open, with no palace created
    await confirmThat(facefile).seesNameTooShortErrorOnPalaceForm();
    await confirmThat(facefile).seesNewPalacePrompt();
  });

  test('a two-character name is accepted', async ({ facefile }) => {
    // GIVEN the user has opened the new-palace form
    await facefile.signsInAsTestUser();
    await facefile.opensThePalaces();
    await facefile.opensNewPalacePrompt();

    // WHEN the user submits a name of exactly the minimum length
    await facefile.createsPalaceNamedExactly('palace: Ox');

    // THEN the palace is created and appears in the list
    await confirmThat(facefile).seesPalaceNamedExactlyInList('palace: Ox');
  });

  test('a duplicate name blocks creation', async ({ facefile }) => {
    // GIVEN the user already has a palace with that name
    await facefile.signsInAsTestUser();
    await facefile.registersPalace('palace: My Office');
    await facefile.opensThePalaces();
    await facefile.opensNewPalacePrompt();

    // WHEN the user submits the form with the same name
    await facefile.attemptsToCreatePalaceWithDuplicateName('palace: My Office');

    // THEN an inline error appears and the form stays open, with no duplicate created
    await confirmThat(facefile).seesDuplicateNameErrorOnPalaceForm();
    await confirmThat(facefile).seesNewPalacePrompt();
  });

  test('abandoning the form creates nothing', async ({ facefile }) => {
    // GIVEN the user has opened the new-palace form and named a palace in it
    await facefile.signsInAsTestUser();
    await facefile.opensThePalaces();
    await facefile.opensNewPalacePrompt();
    await facefile.entersPalaceName('palace: Weekly Meeting Room');

    // WHEN the user cancels it
    await facefile.abandonsNewPalacePrompt();

    // THEN the palace list is shown again with nothing created
    await confirmThat(facefile).doesNotSeeNewPalacePrompt();
    await confirmThat(facefile).doesNotSeePalaceInList('palace: Weekly Meeting Room');
  });
});
