import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequest, errorResponse, json, noContent, preflight } from '../_shared/http';
import { contactsRepo } from '../_shared/contactsRepo';
import { resolveUserId } from '../_shared/session';
import { parseMultipart } from '../_shared/multipart';
import { uploadPhoto } from '../_shared/photos';

// Direct port of backend/src/routes/contacts.js.
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/contacts/, '') || '/').replace(/\/+$/, '') || '/';
  const userId = resolveUserId(event);

  try {
    if (event.httpMethod === 'GET' && sub === '/') {
      const contacts = await contactsRepo.findAllByUser(userId);
      return json(200, contacts);
    }
    if (event.httpMethod === 'POST' && sub === '/') return await create(event, userId);
    if (event.httpMethod === 'DELETE' && sub === '/') {
      await contactsRepo.deleteAllForUser(userId);
      return noContent();
    }
    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};

async function create(event: APIGatewayProxyEvent, userId: string): Promise<APIGatewayProxyResult> {
  const { fields, file } = await parseMultipart(event);
  const name = fields.name?.trim();
  if (!name) throw badRequest('name is required');

  const photoPath = file ? await uploadPhoto(file) : null;

  const { contact, reviewCard } = await contactsRepo.create({
    userId,
    name,
    notes: fields.notes || null,
    photoPath,
    palaceId: fields.palaceId || null,
    locusId: fields.locusId || null,
    nameImage: fields.nameImage || null,
    associationScene: fields.associationScene || null,
  });

  return json(201, { ...contact, reviewCard });
}
