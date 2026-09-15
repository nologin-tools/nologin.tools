export const prerender = true;

import type { APIRoute } from 'astro';
import { OPENAPI_SPEC, jsonResponse } from '../../../lib/api-v1';

export const GET: APIRoute = async () => {
  return jsonResponse(OPENAPI_SPEC, 200, 86400);
};
