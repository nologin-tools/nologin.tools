// @ts-check
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
export const EDITORIAL_PATH = resolve(ROOT_DIR, 'src/data/tool-editorial.json');
export const BUILD_DATA_PATH = resolve(ROOT_DIR, 'src/data/build-data.json');

export const SUPPORTED_LOCALES = /** @type {const} */ (['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt']);
export const NON_EN_LOCALES = /** @type {const} */ (['zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt']);
export const EXTENDED_LOCALES = /** @type {const} */ (['ja', 'ko', 'es', 'fr', 'de', 'pt']);

export const REQUIRED_TEXT_FIELDS = ['bestFor', 'pros', 'cons', 'privacyVerdict', 'benchmarkNotes'];

/**
 * Validate a single locale block for editorial integrity.
 * @param {string} locale
 * @param {any} block
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateLocaleBlock(locale, block) {
  const errors = [];
  if (!block || typeof block !== 'object') {
    return { valid: false, errors: [`[${locale}] Block is not an object`] };
  }

  if (typeof block.bestFor !== 'string' || block.bestFor.trim().length < 5) {
    errors.push(`[${locale}] bestFor must be a non-empty string (>= 5 chars)`);
  }

  if (!Array.isArray(block.pros) || block.pros.length < 2) {
    errors.push(`[${locale}] pros must be an array with at least 2 items`);
  } else {
    block.pros.forEach((p, idx) => {
      if (typeof p !== 'string' || !p.trim()) {
        errors.push(`[${locale}] pros[${idx}] must be a non-empty string`);
      }
    });
  }

  if (!Array.isArray(block.cons) || block.cons.length < 1) {
    errors.push(`[${locale}] cons must be an array with at least 1 item`);
  } else {
    block.cons.forEach((c, idx) => {
      if (typeof c !== 'string' || !c.trim()) {
        errors.push(`[${locale}] cons[${idx}] must be a non-empty string`);
      }
    });
  }

  if (typeof block.privacyVerdict !== 'string' || block.privacyVerdict.trim().length < 10) {
    errors.push(`[${locale}] privacyVerdict must be a non-empty string (>= 10 chars)`);
  }

  if (typeof block.benchmarkNotes !== 'string' || block.benchmarkNotes.trim().length < 10) {
    errors.push(`[${locale}] benchmarkNotes must be a non-empty string (>= 10 chars)`);
  }

  if (!block.productScore || typeof block.productScore !== 'object') {
    errors.push(`[${locale}] Missing productScore object`);
  } else {
    const { overall, frictionless, depth, exportFreedom, privacy, polish } = block.productScore;
    const sum = (frictionless || 0) + (depth || 0) + (exportFreedom || 0) + (privacy || 0) + (polish || 0);
    if (sum !== overall) {
      errors.push(`[${locale}] productScore sum mismatch: ${sum} !== ${overall}`);
    }
  }

  const validTiers = ['editors-choice', 'highly-recommended', 'capable-utility', 'emergency-only'];
  if (!validTiers.includes(block.verdictTier)) {
    errors.push(`[${locale}] verdictTier must be one of: ${validTiers.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Audit editorial locale coverage across approved tools.
 * @param {Record<string, any>} editorial
 * @param {Array<any>} approvedTools
 * @returns {{
 *   summary: {
 *     totalApproved: number;
 *     fullyCovered: number;
 *     needsWorkCount: number;
 *     missingPerLocale: Record<string, number>;
 *   };
 *   items: Array<{
 *     slug: string;
 *     name: string;
 *     missingLocales: string[];
 *     incompleteLocales: string[];
 *   }>;
 * }}
 */
export function auditEditorialLocales(editorial, approvedTools) {
  const missingPerLocale = Object.fromEntries(SUPPORTED_LOCALES.map(l => [l, 0]));
  const items = [];

  for (const tool of approvedTools) {
    const entry = editorial[tool.slug];
    const missingLocales = [];
    const incompleteLocales = [];

    for (const loc of SUPPORTED_LOCALES) {
      if (!entry || !entry[loc]) {
        missingLocales.push(loc);
        missingPerLocale[loc]++;
      } else {
        const check = validateLocaleBlock(loc, entry[loc]);
        if (!check.valid) {
          incompleteLocales.push(loc);
        }
      }
    }

    if (missingLocales.length > 0 || incompleteLocales.length > 0) {
      items.push({
        slug: tool.slug,
        name: tool.name,
        missingLocales,
        incompleteLocales
      });
    }
  }

  return {
    summary: {
      totalApproved: approvedTools.length,
      fullyCovered: approvedTools.length - items.length,
      needsWorkCount: items.length,
      missingPerLocale
    },
    items
  };
}

/**
 * Translate a single text string into a target locale with retries.
 * @param {string} text
 * @param {string} targetLocale
 * @param {number} [retries=3]
 * @returns {Promise<string>}
 */
export async function translateText(text, targetLocale, retries = 3) {
  if (!text || typeof text !== 'string') return '';
  const clean = text.trim();
  if (!clean) return '';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=${targetLocale}&q=${encodeURIComponent(clean)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const data = await res.json();
        const translated = Array.isArray(data)
          ? (Array.isArray(data[0]) ? data[0].join('') : data[0])
          : String(data);
        if (translated && translated.trim()) {
          return translated.trim();
        }
      }
    } catch (err) {
      if (attempt === retries) {
        try {
          const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|${targetLocale}`;
          const mmRes = await fetch(myMemoryUrl, { signal: AbortSignal.timeout(5000) });
          if (mmRes.ok) {
            const mmData = await mmRes.json();
            if (mmData.responseData?.translatedText) {
              return mmData.responseData.translatedText.trim();
            }
          }
        } catch {}
      }
      await new Promise(r => setTimeout(r, 400 * attempt));
    }
  }
  return clean;
}

/**
 * Expand and translate an entire tool entry into target locales.
 * @param {any} toolEntry
 * @param {string[]} [targetLocales=EXTENDED_LOCALES]
 * @returns {Promise<Record<string, any>>}
 */
export async function expandEditorialEntry(toolEntry, targetLocales = EXTENDED_LOCALES) {
  const baseEn = toolEntry.en;
  if (!baseEn) return toolEntry;

  for (const loc of targetLocales) {
    if (toolEntry[loc] && validateLocaleBlock(loc, toolEntry[loc]).valid) {
      continue;
    }

    const [bestFor, pros, cons, privacyVerdict, benchmarkNotes] = await Promise.all([
      translateText(baseEn.bestFor, loc),
      Promise.all((baseEn.pros || []).map(p => translateText(p, loc))),
      Promise.all((baseEn.cons || []).map(c => translateText(c, loc))),
      translateText(baseEn.privacyVerdict, loc),
      translateText(baseEn.benchmarkNotes, loc)
    ]);

    toolEntry[loc] = {
      bestFor,
      pros,
      cons,
      privacyVerdict,
      benchmarkNotes,
      productScore: { ...baseEn.productScore },
      verdictTier: baseEn.verdictTier,
      alternativeTo: [ ...(baseEn.alternativeTo || []) ],
      testedAt: baseEn.testedAt || new Date().toISOString().slice(0, 7)
    };
  }

  return toolEntry;
}

/**
 * Apply translated chunk to editorial data safely.
 * Enforces metadata synchronization from EN (scores, tier, alternatives, testedAt).
 *
 * @param {Record<string, any>} editorial
 * @param {Record<string, any>} chunk
 * @returns {{ updatedSlugs: string[], updatedLocales: Record<string, number>, errors: string[] }}
 */
export function applyEditorialChunk(editorial, chunk) {
  const updatedSlugs = [];
  const updatedLocales = Object.fromEntries(SUPPORTED_LOCALES.map(l => [l, 0]));
  const errors = [];

  for (const [slug, localesData] of Object.entries(chunk)) {
    if (!editorial[slug] && !localesData.en) {
      errors.push(`Tool [${slug}] has no base English record in editorial or chunk; cannot apply.`);
      continue;
    }

    editorial[slug] = editorial[slug] || {};
    const baseEn = localesData.en || editorial[slug].en;
    if (!baseEn) {
      errors.push(`Tool [${slug}] missing base English record.`);
      continue;
    }

    const { productScore, verdictTier, alternativeTo, testedAt } = baseEn;
    let toolUpdated = false;

    for (const [loc, block] of Object.entries(localesData)) {
      if (!SUPPORTED_LOCALES.includes(/** @type {any} */ (loc))) {
        continue;
      }

      const completeBlock = {
        ...block,
        productScore: { ...productScore },
        verdictTier,
        testedAt: testedAt || block.testedAt || new Date().toISOString().slice(0, 7),
        alternativeTo: block.alternativeTo || alternativeTo || []
      };

      const validation = validateLocaleBlock(loc, completeBlock);
      if (!validation.valid) {
        errors.push(`[${slug}][${loc}] Validation failed:\n  • ${validation.errors.join('\n  • ')}`);
        continue;
      }

      editorial[slug][loc] = completeBlock;
      updatedLocales[loc]++;
      toolUpdated = true;
    }

    if (toolUpdated) {
      updatedSlugs.push(slug);
    }
  }

  return {
    updatedSlugs,
    updatedLocales,
    errors
  };
}

/**
 * CLI Handler
 */
export async function runCli() {
  const args = process.argv.slice(2);
  const isAudit = args.includes('--audit') || args.includes('--status');
  const isCheck = args.includes('--check');
  const isJson = args.includes('--json');
  const isBackfill = args.includes('--backfill');
  const applyIdx = args.indexOf('--apply');
  const exportChunkIdx = args.indexOf('--export-chunk');
  const slugIdx = args.indexOf('--slug');

  if (!existsSync(EDITORIAL_PATH) || !existsSync(BUILD_DATA_PATH)) {
    console.error('❌ Required data files (tool-editorial.json or build-data.json) not found.');
    process.exit(1);
  }

  const editorial = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf-8'));
  const buildData = JSON.parse(readFileSync(BUILD_DATA_PATH, 'utf-8'));
  const approvedTools = (buildData.tools || []).filter((/** @type {any} */ t) => t.status === 'approved');

  if (applyIdx !== -1) {
    const file = args[applyIdx + 1];
    if (!file || !existsSync(file)) {
      console.error(`❌ Valid JSON file required after --apply`);
      process.exit(1);
    }
    const chunk = JSON.parse(readFileSync(file, 'utf-8'));
    const result = applyEditorialChunk(editorial, chunk);
    if (result.errors.length > 0) {
      console.error(`⚠️ Errors during apply:\n${result.errors.join('\n')}`);
    }
    if (result.updatedSlugs.length > 0) {
      writeFileSync(EDITORIAL_PATH, JSON.stringify(editorial, null, 2) + '\n', 'utf-8');
      console.log(`✅ Successfully updated ${result.updatedSlugs.length} tools in ${EDITORIAL_PATH}`);
      console.log(`Locale updates count: ${JSON.stringify(result.updatedLocales)}`);
    } else {
      console.log('No tools were updated.');
    }
    process.exit(result.errors.length > 0 ? 1 : 0);
  }

  if (isBackfill) {
    const targetSlug = slugIdx !== -1 ? args[slugIdx + 1] : null;
    const batchSize = 10;
    let candidates = approvedTools.filter(t => {
      const entry = editorial[t.slug];
      if (!entry || !entry.en) return false;
      return EXTENDED_LOCALES.some(loc => !entry[loc] || !validateLocaleBlock(loc, entry[loc]).valid);
    });

    if (targetSlug) {
      candidates = candidates.filter(t => t.slug === targetSlug);
    }

    console.log(`\n🚀 Starting 8-locale editorial backfill for ${candidates.length} tools...`);
    let completed = 0;

    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      console.log(`\n[${i + 1}-${Math.min(i + batchSize, candidates.length)} / ${candidates.length}] Processing batch...`);

      await Promise.all(batch.map(async (tool) => {
        try {
          editorial[tool.slug] = await expandEditorialEntry(editorial[tool.slug]);
          completed++;
          process.stdout.write(`  ✔ [${tool.slug}]\n`);
        } catch (err) {
          console.error(`  ❌ [${tool.slug}] Failed:`, err.message);
        }
      }));

      // Flush progress to disk
      writeFileSync(EDITORIAL_PATH, JSON.stringify(editorial, null, 2) + '\n', 'utf-8');
      console.log(`💾 Checkpoint saved: ${completed} / ${candidates.length} tools backfilled.`);
      await new Promise(r => setTimeout(r, 600));
    }

    console.log(`\n🎉 Backfill complete! Total processed: ${completed}`);
    process.exit(0);
  }

  const audit = auditEditorialLocales(editorial, approvedTools);

  if (exportChunkIdx !== -1) {
    const outFile = args[exportChunkIdx + 1] || '/tmp/editorial-export-chunk.json';
    const limitArg = args[args.indexOf('--limit') + 1];
    const offsetArg = args[args.indexOf('--offset') + 1];
    const limit = limitArg ? parseInt(limitArg, 10) : 20;
    const offset = offsetArg ? parseInt(offsetArg, 10) : 0;

    const targets = audit.items.slice(offset, offset + limit);
    /** @type {Record<string, any>} */
    const exportPayload = {};
    for (const item of targets) {
      const entry = editorial[item.slug] || {};
      exportPayload[item.slug] = {
        name: item.name,
        en: entry.en || null,
        zh: entry.zh || null,
        missing: item.missingLocales
      };
    }
    writeFileSync(outFile, JSON.stringify(exportPayload, null, 2), 'utf-8');
    console.log(`📦 Exported ${targets.length} tools (offset: ${offset}, limit: ${limit}) to ${outFile}`);
    process.exit(0);
  }

  if (isJson) {
    console.log(JSON.stringify(audit, null, 2));
    if (isCheck && audit.summary.needsWorkCount > 0) process.exit(1);
    process.exit(0);
  }

  console.log(`\n======================================================`);
  console.log(`       Tool Editorial Locales Audit Report`);
  console.log(`======================================================`);
  console.log(`Total Approved Tools : ${audit.summary.totalApproved}`);
  console.log(`Fully 8-Locale Synced: ${audit.summary.fullyCovered}`);
  console.log(`Needing Attention    : ${audit.summary.needsWorkCount}`);
  console.log(`------------------------------------------------------`);
  console.log(`Missing Per Locale   :`);
  for (const [loc, count] of Object.entries(audit.summary.missingPerLocale)) {
    const pct = (((audit.summary.totalApproved - count) / audit.summary.totalApproved) * 100).toFixed(1);
    console.log(`  • ${loc.padEnd(5)} : ${count} missing (${pct}% covered)`);
  }
  console.log(`======================================================\n`);

  if (isCheck && audit.summary.needsWorkCount > 0) {
    process.exit(1);
  }
}

const isMain = !process.argv[1] || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMain && !process.env.NODE_TEST_CONTEXT) {
  runCli();
}
