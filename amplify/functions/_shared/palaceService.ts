import { badRequest, conflict, notFound } from './http';
import { PalaceRecord, palacesRepo } from './palacesRepo';

/** S-3.3.1. Two characters is the shortest name that can plausibly describe a place. */
const MIN_NAME_LENGTH = 2;

/**
 * Business rules for creating and removing a memory palace (S-3.3.1). Added the moment
 * palaces stopped being a list-only passthrough — until then the handler called the
 * repository directly, per the "when to skip the service layer" rule in
 * .claude/skills/ports-and-adapters.md.
 */
export const palaceService = {
  listForUser(userId: string): Promise<PalaceRecord[]> {
    return palacesRepo.findAllByUser(userId);
  },

  /**
   * Names are what distinguish one palace from another in the list and in the placement
   * step, so they're the uniqueness key — per user, case-insensitive, trimmed. As with
   * userService.createProfile, DynamoDB can express neither a case-insensitive condition
   * nor a uniqueness constraint, so this reads the user's own (small) palace list and
   * compares in memory.
   */
  async create(userId: string, { name, loci }: { name?: string; loci?: unknown }): Promise<PalaceRecord> {
    const trimmed = name?.trim() ?? '';
    if (trimmed.length < MIN_NAME_LENGTH) {
      throw badRequest(`A palace name must be at least ${MIN_NAME_LENGTH} characters.`);
    }

    const existing = await palacesRepo.findAllByUser(userId);
    if (existing.some((palace) => palace.name.trim().toLowerCase() === trimmed.toLowerCase())) {
      throw conflict('That palace name is already in use.');
    }

    return palacesRepo.create(userId, { name: trimmed, loci: normaliseLoci(loci) });
  },

  async delete(userId: string, id: string): Promise<void> {
    const palace = await palacesRepo.findById(userId, id);
    if (!palace) throw notFound('Palace not found');
    await palacesRepo.delete(userId, id);
  },
};

/**
 * Loci are optional — a palace with none is a valid end state, since loci can also be
 * added later when a contact is placed (story-02). Blank entries are dropped rather than
 * rejected: an empty row the user added and never filled in is an abandoned row, not an
 * error worth blocking the whole palace over.
 */
function normaliseLoci(loci: unknown): string[] {
  if (!Array.isArray(loci)) return [];
  return loci
    .filter((locus): locus is string => typeof locus === 'string')
    .map((locus) => locus.trim())
    .filter((locus) => locus.length > 0);
}
