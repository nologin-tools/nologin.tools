// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeSteps, assessDepth, EXPORT_LIKE } from '../lab/evaluation-depth.mjs';

const start = { type: 'start' };
/** @param {string} summary */
const act = (summary) => ({ type: 'act', performed: true, summary });
const exp = { type: 'export', performed: true, summary: 'Triggered export: Download' };

describe('summarizeSteps', () => {
  it('classifies inputs, triggers and exports, and ignores read-only DOM evals', () => {
    const m = summarizeSteps(
      [start, act('Uploaded fixture: /x/sample.png'), act('Evaluated JS: [{"tag":"DIV"}]'), act('Clicked text: Convert'), exp],
      { buttonLabels: ['Convert'] }
    );
    assert.equal(m.inputs, 1);
    assert.equal(m.triggers, 1);
    assert.equal(m.exports, 1);
    assert.equal(m.interactions, 3);
    assert.equal(m.triggerAfterInput, true);
  });

  it('accepts a live-updating tool: reading the result after the last input counts as running it', () => {
    const m = summarizeSteps([start, act('Filled into INPUT'), act('Evaluated JS: ["Revenue 39.99","Profit 32.04"]')], {});
    assert.equal(m.observationAfterInput, true);
    assert.equal(assessDepth(m, 'approve', { depth: 11 }).ok, true);
  });

  it('does not count a DOM read that happened before the input', () => {
    const m = summarizeSteps([start, act('Evaluated JS: [{"tag":"INPUT"}]'), act('Uploaded fixture: a.wav')], {});
    assert.equal(m.observationAfterInput, false);
    assert.equal(assessDepth(m, 'reject').ok, false);
  });

  it('does not count a trigger that happened before any input', () => {
    const m = summarizeSteps([start, act('Clicked text: Menu'), act('Uploaded fixture: /x/a.wav')], {});
    assert.equal(m.triggerAfterInput, false);
  });

  it('treats JS-driven input and click like real ones', () => {
    const m = summarizeSteps([start, act('Evaluated JS: inputs updated'), act('Evaluated JS: clicked Analyze')], {});
    assert.equal(m.inputs, 1);
    assert.equal(m.triggerAfterInput, true);
  });

  it('detects export-like controls from start and post-action labels', () => {
    const m = summarizeSteps([start], { buttonLabels: ['Menu'], postActionControls: ['Download PNG', 'Reset'] });
    assert.equal(m.exportControlsSeen, true);
    assert.deepEqual(m.exportControlLabels, ['Download PNG']);
  });

  it('ignores failed actions', () => {
    const m = summarizeSteps([start, { type: 'act', performed: false, summary: 'Uploaded fixture: x' }], {});
    assert.equal(m.inputs, 0);
  });
});

describe('EXPORT_LIKE', () => {
  it('matches real export labels but not generic nav', () => {
    for (const l of ['Download PDF', 'Export', 'Save as PNG', 'Print', 'Copy to clipboard', '下载']) assert.ok(EXPORT_LIKE.test(l), l);
    for (const l of ['Menu', 'Pricing', 'Sign in', 'Copy link', 'Save']) assert.ok(!EXPORT_LIKE.test(l), l);
  });
});

describe('assessDepth', () => {
  const good = summarizeSteps([start, act('Uploaded fixture: a'), act('Clicked text: Run'), act('Filled into TEXTAREA'), act('Clicked text: Again'), exp], { buttonLabels: ['Download'] });

  it('passes a thorough approval', () => {
    assert.deepEqual(assessDepth(good, 'approve', { depth: 18 }), { ok: true, failures: [] });
  });

  it('D1: rejects an evaluation with no input', () => {
    const r = assessDepth(summarizeSteps([start], {}), 'reject');
    assert.equal(r.ok, false);
    assert.match(r.failures[0], /^D1/);
  });

  it('D2: rejects a "gated" verdict reached after only uploading (the onlinevocalremover case)', () => {
    const m = summarizeSteps([start, act('Uploaded fixture: sample.wav')], {});
    const r = assessDepth(m, 'reject');
    assert.equal(r.ok, false);
    assert.match(r.failures.join(' '), /D2/);
  });

  it('D3: approval needs an export attempt when export controls are visible', () => {
    const m = summarizeSteps([start, act('Uploaded fixture: a'), act('Clicked text: Run')], { postActionControls: ['Download result'] });
    const r = assessDepth(m, 'approve');
    assert.equal(r.ok, false);
    assert.match(r.failures.join(' '), /D3/);
  });

  it('D3: a failed export attempt still counts as having looked', () => {
    const m = summarizeSteps([start, act('Uploaded fixture: a'), act('Clicked text: Run')], { postActionControls: ['Download result'] }, 1);
    assert.equal(assessDepth(m, 'approve').ok, true);
  });

  it('D3 does not apply to rejections, and is skipped for legacy sessions without control data', () => {
    const m = summarizeSteps([start, act('Uploaded fixture: a'), act('Clicked text: Run')], { postActionControls: ['Download result'] });
    assert.equal(assessDepth(m, 'reject').ok, true);
    const legacy = summarizeSteps([start, act('Uploaded fixture: a'), act('Clicked text: Run')], undefined);
    assert.equal(assessDepth(legacy, 'approve').ok, true);
  });

  it('D4: high depth scores need matching interactions', () => {
    const m = summarizeSteps([start, act('Uploaded fixture: a'), exp], {});
    assert.equal(assessDepth(m, 'approve', { depth: 12 }).ok, true);
    assert.match(assessDepth(m, 'approve', { depth: 19 }).failures.join(' '), /D4/);
    assert.match(assessDepth(m, 'approve', { depth: 14 }).failures.join(' '), /D4/);
  });
});
