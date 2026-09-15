export const prerender = true;

import type { APIRoute } from 'astro';
import { MCP_TOOLS_SPEC, jsonResponse } from '../../../lib/api-v1';

export const GET: APIRoute = async () => {
  return jsonResponse(MCP_TOOLS_SPEC, 200, 86400);
};
