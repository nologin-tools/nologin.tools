#!/usr/bin/env node
// @ts-check
/**
 * Download a hero image for a blog post with a three-level fallback chain:
 *   1. Unsplash API (requires --api-key)
 *   2. Unsplash Source (no key needed, redirect-based)
 *   3. Picsum (final fallback, random high-quality image)
 *
 * Usage:
 *   node scripts/add-blog-hero-image.mjs --slug <slug> [--api-key <key>]
 *
 * The script:
 *   - Reads src/content/blog/{slug}.md
 *   - Extracts search query from heroImageQuery frontmatter or title
 *   - Downloads image to public/blog/images/{slug}/hero.jpg
 *   - Inserts ![alt](/blog/images/{slug}/hero.jpg) after frontmatter
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import http from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

/**
 * Parse CLI arguments.
 * @param {string[]} argv
 * @returns {{ slug: string, apiKey: string }}
 */
export function parseArgs(argv) {
  const args = argv.slice(2);
  let slug = '';
  let apiKey = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
      slug = args[i + 1];
      i++;
    } else if (args[i] === '--api-key' && args[i + 1]) {
      apiKey = args[i + 1];
      i++;
    }
  }

  return { slug, apiKey };
}

// ---------------------------------------------------------------------------
// Frontmatter helpers
// ---------------------------------------------------------------------------

/**
 * Extract heroImageQuery or title from frontmatter.
 * @param {string} content
 * @returns {{ heroImageQuery: string | null, title: string | null }}
 */
export function extractFrontmatterFields(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return { heroImageQuery: null, title: null };

  const fm = match[1];
  const queryMatch = fm.match(/^heroImageQuery:\s*["']?(.+?)["']?\s*$/m);
  const titleMatch = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m);

  return {
    heroImageQuery: queryMatch ? queryMatch[1].trim() : null,
    title: titleMatch ? titleMatch[1].trim() : null,
  };
}

/**
 * Build search query from frontmatter fields.
 * @param {{ heroImageQuery: string | null, title: string | null }} fields
 * @returns {string}
 */
export function buildSearchQuery(fields) {
  if (fields.heroImageQuery) return fields.heroImageQuery;
  if (!fields.title) return 'technology';

  // Extract meaningful keywords from title
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'shall', 'not', 'no', 'nor',
    'so', 'if', 'then', 'than', 'too', 'very', 'just', 'about', 'how',
    'what', 'when', 'where', 'why', 'which', 'who', 'whom', 'this', 'that',
    'these', 'those', 'it', 'its', 'my', 'your', 'our', 'their', 'his',
    'her', 'we', 'you', 'they', 'best', 'top', 'new', 'without', 'using',
  ]);

  const keywords = fields.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  return keywords.slice(0, 3).join(' ') || 'technology';
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

/**
 * Fetch URL and return response body as Buffer. Follows redirects (up to 5).
 * @param {string} url
 * @param {Record<string, string>} [headers]
 * @param {number} [maxRedirects]
 * @returns {Promise<{ statusCode: number, data: Buffer, headers: Record<string, string> }>}
 */
function fetchUrl(url, headers = {}, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers, timeout: 15000 }, (res) => {
      // Follow redirects
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307) && res.headers.location) {
        if (maxRedirects <= 0) {
          reject(new Error('Too many redirects'));
          return;
        }
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        fetchUrl(redirectUrl, headers, maxRedirects - 1).then(resolve).catch(reject);
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          data: Buffer.concat(chunks),
          headers: /** @type {Record<string, string>} */ (res.headers),
        });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

// ---------------------------------------------------------------------------
// Image download strategies
// ---------------------------------------------------------------------------

/**
 * Level 1: Unsplash API (requires API key).
 * Returns { imageData, attribution } or throws.
 * @param {string} query
 * @param {string} apiKey
 * @returns {Promise<{ imageData: Buffer, attribution: string | null }>}
 */
export async function fetchFromUnsplashApi(query, apiKey) {
  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `https://api.unsplash.com/photos/random?query=${encodedQuery}&orientation=landscape&w=1200`;

  const response = await fetchUrl(apiUrl, {
    Authorization: `Client-ID ${apiKey}`,
  });

  if (response.statusCode !== 200) {
    throw new Error(`Unsplash API returned ${response.statusCode}`);
  }

  const json = JSON.parse(response.data.toString('utf-8'));
  const imageUrl = json?.urls?.regular;
  if (!imageUrl) {
    throw new Error('No image URL in Unsplash API response');
  }

  const photographer = json?.user?.name || null;
  const attribution = photographer ? `Photo by ${photographer} on Unsplash` : null;

  const imageResponse = await fetchUrl(imageUrl);
  if (imageResponse.statusCode !== 200) {
    throw new Error(`Image download failed with ${imageResponse.statusCode}`);
  }

  return { imageData: imageResponse.data, attribution };
}

/**
 * Level 2: Unsplash Source (no API key, redirect-based).
 * @param {string} query
 * @returns {Promise<{ imageData: Buffer, attribution: string | null }>}
 */
export async function fetchFromUnsplashSource(query) {
  const encodedQuery = encodeURIComponent(query);
  const sourceUrl = `https://source.unsplash.com/1200x630/?${encodedQuery}`;

  const response = await fetchUrl(sourceUrl);

  if (response.statusCode !== 200 || response.data.length < 1000) {
    throw new Error(`Unsplash Source failed: status=${response.statusCode}, size=${response.data.length}`);
  }

  return { imageData: response.data, attribution: null };
}

/**
 * Level 3: Picsum (final fallback, random high-quality image).
 * @returns {Promise<{ imageData: Buffer, attribution: string | null }>}
 */
export async function fetchFromPicsum() {
  const picsumUrl = 'https://picsum.photos/1200/630';

  const response = await fetchUrl(picsumUrl);

  if (response.statusCode !== 200 || response.data.length < 1000) {
    throw new Error(`Picsum failed: status=${response.statusCode}, size=${response.data.length}`);
  }

  return { imageData: response.data, attribution: null };
}

/**
 * Try all three image sources in order. Returns the first successful result.
 * @param {string} query
 * @param {string} apiKey
 * @returns {Promise<{ imageData: Buffer, attribution: string | null, source: string }>}
 */
export async function fetchHeroImage(query, apiKey) {
  // Level 1: Unsplash API
  if (apiKey) {
    try {
      console.error(`[hero-image] Trying Unsplash API with query: "${query}"`);
      const result = await fetchFromUnsplashApi(query, apiKey);
      console.error('[hero-image] Unsplash API succeeded');
      return { ...result, source: 'unsplash-api' };
    } catch (err) {
      console.error(`[hero-image] Unsplash API failed: ${err.message}`);
    }
  } else {
    console.error('[hero-image] No API key provided, skipping Unsplash API');
  }

  // Level 2: Unsplash Source
  try {
    console.error(`[hero-image] Trying Unsplash Source with query: "${query}"`);
    const result = await fetchFromUnsplashSource(query);
    console.error('[hero-image] Unsplash Source succeeded');
    return { ...result, source: 'unsplash-source' };
  } catch (err) {
    console.error(`[hero-image] Unsplash Source failed: ${err.message}`);
  }

  // Level 3: Picsum
  try {
    console.error('[hero-image] Trying Picsum (final fallback)');
    const result = await fetchFromPicsum();
    console.error('[hero-image] Picsum succeeded');
    return { ...result, source: 'picsum' };
  } catch (err) {
    console.error(`[hero-image] Picsum failed: ${err.message}`);
  }

  throw new Error('All image sources failed');
}

// ---------------------------------------------------------------------------
// Markdown insertion
// ---------------------------------------------------------------------------

/**
 * Insert hero image markdown after frontmatter.
 * @param {string} content - Full markdown file content
 * @param {string} slug - Blog post slug
 * @param {string | null} attribution - Photographer attribution (if available)
 * @returns {string} - Modified content with image inserted
 */
export function insertHeroImage(content, slug, attribution) {
  const firstDelim = content.indexOf('---');
  if (firstDelim === -1) return content;

  const secondDelim = content.indexOf('---', firstDelim + 3);
  if (secondDelim === -1) return content;

  const endOfFrontmatter = content.indexOf('\n', secondDelim);
  if (endOfFrontmatter === -1) return content;

  const altText = attribution || 'Hero image';
  const imageLine = `\n![${altText}](/blog/images/${slug}/hero.jpg)\n`;

  return content.slice(0, endOfFrontmatter + 1) + imageLine + content.slice(endOfFrontmatter + 1);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { slug, apiKey } = parseArgs(process.argv);

  if (!slug) {
    console.error('Usage: node scripts/add-blog-hero-image.mjs --slug <slug> [--api-key <key>]');
    process.exit(1);
  }

  const blogFile = resolve(ROOT, 'src/content/blog', `${slug}.md`);
  if (!existsSync(blogFile)) {
    console.error(`[hero-image] Blog file not found: ${blogFile}`);
    process.exit(1);
  }

  const content = readFileSync(blogFile, 'utf-8');

  // Check if image already exists in the post
  if (content.includes(`/blog/images/${slug}/hero.jpg`)) {
    console.error(`[hero-image] Hero image already referenced in ${slug}.md, skipping`);
    process.exit(0);
  }

  const fields = extractFrontmatterFields(content);
  const query = buildSearchQuery(fields);
  console.error(`[hero-image] Search query: "${query}"`);

  try {
    const { imageData, attribution, source } = await fetchHeroImage(query, apiKey);

    // Save image
    const imageDir = resolve(ROOT, 'public/blog/images', slug);
    mkdirSync(imageDir, { recursive: true });
    const imagePath = resolve(imageDir, 'hero.jpg');
    writeFileSync(imagePath, imageData);
    console.error(`[hero-image] Image saved: ${imagePath} (${imageData.length} bytes, source: ${source})`);

    // Insert image reference in markdown
    const updatedContent = insertHeroImage(content, slug, attribution);
    writeFileSync(blogFile, updatedContent);
    console.error(`[hero-image] Markdown updated: ${blogFile}`);

    console.log(JSON.stringify({ slug, source, attribution, imageSize: imageData.length }));
  } catch (err) {
    console.error(`[hero-image] FATAL: ${err.message}`);
    process.exit(1);
  }
}

// Only run main when executed directly
const isMainModule =
  process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/add-blog-hero-image.mjs'));

if (isMainModule) {
  main();
}
