// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillsDir = resolve(__dirname, '../../.agents/skills');
const agentsMdPath = resolve(__dirname, '../../AGENTS.md');

describe('Agent Skills Directory Integrity', () => {
  const skillFolders = readdirSync(skillsDir).filter((f) =>
    statSync(resolve(skillsDir, f)).isDirectory()
  );

  it('contains expected modular skills', () => {
    const expected = [
      'autonomous-patrol',
      'submission-review',
      'tool-evaluation',
      'health-patrol',
      'daily-seo-audit',
    ];
    for (const exp of expected) {
      assert.ok(
        skillFolders.includes(exp),
        `Expected skill folder "${exp}" to exist under .agents/skills/`
      );
    }
  });

  for (const folder of skillFolders) {
    describe(`Skill: ${folder}`, () => {
      const skillPath = resolve(skillsDir, folder, 'SKILL.md');

      it('has non-empty SKILL.md file', () => {
        assert.ok(existsSync(skillPath), `${folder}/SKILL.md must exist`);
        const content = readFileSync(skillPath, 'utf-8');
        assert.ok(content.length > 100, `${folder}/SKILL.md must not be empty`);
      });

      it('has valid YAML frontmatter with matching name and description', () => {
        const content = readFileSync(skillPath, 'utf-8');
        assert.ok(content.startsWith('---'), `${folder}/SKILL.md must start with --- frontmatter`);
        const secondDelim = content.indexOf('---', 3);
        assert.ok(secondDelim > 3, `${folder}/SKILL.md must have closing --- frontmatter delimiter`);

        const frontmatter = content.slice(3, secondDelim);
        const nameMatch = frontmatter.match(/name:\s*([a-z0-9_-]+)/);
        assert.ok(nameMatch, `${folder}/SKILL.md frontmatter must contain name`);
        assert.equal(nameMatch[1], folder, `Skill name in frontmatter must match folder name "${folder}"`);

        const hasDescription = frontmatter.includes('description:');
        assert.ok(hasDescription, `${folder}/SKILL.md frontmatter must have description`);
      });
    });
  }

  it('verifies AGENTS.md references all current skills correctly', () => {
    const agentsContent = readFileSync(agentsMdPath, 'utf-8');
    assert.ok(agentsContent.includes('.agents/skills/autonomous-patrol/'));
    assert.ok(agentsContent.includes('.agents/skills/submission-review/'));
    assert.ok(agentsContent.includes('.agents/skills/tool-evaluation/'));
    assert.ok(agentsContent.includes('.agents/skills/health-patrol/'));
    assert.ok(agentsContent.includes('.agents/skills/daily-seo-audit/'));
  });
});
