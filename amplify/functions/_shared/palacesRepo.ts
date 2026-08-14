import { DeleteCommand, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from './dynamo';
import { newId } from './ids';

const TABLE = () => tableName('PALACES_TABLE_NAME');

export interface Locus {
  id: string;
  name: string;
  position: number;
}

export interface PalaceRecord {
  userId: string;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  loci: Locus[];
}

// Port of backend/src/repositories/palaceRepository.js. Locus has no route
// of its own today (only ever read nested under its palace, Prisma's
// `include: { loci: ... }`), so it's stored as an embedded, ordered list on
// the Palace item rather than a separate DynamoDB table — there is no access
// pattern that needs to query loci independently of their palace.
export const palacesRepo = {
  async findAllByUser(userId: string): Promise<PalaceRecord[]> {
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE(),
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
      }),
    );
    const palaces = (res.Items ?? []) as PalaceRecord[];
    return palaces
      .map((palace) => ({ ...palace, loci: [...(palace.loci ?? [])].sort((a, b) => a.position - b.position) }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async findById(userId: string, id: string): Promise<PalaceRecord | null> {
    const res = await ddb.send(new GetCommand({ TableName: TABLE(), Key: { userId, id } }));
    return (res.Item as PalaceRecord | undefined) ?? null;
  },

  /**
   * `loci` arrives as an ordered list of names; `position` is the index it was given at,
   * which is what findAllByUser sorts on. That order is the walking order through the
   * place, so it is stored as entered rather than sorted (S-3.3.1).
   */
  async create(userId: string, data: { name: string; loci: string[] }): Promise<PalaceRecord> {
    const now = new Date().toISOString();
    const palace: PalaceRecord = {
      userId,
      id: newId(),
      name: data.name,
      createdAt: now,
      updatedAt: now,
      loci: data.loci.map((name, position) => ({ id: newId(), name, position })),
    };
    await ddb.send(new PutCommand({ TableName: TABLE(), Item: palace }));
    return palace;
  },

  async delete(userId: string, id: string): Promise<void> {
    await ddb.send(new DeleteCommand({ TableName: TABLE(), Key: { userId, id } }));
  },
};
