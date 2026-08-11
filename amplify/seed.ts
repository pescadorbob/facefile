// Port of backend/prisma/seed.js against the DynamoDB tables defined in
// backend.ts. Run after `ampx sandbox` (or a pipeline deploy) has produced
// amplify_outputs.json at the repo root:
//
//   npx tsx amplify/seed.ts
//
// passwordHash is dropped — the ported session flow (functions/session) is
// cookie-based with no password step, matching how session.js actually
// worked (Prisma's `passwordHash` field was already unused by any route).
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputs = JSON.parse(readFileSync(join(__dirname, '..', 'amplify_outputs.json'), 'utf-8'));
const tables = outputs.custom.tables as Record<string, string>;
const defaultUserId = outputs.custom.defaultUserId as string;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

async function main() {
  const now = new Date().toISOString();

  const existingUser = await ddb.send(new GetCommand({ TableName: tables.users, Key: { id: defaultUserId } }));
  if (!existingUser.Item) {
    await ddb.send(
      new PutCommand({
        TableName: tables.users,
        Item: { id: defaultUserId, name: 'Default User', email: 'default@facefile.local', active: true, createdAt: now, updatedAt: now },
      }),
    );
    console.log(`Default user created (id=${defaultUserId})`);
  } else {
    console.log('Default user already exists');
  }

  const existingPalaces = await ddb.send(
    new QueryCommand({
      TableName: tables.palaces,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': defaultUserId },
      Select: 'COUNT',
    }),
  );
  if ((existingPalaces.Count ?? 0) > 0) {
    console.log('Palaces already seeded');
    return;
  }

  const palaceSeeds = [
    { name: 'Childhood Home', loci: ['Front doorstep', 'Coat rack in hallway', 'Kitchen sink', 'Dining table', 'Living room armchair'] },
    { name: 'Secondary School', loci: ['Main entrance gates', 'Reception desk', 'Corridor noticeboard', 'Science lab bench', 'Library reading table'] },
    { name: 'Daily Commute Route', loci: ['Bus stop shelter', 'Pedestrian crossing', 'Corner newsagent', 'Office building lobby'] },
  ];

  for (const seed of palaceSeeds) {
    await ddb.send(
      new PutCommand({
        TableName: tables.palaces,
        Item: {
          userId: defaultUserId,
          id: randomUUID(),
          name: seed.name,
          createdAt: now,
          updatedAt: now,
          loci: seed.loci.map((name, position) => ({ id: randomUUID(), name, position })),
        },
      }),
    );
  }
  console.log(`Seeded ${palaceSeeds.length} palaces with loci for user ${defaultUserId}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
