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
import { inspectArtifact, inspectClipboardArtifact, assessArtifactQuality } from './inspectors/output-inspector.mjs';
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

/**
 * Installed inside the inspected page after navigation and before every action.
 * This function is serialized with toString(), so it must remain self-contained.
 */
function installCadesPageInstrumentation() {
  if (window.__cadesInstrumentationVersion === 2) return true;

  window.__cadesInstrumentationVersion = 2;
  let persistedPayloads = [];
  try { persistedPayloads = JSON.parse(sessionStorage.getItem('__cadesNetPayloads') || '[]'); } catch {}
  window.__netPayloads = Array.isArray(window.__netPayloads) ? window.__netPayloads : persistedPayloads;
  window.__capturedClipboard = Array.isArray(window.__capturedClipboard) ? window.__capturedClipboard : [];

  const recordPayload = (type, method, url) => {
    window.__netPayloads.push({
      type,
      method: String(method || 'UNKNOWN').toUpperCase(),
      url: String(url || '').slice(0, 200),
      timestamp: Date.now()
    });
    try { sessionStorage.setItem('__cadesNetPayloads', JSON.stringify(window.__netPayloads)); } catch {}
  };

  try {
    window.alert = function() { return true; };
    window.confirm = function() { return true; };
    window.prompt = function(msg, def) { return def || ''; };
    window.print = function() {
      window.__printTriggered = true;
      return true;
    };
    if (typeof window.Notification !== 'undefined') {
      try {
        Object.defineProperty(window.Notification, 'permission', {
          get: () => 'granted',
          configurable: true
        });
      } catch (e) {}
      window.Notification.requestPermission = function(cb) {
        if (typeof cb === 'function') cb('granted');
        return Promise.resolve('granted');
      };
    }
  } catch (e) {}

  if (navigator.clipboard && !navigator.clipboard.__cadesWrapped) {
    const origWriteText = navigator.clipboard.writeText?.bind(navigator.clipboard);
    navigator.clipboard.writeText = async function(text) {
      window.__capturedClipboard.push({ type: 'writeText', text: String(text), timestamp: Date.now() });
      return origWriteText ? origWriteText(text) : undefined;
    };
    try { navigator.clipboard.__cadesWrapped = true; } catch {}
  }

  if (!document.__cadesExecCommandWrapped) {
    const origExecCommand = document.execCommand?.bind(document);
    document.execCommand = function(command, ...args) {
      if (String(command || '').toLowerCase() === 'copy') {
        const selected = window.getSelection ? window.getSelection().toString() : '';
        if (selected) window.__capturedClipboard.push({ type: 'execCommand', text: selected, timestamp: Date.now() });
      }
      return origExecCommand ? origExecCommand(command, ...args) : true;
    };
    try { document.__cadesExecCommandWrapped = true; } catch {}
  }

  if (!window.fetch.__cadesWrapped) {
    const origFetch = window.fetch.bind(window);
    const wrappedFetch = function(...args) {
      const request = args[0];
      const options = args[1] || {};
      const url = typeof request === 'string' ? request : (request?.url || '');
      const method = String(options.method || request?.method || 'GET').toUpperCase();
      if (options.body !== undefined || !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        recordPayload('fetch', method, url);
      }
      return origFetch(...args);
    };
    wrappedFetch.__cadesWrapped = true;
    window.fetch = wrappedFetch;
  }

  if (!XMLHttpRequest.prototype.__cadesWrapped) {
    const origXhrOpen = XMLHttpRequest.prototype.open;
    const origXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this.__cadesMethod = String(method || 'GET').toUpperCase();
      this.__cadesUrl = String(url || '');
      return origXhrOpen.call(this, method, url, ...args);
    };
    XMLHttpRequest.prototype.send = function(body) {
      if (body !== undefined && body !== null) {
        recordPayload('xhr', this.__cadesMethod, this.__cadesUrl);
      }
      return origXhrSend.call(this, body);
    };
    XMLHttpRequest.prototype.__cadesWrapped = true;
  }

  if (navigator.sendBeacon && !navigator.sendBeacon.__cadesWrapped) {
    const origSendBeacon = navigator.sendBeacon.bind(navigator);
    const wrappedSendBeacon = function(url, data) {
      recordPayload('beacon', 'POST', url);
      return origSendBeacon(url, data);
    };
    wrappedSendBeacon.__cadesWrapped = true;
    navigator.sendBeacon = wrappedSendBeacon;
  }

  if (typeof WebSocket !== 'undefined' && !WebSocket.prototype.__cadesWrapped) {
    const origWebSocketSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function(data) {
      recordPayload('websocket', 'SEND', this.url);
      return origWebSocketSend.call(this, data);
    };
    WebSocket.prototype.__cadesWrapped = true;
  }

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (form instanceof HTMLFormElement) {
      recordPayload('form', form.method || 'GET', form.action || window.location.href);
    }
  }, true);

  window.__uxTelemetry = window.__uxTelemetry || {
    longTasksCount: 0,
    maxLongTaskDuration: 0,
    totalLongTaskDuration: 0,
    clsScore: 0
  };
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__uxTelemetry.longTasksCount++;
        window.__uxTelemetry.totalLongTaskDuration += entry.duration;
        window.__uxTelemetry.maxLongTaskDuration = Math.max(
          window.__uxTelemetry.maxLongTaskDuration,
          Math.round(entry.duration)
        );
      }
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch {}
  try {
    const layoutObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__uxTelemetry.clsScore += entry.value;
      }
    });
    layoutObserver.observe({ entryTypes: ['layout-shift'] });
  } catch {}

  return true;
}

export function summarizeObservedEgress(payloads) {
  const outgoingPayloadCount = Array.isArray(payloads) ? payloads.length : 0;
  return {
    outgoingPayloadCount,
    observed: outgoingPayloadCount > 0,
    classification: outgoingPayloadCount > 0
      ? 'Payload Egress Observed'
      : 'No Payload Egress Observed (not proof of local-only processing)'
  };
}

export function mergeObservedPayloads(...groups) {
  const merged = groups.flatMap(group => Array.isArray(group) ? group : []);
  return merged.filter((payload, index, all) => {
    const key = `${payload?.type}|${payload?.method}|${payload?.url}|${payload?.timestamp}`;
    return all.findIndex(candidate =>
      `${candidate?.type}|${candidate?.method}|${candidate?.url}|${candidate?.timestamp}` === key
    ) === index;
  });
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
    Launches ego-browser, navigates to URL, installs payload-egress observation hooks,
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

  export <slug> [--trigger <text-regex|css=selector>]
    Listens for download events, triggers export/download, catches artifact,
    and runs format/watermark/bait-trap inspection.

  finish <slug> [--eval <eval.json>] [--sync] [--allow-shallow]
    Summarizes observed payload egress, runs Anti-Slacking checks, generates
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
    return false;
  }

  const initialPicPath = join(tmpdir(), `dogfood-${safeSlug}-step1-initial.png`);
  const resultFile = join(tmpdir(), `dogfood-start-res-${Date.now()}.json`);

  const script = `
(async () => {
  const result = { spaceId: null, url: null, title: "", headings: [], buttonLabels: [], placeholders: [], textareaCount: 0, fileInputCount: 0, canvasCount: 0, error: null };
  try {
    const task = await taskSpace("cades-dogfood-" + ${JSON.stringify(safeSlug)} + "-" + Date.now());
    result.spaceId = task.spaceId;
    const page = task.page("p1");

    await page.dismissDialog().catch(() => false);
    await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: "(" + ${JSON.stringify(installCadesPageInstrumentation.toString())} + ")()"
    }).catch(() => false);
    try {
      await page.goto(${JSON.stringify(targetUrl)}, { waitUntil: "domcontentloaded", timeout: 45000 });
    } catch (navErr) {
      if (String(navErr?.message || '').includes('navigation committed') || String(navErr?.message || '').includes('Continue on this Page')) {
        await page.waitForTimeout(3000);
      } else {
        throw navErr;
      }
    }
    // Keep post-load evaluation as well to ensure top and child frames are instrumented
    await page.evaluate(${installCadesPageInstrumentation.toString()}).catch(() => false);
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
  console.log(`⏳ Navigating and installing payload-egress observation hooks in ego-browser...`);

  try {
    await runEgoScript(script, 60000);
    const res = JSON.parse(readFileSync(resultFile, 'utf-8'));
    try { unlinkSync(resultFile); } catch {}

    if (res.error) {
      console.error(`❌ Session start failed: ${res.error}`);
      return false;
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
      netPayloads: [],
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

    console.log(`\n📸 Visual Checkpoint 1 (Agent MUST inspect via view_image):`);
    console.log(`   👉 ${initialPicPath}`);
    console.log(`\n🛠️ Detected Surface:`);
    console.log(`   - Buttons:      ${res.buttonLabels.slice(0, 8).join(', ') || 'None'}`);
    console.log(`   - Textareas:    ${res.textareaCount} | File Inputs: ${res.fileInputCount} | Canvases: ${res.canvasCount}`);
    console.log(`\n💡 Suggested Next Actions for Agent:`);
    console.log(`   • Click an element:  node scripts/lab/dogfood-session.mjs act ${safeSlug} --click "<text|selector>"`);
    console.log(`   • Upload a fixture:  node scripts/lab/dogfood-session.mjs act ${safeSlug} --upload png`);
    console.log(`   • Test export:       node scripts/lab/dogfood-session.mjs export ${safeSlug}`);
    console.log(`   • Finish session:    node scripts/lab/dogfood-session.mjs finish ${safeSlug}\n`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to start session:`, err.message);
    return false;
  }
}

// -------------------------------------------------------------------------
// Subcommand 2: act
// -------------------------------------------------------------------------
async function cmdAct(slug, options) {
  const session = loadSession(slug);
  if (!session) {
    console.error(`❌ No active session found for [${slug}]. Run 'start <url>' first.`);
    return false;
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
      return false;
    }
  }

  const script = `
(async () => {
  const result = { success: false, actionPerformed: false, netPayloads: [], url: null, title: "", actionSummary: "", error: null };
  try {
    const task = await taskSpace(${JSON.stringify(session.spaceId)});
    const page = task.page("p1");
    await page.evaluate(${installCadesPageInstrumentation.toString()}).catch(() => false);

    ${options.click ? `
      const clickTarget = ${JSON.stringify(options.click)};
      const clicked = await page.evaluate((target) => {
        const getElements = (doc) => {
          let list = Array.from(doc.querySelectorAll('button, input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], a, label, [role="button"]'));
          for (const iframe of doc.querySelectorAll('iframe')) {
            try {
              if (iframe.contentDocument) {
                list = list.concat(getElements(iframe.contentDocument));
              }
            } catch (e) {}
          }
          return list;
        };
        const btns = getElements(document);
        const match = btns.find(b => (b.innerText || b.value || b.getAttribute('aria-label') || b.getAttribute('title') || '').trim().toLowerCase().includes(target.toLowerCase()));
        if (match) {
          match.click();
          return "Clicked text: " + (match.innerText || target);
        }
        const findSelector = (doc, sel) => {
          let el = doc.querySelector(sel);
          if (el) return el;
          for (const iframe of doc.querySelectorAll('iframe')) {
            try {
              if (iframe.contentDocument) {
                el = findSelector(iframe.contentDocument, sel);
                if (el) return el;
              }
            } catch (e) {}
          }
          return null;
        };
        const el = findSelector(document, target);
        if (el) {
          el.click();
          return "Clicked selector: " + target;
        }
        return null;
      }, clickTarget);
      result.actionSummary = clicked || ("Element not found for click: " + clickTarget);
      result.actionPerformed = Boolean(clicked) || result.actionPerformed;
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
      result.actionPerformed = Boolean(filled) || result.actionPerformed;
    ` : ''}

    ${options.upload ? `
      const fixPath = ${JSON.stringify(resolvedFixture)};
      try {
        await page.setInputFiles('input[type="file"]', fixPath);
        result.actionSummary = "Uploaded fixture: " + fixPath;
        result.actionPerformed = true;
      } catch (err) {
        try {
          const specificSelector = await page.evaluate(() => {
            const candidates = Array.from(document.querySelectorAll('input[type="file"]'));
            const fileCandidate = candidates.find(c => !c.hasAttribute('webkitdirectory')) || candidates[0];
            if (fileCandidate && fileCandidate.id) {
              return '#' + fileCandidate.id;
            }
            for (const el of candidates) {
              let p = el.parentElement;
              while (p && p !== document.body) {
                if (p.className && typeof p.className === 'string' && p.className.trim()) {
                  const firstCls = p.className.trim().split(/\s+/)[0];
                  if (firstCls && document.querySelectorAll('.' + firstCls + ' input[type="file"]').length === 1) {
                    return '.' + firstCls + ' input[type="file"]';
                  }
                }
                p = p.parentElement;
              }
            }
            return candidates.length > 0 ? 'input[type="file"]:nth-of-type(1)' : null;
          });
          if (specificSelector) {
            await page.setInputFiles(specificSelector, fixPath);
            result.actionSummary = "Uploaded fixture via disambiguated selector (" + specificSelector + "): " + fixPath;
            result.actionPerformed = true;
          } else {
            throw err;
          }
        } catch (fallbackErr) {
          result.actionSummary = "File input not found for upload: " + err.message;
        }
      }
    ` : ''}

    ${options.press ? `
      const key = ${JSON.stringify(options.press)};
      await page.keyboard.press(key);
      result.actionSummary = "Pressed key: " + key;
      result.actionPerformed = true;
    ` : ''}

    ${options.evalJs ? `
      const jsCode = ${JSON.stringify(options.evalJs)};
      const evalRes = await page.evaluate(async (c) => {
        try { 
          const val = await eval(c);
          return { ok: true, value: typeof val === 'object' ? JSON.stringify(val) : String(val) }; 
        }
        catch (e) { return { ok: false, value: "Eval error: " + e.message }; }
      }, jsCode);
      result.actionSummary = "Evaluated JS: " + evalRes.value;
      result.actionPerformed = Boolean(evalRes.ok) || result.actionPerformed;
    ` : ''}

    await page.waitForTimeout(1500);
    result.url = await page.url();
    result.title = await page.title();
    result.ux = await page.evaluate(() => window.__uxTelemetry || null);
    result.netPayloads = await page.evaluate(() => window.__netPayloads || []);
    await page.screenshot({ path: ${JSON.stringify(actionPicPath)} });
    result.success = result.actionPerformed;
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

    if (res.error || !res.actionPerformed) {
      console.error(`❌ Action failed: ${res.error || res.actionSummary || 'No target was operated'}`);
      return false;
    }

    session.steps.push({
      step: stepNumber,
      type: 'act',
      performed: true,
      summary: res.actionSummary,
      screenshot: actionPicPath,
      url: res.url,
      title: res.title,
      ux: res.ux || null
    });
    session.currentUrl = res.url;
    session.netPayloads = mergeObservedPayloads(session.netPayloads, res.netPayloads);
    if (res.ux) {
      session.uxTelemetry = res.ux;
      const isButter = (res.ux.maxLongTaskDuration < 60 && res.ux.clsScore === 0);
      console.log(`⚡ UX Ergonomics (Step ${stepNumber}): ${isButter ? '✅ Smooth frame pacing (0 jank)' : `⚠️ Max freeze: ${res.ux.maxLongTaskDuration}ms, CLS: ${Number(res.ux.clsScore).toFixed(2)}`}`);
    }
    saveSession(slug, session);

    console.log(`✅ Action completed: ${res.actionSummary}`);
    console.log(`📸 Visual Checkpoint (Step ${stepNumber}):`);
    console.log(`   👉 ${actionPicPath} (Agent inspect via view_image)`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to execute action:`, err.message);
    return false;
  }
}

// -------------------------------------------------------------------------
// Subcommand 3: export
// -------------------------------------------------------------------------
async function cmdExport(slug, trigger = null) {
  const session = loadSession(slug);
  if (!session) {
    console.error(`❌ No active session found for [${slug}].`);
    return false;
  }

  const exportDlPath = join(tmpdir(), `dogfood-dl-${slug}-${Date.now()}.artifact`);
  const exportPicPath = join(tmpdir(), `dogfood-${slug}-step-export.png`);
  const resultFile = join(tmpdir(), `dogfood-export-res-${Date.now()}.json`);

  const script = `
(async () => {
  const result = { downloadTriggered: false, downloadPath: null, clipboardTriggered: false, clipboardText: null, printTriggered: false, netPayloads: [], authIntercepted: false, authDetails: null, error: null };
  try {
    const task = await taskSpace(${JSON.stringify(session.spaceId)});
    const page = task.page("p1");
    await page.evaluate(${installCadesPageInstrumentation.toString()}).catch(() => false);

    const dlPromise = page.waitForEvent("download", { timeout: 4500 }).catch(() => null);

    const triggerTarget = ${JSON.stringify(trigger || "download|export|save|copy|下载|导出|保存|复制")};
    const clicked = await page.evaluate((target) => {
      const getButtons = (doc) => {
        let list = Array.from(doc.querySelectorAll('button, input[type="button"], a, [role="button"], [role="menuitem"], .dropdown-item'));
        for (const iframe of doc.querySelectorAll('iframe')) {
          try {
            if (iframe.contentDocument) {
              list = list.concat(getButtons(iframe.contentDocument));
            }
          } catch (e) {}
        }
        return list;
      };
      const btns = getButtons(document);
      if (target.startsWith('css=')) {
        const findInDocs = (doc, sel) => {
          let el = doc.querySelector(sel);
          if (el) return el;
          for (const iframe of doc.querySelectorAll('iframe')) {
            try {
              if (iframe.contentDocument) {
                el = findInDocs(iframe.contentDocument, sel);
                if (el) return el;
              }
            } catch (e) {}
          }
          return null;
        };
        const selected = findInDocs(document, target.slice(4));
        if (selected) {
          selected.click();
          return (selected.innerText || selected.getAttribute('aria-label') || target).trim();
        }
        return null;
      }
      let matcher;
      try { matcher = new RegExp(target, "i"); }
      catch { matcher = { test: (value) => String(value).toLowerCase().includes(target.toLowerCase()) }; }
      const match = btns.find(b => {
        const labels = [b.innerText, b.value, b.getAttribute('aria-label'), b.getAttribute('title')].filter(Boolean).map(s => s.trim());
        const combined = labels.join(' ');
        if (/login|sign in|pricing|cookie|desktop\s+app/i.test(combined)) return false;
        return labels.some(t => matcher.test(t));
      });
      if (match) {
        match.click();
        return (match.getAttribute('aria-label') || match.innerText || match.getAttribute('title') || "Export trigger").trim();
      }
      return null;
    }, triggerTarget);

    result.triggerClicked = clicked;

    const download = await dlPromise;
    if (download) {
      result.downloadTriggered = true;
      try {
        if (download.saveAs) {
          await download.saveAs(${JSON.stringify(exportDlPath)});
          result.downloadPath = ${JSON.stringify(exportDlPath)};
        }
      } catch (dlErr) {
        // Download was triggered by the page, but saving the artifact was interrupted by browser
      }
    } else {
      await page.waitForTimeout(800);

      // Check if clipboard export occurred
      const capturedClipboard = await page.evaluate(() => window.__capturedClipboard || []);
      if (capturedClipboard.length > 0) {
        const latest = capturedClipboard[capturedClipboard.length - 1];
        result.clipboardTriggered = true;
        result.clipboardText = latest.text;
      }

      const printTriggered = await page.evaluate(() => Boolean(window.__printTriggered));
      if (printTriggered) {
        result.printTriggered = true;
      }

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

    result.netPayloads = await page.evaluate(() => window.__netPayloads || []);
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

    if (res.error) {
      console.error(`❌ Export interaction failed: ${res.error}`);
      return false;
    }

    let inspectionReport = null;
    let qualityReport = null;

    if (res.downloadPath && existsSync(res.downloadPath)) {
      inspectionReport = inspectArtifact(res.downloadPath);
      qualityReport = assessArtifactQuality(inspectionReport);
    } else if (res.clipboardText) {
      inspectionReport = inspectClipboardArtifact(res.clipboardText);
      qualityReport = assessArtifactQuality(inspectionReport);
    }

    session.exportArtifact = {
      downloadTriggered: res.downloadTriggered,
      downloadPath: res.downloadPath,
      clipboardTriggered: res.clipboardTriggered,
      clipboardText: res.clipboardText,
      printTriggered: res.printTriggered,
      authIntercepted: res.authIntercepted,
      authDetails: res.authDetails,
      screenshot: exportPicPath,
      inspectionReport,
      qualityReport
    };
    session.netPayloads = mergeObservedPayloads(session.netPayloads, res.netPayloads);

    if (res.triggerClicked || res.downloadTriggered || res.clipboardTriggered || res.printTriggered) {
      session.steps.push({
        step: session.steps.length + 1,
        type: 'export',
        performed: true,
        summary: `Triggered export: ${res.triggerClicked || (res.downloadTriggered ? 'File Download' : (res.printTriggered ? 'Print to PDF' : 'Clipboard Export'))}`,
        screenshot: exportPicPath,
        downloadTriggered: res.downloadTriggered,
        clipboardTriggered: res.clipboardTriggered,
        printTriggered: res.printTriggered,
        authIntercepted: res.authIntercepted
      });
    }

    saveSession(slug, session);

    console.log(`\n======================================================`);
    console.log(`🛡️ Export Gatekeeper Audit Report:`);
    console.log(`======================================================`);
    console.log(`Trigger Clicked:     ${res.triggerClicked || 'None found'}`);
    console.log(`Download Triggered:  ${res.downloadTriggered ? '✅ YES' : '❌ NO'}`);
    console.log(`Clipboard Captured:  ${res.clipboardTriggered ? '✅ YES' : '❌ NO'}`);
    console.log(`Print / PDF Triggered: ${res.printTriggered ? '✅ YES' : '❌ NO'}`);
    console.log(`Auth Interception:   ${res.authIntercepted ? '⚠️ DETECTED: ' + res.authDetails : '✅ NONE (Safe)'}`);

    if (inspectionReport) {
      if (inspectionReport.type === 'clipboard') {
        console.log(`\n📋 Clipboard Physical Inspection:`);
        console.log(`   - Format:       ${inspectionReport.file?.format?.toUpperCase()}`);
        console.log(`   - Length:       ${inspectionReport.file?.charCount} chars (${inspectionReport.file?.lineCount} lines)`);
        console.log(`   - Watermark Tail: ${inspectionReport.quality?.hasWatermark ? '⚠️ DETECTED: ' + inspectionReport.quality.watermarkSignature : '✅ None'}`);
        console.log(`   - Tail Broke Data: ${inspectionReport.quality?.tailBrokeFormat ? '⚠️ YES (Syntax Error)' : '✅ NO'}`);
        console.log(`   - Bait Trap:    ${inspectionReport.quality?.isBaitTrap ? '⚠️ Bait Trap Prompt!' : '✅ Clean'}`);
        console.log(`   - Valid Data:   ${inspectionReport.quality?.isValidStructure ? '✅ PASS' : '❌ INVALID'}`);
      } else {
        console.log(`\n📄 Artifact Physical Inspection:`);
        console.log(`   - Format:       ${inspectionReport.file?.format?.toUpperCase()}`);
        console.log(`   - Size:         ${inspectionReport.file?.sizeBytes} bytes`);
        console.log(`   - Dimensions:   ${inspectionReport.file?.dimensions ? `${inspectionReport.file.dimensions.width}x${inspectionReport.file.dimensions.height}` : 'N/A'}`);
        console.log(`   - Watermark:    ${inspectionReport.quality?.hasWatermark ? '⚠️ DETECTED: ' + inspectionReport.quality.watermarkSignature : '✅ None'}`);
        console.log(`   - Bait Trap:    ${inspectionReport.quality?.isBaitTrap ? '⚠️ HTML Trap!' : '✅ Clean'}`);
        console.log(`   - Blank Canvas: ${inspectionReport.quality?.isBlankCanvas ? '⚠️ Blank Whiteout!' : '✅ Non-blank'}`);
      }
    }

    console.log(`\n📸 Export State Screenshot:`);
    console.log(`   👉 ${exportPicPath} (Agent inspect via view_image)\n`);
    if (!res.triggerClicked && !res.downloadTriggered && !res.clipboardTriggered) {
      console.error('❌ No export control matched the requested trigger. This does not count as an interaction.');
      return false;
    }
    return true;
  } catch (err) {
    console.error(`❌ Export test failed:`, err.message);
    return false;
  }
}

// -------------------------------------------------------------------------
// Subcommand 4: finish
// -------------------------------------------------------------------------
async function cmdFinish(slug, evalFilePath = null, shouldSync = false, allowShallow = false) {
  const session = loadSession(slug);
  if (!session) {
    console.error(`❌ No active session found for [${slug}].`);
    return false;
  }

  // Only successful, observable interactions satisfy the guardrail.
  const userActions = session.steps.filter(
    s => (s.type === 'act' || s.type === 'export') && s.performed === true
  );
  if (userActions.length === 0 && !allowShallow) {
    console.warn(`\n⚠️  [CADES 2.0 Anti-Slacking Guardrail]`);
    console.warn(`   Session [${slug}] has 0 interactive user steps (only started, never acted/exported).`);
    console.warn(`   Deep dogfooding requires actively testing the tool (fill, click, upload, or export).`);
    console.warn(`   To finalize anyway (e.g. for purely static landing pages), pass --allow-shallow:\n`);
    console.warn(`   node scripts/lab/dogfood-session.mjs finish ${slug} --allow-shallow\n`);
    return false;
  }

  if (shouldSync && !evalFilePath) {
    console.error('❌ --sync requires a validated --eval <json-file> payload.');
    return false;
  }

  let evalData = null;
  if (evalFilePath) {
    if (!existsSync(evalFilePath)) {
      console.error(`❌ Evaluation file not found: ${evalFilePath}`);
      return false;
    }
    try {
      evalData = JSON.parse(readFileSync(evalFilePath, 'utf-8'));
    } catch (err) {
      console.error(`❌ Failed to parse eval file: ${err.message}`);
      return false;
    }

    const validation = validateCognitiveEvaluation(evalData, { requireBilingual: shouldSync });
    if (!validation.valid) {
      console.error('\n❌ Agent evaluation validation failed; session remains open and nothing was synchronized:');
      validation.errors.forEach(error => console.error(`   • ${error}`));
      return false;
    }
    if (shouldSync && !existsSync(EDITORIAL_PATH)) {
      console.error(`❌ Editorial file not found: ${EDITORIAL_PATH}`);
      return false;
    }
    console.log('\n✅ Agent evaluation validated successfully.');
  }

  const resultFile = join(tmpdir(), `dogfood-finish-res-${Date.now()}.json`);

  const script = `
(async () => {
  const result = { netPayloads: [], error: null };
  try {
    let task = null;
    try {
      task = await taskSpace(${JSON.stringify(session.spaceId)});
    } catch (spaceErr) {
      try {
        if (typeof takeOverTaskSpace !== 'undefined') {
          task = await takeOverTaskSpace(${JSON.stringify(session.spaceId)});
        }
      } catch (takeErr) {}
    }
    if (task) {
      const page = task.page("p1");
      const payloads = await page.evaluate(() => window.__netPayloads || []).catch(() => []);
      result.netPayloads = payloads;
      await task.finish({ keep: [] }).catch(() => false);
    }
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
    if (res.error && (!session.netPayloads || session.netPayloads.length === 0)) {
      console.error(`❌ Failed to finalize browser session: ${res.error}`);
      return false;
    }
    netPayloads = mergeObservedPayloads(session.netPayloads, res.netPayloads);
  } catch (e) {
    if (!session.netPayloads || session.netPayloads.length === 0) {
      console.error(`❌ Failed during task.finish: ${e.message}`);
      return false;
    }
    netPayloads = session.netPayloads;
  }

  const egressObservation = summarizeObservedEgress(netPayloads);

  console.log(`\n🌐 Runtime Payload-Egress Observation:`);
  console.log(`   - Outgoing Payloads: ${egressObservation.outgoingPayloadCount}`);
  console.log(`   - Classification:    ${egressObservation.classification}`);

  if (evalData && shouldSync) {
    try {
      if (
        egressObservation.observed &&
        /(?:zero[- ]egress|100%\s+(?:client|local)|pure(?:ly)?\s+(?:client|local)|no\s+(?:payload|data)\s+(?:egress|transmission))/i.test(evalData.privacyVerdict)
      ) {
        console.error('❌ privacyVerdict contradicts observed payload egress; editorial was not synchronized.');
        removeSession(slug);
        return false;
      }

      const editorial = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf-8'));
      const overall = evalData.productScore.overall;
      const verdictTier = evalData.verdictTier || (
        overall >= 90 ? 'editors-choice' :
        overall >= 80 ? 'highly-recommended' :
        overall >= 70 ? 'capable-utility' : 'emergency-only'
      );
      const testedAt = new Date().toISOString().slice(0, 7);
      editorial[slug] = editorial[slug] || {};
      const normalizeAlts = (val, fallback = []) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && val.trim().length > 0) {
          return val.split(',').map(s => s.trim()).filter(Boolean);
        }
        return fallback;
      };

      editorial[slug].en = {
        bestFor: evalData.bestFor,
        pros: evalData.pros,
        cons: evalData.cons,
        privacyVerdict: evalData.privacyVerdict,
        alternativeTo: normalizeAlts(evalData.alternativeTo, editorial[slug]?.en?.alternativeTo || []),
        productScore: evalData.productScore,
        verdictTier,
        benchmarkNotes: evalData.benchmarkNotes,
        testedAt
      };
      editorial[slug].zh = {
        bestFor: evalData.bestForZh,
        pros: evalData.prosZh,
        cons: evalData.consZh,
        privacyVerdict: evalData.privacyVerdictZh,
        alternativeTo: normalizeAlts(evalData.alternativeToZh, editorial[slug]?.zh?.alternativeTo || editorial[slug]?.en?.alternativeTo || []),
        productScore: evalData.productScore,
        verdictTier,
        benchmarkNotes: evalData.benchmarkNotesZh,
        testedAt
      };

      writeFileSync(EDITORIAL_PATH, JSON.stringify(editorial, null, 2) + '\n', 'utf-8');
      console.log(`\n💾 Successfully synced Route A evaluation into ${EDITORIAL_PATH} for [${slug}]!`);
    } catch (err) {
      console.error(`❌ Failed to apply eval file: ${err.message}`);
      removeSession(slug);
      return false;
    }
  } else if (!evalData) {
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
    egressObservation: {
      ...egressObservation,
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
  console.log(`Payload Egress:      ${flightRecorder.egressObservation.classification} (${netPayloads.length} payloads)`);
  if (session.exportArtifact) {
    const art = session.exportArtifact;
    console.log(`Export Gate:         ${art.downloadTriggered ? '✅ Download triggered' : '❌ No download'} | Bait Trap: ${art.qualityReport?.isBaitTrap ? '⚠️ TRAP' : '✅ Clean'}`);
  }
  console.log(`Flight Log Saved:    ${flightRecorderPath}`);
  console.log(`========================================================================`);

  removeSession(slug);
  console.log(`\n🧹 Browser space and local session state cleared.\n`);
  return true;
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
    const ok = await cmdStart(targetUrl, slug);
    if (!ok) process.exitCode = 1;
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

    const ok = await cmdAct(slug, options);
    if (!ok) process.exitCode = 1;
  } else if (cmd === 'export') {
    const slug = args[1];
    if (!slug) {
      console.error('Error: export requires a tool slug.');
      process.exit(1);
    }
    const triggerIdx = args.indexOf('--trigger');
    const trigger = triggerIdx !== -1 ? args[triggerIdx + 1] : null;
    const ok = await cmdExport(slug, trigger);
    if (!ok) process.exitCode = 1;
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
    const ok = await cmdFinish(slug, evalPath, shouldSync, allowShallow);
    if (!ok) process.exitCode = 1;
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

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMain) {
  main();
}
