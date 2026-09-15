import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const orgRoot = join(__dirname, '../..');

describe('Standards Specification Validation (NLW-STD-001)', () => {
  const standardsPath = join(orgRoot, 'src/pages/standards.astro');

  it('standards.astro should exist', () => {
    assert.ok(existsSync(standardsPath), 'standards.astro does not exist');
  });

  const content = readFileSync(standardsPath, 'utf-8');

  it('should define NLW-STD-001 identifier and active status', () => {
    assert.match(content, /NLW-STD-001/);
    assert.match(content, /Active \/ Adopted/);
  });

  it('should have Schema.org TechArticle structured data', () => {
    assert.match(content, /@type':\s*'TechArticle'/);
    assert.match(content, /https:\/\/nologintools\.org\/standards#article/);
    assert.match(content, /https:\/\/nologintools\.org\/#organization/);
  });

  it('should cover all seven core sections', () => {
    assert.match(content, /1\.\s+Abstract &amp; Scope/);
    assert.match(content, /2\.\s+The Three Core Principles \(Normative\)/);
    assert.match(content, /3\.\s+The 3-Tier Trust &amp; Verification Hierarchy/);
    assert.match(content, /4\.\s+Badge Technical Specification/);
    assert.match(content, /5\.\s+Automated Verification Engine &amp; Crawler Protocol/);
    assert.match(content, /6\.\s+Anti-Gaming, Cloaking &amp; Revocation Protocol/);
    assert.match(content, /7\.\s+Public Audit Trail &amp; Archival Footprint/);
  });

  it('should define the 3-tier trust hierarchy', () => {
    assert.match(content, /Directory Listed/);
    assert.match(content, /Certified by NoLoginTools\.org/);
    assert.match(content, /Badge Verified Active/);
    assert.match(content, /ranking boost/i);
  });

  it('should document badge technical specifications', () => {
    assert.match(content, /flat/);
    assert.match(content, /flat-square/);
    assert.match(content, /plastic/);
    assert.match(content, /for-the-badge/);
    assert.match(content, /social/);
    assert.match(content, /aria-label="Verified by NoLoginTools\.org"/);
    assert.match(content, /&lt;title&gt;Verified by NoLoginTools\.org&lt;\/title&gt;/);
  });

  it('should document crawler User-Agents and anti-gaming rules', () => {
    assert.match(content, /NoLoginTools-BadgeChecker\/1\.0/);
    assert.match(content, /NoLoginTools-HealthChecker\/1\.0/);
    assert.match(content, /User-Agent Cloaking/);
    assert.match(content, /Bait-and-Switch Gating/);
  });

  it('should reference public audit repositories and archives', () => {
    assert.match(content, /awesome-nologin-tools/);
    assert.match(content, /Wayback Machine/);
  });
});

describe('Ecosystem Integration & Cross-linking', () => {
  it('Header.astro should link to /standards', () => {
    const header = readFileSync(join(orgRoot, 'src/components/Header.astro'), 'utf-8');
    assert.match(header, /href="\/standards"/);
  });

  it('Footer.astro should link to /standards', () => {
    const footer = readFileSync(join(orgRoot, 'src/components/Footer.astro'), 'utf-8');
    assert.match(footer, /href="\/standards"/);
  });

  it('index.astro should reference /standards in body and schema', () => {
    const index = readFileSync(join(orgRoot, 'src/pages/index.astro'), 'utf-8');
    assert.match(index, /href="\/standards"/);
    assert.match(index, /https:\/\/nologintools\.org\/standards/);
  });

  it('about.astro should link to /standards', () => {
    const about = readFileSync(join(orgRoot, 'src/pages/about.astro'), 'utf-8');
    assert.match(about, /href="\/standards"/);
  });

  it('sitemap.xml.ts should include /standards', () => {
    const sitemap = readFileSync(join(orgRoot, 'src/pages/sitemap.xml.ts'), 'utf-8');
    assert.match(sitemap, /url:\s*'\/standards'/);
  });

  it('public/llms.txt should list NLW-STD-001 standard URL', () => {
    const llms = readFileSync(join(orgRoot, 'public/llms.txt'), 'utf-8');
    assert.match(llms, /https:\/\/nologintools\.org\/standards/);
  });
});
