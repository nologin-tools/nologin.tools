// @ts-check
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const BUILD_DATA_PATH = resolve(ROOT_DIR, 'src/data/build-data.json');
const TRANSLATIONS_DIR = resolve(ROOT_DIR, 'src/data/translations');

export const SUPPORTED_LOCALES = ['zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];

/**
 * Compute the 16-character SHA-256 source hash for a tool.
 * Incorporates description, coreTask, and SEO metadata fields.
 *
 * @param {{
 *   description?: string | null;
 *   coreTask?: string | null;
 *   seoTitle?: string | null;
 *   seoDescription?: string | null;
 *   seoTaskPhrase?: string | null;
 *   seoFocusKeyword?: string | null;
 * }} tool
 * @returns {string}
 */
export function computeSourceHash(tool) {
  const contentToHash = `${tool.description || ''}|${tool.coreTask || ''}|${tool.seoTitle || ''}|${tool.seoDescription || ''}|${tool.seoTaskPhrase || ''}|${tool.seoFocusKeyword || ''}`;
  return createHash('sha256').update(contentToHash).digest('hex').slice(0, 16);
}

/**
 * Load translations for all supported non-English locales.
 * @param {string} [dir]
 * @returns {Record<string, Record<string, any>>}
 */
export function loadAllTranslations(dir = TRANSLATIONS_DIR) {
  /** @type {Record<string, Record<string, any>>} */
  const result = {};
  for (const locale of SUPPORTED_LOCALES) {
    const filePath = resolve(dir, `${locale}.json`);
    if (existsSync(filePath)) {
      try {
        result[locale] = JSON.parse(readFileSync(filePath, 'utf-8'));
      } catch (err) {
        console.error(`[sync-tool-translations] Error reading ${locale}.json:`, err);
        result[locale] = {};
      }
    } else {
      result[locale] = {};
    }
  }
  return result;
}

/**
 * Audit translation completeness and freshness against build-data.
 *
 * @param {{ tools: Array<any> }} buildData
 * @param {Record<string, Record<string, any>>} translationsByLocale
 */
export function auditTranslations(buildData, translationsByLocale) {
  const approvedTools = (buildData.tools || []).filter((t) => t.status === 'approved');

  /** @type {Record<string, number>} */
  const missingCount = Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, 0]));
  /** @type {Record<string, number>} */
  const outdatedCount = Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, 0]));

  /** @type {Array<any>} */
  const needsWorkItems = [];

  for (const tool of approvedTools) {
    const sourceHash = computeSourceHash(tool);
    /** @type {Record<string, { status: 'synced' | 'missing' | 'outdated' | 'unhashed', storedHash?: string }>} */
    const localeStatus = {};
    let itemNeedsWork = false;

    for (const locale of SUPPORTED_LOCALES) {
      const entry = translationsByLocale[locale]?.[tool.slug];
      if (!entry || !entry.description || !entry.coreTask) {
        localeStatus[locale] = { status: 'missing' };
        missingCount[locale]++;
        itemNeedsWork = true;
      } else if (!entry._hash) {
        localeStatus[locale] = { status: 'unhashed' };
        // Valid translation exists, just missing hash baseline
      } else if (entry._hash !== sourceHash) {
        localeStatus[locale] = { status: 'outdated', storedHash: entry._hash };
        outdatedCount[locale]++;
        itemNeedsWork = true;
      } else {
        localeStatus[locale] = { status: 'synced', storedHash: entry._hash };
      }
    }

    if (itemNeedsWork) {
      needsWorkItems.push({
        id: tool.id,
        slug: tool.slug,
        name: tool.name,
        sourceHash,
        description: tool.description,
        coreTask: tool.coreTask,
        locales: localeStatus,
      });
    }
  }

  const totalNeedsAttention = needsWorkItems.length;
  const fullySynced = approvedTools.length - totalNeedsAttention;

  return {
    summary: {
      totalApproved: approvedTools.length,
      fullySynced,
      needsAttention: totalNeedsAttention,
      missingCount,
      outdatedCount,
    },
    items: needsWorkItems,
  };
}

/**
 * Apply batch translations safely to target JSON files.
 * Automatically injects the correct `_hash` based on tool metadata in build-data.
 *
 * @param {{
 *   buildData: { tools: Array<any> };
 *   translationsDir?: string;
 *   payload: Record<string, Record<string, any> & {
 *     _source?: {
 *       description: string;
 *       coreTask: string;
 *       seoTitle?: string;
 *       seoDescription?: string;
 *       seoFocusKeyword?: string;
 *       seoTaskPhrase?: string;
 *     };
 *   }>;
 * }} params
 * @returns {{ updatedLocales: string[], updatedSlugs: string[] }}
 */
export function applyTranslations({ buildData, translationsDir = TRANSLATIONS_DIR, payload }) {
  const translationsByLocale = loadAllTranslations(translationsDir);
  const toolMap = new Map((buildData.tools || []).map((t) => [t.slug, t]));

  const updatedLocalesSet = new Set();
  const updatedSlugsSet = new Set();

  for (const [slug, localeMap] of Object.entries(payload)) {
    const sourceOverride = localeMap?._source;
    const tool = sourceOverride || toolMap.get(slug);
    if (!tool) {
      console.warn(`[sync-tool-translations] Warning: Tool "${slug}" not found in build data and payload has no _source metadata.`);
      continue;
    }
    if (!tool.description || !tool.coreTask) {
      console.warn(`[sync-tool-translations] Warning: Tool "${slug}" is missing source description or coreTask.`);
      continue;
    }

    const sourceHash = computeSourceHash(tool);

    for (const [locale, data] of Object.entries(localeMap)) {
      if (locale === '_source') continue;
      if (!SUPPORTED_LOCALES.includes(locale)) {
        console.warn(`[sync-tool-translations] Warning: Unsupported locale "${locale}" for tool "${slug}".`);
        continue;
      }

      if (!data.description || !data.coreTask) {
        console.warn(`[sync-tool-translations] Warning: Missing description or coreTask for "${slug}" in "${locale}".`);
        continue;
      }

      if (!translationsByLocale[locale]) {
        translationsByLocale[locale] = {};
      }

      // Construct clean translation entry
      const entry = {
        _hash: sourceHash,
        description: data.description.trim(),
        coreTask: data.coreTask.trim(),
      };

      if (data.seoTitle?.trim()) entry.seoTitle = data.seoTitle.trim();
      if (data.seoDescription?.trim()) entry.seoDescription = data.seoDescription.trim();
      if (data.seoFocusKeyword?.trim()) entry.seoFocusKeyword = data.seoFocusKeyword.trim();
      if (data.seoTaskPhrase?.trim()) entry.seoTaskPhrase = data.seoTaskPhrase.trim();

      translationsByLocale[locale][slug] = entry;
      updatedLocalesSet.add(locale);
      updatedSlugsSet.add(slug);
    }
  }

  // Write sorted files back
  for (const locale of updatedLocalesSet) {
    const file = resolve(translationsDir, `${locale}.json`);
    const sortedDict = Object.keys(translationsByLocale[locale])
      .sort()
      .reduce((acc, key) => {
        acc[key] = translationsByLocale[locale][key];
        return acc;
      }, /** @type {Record<string, any>} */ ({}));

    writeFileSync(file, JSON.stringify(sortedDict, null, 2) + '\n', 'utf-8');
  }

  return {
    updatedLocales: Array.from(updatedLocalesSet),
    updatedSlugs: Array.from(updatedSlugsSet),
  };
}

// CLI Execution handler
function runCli() {
  const args = process.argv.slice(2);
  const isCheckMode = args.includes('--check');
  const isDiffMode = args.includes('--diff') || args.includes('--status');
  const isJsonMode = args.includes('--json');
  const applyArgIndex = args.indexOf('--apply');
  const templateArgIndex = args.indexOf('--export-template');

  if (!existsSync(BUILD_DATA_PATH)) {
    console.error(`[sync-tool-translations] Error: build-data.json not found at ${BUILD_DATA_PATH}`);
    process.exit(1);
  }

  const buildData = JSON.parse(readFileSync(BUILD_DATA_PATH, 'utf-8'));

  // Handler: Apply translations
  if (applyArgIndex !== -1) {
    const filePath = args[applyArgIndex + 1];
    if (!filePath || !existsSync(filePath)) {
      console.error(`[sync-tool-translations] Error: Valid file path required after --apply`);
      process.exit(1);
    }
    const payload = JSON.parse(readFileSync(filePath, 'utf-8'));
    const result = applyTranslations({ buildData, payload });
    console.log(`[sync-tool-translations] Successfully updated ${result.updatedSlugs.length} tools across ${result.updatedLocales.length} locales.`);
    console.log(`Updated tools: ${result.updatedSlugs.join(', ')}`);
    process.exit(0);
  }

  const translationsByLocale = loadAllTranslations();
  const audit = auditTranslations(buildData, translationsByLocale);

  // Handler: Export template
  if (templateArgIndex !== -1) {
    const targetFile = args[templateArgIndex + 1] || 'translations-template.json';
    /** @type {Record<string, any>} */
    const template = {};
    for (const item of audit.items) {
      template[item.slug] = {
        name: item.name,
        source: {
          description: item.description,
          coreTask: item.coreTask,
        },
        translations: {},
      };
      for (const [locale, status] of Object.entries(item.locales)) {
        if (status.status !== 'synced') {
          template[item.slug].translations[locale] = {
            description: '',
            coreTask: '',
          };
        }
      }
    }
    writeFileSync(resolve(process.cwd(), targetFile), JSON.stringify(template, null, 2) + '\n', 'utf-8');
    console.log(`[sync-tool-translations] Exported translation template for ${audit.items.length} tools to ${targetFile}`);
    process.exit(0);
  }

  if (isJsonMode) {
    console.log(JSON.stringify(audit, null, 2));
    if (isCheckMode && audit.summary.needsAttention > 0) process.exit(1);
    process.exit(0);
  }

  // Print Human Report
  console.log(`\n======================================================`);
  console.log(`       Tool Translation Status Audit Report`);
  console.log(`======================================================`);
  console.log(`Total approved tools : ${audit.summary.totalApproved}`);
  console.log(`Fully synchronized   : ${audit.summary.fullySynced}`);
  console.log(`Needs attention      : ${audit.summary.needsAttention}`);
  console.log(`------------------------------------------------------`);
  console.log(`Missing per locale   : ${JSON.stringify(audit.summary.missingCount)}`);
  console.log(`Outdated per locale  : ${JSON.stringify(audit.summary.outdatedCount)}`);
  console.log(`======================================================\n`);

  if (audit.items.length > 0) {
    console.log(`Tools needing translation:`);
    for (const item of audit.items) {
      const missingLocales = Object.entries(item.locales)
        .filter(([_, s]) => s.status === 'missing')
        .map(([l]) => l);
      const outdatedLocales = Object.entries(item.locales)
        .filter(([_, s]) => s.status === 'outdated')
        .map(([l]) => l);

      console.log(`• [${item.slug}] (${item.name})`);
      if (missingLocales.length > 0) console.log(`  - Missing: ${missingLocales.join(', ')}`);
      if (outdatedLocales.length > 0) console.log(`  - Outdated: ${outdatedLocales.join(', ')}`);
    }
    console.log('');
  }

  if (isCheckMode && audit.summary.needsAttention > 0) {
    console.error(`[sync-tool-translations] Check failed: ${audit.summary.needsAttention} tools require translation.`);
    process.exit(1);
  }
}

const isMain = !process.argv[1] || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMain && !process.env.NODE_TEST_CONTEXT) {
  runCli();
}
