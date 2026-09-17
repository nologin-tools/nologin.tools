#!/usr/bin/env node
/**
 * scripts/lab/benchmark.mjs
 * 
 * Unified CLI Benchmark Suite for NoLogin Lab.
 * Usage:
 *   node scripts/lab/benchmark.mjs --url "https://squoosh.app"
 *   node scripts/lab/benchmark.mjs --slug squoosh-app --sync
 *   node scripts/lab/benchmark.mjs --category Design --limit 3
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runImageBenchmark } from './runners/image-runner.mjs';
import { runDataBenchmark } from './runners/data-runner.mjs';
import { runWritingBenchmark } from './runners/writing-runner.mjs';
import { runMediaBenchmark } from './runners/media-runner.mjs';
import { runInteractiveBenchmark } from './runners/interactive-runner.mjs';
import { withEgoLock } from '../ego-lock.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const EDITORIAL_PATH = resolve(ROOT, 'src/data/tool-editorial.json');
const BUILD_DATA_PATH = resolve(ROOT, 'src/data/build-data.json');

function printUsage() {
  console.log(`
NoLogin Lab Empirical Benchmark Suite

Usage:
  node scripts/lab/benchmark.mjs [options]

Options:
  --url <URL>        Benchmark a single tool by live URL
  --slug <slug>      Benchmark an existing tool by slug (looks up URL in build-data.json)
  --category <name>  Benchmark all approved tools in a category (e.g. Design, Development, Writing, Media, etc.)
  --rolling [num]    Daily rolling maintenance: benchmarks [num] approved tools (default: 100, unbenchmarked first, then oldest tested)
  --runner <type>    Force runner: 'image' | 'data' | 'writing' | 'media' | 'interactive' (auto-detected if omitted)
  --limit <num>      Max number of tools to benchmark in category mode (default: 3)
  --fixture <type>   Fixture type: 'png' | 'svg' | 'wav' | 'pdf' (default: context-aware)
  --timeout <sec>    Timeout in seconds for page evaluation (watchdog is +60s)
  --sync             Automatically write benchmark scores & lab notes to tool-editorial.json
  --verbose          Print detailed chromium and evaluation trace
  --help             Show this help message
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.length === 0) {
    printUsage();
    process.exit(0);
  }

  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
  };

  const hasFlag = (flag) => args.includes(flag);

  const urlArg = getArg('--url');
  const slugArg = getArg('--slug');
  const categoryArg = getArg('--category');
  let rollingArg = null;
  if (hasFlag('--rolling')) {
    const rawVal = getArg('--rolling');
    rollingArg = (rawVal && !rawVal.startsWith('--') && !isNaN(parseInt(rawVal, 10)))
      ? parseInt(rawVal, 10)
      : 100;
  }
  const limitArg = parseInt(getArg('--limit') || '3', 10);
  const fixtureType = getArg('--fixture') || 'png';
  const runnerArg = getArg('--runner'); // 'image' | 'data'
  const timeoutSec = parseInt(getArg('--timeout') || '0', 10);
  const shouldSync = hasFlag('--sync');
  const verbose = hasFlag('--verbose');

  let toolsToBenchmark = [];

  let buildData = null;
  if (existsSync(BUILD_DATA_PATH)) {
    buildData = JSON.parse(readFileSync(BUILD_DATA_PATH, 'utf-8'));
  }

  function getCategoryForTool(slug, url) {
    if (!buildData) return null;
    const tool = buildData.tools.find(t => (slug && t.slug === slug) || (url && t.url.replace(/\/$/, '') === url.replace(/\/$/, '')));
    if (!tool) return null;
    const catTag = tool.tags.find(tag => tag.tagKey === 'category');
    return catTag ? catTag.tagValue : null;
  }

  if (urlArg) {
    let slug = null;
    if (buildData) {
      const match = buildData.tools.find(t => t.url.replace(/\/$/, '') === urlArg.replace(/\/$/, ''));
      if (match) slug = match.slug;
    }
    const category = getCategoryForTool(slug, urlArg);
    toolsToBenchmark.push({ url: urlArg, slug, category });
  } else if (slugArg) {
    if (!buildData) {
      console.error('Error: build-data.json not found to lookup slug.');
      process.exit(1);
    }
    const tool = buildData.tools.find(t => t.slug === slugArg);
    if (!tool) {
      console.error(`Error: Tool with slug '${slugArg}' not found in build-data.json.`);
      process.exit(1);
    }
    const catTag = tool.tags.find(tag => tag.tagKey === 'category');
    toolsToBenchmark.push({ url: tool.url, slug: tool.slug, name: tool.name, category: catTag?.tagValue });
  } else if (categoryArg) {
    if (!buildData) {
      console.error('Error: build-data.json not found for category queries.');
      process.exit(1);
    }
    const filtered = buildData.tools.filter(t => 
      t.status === 'approved' &&
      t.tags.some(tag => tag.tagKey === 'category' && tag.tagValue.toLowerCase() === categoryArg.toLowerCase())
    ).slice(0, limitArg);

    toolsToBenchmark = filtered.map(t => {
      const catTag = t.tags.find(tag => tag.tagKey === 'category');
      return { url: t.url, slug: t.slug, name: t.name, category: catTag?.tagValue };
    });
  } else if (rollingArg) {
    if (!buildData) {
      console.error('Error: build-data.json not found for rolling queries.');
      process.exit(1);
    }
    const approvedTools = buildData.tools.filter(t => t.status === 'approved');
    let editorialObj = {};
    if (existsSync(EDITORIAL_PATH)) {
      editorialObj = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf-8'));
    }

    // Sort: unbenchmarked tools first, then tools with oldest testedAt
    const sorted = [...approvedTools].sort((a, b) => {
      const edA = editorialObj[a.slug]?.en;
      const edB = editorialObj[b.slug]?.en;
      const hasScoreA = Boolean(edA?.productScore);
      const hasScoreB = Boolean(edB?.productScore);

      if (!hasScoreA && hasScoreB) return -1;
      if (hasScoreA && !hasScoreB) return 1;

      const dateA = edA?.testedAt || '1970-01';
      const dateB = edB?.testedAt || '1970-01';
      return dateA.localeCompare(dateB);
    });

    toolsToBenchmark = sorted.slice(0, rollingArg).map(t => {
      const catTag = t.tags.find(tag => tag.tagKey === 'category');
      return { url: t.url, slug: t.slug, name: t.name, category: catTag?.tagValue };
    });
  }

  function resolveRunner(tool) {
    if (runnerArg) return runnerArg;
    const cat = (tool.category || '').toLowerCase();
    const url = (tool.url || '').toLowerCase();
    const slug = (tool.slug || '').toLowerCase();

    // 1. Writing
    if (cat === 'writing' || /markdown|editor|pastebin|diff|writer|text|typ|wordcount/i.test(slug) || /markdown|stackedit|dillinger|hemingway|rentry/i.test(url)) {
      return 'writing';
    }

    // 2. Media
    if (cat === 'media' || /audio|video|sound|trim|cutter|transcode|gif|music|vocal|speech|spectrogram/i.test(slug) || /audio|video|sound|ezgif|vocal/i.test(url)) {
      return 'media';
    }

    // 3. Development & Data
    if (cat === 'development' || cat === 'data' ||
        url.includes('json') || url.includes('code') || url.includes('regex') || url.includes('format') || url.includes('carbon') || url.includes('sql') ||
        slug.includes('json') || slug.includes('regex') || slug.includes('code') || slug.includes('carbon')) {
      return 'data';
    }

    // 4. Design
    if (cat === 'design' || /image|photo|svg|compress|squoosh|excalidraw|vector|icon|favicon/i.test(slug) || /svg|squoosh|image/i.test(url)) {
      return 'image';
    }

    // 5. Interactive (Productivity, Education, Finance, Privacy, Communication, AI)
    return 'interactive';
  }

  await withEgoLock(async () => {
    console.log(`\n======================================================`);
    console.log(`🧪 NoLogin Lab Empirical Benchmark Harness`);
    console.log(`Tools in queue: ${toolsToBenchmark.length}`);
    console.log(`Auto-sync to editorial: ${shouldSync ? 'ENABLED' : 'DISABLED'}`);
    console.log(`======================================================\n`);

    let editorialData = null;
    if (shouldSync && existsSync(EDITORIAL_PATH)) {
      editorialData = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf-8'));
    }

    let syncCount = 0;

    for (const item of toolsToBenchmark) {
      const runnerType = resolveRunner(item);
      const runnerLabels = {
        image: 'Image & Design Runner (image-runner.mjs)',
        data: 'Data & Code Runner (data-runner.mjs)',
        writing: 'Writing & Markdown Runner (writing-runner.mjs)',
        media: 'Media & Audio Runner (media-runner.mjs)',
        interactive: `Interactive & Utility Runner (interactive-runner.mjs) [${item.category || 'Utility'}]`
      };
      console.log(`\n▶ Benchmarking: ${item.name || item.slug || item.url}`);
      console.log(`  URL: ${item.url}`);
      console.log(`  Runner: ${runnerLabels[runnerType] || runnerType}`);

      try {
        const startTime = Date.now();
        const commonOptions = {
          verbose,
          ...(timeoutSec > 0 ? {
            timeoutMs: timeoutSec * 1000,
            procTimeout: (timeoutSec + 60) * 1000
          } : {})
        };
        let res;
        if (runnerType === 'data') {
          res = await runDataBenchmark(item.url, commonOptions);
        } else if (runnerType === 'writing') {
          res = await runWritingBenchmark(item.url, commonOptions);
        } else if (runnerType === 'media') {
          const mediaFixture = getArg('--fixture') || 'wav';
          res = await runMediaBenchmark(item.url, { fixtureType: mediaFixture, ...commonOptions });
        } else if (runnerType === 'interactive') {
          res = await runInteractiveBenchmark(item.url, { category: item.category || 'Productivity', ...commonOptions });
        } else {
          res = await runImageBenchmark(item.url, { fixtureType, ...commonOptions });
        }
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`\n  ✓ Benchmark Completed in ${elapsedSec}s`);
        console.log(`  📊 Product Utility Score: ${res.productScore.overall}/100 [${res.verdictTier}]`);
        const exportOk = res.downloadCaptured || res.downloadTriggered || res.copyOrExportTriggered;
        console.log(`     • Frictionless UX:    ${res.productScore.frictionless}/25 (TTI: ${res.ttiMs}ms)`);
        console.log(`     • Functional Depth:   ${res.productScore.depth}/30 (${res.hasWasm ? 'Wasm Acceleration' : 'Standard Pipeline'})`);
        console.log(`     • Export Freedom:     ${res.productScore.exportFreedom}/25 (${exportOk ? 'Export/Copy Verified' : 'Standard Access'})`);
        console.log(`     • Stability & Polish: ${res.productScore.polish}/20`);
        console.log(`  📝 Lab Note (EN): "${res.labNotes.en}"`);
        console.log(`  📝 Lab Note (ZH): "${res.labNotes.zh}"`);
        console.log(`  💡 Deep CADES Dogfooding: node scripts/inspect-tool-dogfood.mjs "${item.url}" --slug "${item.slug || ''}"`);

        if (shouldSync && item.slug && editorialData) {
          if (!editorialData[item.slug]) {
            editorialData[item.slug] = {
              en: {
                bestFor: `Instant ${item.category || categoryArg || 'online'} processing directly in browser.`,
                pros: ["Zero registration required", "Immediate task execution"],
                cons: ["Dependent on local browser performance"],
                privacyVerdict: "No login required. Local processing verified.",
                alternativeTo: ["Desktop software"]
              },
              zh: {
                bestFor: `免注册直接在浏览器完成${item.category || categoryArg || '在线'}任务。`,
                pros: ["免注册即开即用", "秒级进入工作流"],
                cons: ["受本地浏览器内存限制"],
                privacyVerdict: "无需登录，本地数据流处理验证通过。",
                alternativeTo: ["本地商业软件"]
              }
            };
          }

          const testedAt = new Date().toISOString().slice(0, 7);

          // Update EN
          editorialData[item.slug].en.productScore = res.productScore;
          editorialData[item.slug].en.verdictTier = res.verdictTier;
          editorialData[item.slug].en.benchmarkNotes = res.labNotes.en;
          editorialData[item.slug].en.testedAt = testedAt;

          // Update ZH
          editorialData[item.slug].zh.productScore = res.productScore;
          editorialData[item.slug].zh.verdictTier = res.verdictTier;
          editorialData[item.slug].zh.benchmarkNotes = res.labNotes.zh;
          editorialData[item.slug].zh.testedAt = testedAt;

          syncCount++;
          console.log(`  💾 Synchronized benchmark data into tool-editorial.json for [${item.slug}]`);
        }
      } catch (err) {
        console.error(`  ❌ Benchmark Failed for ${item.url}:`, err.message);
      }
    }

    if (shouldSync && syncCount > 0 && editorialData) {
      writeFileSync(EDITORIAL_PATH, JSON.stringify(editorialData, null, 2) + '\n', 'utf-8');
      console.log(`\n🎉 Successfully synced ${syncCount} benchmark lab records into ${EDITORIAL_PATH}`);
    }

    console.log(`\n======================================================`);
    console.log(`🏁 Lab Run Finished.`);
    console.log(`======================================================\n`);
  }, {
    label: `benchmark-${toolsToBenchmark.length}-tools`,
    timeoutMs: 900000,
    preClean: true,
    postClean: true,
    verbose
  });
}

main().catch(err => {
  console.error('Fatal benchmark error:', err);
  process.exit(1);
});
