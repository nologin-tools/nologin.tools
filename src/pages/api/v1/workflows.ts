export const prerender = false;

import type { APIRoute } from 'astro';
import { getWorkflowRecipes, getWorkflowBySlug } from '../../../lib/workflows';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../../../lib/api-v1';

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug');

  if (slug) {
    const workflow = getWorkflowBySlug(slug);
    if (!workflow) {
      return errorResponse('Workflow recipe not found', 404);
    }
    return jsonResponse({ workflow });
  }

  const workflows = getWorkflowRecipes();
  return jsonResponse({
    workflows,
    total: workflows.length,
  });
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};
