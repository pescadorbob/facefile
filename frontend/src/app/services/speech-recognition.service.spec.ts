import { afterEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SpeechRecognitionService } from './speech-recognition.service';

type Handlers = {
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

/** A stand-in for the browser's SpeechRecognition constructor, driven manually per test. */
class FakeSpeechRecognition {
  static instances: (FakeSpeechRecognition & Handlers)[] = [];
  lang = '';
  interimResults = false;
  maxAlternatives = 1;
  onresult: Handlers['onresult'] = null;
  onerror: Handlers['onerror'] = null;
  onend: Handlers['onend'] = null;
  started = false;

  constructor() {
    FakeSpeechRecognition.instances.push(this);
  }

  start() {
    this.started = true;
  }

  stop() {}
}

function install(): void {
  FakeSpeechRecognition.instances = [];
  (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = FakeSpeechRecognition;
}

function uninstall(): void {
  delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
  delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
}

describe('SpeechRecognitionService', () => {
  afterEach(() => uninstall());

  it('reports unsupported when the browser has no speech recognition constructor', () => {
    uninstall();
    const service = TestBed.inject(SpeechRecognitionService);

    expect(service.isSupported).toBe(false);
  });

  it('reports supported when the browser exposes SpeechRecognition', () => {
    install();
    const service = TestBed.inject(SpeechRecognitionService);

    expect(service.isSupported).toBe(true);
  });

  it('resolves with the heard transcript once recognition reports a result', async () => {
    install();
    const service = TestBed.inject(SpeechRecognitionService);

    const pending = service.listenOnce();
    const instance = FakeSpeechRecognition.instances[0];
    expect(instance.started).toBe(true);
    instance.onresult?.({ results: [[{ transcript: 'Priya' }]] });

    expect(await pending).toBe('Priya');
  });

  it('resolves null when recognition errors out', async () => {
    install();
    const service = TestBed.inject(SpeechRecognitionService);

    const pending = service.listenOnce();
    FakeSpeechRecognition.instances[0].onerror?.();

    expect(await pending).toBeNull();
  });

  it('resolves null immediately when the browser cannot listen at all', async () => {
    uninstall();
    const service = TestBed.inject(SpeechRecognitionService);

    expect(await service.listenOnce()).toBeNull();
  });
});
