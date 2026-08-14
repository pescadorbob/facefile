import { confirmThat, test, type FacefileDsl } from '../../fixtures/facefile';

/** Every scenario here starts one Face → Name question about a fully encoded contact. */
async function aFaceFirstQuestionAbout(facefile: FacefileDsl, name: string): Promise<void> {
  await facefile.signsInAsTestUser();
  await facefile.opensTheDashboard();
  await facefile.registersFullyEncodedContact(`name: ${name}`);
  await facefile.opensTheQuiz();
  await facefile.choosesSessionType('type: face-to-name');
  await facefile.choosesAnswerFormat('format: typed');
  await facefile.startsPracticeAllSession();
}

test.describe('S-4.1.2 User Sees Correct Name After Answering', () => {
  test('the reveal shows the full name after a correct answer', async ({ facefile }) => {
    // GIVEN a Face → Name question about Priya
    await aFaceFirstQuestionAbout(facefile, 'Priya');

    // WHEN the user answers correctly
    await facefile.answersWithTheName('name: Priya');

    // THEN the reveal names her
    await confirmThat(facefile).seesRevealedName('name: Priya');
  });

  test('the reveal shows the full name after a wrong answer too', async ({ facefile }) => {
    // GIVEN a Face → Name question about Priya
    await aFaceFirstQuestionAbout(facefile, 'Priya');

    // WHEN the user answers with the wrong name
    await facefile.answersWithAName('name: Someone Else Entirely');

    // THEN the reveal still names her
    await confirmThat(facefile).seesRevealedName('name: Priya');
  });

  test('a correct answer is confirmed alongside the name', async ({ facefile }) => {
    // GIVEN a Face → Name question about Priya
    await aFaceFirstQuestionAbout(facefile, 'Priya');

    // WHEN the user answers correctly
    await facefile.answersWithTheName('name: Priya');

    // THEN the reveal confirms the recall as well as showing the name
    await confirmThat(facefile).seesPositiveConfirmation();
    await confirmThat(facefile).seesRevealedName('name: Priya');
  });

  test('a wrong answer is corrected without negative language', async ({ facefile }) => {
    // GIVEN a Face → Name question about Priya
    await aFaceFirstQuestionAbout(facefile, 'Priya');

    // WHEN the user answers with the wrong name
    await facefile.answersWithAName('name: Someone Else Entirely');

    // THEN the reveal corrects them without calling the attempt wrong or failed
    await confirmThat(facefile).seesAnswerMarkedIncorrect();
    await confirmThat(facefile).seesNoNegativeLanguage();
  });

  test('the name image and association scene are shown for reinforcement', async ({ facefile }) => {
    // GIVEN a Face → Name question about a contact with both cues recorded
    await aFaceFirstQuestionAbout(facefile, 'Priya');

    // WHEN the user answers
    await facefile.answersWithTheName('name: Priya');

    // THEN the encoding cues are shown back alongside the name
    await confirmThat(facefile).seesEncodingCuesOnReveal('name: Priya');
  });
});
