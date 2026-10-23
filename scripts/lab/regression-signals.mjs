// @ts-check
/**
 * Regression signal classification for the rolling CADES scan.
 *
 * The rolling probe is heuristic. Only hard, policy-relevant signals are surfaced as
 * anomalies; free-text "core task drift" suggestions are intentionally NOT emitted
 * (they were the dominant source of noise and were never actionable).
 *
 * Severity:
 *   high   → must be escalated to a full tool-evaluation session within the day
 *   medium → escalate when daily escalation budget allows; otherwise carry forward
 */

const PAYWALL_COPY = /\b(free trial|start (?:your |a )?(?:\d+[- ]day )?(?:free )?trial|\d+[- ]day (?:free )?trial|upgrade to (?:pro|premium|plus)|subscribe to (?:continue|unlock|download)|buy credits|credits? (?:left|remaining)|out of credits|daily limit reached|go premium|unlock (?:pro|premium))\b/i;
const LOGIN_TO_CONTINUE = /\b((?:sign|log) ?in to (?:continue|use|download|export|save|start)|create (?:a |an )?(?:free )?account to (?:continue|use|download|export|save)|sign ?up to (?:continue|use|download|export|save))\b/i;

/**
 * @typedef {{ code: string, severity: 'high' | 'medium', evidence: string }} RegressionSignal
 */

/** @param {string | null | undefined} url */
function hostOf(url) {
  try {
    return url ? new URL(url).hostname.toLowerCase().replace(/^www\./, '') : null;
  } catch {
    return null;
  }
}

/** @param {string} s */
function tokens(s) {
  return new Set(
    s
      .toLowerCase()
      .split(/[^a-z0-9\u00c0-\uffff]+/)
      .filter((t) => t.length > 2)
  );
}

/**
 * True when two titles share no meaningful token (strong identity change signal).
 * @param {string} prev
 * @param {string} next
 */
export function titleIdentityChanged(prev, next) {
  if (!prev || !next) return false;
  const a = tokens(prev);
  const b = tokens(next);
  if (a.size === 0 || b.size === 0) return false;
  for (const t of a) if (b.has(t)) return false;
  return true;
}

/**
 * @param {{ inspection?: any, evaluation?: any } | null} report output of runInspection()
 * @param {{ url: string }} tool
 * @param {{ lastTitle?: string | null } | undefined} previous ledger entry
 * @returns {RegressionSignal[]}
 */
export function classifyRegressionSignals(report, tool, previous) {
  /** @type {RegressionSignal[]} */
  const signals = [];
  const ins = report?.inspection;
  if (!ins) {
    signals.push({ code: 'probe_failed', severity: 'medium', evidence: 'Rolling probe produced no inspection result' });
    return signals;
  }

  if (ins.error && /net::ERR_|getaddrinfo|timeout|ENOTFOUND|ECONNREFUSED/i.test(ins.error)) {
    signals.push({ code: 'unreachable', severity: 'high', evidence: String(ins.error).slice(0, 200) });
  }

  if (ins.initialAuthGate?.blocked) {
    signals.push({ code: 'auth_wall', severity: 'high', evidence: String(ins.initialAuthGate.reason || 'Initial auth gate') });
  }

  if (ins.exportGate?.interceptedByAuth) {
    signals.push({
      code: 'export_auth_bait',
      severity: 'high',
      evidence: String(ins.exportGate.authPromptDetails || 'Export intercepted by login/paywall'),
    });
  }

  if (ins.exportGate?.hasWatermark && (ins.exportGate?.downloadPath || ins.exportGate?.tailBrokeFormat)) {
    signals.push({
      code: 'export_watermark',
      severity: 'high',
      evidence: String(ins.exportGate.watermarkSignature || 'Watermark detected in exported artifact'),
    });
  }

  const visibleCopy = [
    ins.title || '',
    ...(ins.surface?.headings || []),
    ...(ins.surface?.buttonLabels || []),
  ].join(' \n ');

  const loginCopy = visibleCopy.match(LOGIN_TO_CONTINUE);
  if (loginCopy && !ins.initialAuthGate?.blocked) {
    signals.push({ code: 'login_to_continue_copy', severity: 'high', evidence: `Visible copy: "${loginCopy[0]}"` });
  }

  const paywallCopy = visibleCopy.match(PAYWALL_COPY);
  if (paywallCopy) {
    signals.push({ code: 'paywall_copy', severity: 'medium', evidence: `Visible copy: "${paywallCopy[0]}"` });
  }

  const fromHost = hostOf(tool.url);
  const toHost = hostOf(ins.finalUrl);
  if (fromHost && toHost && fromHost !== toHost) {
    signals.push({ code: 'cross_host_redirect', severity: 'medium', evidence: `${fromHost} → ${toHost}` });
  }

  const s = ins.surface || {};
  const interactive = s.hasTextInputs || s.hasFileInputs || s.hasCanvas || (s.buttonLabels || []).length > 0;
  if (!ins.error && !interactive) {
    signals.push({ code: 'surface_lost', severity: 'medium', evidence: 'No inputs, canvas, or buttons detected on the landing page' });
  }

  if (previous?.lastTitle && ins.title && titleIdentityChanged(previous.lastTitle, ins.title)) {
    signals.push({ code: 'title_changed', severity: 'medium', evidence: `"${previous.lastTitle}" → "${ins.title}"` });
  }

  return signals;
}
