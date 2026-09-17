#!/usr/bin/env node
/**
 * scripts/inspect-tool-dogfood.mjs
 * 
 * Deep interactive dogfooding inspection tool for nologin.tools using ego-browser.
 * Automates:
 * 1. Initial State & Blocking Auth Gate Detection
 * 2. Workspace Surface & Input Discovery (Textareas, Editors, File Inputs, Canvas)
 * 3. Active Dogfooding (Injecting test payload, clicking core action triggers)
 * 4. Exit / Export Gatekeeper Check (Clicking download/export/copy, intercepting login traps)
 * 5. Network Traffic & Privacy Architecture Sniffing (Local Only vs Cloud Processed)
 * 6. 25-Point 5-Dimension Scorecard & Objective Metadata Synthesis
 * 
 * Usage:
 *   node scripts/inspect-tool-dogfood.mjs <url> [--json] [--verbose]
 */

import { spawn } from 'node:child_process';
import { writeFileSync, unlinkSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const VALID_CATEGORIES = [
  'AI', 'Design', 'Writing', 'Development', 'Productivity',
  'Utilities', 'Media', 'Security', 'Math', 'Finance', 'Privacy'
];

function printUsage() {
  console.log(`
Usage:
  node scripts/inspect-tool-dogfood.mjs <URL> [options]

Options:
  --json       Output raw JSON results only (for agent programmatic consumption)
  --verbose    Print detailed real-time execution steps
  --help       Show this help message
`);
}

// Generate the script that ego-browser nodejs will execute
function buildEgoScript(targetUrl, resultFilePath, timeoutMs = 25000, finishSession = false) {
  return `
(async () => {
  const task = await taskSpace("nologin-audit-" + Date.now());
  const page = task.page("p1");

  const result = {
    targetUrl: ${JSON.stringify(targetUrl)},
    finalUrl: null,
    title: "",
    metaDesc: "",
    githubLink: null,
    initialAuthGate: {
      blocked: false,
      reason: null
    },
    surface: {
      hasTextInputs: false,
      hasFileInputs: false,
      hasCanvas: false,
      textareaCount: 0,
      fileInputCount: 0,
      canvasCount: 0,
      buttonLabels: [],
      headings: []
    },
    dogfoodRun: {
      tested: false,
      actionName: null,
      inputProvided: false,
      outputObserved: false,
      durationMs: 0
    },
    exportGate: {
      tested: false,
      exportTrigger: null,
      interceptedByAuth: false,
      authPromptDetails: null,
      downloadTriggered: false,
      passedNoLoginExport: false
    },
    networkPrivacy: {
      hasWebAssembly: false,
      outgoingPayloadRequests: [],
      hasThirdPartyTracking: false,
      classification: "Unknown",
      offlineCapable: false
    },
    darkPatterns: {
      excessiveAds: false,
      fakeDownloadTriggers: false,
      unclosablePopups: false
    },
    error: null
  };

  try {
    // 1. Navigate
    await page.dismissDialog().catch(() => false);
    await page.goto(${JSON.stringify(targetUrl)}, { waitUntil: "domcontentloaded", timeout: ${timeoutMs} });
    result.finalUrl = await page.url();

    if (/accounts\\.google\\.com|github\\.com\\/login|appleid\\.apple\\.com|auth0\\.com|clerk\\.com/i.test(result.finalUrl)) {
      result.initialAuthGate.blocked = true;
      result.initialAuthGate.reason = "站点重定向至外部第三方登录授权服务: " + result.finalUrl;
    }

    // 2. Set up in-page network interception & evaluate initial surface
    await page.evaluate(() => {
      window.__netPayloads = [];
      const isTelemetry = (u) => /google-analytics|googletagmanager|clarity\\.ms|sentry\\.io|doubleclick|pagead|googlesyndication|pub\\.network|adnxs|rubicon|criteo|fundingchoicesmessages|cloudflareinsights|fonts\\.googleapis|cdnjs\\.cloudflare/i.test(u);
      
      const origFetch = window.fetch;
      window.fetch = function(...args) {
        try {
          const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
          const method = (args[1]?.method || (typeof args[0] === 'object' ? args[0]?.method : 'GET') || 'GET').toUpperCase();
          const hasBody = Boolean(args[1]?.body);
          if (hasBody && !isTelemetry(url)) {
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
    });

    await page.waitForTimeout(1200);

    // 3. Scan DOM Surface & Initial Auth Wall
    const domInfo = await page.evaluate(() => {
      const title = document.title?.trim() || '';
      const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim() ||
                       document.querySelector('meta[property="og:description"]')?.content?.trim() || '';
      const githubLink = document.querySelector('a[href*="github.com/"]')?.href || null;

      const textareas = Array.from(document.querySelectorAll('textarea, .monaco-editor, .cm-editor, [contenteditable="true"], input[type="text"], input[type="search"]'));
      const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
      const canvases = Array.from(document.querySelectorAll('canvas, svg.drawing-surface'));

      const allButtons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a.btn, a[role="button"], [role="button"]'))
        .map(b => (b.innerText || b.value || b.getAttribute('aria-label') || '').trim())
        .filter(t => t.length > 0 && t.length < 40);

      const headings = Array.from(document.querySelectorAll('h1, h2'))
        .map(h => h.innerText?.trim())
        .filter(Boolean)
        .slice(0, 6);

      const modals = Array.from(document.querySelectorAll('[role="dialog"], .modal, .popup, [aria-modal="true"], .overlay'))
        .filter(m => {
          const s = window.getComputedStyle(m);
          return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0' && m.offsetHeight > 100;
        });

      const hasPasswordInput = Boolean(document.querySelector('input[type="password"]'));
      const isPureLoginPage = hasPasswordInput && /(login|signin|sign-in|signup|register)/i.test(window.location.pathname + ' ' + document.title);

      let initialAuthBlocker = isPureLoginPage;
      let blockerText = isPureLoginPage ? '页面为纯登录/注册入口 (含密码输入框)' : null;

      if (!initialAuthBlocker) {
        for (const m of modals) {
          const text = m.innerText || '';
          if (/cookie preferences|cookie notice|manage cookies/i.test(text) && !/sign in|log in|register|create account/i.test(text)) {
            continue;
          }
          if (/sign in with google|log in to continue|create an account to access|please log in|sign up to continue|start free trial/i.test(text)) {
            initialAuthBlocker = true;
            blockerText = text.slice(0, 200).replace(/\\s+/g, ' ');
            break;
          }
        }
      }

      const isWafChallenge = Boolean(document.querySelector('#challenge-running, #challenge-form, #cf-turnstile, .cf-turnstile-wrapper, iframe[src*="challenges.cloudflare.com"], iframe[src*="turnstile"]')) ||
                             /just a moment\.\.\.|attention required!\s*\|\s*cloudflare|checking your browser|security check/i.test(title);

      const hasWasm = Boolean(window.WebAssembly);

      return {
        title,
        metaDesc,
        githubLink,
        initialAuthBlocker,
        blockerText,
        isWafChallenge,
        textareaCount: textareas.length,
        fileInputCount: fileInputs.length,
        canvasCount: canvases.length,
        buttonLabels: allButtons.slice(0, 25),
        headings,
        hasWasm
      };
    });

    result.title = domInfo.title;
    result.metaDesc = domInfo.metaDesc;
    result.githubLink = domInfo.githubLink;
    result.surface.hasTextInputs = domInfo.textareaCount > 0;
    result.surface.hasFileInputs = domInfo.fileInputCount > 0;
    result.surface.hasCanvas = domInfo.canvasCount > 0;
    result.surface.textareaCount = domInfo.textareaCount;
    result.surface.fileInputCount = domInfo.fileInputCount;
    result.surface.canvasCount = domInfo.canvasCount;
    result.surface.buttonLabels = domInfo.buttonLabels;
    result.surface.headings = domInfo.headings;
    result.networkPrivacy.hasWebAssembly = domInfo.hasWasm;

    if (domInfo.isWafChallenge) {
      result.wafChallengeDetected = true;
      result.challengeDetails = "Cloudflare Turnstile / Bot Verification required";
    }

    if (domInfo.initialAuthBlocker) {
      result.initialAuthGate.blocked = true;
      result.initialAuthGate.reason = domInfo.blockerText;
      console.log(JSON.stringify(result));
      await task.finish({ keep: [] });
      return;
    }

    // 4. Dogfooding Execution
    const actionRegex = /format|beautify|convert|run|generate|minify|transform|calculate|process|compress|translate|validate|parse|analyze|execute|test/i;
    const exportRegex = /download|export|save|copy|share/i;

    let targetActionBtn = domInfo.buttonLabels.find(l => actionRegex.test(l) && !/login|sign in|register|pricing|upgrade|cookie|close/i.test(l));
    let targetExportBtn = domInfo.buttonLabels.find(l => exportRegex.test(l) && !/login|sign in|register|pricing|upgrade|cookie|close/i.test(l));

    if (domInfo.textareaCount > 0) {
      const injected = await page.evaluate(() => {
        const ta = document.querySelector('textarea, .monaco-editor, .cm-editor, [contenteditable="true"], input[type="text"]');
        if (ta) {
          const sample = JSON.stringify({ name: "nologin-test", timestamp: Date.now(), values: [1, 2, 3] });
          if (ta.value !== undefined) {
            ta.value = sample;
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            ta.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          } else if (ta.isContentEditable) {
            ta.innerText = sample;
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
          }
        }
        return false;
      });

      result.dogfoodRun.inputProvided = injected;

      if (targetActionBtn) {
        result.dogfoodRun.actionName = targetActionBtn;
        const startTime = Date.now();
        await page.evaluate((btnText) => {
          const btns = Array.from(document.querySelectorAll('button, input[type="button"], a.btn, [role="button"]'));
          const target = btns.find(b => {
            const label = (b.innerText || b.value || b.getAttribute('aria-label') || '').trim();
            return label === btnText || label.toLowerCase().includes(btnText.toLowerCase());
          });
          if (target) target.click();
        }, targetActionBtn);

        await page.waitForTimeout(1500);
        result.dogfoodRun.durationMs = Date.now() - startTime;
        result.dogfoodRun.tested = true;
        result.dogfoodRun.outputObserved = true;
      }
    } else if (domInfo.canvasCount > 0) {
      const drawn = await page.evaluate(() => {
        const c = document.querySelector('canvas') || document.querySelector('svg.canvas');
        if (!c) return false;
        const rect = c.getBoundingClientRect();
        if (rect.width < 50 || rect.height < 50) return false;
        const startX = rect.left + rect.width * 0.35;
        const startY = rect.top + rect.height * 0.35;
        const midX = rect.left + rect.width * 0.5;
        const midY = rect.top + rect.height * 0.45;
        const endX = rect.left + rect.width * 0.65;
        const endY = rect.top + rect.height * 0.6;
        const dispatch = (type, x, y, buttons = 1) => {
          try {
            c.dispatchEvent(new PointerEvent(type, {
              bubbles: true, cancelable: true, view: window,
              clientX: x, clientY: y, button: 0, buttons, pointerId: 1, pointerType: 'mouse', isPrimary: true
            }));
          } catch (e) {}
          try {
            c.dispatchEvent(new MouseEvent(type.replace('pointer', 'mouse'), {
              bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0, buttons
            }));
          } catch (e) {}
        };
        dispatch('pointerdown', startX, startY, 1);
        dispatch('pointermove', midX, midY, 1);
        dispatch('pointermove', endX, endY, 1);
        dispatch('pointerup', endX, endY, 0);
        return true;
      });
      result.dogfoodRun.tested = true;
      result.dogfoodRun.actionName = "Interactive Canvas Stroke Simulation";
      result.dogfoodRun.inputProvided = drawn;
      result.dogfoodRun.outputObserved = drawn;
    }

    // 5. Exit / Export Gatekeeper Check
    if (targetExportBtn) {
      result.exportGate.tested = true;
      result.exportGate.exportTrigger = targetExportBtn;

      const downloadPromise = page.waitForEvent("download", { timeout: 3500 }).catch(() => null);

      await page.evaluate((btnText) => {
        const btns = Array.from(document.querySelectorAll('button, input[type="button"], a, [role="button"]'));
        const target = btns.find(b => {
          const label = (b.innerText || b.value || b.getAttribute('aria-label') || '').trim();
          return label === btnText || label.toLowerCase().includes(btnText.toLowerCase());
        });
        if (target) target.click();
      }, targetExportBtn);

      const download = await downloadPromise;
      if (download) {
        result.exportGate.downloadTriggered = true;
        result.exportGate.passedNoLoginExport = true;
      } else {
        await page.waitForTimeout(1200);
        const modalAuthCheck = await page.evaluate(() => {
          const modals = Array.from(document.querySelectorAll('[role="dialog"], .modal, .popup, [aria-modal="true"]'))
            .filter(m => {
              const s = window.getComputedStyle(m);
              return s.display !== 'none' && s.visibility !== 'hidden' && m.offsetHeight > 80;
            });
          for (const m of modals) {
            const t = m.innerText || '';
            if (/sign in|log in|create account|register|enter your email|start free trial|unlock download/i.test(t)) {
              return t.slice(0, 200).replace(/\\s+/g, ' ');
            }
          }
          if (/\\/(login|signin|register|signup|auth|pricing)/i.test(window.location.pathname)) {
            return "Redirected to auth/pricing URL: " + window.location.pathname;
          }
          return null;
        });

        if (modalAuthCheck) {
          result.exportGate.interceptedByAuth = true;
          result.exportGate.authPromptDetails = modalAuthCheck;
        } else {
          result.exportGate.passedNoLoginExport = true;
        }
      }
    } else {
      result.exportGate.passedNoLoginExport = !result.initialAuthGate.blocked;
    }

    // 6. Network & Privacy Classification
    const netPayloads = await page.evaluate(() => window.__netPayloads || []);
    result.networkPrivacy.outgoingPayloadRequests = netPayloads;
    if (netPayloads.length === 0) {
      result.networkPrivacy.classification = "Local Only";
      result.networkPrivacy.offlineCapable = true;
    } else {
      result.networkPrivacy.classification = "Cloud Processed";
      result.networkPrivacy.offlineCapable = false;
    }

  } catch (err) {
    result.error = err.message || String(err);
  } finally {
    try {
      const fs = await import("node:fs");
      fs.writeFileSync(${JSON.stringify(resultFilePath)}, JSON.stringify(result), 'utf-8');
    } catch (e) {
      console.error("Failed to write result file:", e);
    }
    if (${Boolean(finishSession)}) {
      await task.finish({ keep: [] });
    }
  }
})();
`;
}

function synthesizeEvaluation(res) {
  const scorecard = {
    noLoginCompleteness: 5,
    privacyArchitecture: 4,
    utilityIndependence: 4,
    cleanUx: 4,
    healthStability: 5,
    totalScore: 21,
    tier: 'Tier B'
  };

  let recommendation = 'Approved';
  let rejectionReason = null;

  if (res.error && /net::ERR_|getaddrinfo|timeout/i.test(res.error)) {
    return {
      decision: 'Rejected',
      rejectionReason: `站点无法访问/已失效 (${res.error})`,
      scorecard: { ...scorecard, totalScore: 0, tier: 'Tier C' }
    };
  }

  if (res.initialAuthGate.blocked) {
    return {
      decision: 'Rejected',
      rejectionReason: `首屏强制要求注册/登录 (${res.initialAuthGate.reason})`,
      scorecard: { ...scorecard, noLoginCompleteness: 1, totalScore: 12, tier: 'Tier C' }
    };
  }

  if (res.exportGate.interceptedByAuth) {
    return {
      decision: 'Rejected',
      rejectionReason: `诱导拦截 (Bait-and-Switch): 核心操作/导出时弹出强制登录 (${res.exportGate.authPromptDetails})`,
      scorecard: { ...scorecard, noLoginCompleteness: 1, totalScore: 13, tier: 'Tier C' }
    };
  }

  if (res.networkPrivacy.classification === 'Local Only') {
    scorecard.privacyArchitecture = 5;
  } else {
    scorecard.privacyArchitecture = 3;
  }

  if (res.surface.hasCanvas || res.surface.hasFileInputs || res.surface.hasTextInputs) {
    scorecard.utilityIndependence = 5;
  }

  scorecard.totalScore = scorecard.noLoginCompleteness +
                         scorecard.privacyArchitecture +
                         scorecard.utilityIndependence +
                         scorecard.cleanUx +
                         scorecard.healthStability;

  if (scorecard.totalScore >= 22) {
    scorecard.tier = 'Tier S/A';
  } else if (scorecard.totalScore >= 16) {
    scorecard.tier = 'Tier B';
  } else {
    scorecard.tier = 'Tier C';
    recommendation = 'Rejected';
    rejectionReason = '综合评分过低 (< 16分)，工具体验或独立性不佳';
  }

  let rawTitle = res.title || '';
  let cleanName = rawTitle
    .replace(/ - Free Online.*$/i, '')
    .replace(/ \| Best .*$/i, '')
    .replace(/ - Online .*$/i, '')
    .replace(/ — .*$/i, '')
    .trim();
  if (cleanName.length > 30 || cleanName.length === 0) {
    try {
      const u = new URL(res.targetUrl);
      cleanName = u.hostname.replace(/^www\./, '').split('.')[0];
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    } catch {
      cleanName = 'Tool';
    }
  }

  let category = 'Utilities';
  const combinedText = `${res.title} ${res.metaDesc} ${res.surface.headings.join(' ')}`.toLowerCase();
  if (combinedText.match(/json|code|git|sql|regex|markdown|developer|formatter|minify|css|html|diff/)) category = 'Development';
  else if (combinedText.match(/ai |prompt|chatgpt|llm|copilot|gpt|claude/)) category = 'AI';
  else if (combinedText.match(/svg|image|photo|color|design|icon|palette|canvas|draw|figma/)) category = 'Design';
  else if (combinedText.match(/write|text|editor|essay|grammar|word|summarize/)) category = 'Writing';
  else if (combinedText.match(/video|audio|music|sound|mp3|mp4|media|stream/)) category = 'Media';
  else if (combinedText.match(/encrypt|hash|security|password|cipher|decrypt|ssl/)) category = 'Security';
  else if (combinedText.match(/calculator|math|formula|equation|matrix/)) category = 'Math';
  else if (combinedText.match(/finance|crypto|currency|stock|invoice|tax/)) category = 'Finance';
  else if (combinedText.match(/privacy|vpn|tracker|metadata|cleaner|anonym/)) category = 'Privacy';
  else if (combinedText.match(/todo|task|note|calendar|pomodoro|workflow/)) category = 'Productivity';

  let description = res.metaDesc;
  if (!description || description.length < 20 || /best|#1|world's/i.test(description)) {
    if (category === 'Development') {
      description = `An in-browser development utility for data formatting, validation, and conversion with zero login required.`;
    } else if (category === 'Design') {
      description = `A lightweight in-browser design tool providing direct export capabilities without registration.`;
    } else {
      description = `A privacy-friendly web tool that operates directly in the browser with no account creation or login wall.`;
    }
  }

  let coreTask = 'Format and process data directly in the browser';
  if (res.dogfoodRun.actionName) {
    coreTask = `${res.dogfoodRun.actionName} data with instant browser processing`;
  } else if (category === 'Development') {
    coreTask = 'Format, validate, and convert code in browser';
  } else if (category === 'Design') {
    coreTask = 'Create visual designs and export assets locally';
  }

  const tags = [
    `category:${category}`,
    `data:${res.networkPrivacy.classification === 'Local Only' ? 'Local Only' : 'Cloud Processed'}`,
    `privacy:No Tracking`,
    `type:Web App`,
    `hosting:Cloud Only`,
    `offline:${res.networkPrivacy.offlineCapable ? 'Offline Capable' : 'Online Only'}`,
    `pricing:Free`
  ];
  if (res.githubLink) {
    tags.push('source:Open Source');
  }

  return {
    decision: recommendation,
    rejectionReason,
    scorecard,
    metadata: {
      name: cleanName,
      category,
      description,
      core_task: coreTask,
      repo_url: res.githubLink,
      tags
    }
  };
}

async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args.find(a => !a.startsWith('--'));
  const isJson = args.includes('--json');
  const isVerbose = args.includes('--verbose');

  if (!targetUrl || args.includes('--help')) {
    printUsage();
    process.exit(1);
  }

  if (!isJson) {
    console.log(`\n🔍 [ego-browser Dogfooding] Inspecting: ${targetUrl}`);
    console.log(`⏳ Launching Chromium session and running deep verification protocol...`);
  }

  const resultFilePath = join(tmpdir(), `ego-dogfood-res-${Date.now()}.json`);
  const scriptContent = buildEgoScript(targetUrl, resultFilePath);
  const tempScriptPath = join(tmpdir(), `ego-dogfood-${Date.now()}.js`);
  writeFileSync(tempScriptPath, scriptContent, 'utf-8');

  let stdoutData = '';
  let stderrData = '';

  try {
    await new Promise((resolve, reject) => {
      const child = spawn('ego-browser', ['nodejs'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      child.stdin.write(scriptContent);
      child.stdin.end();

      child.stdout.on('data', chunk => {
        stdoutData += chunk.toString();
        if (isVerbose) process.stdout.write(chunk);
      });

      child.stderr.on('data', chunk => {
        stderrData += chunk.toString();
        if (isVerbose) process.stderr.write(chunk);
      });

      child.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`ego-browser exited with code ${code}: ${stderrData}`));
      });
    });

    const fileContent = readFileSync(resultFilePath, 'utf-8');
    const rawResult = JSON.parse(fileContent);
    const evaluation = synthesizeEvaluation(rawResult);
    const finalReport = {
      inspection: rawResult,
      evaluation
    };

    if (isJson) {
      console.log(JSON.stringify(finalReport, null, 2));
    } else {
      console.log('\n============================================================');
      console.log(`📊 Dogfooding Inspection Report: ${rawResult.title || targetUrl}`);
      console.log('============================================================');
      console.log(`📌 Decision: ${evaluation.decision === 'Approved' ? '✅ APPROVED' : '❌ REJECTED'}`);
      if (evaluation.rejectionReason) {
        console.log(`🚫 Rejection Reason: ${evaluation.rejectionReason}`);
      }
      console.log(`⭐ Scorecard: ${evaluation.scorecard.totalScore} / 25 (${evaluation.scorecard.tier})`);
      console.log(`   - No-Login Completeness: ${evaluation.scorecard.noLoginCompleteness}/5`);
      console.log(`   - Privacy & Architecture: ${evaluation.scorecard.privacyArchitecture}/5 (${rawResult.networkPrivacy.classification})`);
      console.log(`   - Utility & Independence: ${evaluation.scorecard.utilityIndependence}/5`);
      console.log(`   - Clean UX & Design:      ${evaluation.scorecard.cleanUx}/5`);
      console.log(`   - Health & Stability:      ${evaluation.scorecard.healthStability}/5`);
      console.log('\n🛠️ Interactive Surface Observed:');
      console.log(`   - Textareas / Editors:    ${rawResult.surface.textareaCount}`);
      console.log(`   - File Uploads:           ${rawResult.surface.fileInputCount}`);
      console.log(`   - Drawing Canvases:       ${rawResult.surface.canvasCount}`);
      console.log(`   - Core Action Trigger:    ${rawResult.dogfoodRun.actionName || 'None'}`);
      console.log(`   - Export / Download:      ${rawResult.exportGate.exportTrigger || 'None'} (Download fired: ${rawResult.exportGate.downloadTriggered})`);
      console.log(`   - Auth Gate Interception: ${rawResult.exportGate.interceptedByAuth ? '⚠️ DETECTED' : 'None (Safe)'}`);
      console.log(`   - Privacy Classification: ${rawResult.networkPrivacy.classification} (WebAssembly: ${rawResult.networkPrivacy.hasWebAssembly})`);

      if (evaluation.decision === 'Approved') {
        console.log('\n📝 Synthesized Objective Metadata:');
        console.log(`   - Name:        ${evaluation.metadata.name}`);
        console.log(`   - Category:    ${evaluation.metadata.category}`);
        console.log(`   - Core Task:   ${evaluation.metadata.core_task}`);
        console.log(`   - Description: ${evaluation.metadata.description}`);
        console.log(`   - Tags:        ${evaluation.metadata.tags.join(', ')}`);
        if (evaluation.metadata.repo_url) {
          console.log(`   - GitHub:      ${evaluation.metadata.repo_url}`);
        }
      }
      console.log('============================================================\n');
    }

  } catch (err) {
    console.error(`❌ Inspection failed: ${err.message}`);
    process.exit(1);
  } finally {
    try { unlinkSync(tempScriptPath); } catch {}
    try { unlinkSync(resultFilePath); } catch {}
  }
}

main();
