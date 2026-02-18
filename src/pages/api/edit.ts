import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { tools, editSuggestions } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { api } from '../../lib/api';
import { hashIp, getClientIp } from '../../lib/utils';

const ALLOWED_FIELDS = ['name', 'description', 'coreTask', 'url'];

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getDb(locals.runtime.env.DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { toolId, fieldName, newValue, reason } = body;

  if (!toolId || !fieldName || !newValue) {
    return api.error('toolId, fieldName, and newValue are required.', 400);
  }

  if (!ALLOWED_FIELDS.includes(fieldName)) {
    return api.error(`Invalid field: ${fieldName}`, 400);
  }

  if (typeof newValue !== 'string' || newValue.length > 500) {
    return api.error('New value must be a string (max 500 characters).', 400);
  }

  // Verify tool exists and is approved
  const [tool] = await db
    .select()
    .from(tools)
    .where(eq(tools.id, toolId))
    .limit(1);

  if (!tool) return api.error('Tool not found.', 404);
  if (tool.status !== 'approved') {
    return api.error('Only approved tools can be edited.', 400);
  }

  // Get current value
  const fieldKey = fieldName as keyof typeof tool;
  const oldValue = tool[fieldKey] as string | null;

  const clientIp = getClientIp(request);
  const ipHash = await hashIp(clientIp);

  await db.insert(editSuggestions).values({
    toolId,
    fieldName,
    oldValue: oldValue || null,
    newValue: newValue.trim(),
    reason: reason?.trim() || null,
    status: 'pending',
    submittedAt: new Date(),
    submitterIpHash: ipHash,
  });

  return api.success({ message: 'Edit suggestion submitted.' }, 201);
};
