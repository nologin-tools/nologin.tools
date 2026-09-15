import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fallbackPath = resolve(__dirname, 'data/fallback-data.json');

// Lazy-load fallback data
let _cachedFallback = null;
function getFallbackData() {
  if (!_cachedFallback) {
    try {
      _cachedFallback = JSON.parse(readFileSync(fallbackPath, 'utf8'));
    } catch {
      _cachedFallback = { tools: [], workflows: [], alternatives: [] };
    }
  }
  return _cachedFallback;
}

const API_BASE = 'https://nologin.tools/api/v1';

export const MCP_TOOLS = [
  {
    name: 'search_nologin_tools',
    description:
      'Search and filter privacy-first, zero-login web applications by keyword, category, client-side execution, offline PWA support, or open-source status.',
    inputSchema: {
      type: 'object',
      properties: {
        q: {
          type: 'string',
          description: 'Search keywords matching tool name, task, hostname, or description (e.g. "diagram", "pdf", "audio", "encrypt")',
        },
        category: {
          type: 'string',
          description: 'Filter by category: AI, Design, Writing, Development, Productivity, Media, Privacy, Data, Communication, Education, Finance',
        },
        clientSide: {
          type: 'boolean',
          description: 'Filter for tools where data processing occurs 100% in-browser without sending files to remote servers',
        },
        offline: {
          type: 'boolean',
          description: 'Filter for tools with offline / PWA support',
        },
        openSource: {
          type: 'boolean',
          description: 'Filter for verified open-source tools with public code repositories',
        },
        free: {
          type: 'boolean',
          description: 'Filter for 100% free tools without paywalls',
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of results to return (default: 10, max: 30)',
          default: 10,
        },
      },
    },
  },
  {
    name: 'get_tool_details',
    description:
      'Retrieve deep audit specifications, cryptographic privacy verdicts, GitHub telemetry, health uptime, and editorial pros/cons for a specific tool by slug.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'The unique slug identifier of the tool (e.g. "excalidraw-com", "photopea-com", "hat-sh")',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'list_workflows',
    description:
      'Discover curated end-to-end multi-tool workflow recipes that chain 2 to 4 verified no-login web tools together to accomplish complete tasks.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category filter: Media, Productivity, Design, Writing, Development, Privacy, Data',
        },
      },
    },
  },
  {
    name: 'find_alternatives',
    description:
      'Find zero-login, private, in-browser alternatives to popular closed/paywalled software (e.g. Photoshop, Canva, Figma, WeTransfer, Smallpdf, Miro, Lucidchart, Notion, Loom, Zoom).',
    inputSchema: {
      type: 'object',
      properties: {
        software: {
          type: 'string',
          description: 'Name of the proprietary software to replace (e.g. "canva", "photoshop", "figma", "wetransfer", "smallpdf", "miro", "notion")',
        },
      },
      required: ['software'],
    },
  },
];

async function fetchWithTimeout(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'nologin-tools-mcp/1.0 (+https://nologin.tools)' },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Tool Implementation 1: search_nologin_tools
async function handleSearchTools(args) {
  const q = (args.q || '').trim().toLowerCase();
  const category = (args.category || '').trim().toLowerCase();
  const limit = Math.min(Math.max(1, parseInt(args.limit || 10, 10)), 30);

  let tools = [];
  try {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (args.clientSide) params.set('clientSide', 'true');
    if (args.offline) params.set('offline', 'true');
    if (args.openSource) params.set('openSource', 'true');
    if (args.free) params.set('free', 'true');
    params.set('limit', String(limit));

    const json = await fetchWithTimeout(`${API_BASE}/tools?${params.toString()}`);
    if (json.ok && json.data?.tools) {
      tools = json.data.tools;
    }
  } catch {
    // Fallback: in-memory filter
    const fallback = getFallbackData();
    tools = fallback.tools.filter((tool) => {
      if (q) {
        const matchName = tool.name?.toLowerCase().includes(q);
        const matchHost = tool.hostname?.toLowerCase().includes(q);
        const matchTask = tool.coreTask?.toLowerCase().includes(q);
        const matchDesc = tool.description?.toLowerCase().includes(q);
        if (!matchName && !matchHost && !matchTask && !matchDesc) return false;
      }
      if (category && category !== 'all') {
        if (tool.category?.toLowerCase() !== category) return false;
      }
      if (args.clientSide && !tool.capabilities?.clientSideOnly) return false;
      if (args.offline && !tool.capabilities?.worksOffline) return false;
      if (args.openSource && !tool.capabilities?.openSource) return false;
      if (args.free && !tool.capabilities?.free) return false;
      return true;
    }).slice(0, limit);
  }

  if (tools.length === 0) {
    return 'No verified zero-login tools found matching your query criteria. Try broadening search terms or category.';
  }

  const lines = [`Found ${tools.length} verified zero-login tools:\n`];
  for (const t of tools) {
    const caps = [];
    if (t.capabilities?.clientSideOnly) caps.push('Client-Side Only');
    if (t.capabilities?.worksOffline) caps.push('Works Offline');
    if (t.capabilities?.openSource) caps.push('Open Source');
    if (t.capabilities?.free) caps.push('Free');
    const capsStr = caps.length ? `[${caps.join(', ')}]` : '';

    lines.push(`### [${t.name}](${t.url}) - ${t.category} ${capsStr}`);
    if (t.coreTask) lines.push(`- **Core Task**: ${t.coreTask}`);
    lines.push(`- **Description**: ${t.description}`);
    lines.push(`- **Audit Details**: https://nologin.tools/tool/${t.slug}\n`);
  }

  return lines.join('\n');
}

// Tool Implementation 2: get_tool_details
async function handleGetToolDetails(args) {
  const slug = (args.slug || '').trim().toLowerCase();
  if (!slug) throw new Error('Missing required argument: slug');

  let tool = null;
  try {
    const json = await fetchWithTimeout(`${API_BASE}/tools/${slug}`);
    if (json.ok && json.data?.tool) {
      tool = json.data.tool;
    }
  } catch {
    const fallback = getFallbackData();
    tool = fallback.tools.find((t) => t.slug === slug) || null;
  }

  if (!tool) {
    return `Tool with slug "${slug}" was not found in the verified no-login directory.`;
  }

  const lines = [
    `# ${tool.name} (Verified Zero-Login Tool)`,
    `**Website**: ${tool.url}`,
    `**Category**: ${tool.category}`,
    `**Health Status**: ${tool.health?.status || 'online'}`,
    `**Directory Audit**: https://nologin.tools/tool/${tool.slug}`,
    `**Trust Certificate**: https://nologin.tools/badge/${tool.slug}`,
    '',
    `## Description & Core Task`,
    `${tool.description}`,
    tool.coreTask ? `\n**Core Task**: ${tool.coreTask}` : '',
    '',
    `## Privacy & Capability Specifications`,
    `- **Client-Side Only**: ${tool.capabilities?.clientSideOnly ? 'Yes (Runs 100% in browser sandbox)' : 'No (Connects to stateless remote API)'}`,
    `- **Offline Capable**: ${tool.capabilities?.worksOffline ? 'Yes (PWA / ServiceWorker support)' : 'No'}`,
    `- **Open Source**: ${tool.capabilities?.openSource ? 'Yes' : 'No'}`,
    `- **Pricing**: ${tool.capabilities?.free ? '100% Free' : 'Freemium / Free Tier'}`,
  ];

  if (tool.repository?.url) {
    lines.push(
      '',
      `## Code Repository`,
      `- **URL**: ${tool.repository.url}`,
      tool.repository.stars ? `- **Stars**: ${tool.repository.stars}` : '',
      tool.repository.license ? `- **License**: ${tool.repository.license}` : '',
      tool.repository.language ? `- **Language**: ${tool.repository.language}` : ''
    );
  }

  if (tool.editorial) {
    lines.push('', `## Editorial Review & Privacy Verdict`);
    if (tool.editorial.bestFor) lines.push(`- **Best For**: ${tool.editorial.bestFor}`);
    if (tool.editorial.privacyVerdict) lines.push(`- **Privacy Verdict**: ${tool.editorial.privacyVerdict}`);
    if (tool.editorial.pros?.length) {
      lines.push(`\n**Pros**:`);
      tool.editorial.pros.forEach((p) => lines.push(`- ${p}`));
    }
    if (tool.editorial.cons?.length) {
      lines.push(`\n**Cons**:`);
      tool.editorial.cons.forEach((c) => lines.push(`- ${c}`));
    }
  }

  return lines.filter(Boolean).join('\n');
}

// Tool Implementation 3: list_workflows
async function handleListWorkflows(args) {
  const category = (args.category || '').trim().toLowerCase();
  let workflows = [];

  try {
    const json = await fetchWithTimeout(`${API_BASE}/workflows`);
    if (json.ok && json.data?.workflows) {
      workflows = json.data.workflows;
    }
  } catch {
    const fallback = getFallbackData();
    workflows = fallback.workflows || [];
  }

  if (category) {
    workflows = workflows.filter((w) => w.category?.toLowerCase() === category);
  }

  if (workflows.length === 0) {
    return 'No multi-tool zero-login workflows found for this category.';
  }

  const lines = [`# Curated Multi-Tool Zero-Login Workflows (${workflows.length} Recipes)\n`];
  for (const wf of workflows) {
    lines.push(`## [${wf.title}](https://nologin.tools/workflow/${wf.slug})`);
    lines.push(`- **Category**: ${wf.category} | **Time**: ${wf.timeEstimate} | **Difficulty**: ${wf.difficulty}`);
    lines.push(`- **Privacy Guarantee**: ${wf.privacyGuarantee}`);
    lines.push(`- **Summary**: ${wf.summary}`);
    lines.push(`\n### Pipeline Steps:`);
    for (const step of wf.steps || []) {
      lines.push(`  ${step.stepNumber}. **${step.actionTitle}** (using [${step.toolSlug}](https://nologin.tools/tool/${step.toolSlug}))`);
      lines.push(`     ${step.actionDescription}`);
      if (step.proTip) lines.push(`     *Pro Tip*: ${step.proTip}`);
    }
    lines.push('\n---\n');
  }

  return lines.join('\n');
}

// Tool Implementation 4: find_alternatives
async function handleFindAlternatives(args) {
  const software = (args.software || '').trim().toLowerCase();
  if (!software) throw new Error('Missing required argument: software');

  const fallback = getFallbackData();
  const alternatives = fallback.alternatives || [];

  // Match target software by slug, name, or aliases
  const target = alternatives.find((alt) => {
    if (alt.slug.toLowerCase() === software) return true;
    if (alt.name.toLowerCase().includes(software)) return true;
    return alt.aliases?.some((alias) => alias.toLowerCase().includes(software));
  });

  if (!target) {
    return (
      `No direct zero-login alternative mapping found for "${software}". ` +
      `Try searching by category or utility with \`search_nologin_tools\`. ` +
      `Supported direct targets include: Photoshop, Canva, Figma, WeTransfer, Smallpdf, Miro, Lucidchart, Notion, Loom, Zoom, TinyPNG, and more.`
    );
  }

  const lines = [
    `# Zero-Login Alternatives to ${target.name} (${target.category})`,
    `**Mission**: ${target.headline}`,
    `**Catalog Comparison**: https://nologin.tools/alternative/${target.slug}`,
    '',
    `## Recommended No-Login In-Browser Tools:`,
  ];

  for (const tool of target.tools || []) {
    lines.push(`### [${tool.name}](${tool.url})`);
    lines.push(`- **Description**: ${tool.description}`);
    lines.push(`- **Audit & Review**: https://nologin.tools/tool/${tool.slug}\n`);
  }

  return lines.join('\n');
}

/**
 * Handle incoming JSON-RPC 2.0 messages for MCP protocol
 */
export async function handleMcpMessage(message) {
  if (!message || typeof message !== 'object') {
    return { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } };
  }

  const { id, method, params } = message;

  // Handle notifications (no response)
  if (method === 'notifications/initialized') {
    return null;
  }

  // Handle protocol handshake
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'nologin-tools-mcp',
          version: '1.0.0',
        },
      },
    };
  }

  if (method === 'ping') {
    return { jsonrpc: '2.0', id, result: {} };
  }

  // List tools
  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: MCP_TOOLS,
      },
    };
  }

  // Call tool
  if (method === 'tools/call') {
    const { name, arguments: toolArgs = {} } = params || {};
    try {
      let text = '';
      if (name === 'search_nologin_tools') {
        text = await handleSearchTools(toolArgs);
      } else if (name === 'get_tool_details') {
        text = await handleGetToolDetails(toolArgs);
      } else if (name === 'list_workflows') {
        text = await handleListWorkflows(toolArgs);
      } else if (name === 'find_alternatives') {
        text = await handleFindAlternatives(toolArgs);
      } else {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Tool not found: ${name}` },
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text,
            },
          ],
        },
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${err.message}`,
            },
          ],
        },
      };
    }
  }

  // Unknown method
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`,
    },
  };
}
