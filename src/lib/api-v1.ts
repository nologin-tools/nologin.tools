import {
  getApprovedTools,
  getToolBySlug,
  getToolHealthStatus,
  getToolEditorial,
  getLocalizedDescription,
} from '../data/loader';
import { getWorkflowRecipes, getWorkflowBySlug } from './workflows';
import type { Locale } from '../i18n/config';
import {
  CORS_HEADERS,
  serializeApiTool,
  filterApiTools,
  OPENAPI_SPEC,
  MCP_TOOLS_SPEC,
} from './api-v1-core.mjs';

export {
  CORS_HEADERS,
  serializeApiTool,
  filterApiTools,
  OPENAPI_SPEC,
  MCP_TOOLS_SPEC,
} from './api-v1-core.mjs';

/**
 * Standardized JSON success response with CORS and edge cache headers
 */
export function jsonResponse(data: unknown, status = 200, maxAge = 600): Response {
  return new Response(JSON.stringify({ ok: true, data }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=3600`,
      ...CORS_HEADERS,
    },
  });
}

/**
 * Standardized JSON error response with CORS headers
 */
export function errorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/**
 * Retrieves all approved tools serialized for API v1
 */
export function getAllApiTools(locale: Locale = 'en') {
  const tools = getApprovedTools();
  return tools.map((tool) => {
    const health = getToolHealthStatus(tool);
    const localizedDesc = getLocalizedDescription(tool, locale) || tool.description || '';
    const editorial = getToolEditorial(tool.slug, locale);
    return serializeApiTool(tool, locale, health, editorial);
  });
}

/**
 * Retrieves a single tool serialized for API v1 by slug
 */
export function getSingleApiTool(slug: string, locale: Locale = 'en') {
  const tool = getToolBySlug(slug);
  if (!tool) return null;
  const health = getToolHealthStatus(tool);
  const localizedDesc = getLocalizedDescription(tool, locale) || tool.description || '';
  const editorial = getToolEditorial(slug, locale);
  return serializeApiTool(tool, locale, health, editorial);
}
