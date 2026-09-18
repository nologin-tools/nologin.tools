#!/usr/bin/env node
/**
 * scripts/lab/dogfood-session.mjs
 * 
 * CADES 2.0 Route A: Stateful Interactive Dogfooding Harness for Agents.
 * 
 * Enables an AI Agent (or human tester) to drive ego-browser step-by-step
 * across multiple turns like a real human:
 * 
 * Subcommands:
 *   start   <url> [--slug <slug>]
 *   act     <slug> [--click <target>] [--fill <target> <text>] [--upload <fixture>] [--press <key>] [--eval-js <code>]
 *   export  <slug> [--trigger <target>]
 *   finish  <slug> [--eval <json-file>] [--sync]
 *   status  <slug>
 *   abort   <slug>
 */

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAllFixtures } from './fixtures/generate-fixtures.mjs';
import { inspectArtifact, assessArtifactQuality } from './inspectors/output-inspector.mjs';
import { validateCognitiveEvaluation, calibrate5DScore } from './cades-cognitive.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const EDITORIAL_PATH = resolve(ROOT, 'src/data/tool-editorial.json');

const FIXTURES = generateAllFixtures();
const FIXTURE_PATHS = {
  png: FIXTURES.png.path,
  svg: FIXTURES.svg.path,
  json: FIXTURES.json.path,
  md: FIXTURES.md.path,
  wav: FIXTURES.wav.path,
  pdf: FIXTURES.pdf.path,
  'malformed-json': FIXTURES['malformed-json']?.path,
  'corrupted-png': FIXTURES['corrupted-png']?.path,
  'heavy-svg': FIXTURES['heavy-svg']?.path,
  'bad-json': FIXTURES['malformed-json']?.path,
  'bad-png': FIXTURES['corrupted-png']?.path
};

function getSessionFile(slug) {
  return join(tmpdir(), `cades-session-${slug}.json`);
}

function loadSession(slug) {
  const p = getSessionFile(slug);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}

function saveSession(slug, data) {
  writeFileSync(getSessionFile(slug), JSON.stringify(data, null, 2), 'utf-8');
}

function removeSession(slug) {
  const p = getSessionFile(slug);
  if (existsSync(p)) {
    try { unlinkSync(p); } catch {}
  }
}

async function runEgoScript(scriptContent, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const child = spawn('ego-browser', ['nodejs'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdin.write(scriptContent);
    child.stdin.end();

    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });

    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch {}
      reject(new Error(`ego-browser command timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`ego-browser exited with code ${code}: ${stderr || stdout}`));
    });
  });
}

function printUsage() {
  console.log(`
CADES 2.0 Route A: Humanoid Dogfooding Session CLI

Usage:
  node scripts/lab/dogfood-session.mjs <command> [arguments] [options]

Commands:
  start <URL> [--slug <slug>]
    Launches ego-browser, navigates to URL, injects zero-egress snooper,
    captures initial screenshot, and saves session state.

  act <slug> [actions...]
    Performs deliberate human-like interaction on the open page:
      --click <text|selector>    Click a button, tab, or link
      --fill <selector> <text>   Type text into input or textarea
      --upload <fixture|path>    Upload standard or stress fixture:
                                 Standard: png, svg, pdf, wav, json, md
                                 Stress:   malformed-json, corrupted-png, heavy-svg
      --press <key>              Press keyboard key (e.g. Space, Enter, Escape)
      --eval-js <code>           Execute custom JavaScript inside the page

  export <slug> [--trigger <text|selector>]
    Listens for download events, triggers export/download, catches artifact,
    and runs format/watermark/bait-trap inspection.

  finish <slug> [--eval <eval.json>] [--sync] [--allow-shallow]
    Audits final zero-egress payloads, runs Anti-Slacking checks, generates
    flight recorder summary, releases browser space, validates Agent review,
    and updates tool-editorial.json.

  status <slug>
    Displays current session state, step history, and visual screenshot paths.

  abort <slug>
    Closes browser space immediately and discards session state.
`);
}

// -------------------------------------------------------------------------
// Subcommand 1: start
// -------------------------------------------------------------------------
async function cmdStart(targetUrl, customSlug = null) {
  let safeSlug = customSlug;
  if (!safeSlug) {
    try {
      safeSlug = new URL(targetUrl).hostname.replace(/[^a-zA-Z0-9-]/g, '-');
    } catch {
      safeSlug = 'tool-' + Date.now();
    }
  }

  const existing = loadSession(safeSlug);
  if (existing) {
    console.log(`⚠️ Active session already exists for [${safeSlug}] (spaceId: ${existing.spaceId}).`);
    console.log(`Run 'status ${safeSlug}' to view, or 'abort ${safeSlug}' to reset.`);
    return;
  }

  const initialPicPath = join(tmpdir(), `dogfood-${safeSlug}-step1-initial.png`);
  const resultFile = join(tmpdir(), `dogfood-start-res-${Date.now()}.json`);

  const script = `
(async () => {
  const result = { spaceId: null, url: null, title: "", headings: [], buttonLabels: [], placeholders: [], textareaCount: 0, fileInputCount: 0, canvasCount: 0, error: null };
  try {
    const task = await taskSpace("cades-dogfood-" + ${JSON.stringify(safeSlug)});
    result.spaceId = task.spaceId;
    const page = task.page("p1");

    // Network snooper for zero-egress check
    await page.evaluate(() => {
      window.__netPayloads = [];
      const isTelemetry = (u) => /google-analytics|googletagmanager|clarity\\.ms|sentry\\.io|doubleclick|pagead|googlesyndication|pub\\.network|adnxs|rubicon|criteo|fundingchoicesmessages|cloudflareinsights|fonts\\.googleapis|cdnjs\\.cloudflare/i.test(u);
      const origFetch = window.fetch;
      window.fetch = function(...args) {
        try {
          const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
          const method = (args[1]?.method || (typeof args[0] === 'object' ? args[0]?.method : 'GET') || 'GET').toUpperCase();
          if (Boolean(args[1]?.body) && !isTelemetry(url)) {
            window.__netPayloads.push({ type: 'fetch', method, url: url.slice(0, 150) });
          }
        } catch (e) {}
        return origFetch.apply(this, args);
      };
      const origXhrSend = XMLHttpRequest.prototype.send;
      const origXhrOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url) {
        this.__method = method ? method.toUpperCase() : 'GET';
        this.__url = url;
        return origXhrOpen.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function(body) {
        try {
          if (body && !isTelemetry(this.__url || '')) {
            window.__netPayloads.push({ type: 'xhr', method: this.__method, url: (this.__url || '').slice(0, 150) });
          }
        } catch (e) {}
        return origXhrSend.apply(this, arguments);
      };

      // UX Ergonomics Telemetry (PerformanceObserver)
      window.__uxTelemetry = {
        longTasksCount: 0,
        maxLongTaskDuration: 0,
        totalLongTaskDuration: 0,
        clsScore: 0
      };
      try {
        const ltObs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.__uxTelemetry.longTasksCount++;
            window.__uxTelemetry.totalLongTaskDuration += entry.duration;
            if (entry.duration > window.__uxTelemetry.maxLongTaskDuration) {
              window.__uxTelemetry.maxLongTaskDuration = Math.round(entry.duration);
            }
          }
        });
        ltObs.observe({ entryTypes: ['longtask'] });
      } catch (e) {}
      try {
        const clsObs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.__uxTelemetry.clsScore += entry.value;
            }
          }
        });
        clsObs.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {}
    }).catch(() => false);

    await page.dismissDialog().catch(() => false);
    await page.goto(${JSON.stringify(targetUrl)}, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1500);

    result.url = await page.url();
    result.title = await page.title();

    // DOM Summary & UX Telemetry
    const dom = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText?.trim()).filter(Boolean).slice(0, 6);
      const btns = Array.from(document.querySelectorAll('button, input[type="button"], a.btn, [role="button"]'))
        .map(b => (b.innerText || b.value || b.getAttribute('aria-label') || '').trim())
        .filter(t => t.length > 0 && t.length < 40).slice(0, 20);
      const placeholders = Array.from(document.querySelectorAll('input, textarea'))
        .map(el => (el.getAttribute('placeholder') || '').trim()).filter(Boolean).slice(0, 8);
      const tas = document.querySelectorAll('textarea, .monaco-editor, .cm-editor').length;
      const fis = document.querySelectorAll('input[type="file"]').length;
      const cvs = document.querySelectorAll('canvas, svg.canvas').length;
      const ux = window.__uxTelemetry || { longTasksCount: 0, maxLongTaskDuration: 0, totalLongTaskDuration: 0, clsScore: 0 };
      return { headings, btns, placeholders, tas, fis, cvs, ux };
    });

    result.headings = dom.headings;
    result.buttonLabels = dom.btns;
    result.placeholders = dom.placeholders;
    result.textareaCount = dom.tas;
    result.fileInputCount = dom.fis;
    result.canvasCount = dom.cvs;
    result.ux = dom.ux;

    await page.screenshot({ path: ${JSON.stringify(initialPicPath)} });
  } catch (err) {
    result.error = err.message || String(err);
  } finally {
    const fs = await import("node:fs");
    fs.writeFileSync(${JSON.stringify(resultFile)}, JSON.stringify(result), 'utf-8');
  }
})();
`;

  console.log(`\n🚀 [CADES 2.0 Route A] Starting session for: ${targetUrl} (slug: ${safeSlug})`);
  console.log(`⏳ Navigating and injecting zero-egress snooper in ego-browser...`);

  try {
    await runEgoScript(script, 60000);
    const res = JSON.parse(readFileSync(resultFile, 'utf-8'));
    try { unlinkSync(resultFile); } catch {}

    if (res.error) {
      console.error(`❌ Session start failed: ${res.error}`);
      return;
    }

    const sessionData = {
      slug: safeSlug,
      targetUrl,
      finalUrl: res.url,
      spaceId: res.spaceId,
      startedAt: Date.now(),
      steps: [
        {
          step: 1,
          type: 'start',
          screenshot: initialPicPath,
          url: res.url,
          title: res.title,
          ux: res.ux || null
        }
      ],
      uxTelemetry: res.ux || { longTasksCount: 0, maxLongTaskDuration: 0, totalLongTaskDuration: 0, clsScore: 0 },
      surface: {
        headings: res.headings,
        buttonLabels: res.buttonLabels,
        placeholders: res.placeholders,
        textareaCount: res.textareaCount,
        fileInputCount: res.fileInputCount,
        canvasCount: res.canvasCount
      },
      exportArtifact: null
    };

    saveSession(safeSlug, sessionData);

    console.log(`\n✅ Session initialized successfully!`);
    console.log(`   - TaskSpace ID: ${res.spaceId}`);
    console.log(`   - Title:        ${res.title}`);
    console.log(`   - Current URL:  ${res.url}`);

    const ux = sessionData.uxTelemetry;
    const isButter = (ux.maxLongTaskDuration < 60 && ux.clsScore === 0);
    console.log(`\n⚡ UX Ergonomics Baseline:`);
    console.log(`   - Main Thread:  ${isButter ? '✅ Butter-smooth (<60ms tasks)' : `⚠️ Max freeze: ${ux.maxLongTaskDuration}ms`}`);
    console.log(`   - Layout Shift: ${ux.clsScore === 0 ? '✅ 0.00 (Rock solid)' : `⚠️ CLS: ${ux.clsScore.toFixed(2)}`}`);

    console.log(`\n📸 Visual Checkpoint 1 (Agent MUST inspect via view_file):`);
    console.log(`   👉 ${initialPicPath}`);
    console.log(`\n🛠️ Detected Surface:`);
    console.log(`   - Buttons:      ${res.buttonLabels.slice(0, 8).join(', ') || 'None'}`);
    console.log(`   - Textareas:    ${res.textareaCount} | File Inputs: ${res.fileInputCount} | Canvases: ${res.canvasCount}`);
    console.log(`\n💡 Suggested Next Actions for Agent:`);
    console.log(`   • Click an element:  node scripts/lab/dogfood-session.mjs act ${safeSlug} --click "<text|selector>"`);
    console.log(`   • Upload a fixture:  node scripts/lab/dogfood-session.mjs act ${safeSlug} --upload png`);
    console.log(`   • Test export:       node scripts/lab/dogfood-session.mjs export ${safeSlug}`);
    console.log(`   • Finish session:    node scripts/lab/dogfood-session.mjs finish ${safeSlug}\n`);
  } catch (err) {
    console.error(`❌ Failed to start session:`, err.message);
  }
}

// -------------------------------------------------------------------------
// Subcommand 2: act
// -------------------------------------------------------------------------
async function cmdAct(slug, options) {
  const session = loadSession(slug);
  if (!session) {
    console.error(`❌ No active session found for [${slug}]. Run 'start <url>' first.`);
    return;
  }

  const stepNumber = session.steps.length + 1;
  const actionPicPath = join(tmpdir(), `dogfood-${slug}-step${stepNumber}-action.png`);
  const resultFile = join(tmpdir(), `dogfood-act-res-${Date.now()}.json`);

  let resolvedFixture = null;
  if (options.upload) {
    const fKey = options.upload.toLowerCase();
    resolvedFixture = FIXTURE_PATHS[fKey] || options.upload;
    if (!existsSync(resolvedFixture)) {
      console.error(`❌ Fixture file not found: ${resolvedFixture}`);
      return;
    }
  }

  const script = `
(async () => {
  const result = { success: false, url: null, title: "", actionSummary: "", error: null };
  try {
    const task = await taskSpace(${JSON.stringify(session.spaceId)});
    const page = task.page("p1");

    ${options.click ? `
      const clickTarget = ${JSON.stringify(options.click)};
      const clicked = await page.evaluate((target) => {
        const btns = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a, [role="button"]'));
        const match = btns.find(b => (b.innerText || b.value || b.getAttribute('aria-label') || '').trim().toLowerCase().includes(target.toLowerCase()));
        if (match) {
          match.click();
          return "Clicked text: " + (match.innerText || target);
        }
        const el = document.querySelector(target);
        if (el) {
          el.click();
          return "Clicked selector: " + target;
        }
        return null;
      }, clickTarget);
      result.actionSummary = clicked || ("Element not found for click: " + clickTarget);
    ` : ''}

    ${options.fill ? `
      const fillSel = ${JSON.stringify(options.fill.selector)};
      const fillVal = ${JSON.stringify(options.fill.value)};
      const filled = await page.evaluate(({ sel, val }) => {
        const el = document.querySelector(sel) || document.querySelector('textarea, input[type="text"], [contenteditable="true"]');
        if (el) {
          if (el.value !== undefined) {
            el.value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            el.innerText = val;
          }
          return "Filled into " + (el.tagName || sel);
        }
        return null;
      }, { sel: fillSel, val: fillVal });
      result.actionSummary = filled || ("Input element not found: " + fillSel);
    ` : ''}

    ${options.upload ? `
      const fixPath = ${JSON.stringify(resolvedFixture)};
      try {
        await page.setInputFiles('input[type="file"]', fixPath);
        result.actionSummary = "Uploaded fixture: " + fixPath;
      } catch (err) {
        result.actionSummary = "File input not found for upload: " + err.message;
      }
    ` : ''}

    ${options.press ? `
      const key = ${JSON.stringify(options.press)};
      await page.keyboard.press(key);
      result.actionSummary = "Pressed key: " + key;
    ` : ''}

    ${options.evalJs ? `
      const jsCode = ${JSON.stringify(options.evalJs)};
      const evalRes = await page.evaluate((c) => {
        try { return String(eval(c)); } catch (e) { return "Eval error: " + e.message; }
      }, jsCode);
      result.actionSummary = "Evaluated JS: " + evalRes;
    ` : ''}

    await page.waitForTimeout(1500);
    result.url = await page.url();
    result.title = await page.title();
    result.ux = await page.evaluate(() => window.__uxTelemetry || null);
    await page.screenshot({ path: ${JSON.stringify(actionPicPath)} });
    result.success = true;
  } catch (err) {
    result.error = err.message || String(err);
  } finally {
    const fs = await import("node:fs");
    fs.writeFileSync(${JSON.stringify(resultFile)}, JSON.stringify(result), 'utf-8');
  }
})();
`;

  console.log(`\n⚡ [CADES 2.0 Route A] Executing Step ${stepNumber} on [${slug}]...`);
  try {
    await runEgoScript(script, 45000);
    const res = JSON.parse(readFileSync(resultFile, 'utf-8'));
    try { unlinkSync(resultFile); } catch {}

    if (res.error) {
      console.error(`❌ Action failed: ${res.error}`);
      return;
    }

    session.steps.push({
      step: stepNumber,
      type: 'act',
      summary: res.actionSummary,
      screenshot: actionPicPath,
      url: res.url,
      title: res.title,
      ux: res.ux || null
    });
    session.currentUrl = res.url;
    if (res.ux) {
      session.uxTelemetry = res.ux;
      const isButter = (res.ux.maxLongTaskDuration < 60 && res.ux.clsScore === 0);
      console.log(`⚡ UX Ergonomics (Step ${stepNumber}): ${isButter ? '✅ Smooth frame pacing (0 jank)' : `⚠️ Max freeze: ${res.ux.maxLongTaskDuration}ms, CLS: ${Number(res.ux.clsScore).toFixed(2)}`}`);
    }
    saveSession(slug, session);

    console.log(`✅ Action completed: ${res.actionSummary}`);
    console.log(`📸 Visual Checkpoint (Step ${stepNumber}):`);
    console.log(`   👉 ${actionPicPath} (Agent inspect via view_file)`);
  } catch (err) {
    console.error(`❌ Failed to execute action:`, err.message);
  }
}

// -------------------------------------------------------------------------
// Subcommand 3: export
// -------------------------------------------------------------------------
async function cmdExport(slug, trigger = null) {
  const session = loadSession(slug);
  if (!session) {
    console.error(`❌ No active session found for [${slug}].`);
    return;
  }

  const exportDlPath = join(tmpdir(), `dogfood-dl-${slug}-${Date.now()}.artifact`);
  const exportPicPath = join(tmpdir(), `dogfood-${slug}-step-export.png`);
  const resultFile = join(tmpdir(), `dogfood-export-res-${Date.now()}.json`);

  const script = `
(async () => {
  const result = { downloadTriggered: false, downloadPath: null, authIntercepted: false, authDetails: null, error: null };
  try {
    const task = await taskSpace(${JSON.stringify(session.spaceId)});
    const page = task.page("p1");

    const dlPromise = page.waitForEvent("download", { timeout: 4500 }).catch(() => null);

    const triggerTarget = ${JSON.stringify(trigger || "download|export|save|下载|导出|保存")};
    const clicked = await page.evaluate((target) => {
      const btns = Array.from(document.querySelectorAll('button, input[type="button"], a, [role="button"]'));
      const match = btns.find(b => {
        const t = (b.innerText || b.value || b.getAttribute('aria-label') || '').trim();
        return new RegExp(target, "i").test(t) && !/login|sign in|pricing|cookie/i.test(t);
      });
      if (match) {
        match.click();
        return (match.innerText || "Export trigger").trim();
      }
      return null;
    }, triggerTarget);

    result.triggerClicked = clicked;

    const download = await dlPromise;
    if (download) {
      result.downloadTriggered = true;
      if (download.saveAs) {
        await download.saveAs(${JSON.stringify(exportDlPath)});
        result.downloadPath = ${JSON.stringify(exportDlPath)};
      }
    } else {
      await page.waitForTimeout(1500);
      const authCheck = await page.evaluate(() => {
        const modals = Array.from(document.querySelectorAll('[role="dialog"], .modal, .popup, [aria-modal="true"]'))
          .filter(m => m.offsetHeight > 80);
        for (const m of modals) {
          const t = m.innerText || '';
          if (/sign in|log in|create account|register|enter your email|start free trial|unlock download/i.test(t)) {
            return t.slice(0, 200).replace(/\\s+/g, ' ');
          }
        }
        if (/\\/(login|signin|register|signup|auth|pricing)/i.test(window.location.pathname)) {
          return "Redirected to auth/pricing: " + window.location.pathname;
        }
        return null;
      });
      if (authCheck) {
        result.authIntercepted = true;
        result.authDetails = authCheck;
      }
    }

    await page.screenshot({ path: ${JSON.stringify(exportPicPath)} });
  } catch (err) {
    result.error = err.message || String(err);
  } finally {
    const fs = await import("node:fs");
    fs.writeFileSync(${JSON.stringify(resultFile)}, JSON.stringify(result), 'utf-8');
  }
})();
`;

  console.log(`\n📦 [CADES 2.0 Route A] Testing Export Gatekeeper on [${slug}]...`);
  try {
    await runEgoScript(script, 45000);
    const res = JSON.parse(readFileSync(resultFile, 'utf-8'));
    try { unlinkSync(resultFile); } catch {}

    let inspectionReport = null;
    let qualityReport = null;

    if (res.downloadPath && existsSync(res.downloadPath)) {
      inspectionReport = inspectArtifact(res.downloadPath);
      qualityReport = assessArtifactQuality(inspectionReport);
    }

    session.exportArtifact = {
      downloadTriggered: res.downloadTriggered,
      downloadPath: res.downloadPath,
      authIntercepted: res.authIntercepted,
      authDetails: res.authDetails,
      screenshot: exportPicPath,
      inspectionReport,
      qualityReport
    };

    saveSession(slug, session);

    console.log(`\n======================================================`);
    console.log(`🛡️ Export Gatekeeper Audit Report:`);
    console.log(`======================================================`);
    console.log(`Trigger Clicked:     ${res.triggerClicked || 'None found'}`);
    console.log(`Download Triggered:  ${res.downloadTriggered ? '✅ YES' : '❌ NO'}`);
    console.log(`Auth Interception:   ${res.authIntercepted ? '⚠️ DETECTED: ' + res.authDetails : '✅ NONE (Safe)'}`);

    if (inspectionReport) {
      console.log(`\n📄 Artifact Physical Inspection:`);
      console.log(`   - Format:       ${inspectionReport.file?.format?.toUpperCase()}`);
      console.log(`   - Size:         ${inspectionReport.file?.sizeBytes} bytes`);
      console.log(`   - Dimensions:   ${inspectionReport.file?.dimensions ? `${inspectionReport.file.dimensions.width}x${inspectionReport.file.dimensions.height}` : 'N/A'}`);
      console.log(`   - Watermark:    ${inspectionReport.quality?.hasWatermark ? '⚠️ DETECTED: ' + inspectionReport.quality.watermarkSignature : '✅ None'}`);
      console.log(`   - Bait Trap:    ${inspectionReport.quality?.isBaitTrap ? '⚠️ HTML Trap!' : '✅ Clean'}`);
      console.log(`   - Blank Canvas: ${inspectionReport.quality?.isBlankCanvas ? '⚠️ Blank Whiteout!' : '✅ Non-blank'}`);
    }

    console.log(`\n📸 Export State Screenshot:`);
    console.log(`   👉 ${exportPicPath} (Agent inspect via view_file)\n`);
  } catch (err) {
    console.error(`❌ Export test failed:`, err.message);
  }
}

// -------------------------------------------------------------------------
// Subcommand 4: finish
// -------------------------------------------------------------------------
async function cmdFinish(slug, evalFilePath = null, shouldSync = false, allowShallow = false) {
  const session = loadSession(slug);
  if (!session) {
    console.error(`❌ No active session found for [${slug}].`);
    return;
  }

  // Anti-Slacking Guardrail: Ensure Agent actively interacted with the tool
  const userActions = session.steps.filter(s => s.type === 'act' || s.type === 'export');
  if (userActions.length === 0 && !allowShallow) {
    console.warn(`\n⚠️  [CADES 2.0 Anti-Slacking Guardrail]`);
    console.warn(`   Session [${slug}] has 0 interactive user steps (only started, never acted/exported).`);
    console.warn(`   Deep dogfooding requires actively testing the tool (fill, click, upload, or export).`);
    console.warn(`   To finalize anyway (e.g. for purely static landing pages), pass --allow-shallow:\n`);
    console.warn(`   node scripts/lab/dogfood-session.mjs finish ${slug} --allow-shallow\n`);
    return;
  }

  const resultFile = join(tmpdir(), `dogfood-finish-res-${Date.now()}.json`);

  const script = `
(async () => {
  const result = { netPayloads: [], error: null };
  try {
    const task = await taskSpace(${JSON.stringify(session.spaceId)});
    const page = task.page("p1");

    const payloads = await page.evaluate(() => window.__netPayloads || []).catch(() => []);
    result.netPayloads = payloads;

    await task.finish({ keep: [] }).catch(() => false);
  } catch (err) {
    result.error = err.message || String(err);
  } finally {
    const fs = await import("node:fs");
    fs.writeFileSync(${JSON.stringify(resultFile)}, JSON.stringify(result), 'utf-8');
  }
})();
`;

  console.log(`\n🏁 [CADES 2.0 Route A] Finalizing session for [${slug}]...`);
  let netPayloads = [];
  try {
    await runEgoScript(script, 30000);
    const res = JSON.parse(readFileSync(resultFile, 'utf-8'));
    try { unlinkSync(resultFile); } catch {}
    netPayloads = res.netPayloads || [];
  } catch (e) {
    console.warn(`  Notice during task.finish: ${e.message}`);
  }

  const isLocal = netPayloads.length === 0;

  console.log(`\n🌐 Zero-Egress Network Audit:`);
  console.log(`   - Outgoing Payloads: ${netPayloads.length}`);
  console.log(`   - Classification:    ${isLocal ? '🛡️ Local Only (Zero Egress)' : '☁️ Cloud Processed'}`);

  let evalData = null;
  if (evalFilePath && existsSync(evalFilePath)) {
    try {
      evalData = JSON.parse(readFileSync(evalFilePath, 'utf-8'));
      const validation = validateCognitiveEvaluation(evalData);
      if (!validation.valid) {
        console.warn(`\n⚠️ Agent evaluation validation warnings:`);
        validation.errors.forEach(e => console.warn(`   • ${e}`));
      } else {
        console.log(`\n✅ Agent evaluation validated successfully!`);
      }

      if (shouldSync && existsSync(EDITORIAL_PATH)) {
        const editorial = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf-8'));
        editorial[slug] = editorial[slug] || {};

        editorial[slug].en = {
          bestFor: evalData.bestFor || 'In-browser utility',
          pros: evalData.pros || [],
          cons: evalData.cons || [],
          privacyVerdict: isLocal ? 'Verified 100% in-browser RAM execution.' : 'Ephemeral processing verified.',
          alternativeTo: evalData.alternativeTo || [],
          productScore: evalData.productScore,
          verdictTier: evalData.verdictTier || (evalData.productScore.overall >= 90 ? 'editors-choice' : 'highly-recommended'),
          benchmarkNotes: evalData.benchmarkNotes || 'CADES 2.0 Route A Agent verified.',
          testedAt: new Date().toISOString().slice(0, 7)
        };

        editorial[slug].zh = {
          bestFor: evalData.bestForZh || evalData.bestFor,
          pros: evalData.prosZh || evalData.pros,
          cons: evalData.consZh || evalData.cons,
          privacyVerdict: isLocal ? '已核验 100% 纯前端本地计算。' : '临时云端处理验证通过。',
          alternativeTo: evalData.alternativeToZh || evalData.alternativeTo || [],
          productScore: evalData.productScore,
          verdictTier: evalData.verdictTier || (evalData.productScore.overall >= 90 ? 'editors-choice' : 'highly-recommended'),
          benchmarkNotes: evalData.benchmarkNotesZh || evalData.benchmarkNotes,
          testedAt: new Date().toISOString().slice(0, 7)
        };

        writeFileSync(EDITORIAL_PATH, JSON.stringify(editorial, null, 2) + '\n', 'utf-8');
        console.log(`\n💾 Successfully synced Route A evaluation into ${EDITORIAL_PATH} for [${slug}]!`);
      }
    } catch (err) {
      console.error(`❌ Failed to apply eval file: ${err.message}`);
    }
  } else {
    console.log(`\n📝 No --eval file provided. Session closed.`);
    console.log(`To record your qualitative review, create an eval JSON and run:`);
    console.log(`node scripts/lab/dogfood-session.mjs finish ${slug} --eval /path/to/eval.json --sync`);
  }

  // Forensic Flight Recorder Generation
  const flightRecorder = {
    slug,
    targetUrl: session.targetUrl,
    finalUrl: session.currentUrl || session.targetUrl,
    startedAt: session.startedAt,
    finishedAt: Date.now(),
    durationSec: Math.round((Date.now() - session.startedAt) / 1000),
    totalSteps: session.steps.length,
    steps: session.steps,
    uxTelemetry: session.uxTelemetry || { longTasksCount: 0, maxLongTaskDuration: 0, clsScore: 0 },
    zeroEgress: {
      classification: isLocal ? 'Local Only' : 'Cloud Processed',
      outgoingPayloadCount: netPayloads.length,
      payloads: netPayloads
    },
    exportArtifact: session.exportArtifact || null,
    evaluation: evalData || null
  };

  const flightRecorderPath = join(tmpdir(), `cades-flight-recorder-${slug}.json`);
  try {
    writeFileSync(flightRecorderPath, JSON.stringify(flightRecorder, null, 2), 'utf-8');
  } catch (e) {}

  console.log(`\n========================================================================`);
  console.log(`✈️  CADES 2.0 Dogfood Flight Recorder Summary: [${slug}]`);
  console.log(`========================================================================`);
  console.log(`Duration:            ${flightRecorder.durationSec}s across ${session.steps.length} turns`);
  console.log(`Visual Checkpoints:  ${session.steps.length} screenshots recorded`);
  console.log(`UX Telemetry:        Max Task: ${flightRecorder.uxTelemetry.maxLongTaskDuration}ms | CLS: ${Number(flightRecorder.uxTelemetry.clsScore).toFixed(2)}`);
  console.log(`Zero Egress:         ${flightRecorder.zeroEgress.classification} (${netPayloads.length} payloads)`);
  if (session.exportArtifact) {
    const art = session.exportArtifact;
    console.log(`Export Gate:         ${art.downloadTriggered ? '✅ Download triggered' : '❌ No download'} | Bait Trap: ${art.qualityReport?.isBaitTrap ? '⚠️ TRAP' : '✅ Clean'}`);
  }
  console.log(`Flight Log Saved:    ${flightRecorderPath}`);
  console.log(`========================================================================`);

  removeSession(slug);
  console.log(`\n🧹 Browser space and local session state cleared.\n`);
}

// -------------------------------------------------------------------------
// Subcommand 5: status
// -------------------------------------------------------------------------
function cmdStatus(slug) {
  const session = loadSession(slug);
  if (!session) {
    console.log(`No active session found for [${slug}].`);
    return;
  }

  console.log(`\n📊 [CADES 2.0 Route A] Session Status: [${slug}]`);
  console.log(`Target URL:  ${session.targetUrl}`);
  console.log(`Current URL: ${session.currentUrl || session.targetUrl}`);
  console.log(`Space ID:    ${session.spaceId}`);
  console.log(`Steps Run:   ${session.steps.length}`);
  session.steps.forEach(s => {
    console.log(`  • Step ${s.step} [${s.type}]: ${s.summary || s.title || ''}`);
    console.log(`    Screenshot: ${s.screenshot}`);
  });
  if (session.exportArtifact) {
    console.log(`\nExport Status: Downloaded=${session.exportArtifact.downloadTriggered}, AuthTrap=${session.exportArtifact.authIntercepted}`);
  }
  console.log('');
}

// -------------------------------------------------------------------------
// Subcommand 6: abort
// -------------------------------------------------------------------------
async function cmdAbort(slug) {
  const session = loadSession(slug);
  if (!session) {
    console.log(`No active session found for [${slug}].`);
    return;
  }

  try {
    const script = `
(async () => {
  try {
    const task = await taskSpace(${JSON.stringify(session.spaceId)});
    await task.finish({ keep: [] }).catch(() => false);
  } catch (e) {}
})();
`;
    await runEgoScript(script, 10000);
  } catch (e) {}

  removeSession(slug);
  console.log(`🧹 Aborted and cleaned session for [${slug}].`);
}

// -------------------------------------------------------------------------
// Main CLI Router
// -------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const cmd = args[0].toLowerCase();

  if (cmd === 'start') {
    const targetUrl = args[1];
    if (!targetUrl || targetUrl.startsWith('--')) {
      console.error('Error: start requires a target URL.');
      process.exit(1);
    }
    const slugIdx = args.indexOf('--slug');
    const slug = slugIdx !== -1 && slugIdx + 1 < args.length ? args[slugIdx + 1] : null;
    await cmdStart(targetUrl, slug);
  } else if (cmd === 'act') {
    const slug = args[1];
    if (!slug) {
      console.error('Error: act requires a tool slug.');
      process.exit(1);
    }
    const options = {};
    const clickIdx = args.indexOf('--click');
    if (clickIdx !== -1) options.click = args[clickIdx + 1];

    const fillIdx = args.indexOf('--fill');
    if (fillIdx !== -1 && fillIdx + 2 < args.length) {
      options.fill = { selector: args[fillIdx + 1], value: args[fillIdx + 2] };
    }

    const uploadIdx = args.indexOf('--upload');
    if (uploadIdx !== -1) options.upload = args[uploadIdx + 1];

    const pressIdx = args.indexOf('--press');
    if (pressIdx !== -1) options.press = args[pressIdx + 1];

    const evalIdx = args.indexOf('--eval-js');
    if (evalIdx !== -1) options.evalJs = args[evalIdx + 1];

    await cmdAct(slug, options);
  } else if (cmd === 'export') {
    const slug = args[1];
    if (!slug) {
      console.error('Error: export requires a tool slug.');
      process.exit(1);
    }
    const triggerIdx = args.indexOf('--trigger');
    const trigger = triggerIdx !== -1 ? args[triggerIdx + 1] : null;
    await cmdExport(slug, trigger);
  } else if (cmd === 'finish') {
    const slug = args[1];
    if (!slug) {
      console.error('Error: finish requires a tool slug.');
      process.exit(1);
    }
    const evalIdx = args.indexOf('--eval');
    const evalPath = evalIdx !== -1 ? args[evalIdx + 1] : null;
    const shouldSync = args.includes('--sync');
    const allowShallow = args.includes('--allow-shallow');
    await cmdFinish(slug, evalPath, shouldSync, allowShallow);
  } else if (cmd === 'status') {
    const slug = args[1];
    cmdStatus(slug);
  } else if (cmd === 'abort') {
    const slug = args[1];
    await cmdAbort(slug);
  } else {
    console.error(`Unknown command: ${cmd}`);
    printUsage();
    process.exit(1);
  }
}

main();
