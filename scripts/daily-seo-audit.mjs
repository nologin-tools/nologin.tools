#!/usr/bin/env node
// @ts-check
/**
 * Daily Technical SEO & Broken Link Audit.
 *
 * Audits all indexable pages in sitemap.xml for:
 * 1. Existence and HTTP 200 (or file existence in dist/)
 * 2. Canonical tag accuracy
 * 3. Robots meta tag policy (indexable vs noindex)
 * 4. Schema.org JSON-LD validity & required types
 * 5. Internal link health (zero broken internal links)
 *
 * Usage:
 *   node scripts/daily-seo-audit.mjs [--local] [--remote] [--limit <n>]
 */

import { readFileSync, existsSync, statSync, appendFileSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

/**
 * Extracts all URLs from a sitemap XML string.
 * @param {string} xml
 * @returns {string[]}
 */
export function parseSitemapUrls(xml) {
  const urls = [];
  const regex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

/**
 * Converts a full URL to local file path in dist/
 * @param {string} url
 * @returns {string}
 */
export function urlToDistPath(url) {
  const parsed = new URL(url);
  let pathname = parsed.pathname;
  if (pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  if (!pathname) {
    return resolve(DIST, 'index.html');
  }
  return resolve(DIST, pathname.slice(1), 'index.html');
}

export function normalizeAuditUrl(url) {
  const parsed = new URL(url);
  parsed.hash = '';
  parsed.search = '';
  parsed.pathname = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/+$/, '');
  return parsed.toString();
}

export function extractInternalPageLinks(html, baseUrl) {
  const origin = new URL(baseUrl).origin;
  const links = new Set();
  // Links inside scripts/styles are source code, not crawlable document links.
  // In particular, client-side template literals may contain an href whose
  // runtime value cannot be resolved by this static audit.
  const documentHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const hrefRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = hrefRegex.exec(documentHtml)) !== null) {
    const href = match[1].trim();
    if (!href || href.startsWith('#') || /^(?:mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.origin !== origin) continue;
      if (/^\/(?:api|admin|ssr|cdn-cgi)(?:\/|$)/.test(resolved.pathname)) continue;
      if (/\.(?:avif|css|gif|ico|jpe?g|js|json|map|png|svg|txt|webmanifest|webp|woff2?|xml)$/i.test(resolved.pathname)) continue;
      links.add(normalizeAuditUrl(resolved.toString()));
    } catch {}
  }
  return Array.from(links);
}

/**
 * Parses exact Cloudflare Pages redirect rules. Dynamic splat/placeholder
 * rules are intentionally excluded because they cannot be resolved safely
 * without Cloudflare's full matching semantics.
 * @param {string} contents
 * @returns {Map<string, string>}
 */
export function parseStaticRedirects(contents) {
  const redirects = new Map();
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const [source, destination, status = '302'] = line.split(/\s+/);
    if (!source?.startsWith('/') || !destination || !/^[23]\d\d$/.test(status)) continue;
    if (/[*:]/.test(source)) continue;
    try {
      redirects.set(new URL(source, 'https://nologin.tools').pathname, destination);
    } catch {}
  }
  return redirects;
}

function isFile(filePath) {
  try {
    return existsSync(filePath) && statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function localFileCandidates(url) {
  const parsed = new URL(url);
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(parsed.pathname);
  } catch {
    return [];
  }
  const directPath = resolve(DIST, decodedPath.replace(/^\/+/, ''));
  const distPrefix = `${DIST}${sep}`;
  if (directPath !== DIST && !directPath.startsWith(distPrefix)) return [];
  return [directPath, urlToDistPath(url)];
}

/**
 * Resolves a local URL as either a generated page, a public asset, or an exact
 * Cloudflare Pages redirect whose local destination also exists.
 * @param {string} url
 * @param {Map<string, string>} redirects
 * @param {Set<string>} [visited]
 * @returns {boolean}
 */
export function isResolvableLocalLink(url, redirects, visited = new Set()) {
  const normalized = normalizeAuditUrl(url);
  if (visited.has(normalized)) return false;
  visited.add(normalized);

  if (localFileCandidates(normalized).some(isFile)) return true;

  const parsed = new URL(normalized);
  const redirectTarget = redirects.get(parsed.pathname)
    ?? redirects.get(parsed.pathname === '/' ? '/' : `${parsed.pathname}/`);
  if (!redirectTarget) return false;

  let destination;
  try {
    destination = new URL(redirectTarget, parsed.origin);
  } catch {
    return false;
  }
  if (destination.origin !== parsed.origin) return true;
  return isResolvableLocalLink(destination.toString(), redirects, visited);
}

function collectSchemaNodes(value, nodes = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectSchemaNodes(item, nodes);
    return nodes;
  }
  if (!value || typeof value !== 'object') return nodes;
  if (value['@type']) nodes.push(value);
  if (Array.isArray(value['@graph'])) collectSchemaNodes(value['@graph'], nodes);
  return nodes;
}

function expectedSchemaTypes(url) {
  const path = new URL(url).pathname
    .replace(/^\/(?:zh|ja|ko|es|fr|de|pt)(?=\/|$)/, '') || '/';
  if (path === '/') return ['WebSite'];
  if (/^\/tool\/[^/]+\/?$/.test(path)) return ['SoftwareApplication'];
  if (/^\/blog\/[^/]+\/?$/.test(path)) return ['BlogPosting'];
  if (/^\/blog\/?$/.test(path)) return ['Blog'];
  if (/^\/category\/[^/]+\/?$/.test(path)) return ['CollectionPage'];
  if (/^\/about\/?$/.test(path)) return ['Organization'];
  if (/^\/submit\/?$/.test(path)) return ['BreadcrumbList'];
  if (/^\/badge\/?$/.test(path)) return ['FAQPage', 'HowTo'];
  if (/^\/badge\/[^/]+\/?$/.test(path)) return ['BreadcrumbList'];
  return [];
}

const REQUIRED_SCHEMA_FIELDS = {
  WebSite: ['name', 'url'],
  SoftwareApplication: ['name', 'applicationCategory'],
  Blog: ['name'],
  BlogPosting: ['headline', 'datePublished'],
  CollectionPage: ['name', 'mainEntity'],
  Organization: ['name', 'url'],
  BreadcrumbList: ['itemListElement'],
  FAQPage: ['mainEntity'],
  HowTo: ['name', 'step'],
};

/**
 * Validates a single HTML string for Technical SEO requirements
 * @param {string} html
 * @param {string} url
 * @returns {{ errors: string[], warnings: string[], schemas: string[] }}
 */
export function validateHtmlSeo(html, url) {
  const errors = [];
  const warnings = [];
  const schemas = [];

  // 1. Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    errors.push(`[${url}] Missing or empty <title> tag`);
  }

  // 2. Meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
                    html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  if (!descMatch || !descMatch[1].trim()) {
    errors.push(`[${url}] Missing or empty meta description`);
  }

  // 3. Canonical
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) ||
                         html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
  if (!canonicalMatch) {
    errors.push(`[${url}] Missing <link rel="canonical"> tag`);
  } else {
    try {
      const canonical = normalizeAuditUrl(new URL(canonicalMatch[1], url).toString());
      const expected = normalizeAuditUrl(url);
      if (canonical !== expected) {
        errors.push(`[${url}] Canonical mismatch: expected ${expected}, found ${canonical}`);
      }
    } catch {
      errors.push(`[${url}] Invalid canonical URL: ${canonicalMatch[1]}`);
    }
  }

  // 4. Robots meta
  const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  if (robotsMatch) {
    const robotsContent = robotsMatch[1].toLowerCase();
    if (robotsContent.includes('noindex')) {
      errors.push(`[${url}] Unexpected 'noindex' on indexable path: ${robotsContent}`);
    }
  }

  // 5. JSON-LD Schemas
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let jsonMatch;
  while ((jsonMatch = jsonLdRegex.exec(html)) !== null) {
    const rawJson = jsonMatch[1].trim();
    try {
      const parsedJson = JSON.parse(rawJson);
      const nodes = collectSchemaNodes(parsedJson);
      if (nodes.length === 0) schemas.push('Unknown');
      for (const node of nodes) {
        const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
        for (const schemaType of types) {
          schemas.push(schemaType);
          const requiredFields = REQUIRED_SCHEMA_FIELDS[schemaType] || [];
          for (const field of requiredFields) {
            if (node[field] === undefined || node[field] === null || node[field] === '') {
              errors.push(`[${url}] ${schemaType} JSON-LD missing required field: ${field}`);
            }
          }
          if (schemaType === 'Review' && (!node.positiveNotes || !node.negativeNotes)) {
            warnings.push(`[${url}] Schema Review missing positiveNotes or negativeNotes`);
          }
        }
      }
    } catch (err) {
      errors.push(`[${url}] Invalid JSON-LD schema syntax: ${err.message}`);
    }
  }

  const expectedTypes = expectedSchemaTypes(url);
  for (const expectedType of expectedTypes) {
    if (!schemas.includes(expectedType)) {
      errors.push(`[${url}] Missing expected ${expectedType} JSON-LD schema`);
    }
  }

  return { errors, warnings, schemas };
}

/**
 * Runs the local audit on dist/ directory
 */
export async function runLocalAudit(limit) {
  const sitemapFile = resolve(DIST, 'sitemap.xml');
  if (!existsSync(sitemapFile)) {
    throw new Error('dist/sitemap.xml not found. Please run `pnpm build` before running local audit.');
  }

  const sitemapXml = readFileSync(sitemapFile, 'utf-8');
  const urls = parseSitemapUrls(sitemapXml);
  const targetUrls = limit ? urls.slice(0, limit) : urls;
  const redirectsFile = resolve(DIST, '_redirects');
  const redirects = existsSync(redirectsFile)
    ? parseStaticRedirects(readFileSync(redirectsFile, 'utf-8'))
    : new Map();

  console.log(`[daily-seo-audit] Auditing ${targetUrls.length} indexable pages from dist/...`);

  let allErrors = [];
  let allWarnings = [];
  let auditedCount = 0;
  const internalLinks = new Set();

  for (const url of targetUrls) {
    const filePath = urlToDistPath(url);
    if (!existsSync(filePath)) {
      allErrors.push(`[${url}] Missing generated file: ${filePath}`);
      continue;
    }

    const html = readFileSync(filePath, 'utf-8');
    const { errors, warnings } = validateHtmlSeo(html, url);
    for (const link of extractInternalPageLinks(html, url)) internalLinks.add(link);
    if (errors.length > 0) allErrors.push(...errors);
    if (warnings.length > 0) allWarnings.push(...warnings);
    auditedCount++;
  }

  for (const link of internalLinks) {
    if (!isResolvableLocalLink(link, redirects)) {
      allErrors.push(`[${link}] Broken internal link: no generated page, public asset, or valid static redirect found`);
    }
  }

  return {
    success: allErrors.length === 0,
    totalAudited: auditedCount,
    errors: allErrors,
    warnings: allWarnings,
    internalLinksChecked: internalLinks.size,
  };
}

/**
 * Runs remote audit against live production site
 * @param {number} [limit]
 * @param {string[]} [customUrls]
 * @param {{ concurrency?: number, timeout?: number, auditDiscovery?: boolean }} [options]
 * @returns {Promise<{ success: boolean, totalAudited: number, errors: string[], warnings: string[], responseTimes: number[], avgResponseTimeMs: number, internalLinksChecked: number, cacheHeaderCoverage: number }>}
 */
export async function runRemoteAudit(limit, customUrls, options = {}) {
  const concurrency = options.concurrency || 5;
  const timeoutMs = options.timeout || 10000;

  let urls = customUrls;
  if (!urls || urls.length === 0) {
    const res = await fetch('https://nologin.tools/sitemap.xml', {
      headers: { 'User-Agent': 'NoLoginTools-SEOAudit/1.0' },
    });
    if (!res.ok) throw new Error(`Failed to fetch remote sitemap: HTTP ${res.status}`);
    urls = parseSitemapUrls(await res.text());
  }

  const targetUrls = limit ? urls.slice(0, limit) : urls;
  console.log(`[daily-seo-audit] Auditing ${targetUrls.length} live pages from production...`);

  const allErrors = [];
  const allWarnings = [];
  const responseTimes = [];
  let auditedCount = 0;
  let pagesWithCacheHeader = 0;
  const internalLinks = new Set();

  // Process in batches
  for (let i = 0; i < targetUrls.length; i += concurrency) {
    const batch = targetUrls.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (url) => {
        const start = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const res = await fetch(url, {
            headers: { 'User-Agent': 'NoLoginTools-SEOAudit/1.0' },
            redirect: 'follow',
            signal: controller.signal,
          });
          const duration = Date.now() - start;
          responseTimes.push(duration);

          if (!res.ok) {
            allErrors.push(`[${url}] HTTP status ${res.status}`);
            return;
          }

          const html = await res.text();
          const { errors, warnings } = validateHtmlSeo(html, url);
          for (const link of extractInternalPageLinks(html, url)) internalLinks.add(link);
          if (res.headers.get('cache-control')) {
            pagesWithCacheHeader++;
          } else {
            allWarnings.push(`[${url}] Missing Cache-Control response header`);
          }
          if (errors.length > 0) allErrors.push(...errors);
          if (warnings.length > 0) allWarnings.push(...warnings);
          auditedCount++;
        } catch (err) {
          allErrors.push(`[${url}] Network/fetch error: ${err.message}`);
        } finally {
          clearTimeout(timer);
        }
      })
    );
  }

  const auditedUrls = new Set(targetUrls.map(normalizeAuditUrl));
  const linksToProbe = Array.from(internalLinks).filter(link => !auditedUrls.has(link));
  for (let i = 0; i < linksToProbe.length; i += concurrency) {
    const batch = linksToProbe.slice(i, i + concurrency);
    await Promise.all(batch.map(async (link) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(link, {
          headers: { 'User-Agent': 'NoLoginTools-SEOAudit/1.0' },
          redirect: 'follow',
          signal: controller.signal,
        });
        if (!response.ok) allErrors.push(`[${link}] Broken internal link: HTTP ${response.status}`);
      } catch (err) {
        allErrors.push(`[${link}] Broken internal link: ${err.message}`);
      } finally {
        clearTimeout(timer);
      }
    }));
  }

  if (options.auditDiscovery !== false) {
    const discovery = await runDiscoveryAudit({ timeout: timeoutMs });
    allErrors.push(...discovery.errors);
    allWarnings.push(...discovery.warnings);
  }

  const avgResponseTimeMs =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

  return {
    success: allErrors.length === 0,
    totalAudited: auditedCount,
    errors: allErrors,
    warnings: allWarnings,
    responseTimes,
    avgResponseTimeMs,
    internalLinksChecked: internalLinks.size,
    cacheHeaderCoverage: auditedCount > 0 ? Math.round((pagesWithCacheHeader / auditedCount) * 100) : 0,
  };
}

export async function runDiscoveryAudit(options = {}) {
  const timeoutMs = options.timeout || 10000;
  const fetchImpl = options.fetchImpl || fetch;
  const errors = [];
  const warnings = [];
  const targets = [
    ['https://nologin.tools/robots.txt', 'robots'],
    ['https://nologin.tools/llms.txt', 'llms'],
    ['https://nologin.tools/llms-full.txt', 'llms-full'],
  ];

  for (const [url, kind] of targets) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        headers: { 'User-Agent': 'NoLoginTools-SEOAudit/1.0' },
        signal: controller.signal,
      });
      if (!response.ok) {
        errors.push(`[${url}] Discovery resource returned HTTP ${response.status}`);
        continue;
      }
      const body = await response.text();
      if (kind === 'robots') {
        for (const directive of [
          'Sitemap: https://nologin.tools/sitemap.xml',
          'llms-txt: https://nologin.tools/llms.txt',
          'GPTBot',
          'ClaudeBot',
          'PerplexityBot',
        ]) {
          if (!body.includes(directive)) errors.push(`[${url}] Missing crawler directive: ${directive}`);
        }
      } else if (!/^#\s+\S+/m.test(body)) {
        errors.push(`[${url}] LLM discovery document is missing a Markdown title`);
      }
    } catch (err) {
      errors.push(`[${url}] Discovery resource fetch failed: ${err.message}`);
    } finally {
      clearTimeout(timer);
    }
  }

  return { success: errors.length === 0, errors, warnings };
}

/**
 * Main execution
 */
async function main() {
  const isRemote = process.argv.includes('--remote');
  const isBoth = process.argv.includes('--both');
  const limitIndex = process.argv.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(process.argv[limitIndex + 1], 10) : undefined;

  console.log('================================================================');
  console.log('       nologin.tools - Daily Technical SEO & Crawl Audit        ');
  console.log('================================================================');

  try {
    let result;
    if (isBoth) {
      console.log('\n--- Phase 1: Local dist/ Audit ---');
      const localResult = await runLocalAudit(limit);
      console.log(`✓ Local dist/ audited ${localResult.totalAudited} pages.`);

      console.log('\n--- Phase 2: Remote Production Audit ---');
      const remoteResult = await runRemoteAudit(limit);
      console.log(`✓ Remote production audited ${remoteResult.totalAudited} pages (avg ${remoteResult.avgResponseTimeMs}ms).`);

      result = {
        success: localResult.success && remoteResult.success,
        totalAudited: localResult.totalAudited + remoteResult.totalAudited,
        errors: [...localResult.errors, ...remoteResult.errors],
        warnings: [...localResult.warnings, ...remoteResult.warnings],
        avgResponseTimeMs: remoteResult.avgResponseTimeMs,
        internalLinksChecked: Math.max(localResult.internalLinksChecked, remoteResult.internalLinksChecked),
        cacheHeaderCoverage: remoteResult.cacheHeaderCoverage,
      };
    } else if (isRemote) {
      result = await runRemoteAudit(limit);
      console.log(`\n✓ Audited ${result.totalAudited} remote pages (avg ${result.avgResponseTimeMs}ms).`);
    } else {
      result = await runLocalAudit(limit);
      console.log(`\n✓ Audited ${result.totalAudited} local pages.`);
    }

    if (result.warnings.length > 0) {
      console.log(`⚠️  ${result.warnings.length} warning(s):`);
      result.warnings.slice(0, 10).forEach(w => console.log(`   - ${w}`));
    }

    if (result.errors.length > 0) {
      console.error(`\n❌  FAILED with ${result.errors.length} error(s):`);
      result.errors.slice(0, 20).forEach(e => console.error(`   - ${e}`));
      process.exit(1);
    }

    const checksPassed = isRemote || isBoth
      ? 'canonical, schema, robots, and discovery checks passed'
      : 'canonical and schema checks passed';
    console.log(`✅  PASS: ${result.internalLinksChecked || 0} internal links checked; ${checksPassed}.`);
    if (result.cacheHeaderCoverage !== undefined) {
      console.log(`    Cache-Control coverage: ${result.cacheHeaderCoverage}%\n`);
    }

    // Output GitHub Actions step summary if running in CI
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (summaryFile) {
      const summaryContent = [
        '### 📊 Daily Technical SEO & Crawl Audit Report',
        '',
        '| Metric | Value / Status |',
        '| :--- | :--- |',
        `| **Total Indexable Pages Audited** | **${result.totalAudited}** |`,
        '| **HTTP 200 & File Integrity** | ✅ 100% PASS |',
        '| **Canonical Tag Consistency** | ✅ Validated |',
        '| **Multi-locale indexability** | ✅ All sitemap locales indexable |',
        '| **Schema.org JSON-LD Markup** | ✅ Validated |',
        `| **Internal Links Checked** | ${result.internalLinksChecked || 0} |`,
        `| **Cache-Control Coverage** | ${result.cacheHeaderCoverage ?? 'local audit'} |`,
        '',
        result.warnings.length > 0
          ? `> [!NOTE]\n> **${result.warnings.length} Warning(s):**\n` + result.warnings.map(w => `- ${w}`).join('\n')
          : '> [!TIP]\n> Zero warnings encountered. All technical SEO indicators are in perfect health.',
        '',
      ].join('\n');

      appendFileSync(summaryFile, summaryContent + '\n', 'utf-8');
    }

    process.exit(0);
  } catch (err) {
    console.error(`\n❌  Audit crashed: ${err.message}`);
    process.exit(1);
  }
}

const isMain = process.argv[1] && process.argv[1].endsWith('daily-seo-audit.mjs');
if (isMain) {
  main();
}
