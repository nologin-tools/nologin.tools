import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serializeApiTool } from '../src/lib/api-v1-core.mjs';
import { WORKFLOW_RECIPES } from '../src/lib/workflows-data.mjs';
import { ALTERNATIVE_TARGETS } from '../src/lib/alternatives-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const buildDataPath = resolve(ROOT, 'src/data/build-data.json');
const editorialPath = resolve(ROOT, 'src/data/tool-editorial.json');
const outDir = resolve(ROOT, 'packages/mcp/src/data');
const outFile = resolve(outDir, 'fallback-data.json');

const buildData = JSON.parse(readFileSync(buildDataPath, 'utf8'));
const editorialData = JSON.parse(readFileSync(editorialPath, 'utf8'));

const approvedTools = (buildData.tools || []).filter((t) => t.status === 'approved');

const serializedTools = approvedTools.map((t) => {
  const editorial = editorialData[t.slug]?.en || null;
  return serializeApiTool(t, 'en', { status: 'online', checkedAt: new Date().toISOString() }, editorial);
});

// Build alternative target mappings
const alternatives = ALTERNATIVE_TARGETS.map((target) => {
  const matchingSlugs = new Set();
  for (const [toolSlug, entry] of Object.entries(editorialData)) {
    const alts = entry.en?.alternativeTo || [];
    if (alts.some((a) => target.aliases.some((alias) => alias.toLowerCase() === a.toLowerCase()))) {
      matchingSlugs.add(toolSlug);
    }
  }

  const matchingTools = serializedTools
    .filter((t) => matchingSlugs.has(t.slug))
    .map((t) => ({
      slug: t.slug,
      name: t.name,
      url: t.url,
      description: t.description,
      category: t.category,
      capabilities: t.capabilities,
    }));

  return {
    slug: target.slug,
    name: target.name,
    category: target.category,
    aliases: target.aliases,
    headline: target.headline,
    tools: matchingTools,
  };
});

const payload = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  tools: serializedTools,
  workflows: WORKFLOW_RECIPES,
  alternatives,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8');

console.log(`Generated MCP fallback data: ${serializedTools.length} tools, ${WORKFLOW_RECIPES.length} workflows, ${alternatives.length} alternatives at ${outFile}`);
