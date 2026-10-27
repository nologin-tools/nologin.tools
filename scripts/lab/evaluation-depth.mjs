// @ts-check
/**
 * Evaluation depth gate.
 *
 * A finished dogfood session only counts toward the daily quota (and may only back an
 * approval, rejection, or regression clearance) when it shows the tool was actually run:
 *
 *   D1  at least one real input (fill / upload) was given to the tool
 *   D2  the core task was run after that input: a trigger (click / key press / export), or,
 *       for tools that update live with no run button, a read of the result after the last input
 *   D3  approve/clear: if export-like controls were visible, an export was attempted
 *   D4  approve: claimed functional depth must be backed by interactions
 *         depth >= 13 -> >= 3 interactions;  depth >= 18 -> >= 5 interactions
 *
 * "Interaction" = input, trigger, or export. Evaluating JS only to read the DOM is
 * observation, not interaction. Pure functions: usable from the harness, the queue CLI,
 * the ledger CLI, and tests.
 */

/** Controls whose label suggests the tool can hand its result back to the user. */
export const EXPORT_LIKE =
  /\b(download|export|save (?:as|image|pdf|file|png|svg|csv|result)|print|copy (?:to )?clipboard)\b|下载|导出/i;

const INPUT_RE = /^(Filled into|Uploaded fixture)/i;
const JS_INPUT_RE = /^Evaluated JS:\s*(inputs? updated|updated|set|typed|filled)/i;
const CLICK_RE = /^Clicked/i;
const KEY_RE = /^Pressed key/i;
const JS_CLICK_RE = /^Evaluated JS:\s*clicked/i;

/**
 * @typedef {{ type: string, summary?: string, performed?: boolean }} Step
 * @typedef {{
 *   inputs: number, triggers: number, exports: number, exportAttempts: number,
 *   interactions: number, triggerAfterInput: boolean, observationAfterInput: boolean,
 *   exportControlsSeen: boolean, exportControlLabels: string[],
 *   exportKnown: boolean
 * }} DepthMetrics
 */

/**
 * @param {Step[]} steps session steps (including the start step)
 * @param {{ buttonLabels?: string[], postActionControls?: string[] } | null | undefined} surface
 * @param {number} [exportAttempts] export commands that found no control
 * @returns {DepthMetrics}
 */
export function summarizeSteps(steps, surface, exportAttempts = 0) {
  let inputs = 0;
  let triggers = 0;
  let exports = 0;
  let firstInputAt = -1;
  let lastInputAt = -1;
  let triggerAfterInput = false;
  let observationAfterInput = false;

  let seq = 0;
  steps.forEach((s) => {
    if (s.performed !== true) return;
    const text = s.summary || '';
    if (s.type === 'export') {
      seq++;
      exports++;
      if (firstInputAt !== -1 && seq > firstInputAt) triggerAfterInput = true;
      return;
    }
    if (s.type !== 'act') return;
    const parts = text.includes(' ; ') ? text.split(/\s*;\s*/).filter(Boolean) : [text];
    for (const part of parts) {
      seq++;
      if (INPUT_RE.test(part) || JS_INPUT_RE.test(part)) {
        inputs++;
        if (firstInputAt === -1) firstInputAt = seq;
        lastInputAt = seq;
      } else if (CLICK_RE.test(part) || KEY_RE.test(part) || JS_CLICK_RE.test(part)) {
        triggers++;
        if (firstInputAt !== -1 && seq > firstInputAt) triggerAfterInput = true;
      } else if (/^Evaluated JS:/i.test(part) && lastInputAt !== -1 && seq > lastInputAt) {
        observationAfterInput = true; // read the DOM after the last input: live-updating tools
      }
    }
  });

  const labels = [...(surface?.buttonLabels || []), ...(surface?.postActionControls || [])];
  const exportControlLabels = [...new Set(labels.filter((l) => EXPORT_LIKE.test(l)))].slice(0, 6);
  return {
    inputs,
    triggers,
    exports,
    exportAttempts,
    interactions: inputs + triggers + exports,
    triggerAfterInput,
    observationAfterInput,
    exportControlsSeen: exportControlLabels.length > 0,
    exportControlLabels,
    // Recorders from before this gate existed carry no control list: D3 cannot be judged.
    exportKnown: Boolean(surface),
  };
}

/**
 * @param {DepthMetrics} m
 * @param {'approve' | 'reject' | 'clear'} decision
 * @param {{ depth?: number }} [opts]
 * @returns {{ ok: boolean, failures: string[] }}
 */
export function assessDepth(m, decision, opts = {}) {
  /** @type {string[]} */
  const failures = [];

  if (m.inputs < 1) {
    failures.push('D1: no input was ever given to the tool (fill or upload a real fixture and run the core task).');
  }
  if (m.inputs >= 1 && !m.triggerAfterInput && !m.observationAfterInput) {
    failures.push(
      'D2: the core task was never run after the input (click the run/process/generate/download control, run export, or read the live result after typing). ' +
        'A gate (login, credits, paywall) must be observed by actually hitting it, not read from page copy.'
    );
  }
  if ((decision === 'approve' || decision === 'clear') && m.exportKnown && m.exportControlsSeen && m.exports === 0 && m.exportAttempts === 0) {
    failures.push(
      `D3: export-like controls are visible (${m.exportControlLabels.join(', ')}) but no export was attempted. ` +
        'Run `dogfood-session.mjs export` and inspect the artifact (bait-and-switch walls and watermarks only show up there).'
    );
  }
  if (decision === 'approve' && typeof opts.depth === 'number') {
    const need = opts.depth >= 18 ? 5 : opts.depth >= 13 ? 3 : 0;
    if (m.interactions < need) {
      failures.push(
        `D4: functional depth ${opts.depth} claims more than the session showed (${m.interactions} interactions, need >= ${need}). ` +
          'Exercise more of the tool\'s features, or lower the depth score to what was actually observed.'
      );
    }
  }
  return { ok: failures.length === 0, failures };
}
