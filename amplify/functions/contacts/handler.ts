import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequest, errorResponse, json, noContent, notFound, preflight } from '../_shared/http';
import { contactsRepo } from '../_shared/contactsRepo';
import { resolveUserId } from '../_shared/session';
import { parseMultipart } from '../_shared/multipart';
import { uploadPhoto } from '../_shared/photos';

// Direct port of backend/src/routes/contacts.js, plus GET/:id and PATCH/:id (S-2.6 — edit).
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/contacts/, '') || '/').replace(/\/+$/, '') || '/';
  const idMatch = sub.match(/^\/([^/]+)$/);
  const userId = resolveUserId(event);

  try {
    if (event.httpMethod === 'GET' && sub === '/') {
      const contacts = await contactsRepo.findAllByUser(userId);
      return json(200, contacts);
    }
    if (event.httpMethod === 'GET' && idMatch) {
      const contact = await contactsRepo.findById(userId, idMatch[1]);
      if (!contact) throw notFound('Contact not found');
      return json(200, contact);
    }
    if (event.httpMethod === 'POST' && sub === '/') return await create(event, userId);
    if (event.httpMethod === 'PATCH' && idMatch) return await update(event, userId, idMatch[1]);
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

/** Name/photo only (S-2.6) — never touches notes/palaceId/locusId/nameImage/associationScene,
 * which is what keeps an edit from disturbing a contact's palace/locus placement (S-2.6.7). */
async function update(event: APIGatewayProxyEvent, userId: string, id: string): Promise<APIGatewayProxyResult> {
  const existing = await contactsRepo.findById(userId, id);
  if (!existing) throw notFound('Contact not found');

  const { fields, file } = await parseMultipart(event);
  const name = fields.name?.trim();
  if (!name) throw badRequest('name is required');

  const data: { name: string; photoPath?: string | null } = { name };
  if (file) {
    data.photoPath = await uploadPhoto(file);
  } else if (fields.removePhoto === 'true') {
    data.photoPath = null;
  }

  const updated = await contactsRepo.update(userId, id, data);
  return json(200, updated);
}
