import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { ALTERNATIVE_TARGETS } from '../src/lib/alternatives-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const buildDataPath = resolve(ROOT, 'src/data/build-data.json');
const editorialPath = resolve(ROOT, 'src/data/tool-editorial.json');
const extDir = resolve(ROOT, 'packages/extension');
const srcDir = resolve(extDir, 'src');

const buildData = JSON.parse(readFileSync(buildDataPath, 'utf8'));
const editorialData = JSON.parse(readFileSync(editorialPath, 'utf8'));

const DOMAIN_MAP = {
  photoshop: ['photoshop.adobe.com', 'adobe.com'],
  canva: ['canva.com'],
  figma: ['figma.com'],
  miro: ['miro.com'],
  lucidchart: ['lucidchart.com', 'lucid.app'],
  notion: ['notion.so', 'notion.site'],
  grammarly: ['grammarly.com'],
  zoom: ['zoom.us'],
  smallpdf: ['smallpdf.com'],
  ilovepdf: ['ilovepdf.com'],
  postman: ['postman.com'],
  audacity: ['audacityteam.org'],
  tinypng: ['tinypng.com'],
  cloudconvert: ['cloudconvert.com'],
  illustrator: ['illustrator.adobe.com'],
  visio: ['visio.office.com'],
};

const approvedTools = (buildData.tools || []).filter((t) => t.status === 'approved');

// Compact tools database
const compactTools = approvedTools.map((t) => {
  const getTagValue = (key) =>
    t.tags?.find((item) => item.tagKey === key || item.key === key)?.tagValue ||
    t.tags?.find((item) => item.tagKey === key || item.key === key)?.value;

  const category = getTagValue('category') || 'Other';
  const isClientSideOnly = Boolean(
    t.tags?.some((item) => (item.tagKey === 'data' || item.key === 'data') && (item.tagValue === 'Client-Side Only' || item.value === 'Client-Side Only'))
  );
  const worksOffline = Boolean(
    t.tags?.some((item) => (item.tagKey === 'offline' || item.key === 'offline') && (item.tagValue === 'Works Offline' || item.value === 'Works Offline'))
  );
  const isOpenSource = Boolean(
    t.repoUrl ||
      t.tags?.some((item) => (item.tagKey === 'source' || item.key === 'source') && (item.tagValue === 'Open Source' || item.value === 'Open Source'))
  );
  const isFree = Boolean(
    t.tags?.some((item) => (item.tagKey === 'pricing' || item.key === 'pricing') && (item.tagValue === 'Free' || item.value === 'Free'))
  );

  let hostname = '';
  try {
    hostname = new URL(t.url).hostname.replace(/^www\./, '');
  } catch {}

  return {
    slug: t.slug,
    name: t.name,
    url: t.url,
    hostname,
    category,
    description: t.description || '',
    coreTask: t.coreTask || '',
    isFeatured: Boolean(t.isFeatured),
    capabilities: {
      clientSideOnly: isClientSideOnly,
      worksOffline,
      openSource: isOpenSource,
      free: isFree,
    },
  };
});

// Domain alternative mappings
const domainAlternatives = {};

for (const target of ALTERNATIVE_TARGETS) {
  const domains = DOMAIN_MAP[target.slug] || [`${target.slug}.com`];
  const matchingSlugs = new Set();
  for (const [toolSlug, entry] of Object.entries(editorialData)) {
    const alts = entry.en?.alternativeTo || [];
    if (alts.some((a) => target.aliases.some((alias) => alias.toLowerCase() === a.toLowerCase()))) {
      matchingSlugs.add(toolSlug);
    }
  }

  const matchingTools = compactTools
    .filter((t) => matchingSlugs.has(t.slug))
    .slice(0, 4);

  for (const domain of domains) {
    domainAlternatives[domain] = {
      targetName: target.name,
      targetSlug: target.slug,
      category: target.category,
      headline: target.headline,
      tools: matchingTools,
    };
  }
}

// Extra high-intent privacy switches
domainAlternatives['wetransfer.com'] = {
  targetName: 'WeTransfer',
  targetSlug: 'wetransfer',
  category: 'Privacy',
  headline: 'Send files with end-to-end encryption without email capture or subscription gates',
  tools: compactTools.filter((t) => t.slug === 'wormhole-app' || t.slug === 'hat-sh' || t.slug === 'snapdrop-net').slice(0, 3),
};

domainAlternatives['loom.com'] = {
  targetName: 'Loom',
  targetSlug: 'loom',
  category: 'Media',
  headline: 'Record screen and camera without account registration or video upload limits',
  tools: compactTools.filter((t) => t.slug === 'recordrtc-org' || t.slug === 'audiomass-co').slice(0, 2),
};

mkdirSync(srcDir, { recursive: true });
writeFileSync(resolve(srcDir, 'tools-data.json'), JSON.stringify(compactTools), 'utf8');
writeFileSync(resolve(srcDir, 'alternatives-data.json'), JSON.stringify(domainAlternatives, null, 2), 'utf8');

console.log(`Generated extension data: ${compactTools.length} tools, ${Object.keys(domainAlternatives).length} domain alternative mappings.`);

// Package zip distribution if zip utility is available
const distExtDir = resolve(ROOT, 'dist-extension');
mkdirSync(distExtDir, { recursive: true });

try {
  const chromeZip = resolve(distExtDir, 'nologin-quick-switcher-chrome.zip');
  execSync(`cd "${extDir}" && zip -r "${chromeZip}" manifest.json background.js icons popup src -x "*.DS_Store"`, { stdio: 'inherit' });
  console.log(`Packaged Chrome extension: ${chromeZip}`);

  const downloadsDir = resolve(ROOT, 'public/downloads');
  mkdirSync(downloadsDir, { recursive: true });
  copyFileSync(chromeZip, resolve(downloadsDir, 'nologin-quick-switcher-chrome.zip'));
  console.log(`Published downloadable zip to: ${resolve(downloadsDir, 'nologin-quick-switcher-chrome.zip')}`);
} catch (e) {
  console.log('Zip packaging skipped or failed:', e.message);
}
