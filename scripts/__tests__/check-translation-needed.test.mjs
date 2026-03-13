// @ts-check
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { hash, LOCALES } from '../check-translation-needed.mjs';

// ---------------------------------------------------------------------------
// Helpers — use a temp directory to isolate filesystem side-effects
// ---------------------------------------------------------------------------

const TMP = join(import.meta.dirname, '__tmp_check_translation__');

function setup() {
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(join(TMP, 'src', 'i18n'), { recursive: true });
  mkdirSync(join(TMP, 'src', 'content', 'blog'), { recursive: true });
  mkdirSync(join(TMP, 'src', 'data', 'translations'), { recursive: true });
}

function teardown() {
  rmSync(TMP, { recursive: true, force: true });
}

/**
 * Run the check functions with cwd temporarily changed to TMP.
 * We dynamically re-import to pick up filesystem changes.
 */
async function runInTmp(fn) {
  const origCwd = process.cwd();
  try {
    process.chdir(TMP);
    // We call the exported functions directly — they read from cwd
    const mod = await import(`../check-translation-needed.mjs?t=${Date.now()}`);
    return fn(mod);
  } finally {
    process.chdir(origCwd);
  }
}

function writeEnJson(data) {
  writeFileSync(join(TMP, 'src', 'i18n', 'en.json'), JSON.stringify(data, null, 2));
}

function writeLocaleJson(locale, data) {
  writeFileSync(join(TMP, 'src', 'i18n', `${locale}.json`), JSON.stringify(data, null, 2));
}

function writeBlogPost(filename, content) {
  writeFileSync(join(TMP, 'src', 'content', 'blog', filename), content);
}

function writeBlogTranslation(locale, filename, content) {
  const dir = join(TMP, 'src', 'content', 'blog', locale);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), content);
}

function writeBuildData(tools) {
  writeFileSync(
    join(TMP, 'src', 'data', 'build-data.json'),
    JSON.stringify({ tools }, null, 2)
  );
}

function writeToolTranslations(locale, data) {
  writeFileSync(
    join(TMP, 'src', 'data', 'translations', `${locale}.json`),
    JSON.stringify(data, null, 2)
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('hash()', () => {
  it('returns a 16-char hex string', () => {
    const h = hash('hello');
    assert.equal(h.length, 16);
    assert.match(h, /^[0-9a-f]{16}$/);
  });

  it('is deterministic', () => {
    assert.equal(hash('test'), hash('test'));
  });

  it('differs for different inputs', () => {
    assert.notEqual(hash('a'), hash('b'));
  });
});

describe('checkUI()', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('all locales up_to_date when hashes match and all keys present', async () => {
    const enData = { 'nav.tools': 'Tools', 'nav.about': 'About' };
    writeEnJson(enData);
    const enHash = hash(JSON.stringify(enData, null, 2));

    for (const locale of LOCALES) {
      writeLocaleJson(locale, { _sourceHash: enHash, 'nav.tools': 'X', 'nav.about': 'Y' });
    }

    await runInTmp(({ checkUI }) => {
      const result = checkUI();
      assert.equal(result.sourceHash, enHash);
      for (const locale of LOCALES) {
        assert.equal(result.locales[locale].status, 'up_to_date');
      }
    });
  });

  it('detects hash_mismatch when _sourceHash differs', async () => {
    const enData = { 'nav.tools': 'Tools' };
    writeEnJson(enData);

    writeLocaleJson('zh', { _sourceHash: 'wrong_hash', 'nav.tools': '工具' });
    // Others are up-to-date
    const enHash = hash(JSON.stringify(enData, null, 2));
    for (const locale of LOCALES.filter(l => l !== 'zh')) {
      writeLocaleJson(locale, { _sourceHash: enHash, 'nav.tools': 'X' });
    }

    await runInTmp(({ checkUI }) => {
      const result = checkUI();
      assert.equal(result.locales['zh'].status, 'hash_mismatch');
    });
  });

  it('detects missing_keys with specific key names', async () => {
    const enData = { 'nav.tools': 'Tools', 'nav.new': 'New', 'nav.another': 'Another' };
    writeEnJson(enData);
    const enHash = hash(JSON.stringify(enData, null, 2));

    // zh has matching hash but missing 'nav.new' and 'nav.another'
    writeLocaleJson('zh', { _sourceHash: enHash, 'nav.tools': '工具' });
    for (const locale of LOCALES.filter(l => l !== 'zh')) {
      writeLocaleJson(locale, { _sourceHash: enHash, 'nav.tools': 'X', 'nav.new': 'Y', 'nav.another': 'Z' });
    }

    await runInTmp(({ checkUI }) => {
      const result = checkUI();
      assert.equal(result.locales['zh'].status, 'missing_keys');
      assert.deepEqual(result.locales['zh'].missingKeys, ['nav.new', 'nav.another']);
    });
  });

  it('detects missing locale file', async () => {
    const enData = { 'nav.tools': 'Tools' };
    writeEnJson(enData);
    const enHash = hash(JSON.stringify(enData, null, 2));

    // Only write some locales, skip 'ja'
    for (const locale of LOCALES.filter(l => l !== 'ja')) {
      writeLocaleJson(locale, { _sourceHash: enHash, 'nav.tools': 'X' });
    }

    await runInTmp(({ checkUI }) => {
      const result = checkUI();
      assert.equal(result.locales['ja'].status, 'missing');
    });
  });

  it('detects invalid JSON', async () => {
    const enData = { 'nav.tools': 'Tools' };
    writeEnJson(enData);

    writeFileSync(join(TMP, 'src', 'i18n', 'zh.json'), '{invalid json');
    const enHash = hash(JSON.stringify(enData, null, 2));
    for (const locale of LOCALES.filter(l => l !== 'zh')) {
      writeLocaleJson(locale, { _sourceHash: enHash, 'nav.tools': 'X' });
    }

    await runInTmp(({ checkUI }) => {
      const result = checkUI();
      assert.equal(result.locales['zh'].status, 'invalid_json');
    });
  });
});

describe('checkBlog()', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('returns empty posts when blog dir has no posts', async () => {
    await runInTmp(({ checkBlog }) => {
      const result = checkBlog();
      assert.deepEqual(result.posts, {});
    });
  });

  it('detects missing blog translations', async () => {
    writeBlogPost('welcome.md', '---\ntitle: Welcome\n---\nHello world');

    await runInTmp(({ checkBlog }) => {
      const result = checkBlog();
      assert.ok(result.posts['welcome.md']);
      for (const locale of LOCALES) {
        assert.equal(result.posts['welcome.md'].locales[locale], 'missing');
      }
    });
  });

  it('detects hash_mismatch when source content changed', async () => {
    const body = 'Hello world content here';
    writeBlogPost('post.md', `---\ntitle: Post\n---\n${body}`);

    const correctHash = hash(body);
    // Write translation with wrong hash
    writeBlogTranslation('zh', 'post.md', `---\ntitle: 帖子\nsourceHash: wronghash123\nlocale: zh\n---\n翻译`);
    // Write correct translation for ja
    writeBlogTranslation('ja', 'post.md', `---\ntitle: ポスト\nsourceHash: ${correctHash}\nlocale: ja\n---\n翻訳`);

    await runInTmp(({ checkBlog }) => {
      const result = checkBlog();
      assert.equal(result.posts['post.md'].locales['zh'], 'hash_mismatch');
      assert.equal(result.posts['post.md'].locales['ja'], 'up_to_date');
    });
  });

  it('treats missing sourceHash in frontmatter as hash_mismatch', async () => {
    writeBlogPost('post.md', '---\ntitle: Post\n---\nContent');
    writeBlogTranslation('zh', 'post.md', '---\ntitle: 帖子\nlocale: zh\n---\n翻译');

    await runInTmp(({ checkBlog }) => {
      const result = checkBlog();
      assert.equal(result.posts['post.md'].locales['zh'], 'hash_mismatch');
    });
  });

  it('omits posts where all locales are up_to_date', async () => {
    const body = 'All good content';
    writeBlogPost('done.md', `---\ntitle: Done\n---\n${body}`);
    const h = hash(body);

    for (const locale of LOCALES) {
      writeBlogTranslation(locale, 'done.md', `---\ntitle: Done\nsourceHash: ${h}\nlocale: ${locale}\n---\nTranslated`);
    }

    await runInTmp(({ checkBlog }) => {
      const result = checkBlog();
      assert.deepEqual(result.posts, {});
    });
  });
});

describe('checkTools()', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('returns empty items when build-data.json not found', async () => {
    await runInTmp(({ checkTools }) => {
      const result = checkTools();
      assert.deepEqual(result.items, {});
    });
  });

  it('detects missing tool translations', async () => {
    writeBuildData([
      { slug: 'excalidraw-com', description: 'Draw stuff', coreTask: 'Drawing', status: 'approved' },
    ]);

    await runInTmp(({ checkTools }) => {
      const result = checkTools();
      assert.ok(result.items['excalidraw-com']);
      for (const locale of LOCALES) {
        assert.equal(result.items['excalidraw-com'].locales[locale], 'missing');
      }
    });
  });

  it('detects hash_mismatch when tool content changed', async () => {
    const desc = 'Draw stuff';
    const core = 'Drawing';
    writeBuildData([
      { slug: 'tool-a', description: desc, coreTask: core, status: 'approved' },
    ]);

    const correctHash = hash(`${desc}|${core}`);
    writeToolTranslations('zh', { 'tool-a': { description: '画画', coreTask: '绘图', _hash: 'wronghash' } });
    writeToolTranslations('ja', { 'tool-a': { description: '描く', coreTask: '描画', _hash: correctHash } });

    await runInTmp(({ checkTools }) => {
      const result = checkTools();
      assert.equal(result.items['tool-a'].locales['zh'], 'hash_mismatch');
      assert.equal(result.items['tool-a'].locales['ja'], 'up_to_date');
    });
  });

  it('skips non-approved tools', async () => {
    writeBuildData([
      { slug: 'pending-tool', description: 'Pending', coreTask: 'Task', status: 'pending' },
    ]);

    await runInTmp(({ checkTools }) => {
      const result = checkTools();
      assert.deepEqual(result.items, {});
    });
  });

  it('omits tools where all locales are up_to_date', async () => {
    const desc = 'Done tool';
    const core = 'Task';
    writeBuildData([{ slug: 'done-tool', description: desc, coreTask: core, status: 'approved' }]);
    const h = hash(`${desc}|${core}`);

    for (const locale of LOCALES) {
      writeToolTranslations(locale, { 'done-tool': { description: 'X', coreTask: 'Y', _hash: h } });
    }

    await runInTmp(({ checkTools }) => {
      const result = checkTools();
      assert.deepEqual(result.items, {});
    });
  });
});

describe('buildManifest()', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('returns needsTranslation=false when everything is up to date', async () => {
    const enData = { 'nav.tools': 'Tools' };
    writeEnJson(enData);
    const enHash = hash(JSON.stringify(enData, null, 2));

    for (const locale of LOCALES) {
      writeLocaleJson(locale, { _sourceHash: enHash, 'nav.tools': 'X' });
    }
    // No blog posts, no build data — all clean.

    await runInTmp(({ buildManifest }) => {
      const { needsTranslation, taskTypes } = buildManifest();
      assert.equal(needsTranslation, false);
      assert.deepEqual(taskTypes, []);
    });
  });

  it('returns correct task_types when only UI needs work', async () => {
    const enData = { 'nav.tools': 'Tools', 'nav.new': 'New' };
    writeEnJson(enData);
    const enHash = hash(JSON.stringify(enData, null, 2));

    for (const locale of LOCALES) {
      writeLocaleJson(locale, { _sourceHash: enHash, 'nav.tools': 'X' }); // missing nav.new
    }

    await runInTmp(({ buildManifest }) => {
      const { needsTranslation, taskTypes } = buildManifest();
      assert.equal(needsTranslation, true);
      assert.deepEqual(taskTypes, ['ui']);
    });
  });

  it('returns correct task_types when blog and tools need work', async () => {
    const enData = { 'nav.tools': 'Tools' };
    writeEnJson(enData);
    const enHash = hash(JSON.stringify(enData, null, 2));
    for (const locale of LOCALES) {
      writeLocaleJson(locale, { _sourceHash: enHash, 'nav.tools': 'X' });
    }

    // Add a blog post without translations
    writeBlogPost('new.md', '---\ntitle: New\n---\nContent');

    // Add a tool without translations
    writeBuildData([{ slug: 'tool-x', description: 'X', coreTask: 'Y', status: 'approved' }]);

    await runInTmp(({ buildManifest }) => {
      const { needsTranslation, taskTypes } = buildManifest();
      assert.equal(needsTranslation, true);
      assert.ok(taskTypes.includes('blog'));
      assert.ok(taskTypes.includes('tools'));
      assert.ok(!taskTypes.includes('ui'));
    });
  });

  it('includes sourceHash in manifest for all sections', async () => {
    const enData = { 'key': 'value' };
    writeEnJson(enData);

    writeBlogPost('p.md', '---\ntitle: P\n---\nBody text');
    writeBuildData([{ slug: 's', description: 'D', coreTask: 'C', status: 'approved' }]);

    await runInTmp(({ buildManifest }) => {
      const { manifest } = buildManifest();
      assert.ok(manifest.ui.sourceHash);
      assert.ok(manifest.blog.posts['p.md'].sourceHash);
      assert.ok(manifest.tools.items['s'].sourceHash);
    });
  });
});
