import { describe, expect, it } from 'vitest';
import { namesMatch, nameSimilarity } from './name-match';

describe('nameSimilarity', () => {
  it('is 1 for an identical name', () => {
    expect(nameSimilarity('Priya', 'Priya')).toBe(1);
  });

  it('ignores case and surrounding whitespace', () => {
    expect(nameSimilarity('  priya ', 'Priya')).toBe(1);
  });

  it('is lower the more the guess and the name diverge', () => {
    const close = nameSimilarity('Pria', 'Priya');
    const far = nameSimilarity('Somebody Else', 'Priya');
    expect(close).toBeGreaterThan(far);
  });
});

describe('namesMatch', () => {
  it('accepts an exact match', () => {
    expect(namesMatch('Priya', 'Priya')).toBe(true);
  });

  it('accepts a close but imperfect spoken guess (S-4.1.3)', () => {
    expect(namesMatch('Pria', 'Priya')).toBe(true);
  });

  it('rejects a guess that is not a close match', () => {
    expect(namesMatch('Somebody Else', 'Priya')).toBe(false);
  });

  it('is stricter at a higher threshold', () => {
    expect(namesMatch('Pria', 'Priya', 0.9)).toBe(false);
  });
});
