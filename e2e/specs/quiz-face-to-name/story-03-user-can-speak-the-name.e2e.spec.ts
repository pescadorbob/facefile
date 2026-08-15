import { confirmThat, test } from '../../fixtures/facefile';

test.describe('S-4.1.3 User Can Speak the Name Instead of Typing It', () => {
  test('the user can choose to answer by speaking', async ({ facefile }) => {
    // GIVEN a Face → Name session about to start
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');

    // WHEN the user selects "Say the name" as the answering method
    await facefile.choosesAnswerFormat('format: spoken');
    await facefile.startsPracticeAllSession();

    // THEN the session begins with a control for speaking the answer, not a typed
    // field or multiple-choice list
    await confirmThat(facefile).seesSpeakingControl();
  });

  test('the spoken answer is shown back as text', async ({ facefile }) => {
    // GIVEN a spoken-answering Face → Name question about Priya
    await facefile.theMicrophoneWillHear('transcript: Pria');
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: spoken');
    await facefile.startsPracticeAllSession();

    // WHEN the user speaks and their words are heard
    await facefile.speaksTheAnswer();

    // THEN what they said is displayed as text on the card
    await confirmThat(facefile).seesWhatWasHeard('text: Pria');
  });

  test('a close but imperfect spoken answer is still accepted', async ({ facefile }) => {
    // GIVEN a spoken-answering Face → Name question about Priya
    await facefile.theMicrophoneWillHearACloseVariantOf('name: Priya');
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: spoken');
    await facefile.startsPracticeAllSession();

    // WHEN what is heard is close to "Priya" but not identical
    await facefile.speaksTheAnswer();

    // THEN the answer is accepted as correctly recalled
    await confirmThat(facefile).seesPositiveConfirmation();
    await confirmThat(facefile).seesRevealedName('name: Priya');
  });

  test('a spoken answer that misses badly is marked as not recalled', async ({ facefile }) => {
    // GIVEN a spoken-answering Face → Name question about Priya
    await facefile.theMicrophoneWillHear('transcript: Someone Else Entirely');
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');
    await facefile.opensTheQuiz();
    await facefile.choosesSessionType('type: face-to-name');
    await facefile.choosesAnswerFormat('format: spoken');
    await facefile.startsPracticeAllSession();

    // WHEN what is heard is an unrelated name
    await facefile.speaksTheAnswer();

    // THEN the answer is marked as not recalled, and the reveal still shows Priya's
    // name as usual
    await confirmThat(facefile).seesAnswerMarkedIncorrect();
    await confirmThat(facefile).seesRevealedName('name: Priya');
  });

  test('voice answering is not offered when the browser cannot listen', async ({ facefile }) => {
    // GIVEN a browser with no speech recognition support
    await facefile.hasNoVoiceInputSupport();
    await facefile.signsInAsTestUser();
    await facefile.opensTheDashboard();
    await facefile.registersFullyEncodedContact('name: Priya');

    // WHEN the user reaches the session-type screen
    await facefile.opensTheQuiz();

    // THEN "Say the name" is not offered as an answering method
    await confirmThat(facefile).seesNoSpokenAnsweringOption();
  });
});
