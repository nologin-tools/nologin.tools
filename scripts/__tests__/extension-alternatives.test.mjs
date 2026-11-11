import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const extDir = resolve(ROOT, 'packages/extension');

describe('NoLogin Quick Switcher Extension', () => {
  it('has valid Manifest V3 configuration', () => {
    const manifestPath = resolve(extDir, 'manifest.json');
    assert.ok(existsSync(manifestPath), 'manifest.json must exist');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

    assert.equal(manifest.manifest_version, 3);
    assert.ok(manifest.name.includes('NoLogin'));
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
    assert.ok(manifest.action?.default_popup);
    assert.ok(manifest.permissions.includes('activeTab'));
    assert.ok(manifest.icons['16']);
    assert.ok(manifest.icons['48']);
    assert.ok(manifest.icons['128']);
  });

  it('has valid icon image assets', () => {
    assert.ok(existsSync(resolve(extDir, 'icons/icon-16.png')), 'icon-16.png must exist');
    assert.ok(existsSync(resolve(extDir, 'icons/icon-48.png')), 'icon-48.png must exist');
    assert.ok(existsSync(resolve(extDir, 'icons/icon-128.png')), 'icon-128.png must exist');
  });

  it('contains comprehensive offline tools database', () => {
    const toolsPath = resolve(extDir, 'src/tools-data.json');
    assert.ok(existsSync(toolsPath), 'tools-data.json must exist');
    const tools = JSON.parse(readFileSync(toolsPath, 'utf8'));

    assert.ok(Array.isArray(tools));
    assert.ok(tools.length >= 150, 'Should index at least 150 verified tools');

    const sample = tools[0];
    assert.ok(sample.slug);
    assert.ok(sample.name);
    assert.ok(sample.url);
    assert.ok(sample.capabilities);
    assert.ok(typeof sample.capabilities.clientSideOnly === 'boolean');
  });

  it('contains domain alternative mapping for major closed SaaS targets', () => {
    const altsPath = resolve(extDir, 'src/alternatives-data.json');
    assert.ok(existsSync(altsPath), 'alternatives-data.json must exist');
    const alts = JSON.parse(readFileSync(altsPath, 'utf8'));

    const domains = Object.keys(alts);
    assert.ok(domains.includes('canva.com'), 'Must map canva.com');
    assert.ok(domains.includes('figma.com'), 'Must map figma.com');
    assert.ok(domains.includes('wetransfer.com'), 'Must map wetransfer.com');
    assert.ok(domains.includes('smallpdf.com'), 'Must map smallpdf.com');
    assert.ok(domains.includes('miro.com'), 'Must map miro.com');
    assert.ok(domains.includes('kapwing.com'), 'Must map kapwing.com');
    assert.ok(domains.includes('doodle.com'), 'Must map doodle.com');
    assert.ok(domains.includes('toggl.com'), 'Must map toggl.com');
    assert.ok(domains.includes('iloveimg.com'), 'Must map iloveimg.com');
    assert.ok(domains.includes('pastebin.com'), 'Must map pastebin.com');
    assert.ok(domains.includes('devtoys.app'), 'Must map devtoys.app');

    assert.equal(alts['kapwing.com'].alternativePageUrl, 'https://nologin.tools/alternative/kapwing');
    assert.equal(alts['doodle.com'].alternativePageUrl, 'https://nologin.tools/alternative/doodle');
    assert.equal(alts['toggl.com'].alternativePageUrl, 'https://nologin.tools/alternative/toggl');
    assert.equal(alts['iloveimg.com'].alternativePageUrl, 'https://nologin.tools/alternative/iloveimg');
    assert.equal(alts['pastebin.com'].alternativePageUrl, 'https://nologin.tools/alternative/pastebin');
    assert.equal(alts['devtoys.app'].alternativePageUrl, 'https://nologin.tools/alternative/devtoys');

    for (const [domain, entry] of Object.entries(alts)) {
      assert.ok(entry.targetName, `${domain} must have targetName`);
      assert.ok(entry.headline, `${domain} must have headline`);
      assert.ok(Array.isArray(entry.tools), `${domain} must have tools array`);
      assert.ok(entry.tools.length > 0, `${domain} must have at least one alternative tool`);
      for (const t of entry.tools) {
        assert.ok(t.name);
        assert.ok(t.url);
      }
    }
  });

  it('verifies popup files are complete and linked', () => {
    const htmlPath = resolve(extDir, 'popup/popup.html');
    const cssPath = resolve(extDir, 'popup/popup.css');
    const jsPath = resolve(extDir, 'popup/popup.js');

    assert.ok(existsSync(htmlPath), 'popup.html must exist');
    assert.ok(existsSync(cssPath), 'popup.css must exist');
    assert.ok(existsSync(jsPath), 'popup.js must exist');

    const html = readFileSync(htmlPath, 'utf8');
    assert.ok(html.includes('popup.css'));
    assert.ok(html.includes('popup.js'));
    assert.ok(html.includes('alternative-banner'));
    assert.ok(html.includes('search-input'));
  });
});
