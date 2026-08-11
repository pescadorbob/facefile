import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from './dynamo';

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
};
