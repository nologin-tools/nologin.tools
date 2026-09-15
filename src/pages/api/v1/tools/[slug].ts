export const prerender = false;

import type { APIRoute } from 'astro';
import { getSingleApiTool, jsonResponse, errorResponse, CORS_HEADERS } from '../../../../lib/api-v1';

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return errorResponse('Missing tool slug', 400);
  }

  const tool = getSingleApiTool(slug, 'en');
  if (!tool) {
    return errorResponse('Tool not found', 404);
  }

  return jsonResponse({ tool });
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};
