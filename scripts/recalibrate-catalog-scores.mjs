// @ts-check
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
export const EDITORIAL_PATH = resolve(ROOT_DIR, 'src/data/tool-editorial.json');
export const BUILD_DATA_PATH = resolve(ROOT_DIR, 'src/data/build-data.json');

export const LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];

/**
 * Top 12-15% Tier S: Verified Canonical Workstations
 * Possessing canvas/WebGL engines, compilers, audio/video pipelines, full-featured IDEs/whiteboards.
 */
export const CANONICAL_WORKSTATIONS = new Set([
  'excalidraw-com',
  'photopea-com',
  'tldraw-com',
  'squoosh-app',
  'gchq-github-io-cyberchef',
  'desmos-com-calculator',
  'geogebra-org-calculator',
  'app-diagrams-net',
  'audiomass-co',
  'godbolt-org',
  'play-rust-lang-org',
  'go-dev-play',
  'typescriptlang-org-play',
  'mermaid-live',
  'astexplorer-net',
  'regex101-com',
  'devdocs-io',
  'hoppscotch-io',
  'carbon-now-sh',
  'pythontutor-com',
  'visualgo-net',
  'rawgraphs-io',
  'photomosh-com',
  'animista-net',
  'haikei-app',
  'fomrix-com-stl-viewer',
  'phet-colorado-edu',
  'lite-datasette-io',
  'webutilslab-com-tools',
  'toolsphare-tech-en',
  'artboardlab-com',
  'gantt-chart-io',
  'spritesheettool-com',
  'www-allsubconverter-com',
  'crochet-chart-maker-com',
  'salitronic-com-gerber-analyzer',
  'nextgenailearning-com',
  'pst-aivismonitor-com',
  'nextreset-ai',
  'bytepriva-com-merge-pdf',
  'svgviewer-app',
  'diffhero-app'
]);

/**
 * Recalibrate a tool's 5D Product Score to eliminate grade inflation.
 * Enforces strict architectural ladders.
 * 
 * @param {any} tool
 * @param {any} editorialEn
 * @returns {{
 *   overall: number;
 *   frictionless: number;
 *   depth: number;
 *   exportFreedom: number;
 *   privacy: number;
 *   polish: number;
 *   verdictTier: string;
 * }}
 */
export function recalibrateToolScore(tool, editorialEn) {
  const isWorkstation = CANONICAL_WORKSTATIONS.has(tool.slug);
  const oldScore = editorialEn?.productScore || {};
  const isEmergency = editorialEn?.verdictTier === 'emergency-only';

  if (isEmergency) {
    const frictionless = typeof oldScore.frictionless === 'number' ? oldScore.frictionless : 8;
    const depth = typeof oldScore.depth === 'number' ? oldScore.depth : 10;
    const exportFreedom = typeof oldScore.exportFreedom === 'number' ? oldScore.exportFreedom : 5;
    const privacy = typeof oldScore.privacy === 'number' ? oldScore.privacy : 12;
    const polish = typeof oldScore.polish === 'number' ? oldScore.polish : 8;
    const overall = typeof oldScore.overall === 'number' && oldScore.overall === (frictionless + depth + exportFreedom + privacy + polish)
      ? oldScore.overall
      : (frictionless + depth + exportFreedom + privacy + polish);
    return {
      overall,
      frictionless,
      depth,
      exportFreedom,
      privacy,
      polish,
      verdictTier: 'emergency-only'
    };
  }

  const isLocal = (tool.tags || []).some((/** @type {any} */ t) => t.tagKey === 'data' && (t.tagValue === 'Client-Side Only' || t.tagValue === 'Local Only'));
  const isOffline = (tool.tags || []).some((/** @type {any} */ t) => t.tagKey === 'offline' && (t.tagValue === 'Works Offline' || t.tagValue === 'Offline Capable'));
  const hasTelemetry = (editorialEn?.cons || []).some((/** @type {string} */ c) => /telemetry|tracking|adsense|analytics|google analytics/i.test(c));

  if (isWorkstation) {
    // 👑 Editor's Choice (Overall 92 - 96)
    const frictionless = 19;
    const depth = 24; // Strict requirement: Depth >= 22
    const exportFreedom = 19;
    const privacy = isLocal && isOffline ? 20 : isLocal ? 19 : 17;
    const polish = 14;
    const overall = frictionless + depth + exportFreedom + (hasTelemetry ? privacy - 1 : privacy) + polish;
    return {
      overall,
      frictionless,
      depth,
      exportFreedom,
      privacy: hasTelemetry ? privacy - 1 : privacy,
      polish,
      verdictTier: 'editors-choice'
    };
  }

  const text = `${tool.description || ''} ${tool.coreTask || ''} ${editorialEn?.bestFor || ''} ${(editorialEn?.pros || []).join(' ')}`.toLowerCase();
  const isAdvanced = /(\b(?:batch|indexeddb|sqlite|pwa|monaco|codemirror|syntax tree|visualization|matrix|palette|diff|audiobook|spectrogram|gerber|parser|generator|chart|simulator|vector|filter|converter|svg|canvas|audio|editor|transform|compression|compressor|inspector)\b)/i.test(text);

  if (isAdvanced || (tool.tags || []).some((/** @type {any} */ t) => t.tagValue === 'PWA' || t.tagValue === 'Offline Capable')) {
    // 🌟 Highly Recommended (Overall 81 - 85)
    const frictionless = 18;
    const depth = 18; // Advanced utility depth
    const exportFreedom = 17;
    const privacy = isLocal && isOffline ? 19 : isLocal ? 18 : 15;
    const polish = 13;
    const adjPrivacy = hasTelemetry ? privacy - 2 : privacy;
    const overall = frictionless + depth + exportFreedom + adjPrivacy + polish;
    return {
      overall,
      frictionless,
      depth,
      exportFreedom,
      privacy: adjPrivacy,
      polish,
      verdictTier: 'highly-recommended'
    };
  }

  // 🛠️ Capable Utility (Overall 70 - 76)
  const frictionless = 17;
  const depth = 13; // Single-task / basic utility depth
  const exportFreedom = 15;
  const privacy = isLocal && isOffline ? 19 : isLocal ? 17 : 15;
  const polish = 12;
  const adjPrivacy = hasTelemetry ? privacy - 2 : privacy;
  const overall = frictionless + depth + exportFreedom + adjPrivacy + polish;

  return {
    overall,
    frictionless,
    depth,
    exportFreedom,
    privacy: adjPrivacy,
    polish,
    verdictTier: 'capable-utility'
  };
}

/**
 * Execute catalog re-calibration across tool-editorial.json
 */
export function runRecalibration() {
  const editorial = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf-8'));
  const buildData = JSON.parse(readFileSync(BUILD_DATA_PATH, 'utf-8'));
  const approvedTools = (buildData.tools || []).filter(t => t.status === 'approved');

  const tierCounts = { 'editors-choice': 0, 'highly-recommended': 0, 'capable-utility': 0, 'emergency-only': 0 };
  let totalScore = 0;

  for (const tool of approvedTools) {
    const entry = editorial[tool.slug];
    if (!entry || !entry.en) continue;

    const newScore = recalibrateToolScore(tool, entry.en);
    tierCounts[newScore.verdictTier]++;
    totalScore += newScore.overall;

    // Apply synchronized score & tier across all 8 locales
    for (const loc of LOCALES) {
      if (entry[loc]) {
        entry[loc].productScore = {
          overall: newScore.overall,
          frictionless: newScore.frictionless,
          depth: newScore.depth,
          exportFreedom: newScore.exportFreedom,
          privacy: newScore.privacy,
          polish: newScore.polish
        };
        entry[loc].verdictTier = newScore.verdictTier;
      }
    }
  }

  writeFileSync(EDITORIAL_PATH, JSON.stringify(editorial, null, 2) + '\n', 'utf-8');

  console.log(`\n======================================================`);
  console.log(`🏆 Catalog Re-calibration Results (Anti-Inflation)`);
  console.log(`======================================================`);
  console.log(`Total Approved Tools : ${approvedTools.length}`);
  console.log(`Average Product Score: ${(totalScore / approvedTools.length).toFixed(1)}`);
  console.log(`------------------------------------------------------`);
  console.log(`Healthy Pyramid Distribution:`);
  for (const [tier, count] of Object.entries(tierCounts)) {
    const pct = ((count / approvedTools.length) * 100).toFixed(1);
    console.log(`  • ${tier.padEnd(20)} : ${count} (${pct}%)`);
  }
  console.log(`======================================================\n`);
}

const isMain = !process.argv[1] || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMain && !process.env.NODE_TEST_CONTEXT) {
  runRecalibration();
}
