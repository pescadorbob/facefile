import { Injectable } from '@angular/core';

/**
 * Minimal shape of the browser's Web Speech API — not part of TypeScript's DOM lib,
 * so only the handful of members this service actually touches are declared here.
 */
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function speechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Wraps the browser's speech recognition so the rest of the app never touches `window` directly. */
@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  readonly isSupported = speechRecognitionCtor() !== null;

  /**
   * Listens for a single spoken utterance and resolves with the best transcript heard,
   * or `null` on error, silence, or when the browser has no speech recognition at all.
   */
  listenOnce(): Promise<string | null> {
    const Ctor = speechRecognitionCtor();
    if (!Ctor) return Promise.resolve(null);

    return new Promise(resolve => {
      const recognition = new Ctor();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let settled = false;
      const finish = (value: string | null) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      recognition.onresult = event => finish(event.results?.[0]?.[0]?.transcript ?? null);
      recognition.onerror = () => finish(null);
      recognition.onend = () => finish(null);

      recognition.start();
    });
  }
}
