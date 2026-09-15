import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

describe('Extension Landing Page & Distribution Asset', () => {
  it('has static entry pages for English and multi-locale routes', () => {
    const enPage = resolve(ROOT, 'src/pages/extension.astro');
    const langPage = resolve(ROOT, 'src/pages/[lang]/extension.astro');

    assert.ok(existsSync(enPage), 'src/pages/extension.astro must exist');
    assert.ok(existsSync(langPage), 'src/pages/[lang]/extension.astro must exist');

    const enContent = readFileSync(enPage, 'utf8');
    assert.ok(enContent.includes('ExtensionPage'));

    const langContent = readFileSync(langPage, 'utf8');
    assert.ok(langContent.includes('getStaticPaths'));
    assert.ok(langContent.includes('ExtensionPage'));
  });

  it('has valid downloadable zip package in public/downloads/', () => {
    const zipPath = resolve(ROOT, 'public/downloads/nologin-quick-switcher-chrome.zip');
    assert.ok(existsSync(zipPath), 'public/downloads/nologin-quick-switcher-chrome.zip must exist');

    const stats = statSync(zipPath);
    assert.ok(stats.size > 10000, `Zip file size should be substantial (actual: ${stats.size} bytes)`);
  });

  it('includes extension navigation in Header and Footer components', () => {
    const headerPath = resolve(ROOT, 'src/components/Header.astro');
    const footerPath = resolve(ROOT, 'src/components/Footer.astro');

    const header = readFileSync(headerPath, 'utf8');
    const footer = readFileSync(footerPath, 'utf8');

    assert.ok(header.includes("path: '/extension'"), 'Header navItems must include /extension');
    assert.ok(footer.includes("'/extension'"), 'Footer nav must include /extension');
  });

  it('contains complete i18n keys for extension landing page', () => {
    const en = JSON.parse(readFileSync(resolve(ROOT, 'src/i18n/en.json'), 'utf8'));
    const zh = JSON.parse(readFileSync(resolve(ROOT, 'src/i18n/zh.json'), 'utf8'));

    assert.ok(en['nav.extension']);
    assert.ok(en['extension.title']);
    assert.ok(en['extension.description']);
    assert.ok(en['extension.hero.heading']);
    assert.ok(en['extension.btn.download']);

    assert.ok(zh['nav.extension']);
    assert.ok(zh['extension.title']);
    assert.ok(zh['extension.description']);
    assert.ok(zh['extension.hero.heading']);
    assert.ok(zh['extension.btn.download']);
  });
});
