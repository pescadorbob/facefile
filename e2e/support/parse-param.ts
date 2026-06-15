export function parseParam(param: string, key: string): string {
  const match = param.match(new RegExp(`^${key}:\\s*(.+)$`));
  if (!match) {
    throw new Error(`Expected param format "${key}: <value>", got: "${param}"`);
  }
  return match[1].trim();
}
