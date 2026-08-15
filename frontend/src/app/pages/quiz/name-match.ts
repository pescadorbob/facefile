/** Case/whitespace-insensitive normalisation shared by every way of grading a name guess. */
export function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Levenshtein edit distance between two strings. */
function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dist: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) dist[i][0] = i;
  for (let j = 0; j < cols; j++) dist[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dist[i][j] = Math.min(dist[i - 1][j] + 1, dist[i][j - 1] + 1, dist[i - 1][j - 1] + cost);
    }
  }
  return dist[rows - 1][cols - 1];
}

/** 1 for identical (after normalising) strings, trending toward 0 the less they share. */
export function nameSimilarity(a: string, b: string): number {
  const left = normalise(a);
  const right = normalise(b);
  if (left === right) return 1;
  const longest = Math.max(left.length, right.length);
  if (longest === 0) return 1;
  return 1 - levenshtein(left, right) / longest;
}

/** A guess counts as a match once it's close enough to the name — not necessarily identical. */
export function namesMatch(guess: string, name: string, threshold = 0.7): boolean {
  return nameSimilarity(guess, name) >= threshold;
}
