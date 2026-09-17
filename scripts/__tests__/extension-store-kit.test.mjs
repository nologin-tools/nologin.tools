import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const storeDir = path.resolve(ROOT, 'packages/extension/store');
const downloadsDir = path.resolve(ROOT, 'public/downloads');

describe('Browser Extension Store Kit & Packaging', () => {
  it('validates Chrome Web Store listing metadata and character constraints', () => {
    const chromeDocPath = path.resolve(storeDir, 'CHROME_STORE.md');
    assert.ok(fs.existsSync(chromeDocPath), 'CHROME_STORE.md must exist');
    const content = fs.readFileSync(chromeDocPath, 'utf8');

    // Name constraint <= 45 chars
    const nameMatch = content.match(/\*\*Extension Name\*\*:\s*([^\n]+)/);
    assert.ok(nameMatch, 'Extension Name must be declared');
    const extName = nameMatch[1].trim();
    assert.ok(extName.length <= 45, `Extension name exceeds 45 chars: ${extName.length}`);

    // Short description constraint <= 132 chars
    const shortDescMatch = content.match(/\*\*Short Description\*\*:\s*\n\s*([^\n]+)/);
    assert.ok(shortDescMatch, 'Short Description must be declared');
    const shortDesc = shortDescMatch[1].trim();
    assert.ok(shortDesc.length <= 132, `Short description exceeds 132 chars: ${shortDesc.length}`);

    // Detailed description and permissions disclosure
    assert.ok(content.includes('activeTab'));
    assert.ok(content.includes('Zero Telemetry'));
    assert.ok(content.includes('https://nologin.tools/privacy'));
  });

  it('validates Mozilla Add-ons (AMO) listing metadata and constraints', () => {
    const amoDocPath = path.resolve(storeDir, 'FIREFOX_AMO.md');
    assert.ok(fs.existsSync(amoDocPath), 'FIREFOX_AMO.md must exist');
    const content = fs.readFileSync(amoDocPath, 'utf8');

    // Summary constraint <= 250 chars
    const summaryMatch = content.match(/\*\*Summary\*\*:\s*\n\s*([^\n]+)/);
    assert.ok(summaryMatch, 'AMO Summary must be declared');
    const summary = summaryMatch[1].trim();
    assert.ok(summary.length <= 250, `AMO summary exceeds 250 chars: ${summary.length}`);

    // Gecko ID disclosure
    assert.ok(content.includes('extension@nologin.tools'));
    assert.ok(content.includes('activeTab'));
    assert.ok(content.includes('https://nologin.tools/privacy'));
  });

  it('validates promotional artwork assets and required aspect dimensions', () => {
    const smallPromo = path.resolve(storeDir, 'promo-small-440x280.svg');
    const marquee = path.resolve(storeDir, 'marquee-1400x560.svg');
    const screenshot = path.resolve(storeDir, 'screenshot-1280x800.svg');

    assert.ok(fs.existsSync(smallPromo), 'Small promo tile must exist');
    assert.ok(fs.existsSync(marquee), 'Marquee banner must exist');
    assert.ok(fs.existsSync(screenshot), 'Screenshot preview must exist');

    const smallContent = fs.readFileSync(smallPromo, 'utf8');
    assert.ok(smallContent.includes('width="440"'));
    assert.ok(smallContent.includes('height="280"'));

    const marqueeContent = fs.readFileSync(marquee, 'utf8');
    assert.ok(marqueeContent.includes('width="1400"'));
    assert.ok(marqueeContent.includes('height="560"'));

    const screenshotContent = fs.readFileSync(screenshot, 'utf8');
    assert.ok(screenshotContent.includes('width="1280"'));
    assert.ok(screenshotContent.includes('height="800"'));
  });

  it('verifies downloadable zip archives for Chrome, Firefox, and default bundles', () => {
    const chromeZip = path.resolve(downloadsDir, 'nologin-quick-switcher-chrome.zip');
    const firefoxZip = path.resolve(downloadsDir, 'nologin-quick-switcher-firefox.zip');
    const defaultZip = path.resolve(downloadsDir, 'nologin-extension.zip');

    assert.ok(fs.existsSync(chromeZip), 'Chrome zip download must exist');
    assert.ok(fs.existsSync(firefoxZip), 'Firefox zip download must exist');
    assert.ok(fs.existsSync(defaultZip), 'Default zip download must exist');

    assert.ok(fs.statSync(chromeZip).size > 10000, 'Chrome zip should have valid size');
    assert.ok(fs.statSync(firefoxZip).size > 10000, 'Firefox zip should have valid size');
    assert.ok(fs.statSync(defaultZip).size > 10000, 'Default zip should have valid size');
  });
});
