// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSitemapUrls, urlToDistPath, validateHtmlSeo } from '../daily-seo-audit.mjs';
import { buildIndexNowPayload, extractUrlsFromSitemap, DEFAULT_INDEXNOW_KEY } from '../push-indexnow.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

describe('Daily SEO Audit & IndexNow Scheduled Pipeline', () => {
  it('IndexNow key file exists and matches key', () => {
    const keyFilePath = resolve(ROOT, `public/${DEFAULT_INDEXNOW_KEY}.txt`);
    assert.ok(existsSync(keyFilePath), `IndexNow key file ${keyFilePath} must exist`);
    const content = readFileSync(keyFilePath, 'utf-8').trim();
    assert.equal(content, DEFAULT_INDEXNOW_KEY, 'Key file content must match DEFAULT_INDEXNOW_KEY');
  });

  it('buildIndexNowPayload generates standard IndexNow JSON format', () => {
    const urls = ['https://nologin.tools/', 'https://nologin.tools/about/'];
    const payload = buildIndexNowPayload(urls);
    assert.equal(payload.host, 'nologin.tools');
    assert.equal(payload.key, DEFAULT_INDEXNOW_KEY);
    assert.equal(payload.keyLocation, `https://nologin.tools/${DEFAULT_INDEXNOW_KEY}.txt`);
    assert.deepEqual(payload.urlList, urls);
  });

  it('extractUrlsFromSitemap parses sitemap XML correctly', () => {
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>https://nologin.tools/</loc></url>
        <url><loc>https://nologin.tools/zh</loc></url>
        <url><loc>https://nologin.tools/about</loc></url>
      </urlset>`;
    const urls = extractUrlsFromSitemap(sampleXml);
    assert.equal(urls.length, 3);
    assert.equal(urls[0], 'https://nologin.tools/');
    assert.equal(urls[1], 'https://nologin.tools/zh');
    assert.equal(urls[2], 'https://nologin.tools/about');
  });

  it('parseSitemapUrls extracts URLs identically', () => {
    const sampleXml = `<urlset><url><loc>https://nologin.tools/tool/photopea-com</loc></url></urlset>`;
    const urls = parseSitemapUrls(sampleXml);
    assert.deepEqual(urls, ['https://nologin.tools/tool/photopea-com']);
  });

  it('urlToDistPath resolves root and subpaths to index.html', () => {
    assert.ok(urlToDistPath('https://nologin.tools/').endsWith('dist/index.html'));
    assert.ok(urlToDistPath('https://nologin.tools/about').endsWith('dist/about/index.html'));
    assert.ok(urlToDistPath('https://nologin.tools/zh/about/').endsWith('dist/zh/about/index.html'));
  });

  it('validateHtmlSeo detects valid SEO html and flags invalid ones', () => {
    const validHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Photopea | nologin.tools</title>
          <meta name="description" content="Online photo editor" />
          <link rel="canonical" href="https://nologin.tools/tool/photopea-com" />
          <meta name="robots" content="index, follow" />
          <script type="application/ld+json">{"@context":"https://schema.org","@type":"SoftwareApplication","name":"Photopea"}</script>
        </head>
        <body><h1>Photopea</h1></body>
      </html>
    `;

    const validResult = validateHtmlSeo(validHtml, 'https://nologin.tools/tool/photopea-com');
    assert.equal(validResult.errors.length, 0);
    assert.deepEqual(validResult.schemas, ['SoftwareApplication']);

    const brokenHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <!-- Missing title, description, canonical -->
          <meta name="robots" content="noindex, follow" />
          <script type="application/ld+json">{ broken json </script>
        </head>
      </html>
    `;

    const brokenResult = validateHtmlSeo(brokenHtml, 'https://nologin.tools/tool/broken');
    assert.ok(brokenResult.errors.length >= 3, 'Must flag missing title, canonical, and broken json-ld');
  });

  it('daily-seo-audit.yml workflow file exists and has correct daily cron schedule', () => {
    const workflowPath = resolve(ROOT, '.github/workflows/daily-seo-audit.yml');
    assert.ok(existsSync(workflowPath), 'Workflow file must exist');
    const content = readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes("- cron: '0 3 * * *'"), 'Must declare daily cron at 03:00 UTC');
    assert.ok(content.includes('node scripts/daily-seo-audit.mjs'), 'Must execute daily-seo-audit.mjs');
    assert.ok(content.includes('node scripts/push-indexnow.mjs'), 'Must execute push-indexnow.mjs');
    assert.ok(content.includes('seo-alert'), 'Must use seo-alert label for failure notifications');
  });
});
