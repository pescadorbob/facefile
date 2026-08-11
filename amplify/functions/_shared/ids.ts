import { randomUUID } from 'crypto';

/**
 * DynamoDB has no autoincrement primary key, so ids move from Prisma's
 * integer autoincrement to UUID strings — the idiomatic DynamoDB approach
 * (an atomic-counter-item workaround would add a write bottleneck for no
 * benefit here). Frontend types change from `id: number` to `id: string`.
 */
export function newId(): string {
  return randomUUID();
}
