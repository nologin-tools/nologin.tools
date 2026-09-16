import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CURATED_COLLECTIONS,
  getCollectionBySlug,
  getRelatedCollections,
  findCollectionsForTool,
} from '../../src/lib/collections-data.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildDataPath = path.resolve(__dirname, '../../src/data/build-data.json');
const buildData = JSON.parse(fs.readFileSync(buildDataPath, 'utf8'));
const approvedSlugs = new Set(buildData.tools.map((t) => t.slug));

describe('Curated Stacks / Collections Data Model', () => {
  it('defines 8 high-intent curated collections', () => {
    assert.equal(CURATED_COLLECTIONS.length, 8);
  });

  it('has valid URL-safe unique slugs for all collections', () => {
    const slugSet = new Set();
    for (const col of CURATED_COLLECTIONS) {
      assert.match(col.slug, /^[a-z0-9-]+$/);
      assert.ok(!slugSet.has(col.slug), `Duplicate slug detected: ${col.slug}`);
      slugSet.add(col.slug);
    }
  });

  it('ensures every tool referenced in all collections is an approved tool in build-data.json', () => {
    for (const col of CURATED_COLLECTIONS) {
      assert.ok(col.items.length >= 4, `Collection ${col.slug} has fewer than 4 tools`);
      for (const item of col.items) {
        assert.ok(
          approvedSlugs.has(item.toolSlug),
          `Tool slug "${item.toolSlug}" in collection "${col.slug}" is not an approved tool in build-data.json`
        );
        assert.ok(item.roleTitle.trim().length > 0);
        assert.ok(item.whySelected.trim().length > 0);
      }
    }
  });

  it('contains comprehensive metadata, guarantees, and FAQs for each collection', () => {
    for (const col of CURATED_COLLECTIONS) {
      assert.ok(col.title.length > 5);
      assert.ok(col.tagline.length > 15);
      assert.ok(col.persona.length > 3);
      assert.ok(col.description.length > 100);
      assert.ok(col.guarantees.length >= 3);
      assert.ok(col.faqs.length >= 2);
      for (const faq of col.faqs) {
        assert.ok(faq.question.length > 10);
        assert.ok(faq.answer.length > 20);
      }
    }
  });

  it('resolves valid collections with getCollectionBySlug', () => {
    const col = getCollectionBySlug('ephemeral-creative-suite');
    assert.ok(col);
    assert.equal(col.title, 'Zero-Account Creative Studio');

    const nonExistent = getCollectionBySlug('fake-non-existent-collection');
    assert.equal(nonExistent, undefined);
  });

  it('resolves related collections with getRelatedCollections', () => {
    const related = getRelatedCollections('ephemeral-creative-suite');
    assert.ok(related.length > 0);
    for (const r of related) {
      assert.notEqual(r.slug, 'ephemeral-creative-suite');
    }
  });

  it('finds collections for a given tool with findCollectionsForTool', () => {
    const found = findCollectionsForTool('excalidraw-com');
    assert.ok(found.length >= 1);
    assert.ok(found.some((c) => c.slug === 'ephemeral-creative-suite'));

    const empty = findCollectionsForTool('unknown-dummy-tool-slug');
    assert.equal(empty.length, 0);
  });
});
