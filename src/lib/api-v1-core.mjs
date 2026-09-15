// @ts-check
import { computePrivacyScorecard } from './privacy-scorecard.mjs';

/**
 * Standard CORS headers for public API v1 endpoints
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Clean URL hostname extractor
 * @param {string} url
 * @returns {string}
 */
export function extractHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Serializes a tool into a standardized API v1 public format
 * @param {any} tool
 * @param {string} [locale]
 * @param {any} [health]
 * @param {any} [editorial]
 * @returns {Record<string, any>}
 */
export function serializeApiTool(tool, locale = 'en', health = null, editorial = null) {
  const getTagValue = (key) =>
    tool.tags?.find((t) => t.tagKey === key || t.key === key)?.tagValue ||
    tool.tags?.find((t) => t.tagKey === key || t.key === key)?.value;

  const categoryTag = getTagValue('category') || tool.category || 'Other';
  const isClientSideOnly = Boolean(
    tool.tags?.some(
      (t) =>
        (t.tagKey === 'data' || t.key === 'data') &&
        (t.tagValue === 'Client-Side Only' || t.value === 'Client-Side Only')
    )
  );
  const worksOffline = Boolean(
    tool.tags?.some(
      (t) =>
        (t.tagKey === 'offline' || t.key === 'offline') &&
        (t.tagValue === 'Works Offline' || t.value === 'Works Offline')
    )
  );
  const isOpenSource = Boolean(
    tool.repoUrl ||
      tool.tags?.some(
        (t) =>
          (t.tagKey === 'source' || t.key === 'source') &&
          (t.tagValue === 'Open Source' || t.value === 'Open Source')
      )
  );
  const isFree = Boolean(
    tool.tags?.some(
      (t) =>
        (t.tagKey === 'pricing' || t.key === 'pricing') &&
        (t.tagValue === 'Free' || t.value === 'Free')
    )
  );

  const hostname = extractHostname(tool.url);

  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    url: tool.url,
    hostname,
    favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`,
    description: tool.description || '',
    coreTask: tool.coreTask || '',
    category: categoryTag,
    isFeatured: Boolean(tool.isFeatured),
    score: tool.score ?? 0,
    approvedAt: tool.approvedAt ?? null,
    badgeDisplayType: tool.badgeDisplayType || null,
    capabilities: {
      clientSideOnly: isClientSideOnly,
      worksOffline: worksOffline,
      openSource: isOpenSource,
      free: isFree,
    },
    repository: tool.repoUrl
      ? {
          url: tool.repoUrl,
          stars: tool.githubStars ?? null,
          license: tool.githubLicense ?? null,
          language: tool.githubLanguage ?? null,
        }
      : null,
    health: health
      ? {
          status: health.status || 'online',
          checkedAt: health.checkedAt || new Date().toISOString(),
        }
      : {
          status: 'online',
          checkedAt: new Date().toISOString(),
        },
    badges: {
      statusBadgeSvg: `https://nologin.tools/api/badge/${tool.slug}.svg`,
      embedFlatSvg: `https://nologin.tools/badges/flat.svg`,
      embedFlatDarkSvg: `https://nologin.tools/badges/flat-dark.svg`,
      certificatePage: `https://nologin.tools/badge/${tool.slug}`,
    },
    links: {
      canonical: `https://nologin.tools/tool/${tool.slug}`,
      audit: `https://nologin.tools/tool/${tool.slug}`,
    },
    scorecard: computePrivacyScorecard(tool, health, editorial),
    editorial: editorial
      ? {
          bestFor: editorial.bestFor || null,
          pros: editorial.pros || [],
          cons: editorial.cons || [],
          privacyVerdict: editorial.privacyVerdict || null,
        }
      : null,
  };
}

/**
 * Filter and paginate API tools
 * @param {any[]} tools
 * @param {Record<string, any>} params
 * @returns {{ tools: any[]; total: number; limit: number; offset: number }}
 */
export function filterApiTools(tools, params) {
  const q = (params.q || '').trim().toLowerCase();
  const category = (params.category || '').trim().toLowerCase();
  const clientSide = params.clientSide === 'true' || params.clientSide === '1' || params.clientSide === true;
  const offline = params.offline === 'true' || params.offline === '1' || params.offline === true;
  const openSource = params.openSource === 'true' || params.openSource === '1' || params.openSource === true;
  const free = params.free === 'true' || params.free === '1' || params.free === true;
  const featured = params.featured === 'true' || params.featured === '1' || params.featured === true;

  const limit = Math.min(Math.max(1, parseInt(params.limit || '30', 10)), 100);
  const offset = Math.max(0, parseInt(params.offset || '0', 10));
  const sort = params.sort || 'score';

  const filtered = tools.filter((tool) => {
    if (q) {
      const matchName = tool.name?.toLowerCase().includes(q);
      const matchHost = tool.hostname?.toLowerCase().includes(q);
      const matchTask = tool.coreTask?.toLowerCase().includes(q);
      const matchDesc = tool.description?.toLowerCase().includes(q);
      if (!matchName && !matchHost && !matchTask && !matchDesc) return false;
    }

    if (category && category !== 'all') {
      const cat = (
        tool.category ||
        tool.tags?.find((t) => t.tagKey === 'category' || t.key === 'category')?.tagValue ||
        tool.tags?.find((t) => t.tagKey === 'category' || t.key === 'category')?.value ||
        ''
      ).toLowerCase();
      if (cat !== category) return false;
    }

    const hasClientSide = tool.capabilities
      ? tool.capabilities.clientSideOnly
      : Boolean(
          tool.tags?.some(
            (t) =>
              (t.tagKey === 'data' || t.key === 'data') &&
              (t.tagValue === 'Client-Side Only' || t.value === 'Client-Side Only')
          )
        );
    const hasOffline = tool.capabilities
      ? tool.capabilities.worksOffline
      : Boolean(
          tool.tags?.some(
            (t) =>
              (t.tagKey === 'offline' || t.key === 'offline') &&
              (t.tagValue === 'Works Offline' || t.value === 'Works Offline')
          )
        );
    const hasOpenSource = tool.capabilities
      ? tool.capabilities.openSource
      : Boolean(
          tool.repoUrl ||
            tool.tags?.some(
              (t) =>
                (t.tagKey === 'source' || t.key === 'source') &&
                (t.tagValue === 'Open Source' || t.value === 'Open Source')
            )
        );
    const hasFree = tool.capabilities
      ? tool.capabilities.free
      : Boolean(
          tool.tags?.some(
            (t) =>
              (t.tagKey === 'pricing' || t.key === 'pricing') &&
              (t.tagValue === 'Free' || t.value === 'Free')
          )
        );

    if (clientSide && !hasClientSide) return false;
    if (offline && !hasOffline) return false;
    if (openSource && !hasOpenSource) return false;
    if (free && !hasFree) return false;
    if (featured && !tool.isFeatured) return false;

    return true;
  });

  filtered.sort((a, b) => {
    if (sort === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (sort === 'newest') {
      const dateA = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
      const dateB = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
      return dateB - dateA;
    }
    return (b.score || 0) - (a.score || 0);
  });

  const total = filtered.length;
  const paged = filtered.slice(offset, offset + limit);

  return {
    tools: paged,
    total,
    limit,
    offset,
  };
}

/**
 * Official OpenAPI 3.1.0 Specification Document
 */
export const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'nologin.tools Directory API',
    version: '1.0.0',
    description:
      'Open RESTful API for searching, inspecting, and retrieving verified zero-login, privacy-friendly web applications.',
    contact: {
      name: 'NoLoginTools.org',
      url: 'https://nologintools.org',
      email: 'contact@nologintools.org',
    },
    license: {
      name: 'CC0-1.0',
      url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
  },
  servers: [
    {
      url: 'https://nologin.tools',
      description: 'Production Edge Network',
    },
  ],
  paths: {
    '/api/v1/tools': {
      get: {
        summary: 'List and filter verified no-login tools',
        description:
          'Returns a paginated list of audited web applications that operate with zero account registration.',
        operationId: 'listTools',
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'Keyword search query matching name, task, hostname, or description',
            schema: { type: 'string' },
          },
          {
            name: 'category',
            in: 'query',
            description: 'Filter by category (AI, Design, Writing, Development, Productivity, Media, Privacy, Data, Communication, Education, Finance)',
            schema: { type: 'string' },
          },
          {
            name: 'clientSide',
            in: 'query',
            description: 'Filter for tools processing data 100% in browser memory (true/1)',
            schema: { type: 'string' },
          },
          {
            name: 'offline',
            in: 'query',
            description: 'Filter for offline-capable PWA tools (true/1)',
            schema: { type: 'string' },
          },
          {
            name: 'openSource',
            in: 'query',
            description: 'Filter for open-source verified repositories (true/1)',
            schema: { type: 'string' },
          },
          {
            name: 'free',
            in: 'query',
            description: 'Filter for 100% free tools without freemium paywalls (true/1)',
            schema: { type: 'string' },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of results to return (max 100, default 30)',
            schema: { type: 'integer', default: 30, maximum: 100 },
          },
          {
            name: 'offset',
            in: 'query',
            description: 'Pagination offset',
            schema: { type: 'integer', default: 0 },
          },
          {
            name: 'sort',
            in: 'query',
            description: 'Sort by score or name',
            schema: { type: 'string', enum: ['score', 'name'], default: 'score' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful list response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        tools: { type: 'array', items: { $ref: '#/components/schemas/Tool' } },
                        total: { type: 'integer', example: 181 },
                        limit: { type: 'integer', example: 30 },
                        offset: { type: 'integer', example: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/tools/{slug}': {
      get: {
        summary: 'Get full tool security audit and specs by slug',
        description: 'Returns comprehensive metadata, health uptime, badges, and editorial review for a specific tool.',
        operationId: 'getToolBySlug',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            description: 'Canonical slug of the tool (e.g. excalidraw-com, squoosh-app)',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Tool found and returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        tool: { $ref: '#/components/schemas/Tool' },
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Tool not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Tool not found' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/workflows': {
      get: {
        summary: 'List curated no-login workflow stacks',
        description: 'Returns structured recipes chaining multiple no-login tools to solve complex end-to-end tasks.',
        operationId: 'listWorkflows',
        parameters: [
          {
            name: 'slug',
            in: 'query',
            description: 'Filter for a specific workflow recipe slug',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful workflows list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        workflows: { type: 'array', items: { $ref: '#/components/schemas/Workflow' } },
                        total: { type: 'integer', example: 10 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Tool: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          slug: { type: 'string', example: 'excalidraw-com' },
          name: { type: 'string', example: 'Excalidraw' },
          url: { type: 'string', example: 'https://excalidraw.com' },
          hostname: { type: 'string', example: 'excalidraw.com' },
          favicon: { type: 'string' },
          description: { type: 'string' },
          coreTask: { type: 'string' },
          category: { type: 'string', example: 'Design' },
          isFeatured: { type: 'boolean' },
          capabilities: {
            type: 'object',
            properties: {
              clientSideOnly: { type: 'boolean' },
              worksOffline: { type: 'boolean' },
              openSource: { type: 'boolean' },
              free: { type: 'boolean' },
            },
          },
          health: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['online', 'unstable', 'offline'] },
              checkedAt: { type: 'string', format: 'date-time' },
            },
          },
          badges: {
            type: 'object',
            properties: {
              statusBadgeSvg: { type: 'string' },
              embedFlatSvg: { type: 'string' },
              certificatePage: { type: 'string' },
            },
          },
        },
      },
      Workflow: {
        type: 'object',
        properties: {
          slug: { type: 'string', example: 'private-podcast-production' },
          title: { type: 'string' },
          category: { type: 'string' },
          timeEstimate: { type: 'string' },
          difficulty: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'] },
          privacyGuarantee: { type: 'string' },
          headline: { type: 'string' },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                stepNumber: { type: 'integer' },
                toolSlug: { type: 'string' },
                actionTitle: { type: 'string' },
                actionDescription: { type: 'string' },
                inputFormat: { type: 'string' },
                outputFormat: { type: 'string' },
                proTip: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
};

/**
 * Model Context Protocol (MCP) Tools Specification for AI Agents
 */
export const MCP_TOOLS_SPEC = {
  name: 'nologin-tools',
  version: '1.0.0',
  description:
    'Model Context Protocol (MCP) server integration for querying the curated registry of verified zero-login, privacy-first web applications.',
  tools: [
    {
      name: 'search_nologin_tools',
      description:
        'Search and filter privacy-friendly web applications that require no account creation or login.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Task or tool search query (e.g. "PDF editor", "audio trimmer", "encrypt file", "SVG cleaner")',
          },
          category: {
            type: 'string',
            description: 'Optional category filter (AI, Design, Writing, Development, Productivity, Media, Privacy, Data, Communication, Education, Finance)',
          },
          clientSideOnly: {
            type: 'boolean',
            description: 'If true, returns only tools that process data strictly in client-side browser memory without remote uploads',
          },
          worksOffline: {
            type: 'boolean',
            description: 'If true, returns only PWA tools that work offline without an active internet connection',
          },
          openSource: {
            type: 'boolean',
            description: 'If true, returns only tools with verified open-source repositories',
          },
          limit: {
            type: 'integer',
            description: 'Maximum number of tools to return (default: 10)',
            default: 10,
          },
        },
      },
    },
    {
      name: 'get_tool_details',
      description:
        'Get full security audit, health uptime status, and editorial review for a specific no-login tool.',
      inputSchema: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: {
            type: 'string',
            description: 'Canonical tool slug (e.g. "excalidraw-com", "squoosh-app", "tools-pdf24-org-en")',
          },
        },
      },
    },
    {
      name: 'list_workflows',
      description:
        'List end-to-end procedural workflow recipes that chain multiple no-login tools to complete real-world tasks.',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Optional category filter for workflow recipes',
          },
        },
      },
    },
  ],
};
