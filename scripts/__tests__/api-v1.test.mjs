import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CORS_HEADERS,
  serializeApiTool,
  filterApiTools,
  OPENAPI_SPEC,
  MCP_TOOLS_SPEC,
} from '../../src/lib/api-v1-core.mjs';

const MOCK_TOOLS = [
  {
    id: 1,
    name: 'CyberChef',
    url: 'https://gchq.github.io/CyberChef',
    description: 'The Cyber Swiss Army Knife - a web app for encryption, encoding, compression and data analysis.',
    slug: 'gchq-github-io-cyberchef',
    repoUrl: 'https://github.com/gchq/CyberChef',
    status: 'approved',
    isFeatured: 1,
    badgeDisplay: 'svg',
    effectiveStatus: 'online',
    score: 95,
    approvedAt: 1700000000000,
    tags: [
      { key: 'category', value: 'Development' },
      { key: 'data', value: 'Client-Side Only' },
      { key: 'offline', value: 'Works Offline' },
      { key: 'pricing', value: 'Free' },
    ],
  },
  {
    id: 2,
    name: 'Excalidraw',
    url: 'https://excalidraw.com',
    description: 'Virtual collaborative whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel to them.',
    slug: 'excalidraw-com',
    repoUrl: 'https://github.com/excalidraw/excalidraw',
    status: 'approved',
    isFeatured: 0,
    badgeDisplay: 'none',
    effectiveStatus: 'online',
    score: 85,
    approvedAt: 1710000000000,
    tags: [
      { key: 'category', value: 'Design' },
      { key: 'pricing', value: 'Freemium' },
    ],
  },
  {
    id: 3,
    name: 'Temp Mail',
    url: 'https://temp-mail.org',
    description: 'Disposable temporary email address to protect your personal email from spam.',
    slug: 'temp-mail-org',
    repoUrl: null,
    status: 'approved',
    isFeatured: 0,
    badgeDisplay: 'none',
    effectiveStatus: 'online',
    score: 70,
    approvedAt: 1690000000000,
    tags: [
      { key: 'category', value: 'Privacy' },
      { key: 'pricing', value: 'Free' },
    ],
  },
];

describe('Developer API v1 Core Logic', () => {
  describe('CORS_HEADERS', () => {
    it('defines universal access headers', () => {
      assert.equal(CORS_HEADERS['Access-Control-Allow-Origin'], '*');
      assert.ok(CORS_HEADERS['Access-Control-Allow-Methods'].includes('GET'));
      assert.ok(CORS_HEADERS['Access-Control-Allow-Headers'].includes('Content-Type'));
    });
  });

  describe('serializeApiTool', () => {
    it('correctly maps tool properties and computes boolean capabilities', () => {
      const serialized = serializeApiTool(MOCK_TOOLS[0]);

      assert.equal(serialized.slug, 'gchq-github-io-cyberchef');
      assert.equal(serialized.name, 'CyberChef');
      assert.equal(serialized.category, 'Development');
      assert.equal(serialized.isFeatured, true);
      assert.equal(serialized.score, 95);

      // Boolean capabilities
      assert.equal(serialized.capabilities.clientSideOnly, true);
      assert.equal(serialized.capabilities.worksOffline, true);
      assert.equal(serialized.capabilities.openSource, true);
      assert.equal(serialized.capabilities.free, true);

      // Badges
      assert.ok(serialized.badges.embedFlatSvg.includes('/badges/flat.svg'));
      assert.ok(serialized.badges.statusBadgeSvg.includes('/api/badge/gchq-github-io-cyberchef.svg'));

      // Links
      assert.equal(serialized.badges.certificatePage, 'https://nologin.tools/badge/gchq-github-io-cyberchef');

      // Scorecard
      assert.ok(serialized.scorecard, 'Expected scorecard to be present');
      assert.equal(serialized.scorecard.overallGrade, 'A+');
      assert.ok(serialized.scorecard.overallScore >= 90);
      assert.ok(serialized.scorecard.dimensions.sandbox);

      assert.equal(serialized.links.canonical, 'https://nologin.tools/tool/gchq-github-io-cyberchef');
    });

    it('handles tools without repository or client-side flags', () => {
      const serialized = serializeApiTool(MOCK_TOOLS[2]);
      assert.equal(serialized.capabilities.openSource, false);
      assert.equal(serialized.capabilities.clientSideOnly, false);
      assert.equal(serialized.capabilities.worksOffline, false);
      assert.equal(serialized.capabilities.free, true);
      assert.equal(serialized.isFeatured, false);
    });

    it('serializes modern editorial intelligence, productScore, and dueDiligence', () => {
      const mockEditorial = {
        bestFor: 'Mock best for',
        pros: ['Pro 1'],
        cons: ['Con 1'],
        privacyVerdict: 'Local only',
        alternativeTo: ['Competitor A'],
        productScore: {
          overall: 95,
          frictionless: 19,
          depth: 24,
          exportFreedom: 19,
          privacy: 19,
          polish: 14,
          factors: {
            frictionless: ['Instant access'],
            privacy: ['100% client RAM execution']
          }
        },
        verdictTier: 'editors-choice',
        benchmarkNotes: 'Lab notes pass',
        testedAt: '2026-09',
        dueDiligence: {
          community: { status: 'community-acclaimed', sentimentScore: 98 },
          openSource: { isRepoVerified: true, isSelfHostable: true },
          privacyAudit: { runtimeClassification: 'Local Only', zeroEgressConfirmed: true },
          visualCraft: { watermarkFree: true, adPollutionTier: 'zero-ads' }
        }
      };

      const serialized = serializeApiTool(MOCK_TOOLS[0], 'en', null, mockEditorial);
      assert.ok(serialized.editorial);
      assert.equal(serialized.editorial.bestFor, 'Mock best for');
      assert.equal(serialized.editorial.verdictTier, 'editors-choice');
      assert.equal(serialized.editorial.productScore.overall, 95);
      assert.equal(serialized.editorial.productScore.privacy, 19);
      assert.equal(serialized.editorial.dueDiligence.community.status, 'community-acclaimed');
      assert.equal(serialized.editorial.dueDiligence.openSource.isSelfHostable, true);
      assert.equal(serialized.editorial.dueDiligence.privacyAudit.zeroEgressConfirmed, true);
      assert.equal(serialized.editorial.dueDiligence.visualCraft.watermarkFree, true);
    });
  });

  describe('filterApiTools', () => {
    it('returns all tools when no filters applied', () => {
      const result = filterApiTools(MOCK_TOOLS, {});
      assert.equal(result.total, 3);
      assert.equal(result.tools.length, 3);
    });

    it('filters by keyword search (q)', () => {
      const byName = filterApiTools(MOCK_TOOLS, { q: 'cyberchef' });
      assert.equal(byName.total, 1);
      assert.equal(byName.tools[0].name, 'CyberChef');

      const byDesc = filterApiTools(MOCK_TOOLS, { q: 'whiteboard' });
      assert.equal(byDesc.total, 1);
      assert.equal(byDesc.tools[0].name, 'Excalidraw');
    });

    it('filters by category', () => {
      const dev = filterApiTools(MOCK_TOOLS, { category: 'development' });
      assert.equal(dev.total, 1);
      assert.equal(dev.tools[0].name, 'CyberChef');

      const design = filterApiTools(MOCK_TOOLS, { category: 'Design' });
      assert.equal(design.total, 1);
      assert.equal(design.tools[0].name, 'Excalidraw');
    });

    it('filters by boolean flags', () => {
      const clientSide = filterApiTools(MOCK_TOOLS, { clientSide: true });
      assert.equal(clientSide.total, 1);
      assert.equal(clientSide.tools[0].name, 'CyberChef');

      const openSource = filterApiTools(MOCK_TOOLS, { openSource: true });
      assert.equal(openSource.total, 2);

      const freeOnly = filterApiTools(MOCK_TOOLS, { free: true });
      assert.equal(freeOnly.total, 2);
    });

    it('supports pagination with limit and offset', () => {
      const page1 = filterApiTools(MOCK_TOOLS, { limit: 1, offset: 0 });
      assert.equal(page1.tools.length, 1);
      assert.equal(page1.total, 3);
      assert.equal(page1.limit, 1);
      assert.equal(page1.offset, 0);

      const page2 = filterApiTools(MOCK_TOOLS, { limit: 1, offset: 1 });
      assert.equal(page2.tools.length, 1);
      assert.notEqual(page1.tools[0].slug, page2.tools[0].slug);
    });

    it('supports sorting options', () => {
      // score (default) - sorted by score desc
      const rec = filterApiTools(MOCK_TOOLS, { sort: 'score' });
      assert.equal(rec.tools[0].name, 'CyberChef'); // score 95
      assert.equal(rec.tools[1].name, 'Excalidraw'); // score 85
      assert.equal(rec.tools[2].name, 'Temp Mail'); // score 70

      // name asc
      const nameSort = filterApiTools(MOCK_TOOLS, { sort: 'name' });
      assert.equal(nameSort.tools[0].name, 'CyberChef');
      assert.equal(nameSort.tools[1].name, 'Excalidraw');
      assert.equal(nameSort.tools[2].name, 'Temp Mail');

      // newest desc
      const newestSort = filterApiTools(MOCK_TOOLS, { sort: 'newest' });
      assert.equal(newestSort.tools[0].name, 'Excalidraw'); // 1710000000000
      assert.equal(newestSort.tools[1].name, 'CyberChef'); // 1700000000000
      assert.equal(newestSort.tools[2].name, 'Temp Mail'); // 1690000000000
    });
  });

  describe('OPENAPI_SPEC', () => {
    it('is valid OpenAPI 3.1.0 specification', () => {
      assert.equal(OPENAPI_SPEC.openapi, '3.1.0');
      assert.ok(OPENAPI_SPEC.info.title.includes('nologin.tools'));
      assert.ok(OPENAPI_SPEC.info.version);
      assert.ok(OPENAPI_SPEC.paths['/api/v1/tools']);
      assert.ok(OPENAPI_SPEC.paths['/api/v1/tools/{slug}']);
      assert.ok(OPENAPI_SPEC.paths['/api/v1/workflows']);
    });

    it('defines query parameters and schema models', () => {
      const getTools = OPENAPI_SPEC.paths['/api/v1/tools'].get;
      assert.ok(getTools);
      const paramNames = getTools.parameters.map((p) => p.name);
      assert.ok(paramNames.includes('q'));
      assert.ok(paramNames.includes('category'));
      assert.ok(paramNames.includes('clientSide'));
      assert.ok(paramNames.includes('offline'));
      assert.ok(paramNames.includes('openSource'));
      assert.ok(paramNames.includes('limit'));
      assert.ok(paramNames.includes('offset'));
      assert.ok(paramNames.includes('sort'));
    });
  });

  describe('MCP_TOOLS_SPEC', () => {
    it('contains MCP tool declarations for LLM agent integration', () => {
      assert.ok(Array.isArray(MCP_TOOLS_SPEC.tools));
      assert.ok(MCP_TOOLS_SPEC.tools.length >= 3);

      const toolNames = MCP_TOOLS_SPEC.tools.map((t) => t.name);
      assert.ok(toolNames.includes('search_nologin_tools'));
      assert.ok(toolNames.includes('get_tool_details'));
      assert.ok(toolNames.includes('list_workflows'));
    });

    it('has valid inputSchema for each tool', () => {
      for (const tool of MCP_TOOLS_SPEC.tools) {
        assert.equal(tool.inputSchema.type, 'object');
        assert.ok(tool.inputSchema.properties);
        assert.ok(typeof tool.description === 'string');
      }

      const getDetails = MCP_TOOLS_SPEC.tools.find((t) => t.name === 'get_tool_details');
      assert.deepEqual(getDetails.inputSchema.required, ['slug']);
    });
  });
});
