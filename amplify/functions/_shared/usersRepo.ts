import { GetCommand, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from './dynamo';
import { newId } from './ids';

const TABLE = () => tableName('USERS_TABLE_NAME');
const EMAIL_INDEX = 'byEmail';

export interface UserRecord {
  id: string;
  name: string;
  /** Optional: a profile created from the picker (S-1.7.4) is name-only, so the
   * attribute is simply absent on that item — and therefore absent from the
   * `byEmail` GSI, which only indexes items that carry an email. Admin-created
   * accounts (POST /admin/users) still always have one. */
  email?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const nowIso = () => new Date().toISOString();

// Port of backend/src/repositories/userRepository.js against DynamoDB. `id`
// is now a UUID (see _shared/ids.ts), and email lookups go through the
// `byEmail` GSI defined on the Users table in amplify/backend.ts, since
// DynamoDB has no unique-constraint equivalent to enforce at the DB layer.
export const usersRepo = {
  async findAll(filter: { active?: boolean } = {}): Promise<UserRecord[]> {
    const res = await ddb.send(new ScanCommand({ TableName: TABLE() }));
    const items = (res.Items ?? []) as UserRecord[];
    const filtered = filter.active === undefined ? items : items.filter((u) => u.active === filter.active);
    return filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async findById(id: string): Promise<UserRecord | null> {
    const res = await ddb.send(new GetCommand({ TableName: TABLE(), Key: { id } }));
    return (res.Item as UserRecord | undefined) ?? null;
  },

  async findByEmail(email: string): Promise<UserRecord | null> {
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE(),
        IndexName: EMAIL_INDEX,
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email },
        Limit: 1,
      }),
    );
    return (res.Items?.[0] as UserRecord | undefined) ?? null;
  },

  async create(data: { name: string; email?: string }): Promise<UserRecord> {
    const now = nowIso();
    // `email: undefined` is pruned by the document client's removeUndefinedValues
    // (see _shared/dynamo.ts), so a name-only profile stores no email attribute.
    const user: UserRecord = { id: newId(), name: data.name, email: data.email, active: true, createdAt: now, updatedAt: now };
    await ddb.send(new PutCommand({ TableName: TABLE(), Item: user }));
    return user;
  },

  async update(id: string, data: Partial<Pick<UserRecord, 'name' | 'email' | 'active'>>): Promise<UserRecord> {
    const existing = await usersRepo.findById(id);
    if (!existing) throw new Error(`User ${id} not found`);
    const updated: UserRecord = { ...existing, ...data, updatedAt: nowIso() };
    await ddb.send(new PutCommand({ TableName: TABLE(), Item: updated }));
    return updated;
  },
};
