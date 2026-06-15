import { createHash } from 'crypto';

function shortHash(seed: string): string {
  return createHash('sha256').update(seed).digest('hex').slice(0, 4);
}

export class DslContext {
  private readonly hash: string;
  private readonly aliasCache = new Map<string, string>();
  private readonly counters = new Map<string, number>();

  constructor(seed?: string) {
    this.hash = shortHash(seed ?? String(Date.now()));
  }

  alias(value: string): string {
    if (this.aliasCache.has(value)) return this.aliasCache.get(value)!;
    const count = (this.counters.get(value) ?? 0) + 1;
    this.counters.set(value, count);
    const aliased = `${value}${count}${this.hash}`;
    this.aliasCache.set(value, aliased);
    return aliased;
  }

  aliasEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${this.alias(local)}@${domain}`;
  }

  interpolate(template: string): string {
    return template.replace(/\$\{(\w+)\}/g, (_, key) => {
      return this.aliasCache.get(key) ?? key;
    });
  }
}
