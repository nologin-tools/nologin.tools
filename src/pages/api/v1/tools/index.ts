export const prerender = false;

import type { APIRoute } from 'astro';
import { getAllApiTools, filterApiTools, jsonResponse, CORS_HEADERS } from '../../../../lib/api-v1';

export const GET: APIRoute = async ({ url }) => {
  const allTools = getAllApiTools('en');

  const params = {
    q: url.searchParams.get('q') || undefined,
    category: url.searchParams.get('category') || undefined,
    clientSide: url.searchParams.get('clientSide') || undefined,
    offline: url.searchParams.get('offline') || undefined,
    openSource: url.searchParams.get('openSource') || undefined,
    free: url.searchParams.get('free') || undefined,
    featured: url.searchParams.get('featured') || undefined,
    limit: url.searchParams.get('limit') || undefined,
    offset: url.searchParams.get('offset') || undefined,
    sort: url.searchParams.get('sort') || undefined,
  };

  const result = filterApiTools(allTools, params);

  return jsonResponse({
    tools: result.tools,
    total: result.total,
    limit: result.limit,
    offset: result.offset,
  });
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};
