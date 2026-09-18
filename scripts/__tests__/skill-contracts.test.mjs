import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const names = [
  'autonomous-patrol',
  'submission-review',
  'tool-evaluation',
  'health-patrol',
  'daily-seo-audit',
];
const skills = Object.fromEntries(names.map(name => [
  name,
  readFileSync(resolve(ROOT, `.agents/skills/${name}/SKILL.md`), 'utf8'),
]));

describe('project skill contracts', () => {
  it('uses portable links, supported image inspection, and current browser commands', () => {
    for (const [name, content] of Object.entries(skills)) {
      assert.doesNotMatch(content, /file:\/\/\/Users\//, `${name} contains a machine-specific link`);
      assert.doesNotMatch(content, /\bview_file\b/, `${name} references an unavailable image tool`);
    }
    assert.match(skills['tool-evaluation'], /prefixed with `css=`/);
    assert.match(skills['tool-evaluation'], /\/tmp\/dogfood-<slug>-step1-initial\.png/);
    assert.doesNotMatch(skills['health-patrol'], /--rolling\s+20\s+--sync/);
  });

  it('keeps approval state separate from effective health state', () => {
    assert.doesNotMatch(skills['health-patrol'], /UPDATE\s+tools\s+SET\s+status\s*=\s*['"]unstable/i);
    assert.match(skills['health-patrol'], /health_checks/);
    assert.match(skills['health-patrol'], /effectiveStatus/);
  });

  it('documents current ranking weights and atomic evaluated approval', () => {
    assert.match(skills['health-patrol'], /explicit[^\n]*\+4/i);
    assert.match(skills['health-patrol'], /implicit[^\n]*\+2/i);
    assert.match(skills['submission-review'], /approve_evaluated/);
    assert.match(skills['submission-review'], /"_source"/);
  });

  it('includes SEO in the orchestrator and preserves bounded egress language', () => {
    assert.match(skills['autonomous-patrol'], /daily-seo-audit/);
    assert.match(skills['tool-evaluation'], /does not prove local-only/i);
    assert.match(skills['daily-seo-audit'], /every URL in it/);
  });
});
