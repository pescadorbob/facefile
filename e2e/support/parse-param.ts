/** Comma-separated variant, for params naming an ordered set — e.g. "loci: Doorstep, Coat rack". */
export function parseListParam(param: string, key: string): string[] {
  return parseParam(param, key)
    .split(',')
    .map(value => value.trim())
    .filter(value => value.length > 0);
}

export function parseParam(param: string, key: string): string {
  const match = param.match(new RegExp(`^${key}:\\s*(.+)$`));
  if (!match) {
    throw new Error(`Expected param format "${key}: <value>", got: "${param}"`);
  }
  return match[1].trim();
}
