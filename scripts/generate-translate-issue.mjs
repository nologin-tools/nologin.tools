#!/usr/bin/env node

/**
 * Generate a targeted translation Issue body from a change manifest.
 *
 * Reads the change manifest JSON from stdin and outputs Markdown to stdout.
 * Only includes tasks/locales that actually need work — up_to_date items are omitted.
 *
 * Usage:
 *   echo '{"ui":...,"blog":...,"tools":...}' | node scripts/generate-translate-issue.mjs
 */

/**
 * Generate Issue body from a parsed manifest object.
 * @param {object} manifest - The change manifest from check-translation-needed.mjs
 * @returns {string} Markdown Issue body
 */
export function generateIssueBody(manifest) {
  const sections = [];

  sections.push('@claude You are a translation agent for nologin.tools.');
  sections.push('Target languages: zh, ja, ko, es, fr, de, pt.\n');

  const hasTasks = { ui: false, blog: false, tools: false };

  // --- UI Strings ---
  const ui = manifest.ui;
  if (ui && ui.locales) {
    const needsWork = Object.entries(ui.locales).filter(([, v]) => v.status !== 'up_to_date');
    if (needsWork.length > 0) {
      hasTasks.ui = true;
      sections.push('## Task: UI Strings');
      sections.push(`Source file: \`src/i18n/en.json\` (hash: \`${ui.sourceHash}\`)\n`);

      // Group by status type for clarity
      const hashMismatch = needsWork.filter(([, v]) => v.status === 'hash_mismatch' || v.status === 'missing' || v.status === 'invalid_json');
      const missingKeys = needsWork.filter(([, v]) => v.status === 'missing_keys');

      if (hashMismatch.length > 0) {
        const locales = hashMismatch.map(([l]) => `\`${l}\``).join(', ');
        sections.push(`**Full re-translate** (source changed or file missing): ${locales}`);
        sections.push('- Read `src/i18n/en.json` and translate ALL keys for these locales');
        sections.push(`- Set \`_sourceHash\` to \`${ui.sourceHash}\` as the first key`);
        sections.push('');
      }

      if (missingKeys.length > 0) {
        sections.push('**Add missing keys only**:');
        for (const [locale, info] of missingKeys) {
          const keys = info.missingKeys.map(k => `\`${k}\``).join(', ');
          sections.push(`- \`${locale}\`: ${keys}`);
        }
        sections.push(`- Set \`_sourceHash\` to \`${ui.sourceHash}\` after adding keys`);
        sections.push('');
      }

      sections.push('Rules:');
      sections.push('- Keep brand names (nologin.tools, NoLoginTools.org) untranslated');
      sections.push('- Preserve `{placeholder}` syntax exactly');
      sections.push('- Write valid JSON with 2-space indentation');
      sections.push('');
    }
  }

  // --- Blog Posts ---
  const blog = manifest.blog;
  if (blog && blog.posts && Object.keys(blog.posts).length > 0) {
    hasTasks.blog = true;
    sections.push('## Task: Blog Posts\n');

    for (const [filename, postInfo] of Object.entries(blog.posts)) {
      const needsWork = Object.entries(postInfo.locales).filter(([, s]) => s !== 'up_to_date');
      if (needsWork.length === 0) continue;

      const missing = needsWork.filter(([, s]) => s === 'missing').map(([l]) => l);
      const outdated = needsWork.filter(([, s]) => s === 'hash_mismatch').map(([l]) => l);

      sections.push(`### \`${filename}\` (hash: \`${postInfo.sourceHash}\`)`);
      if (missing.length > 0) {
        sections.push(`- **Create translation**: ${missing.map(l => `\`${l}\``).join(', ')}`);
      }
      if (outdated.length > 0) {
        sections.push(`- **Re-translate** (content updated): ${outdated.map(l => `\`${l}\``).join(', ')}`);
      }
      sections.push('');
    }

    sections.push('Rules:');
    sections.push('- Translate title and description in frontmatter');
    sections.push('- Add `locale`, `originalSlug`, `sourceHash` to frontmatter');
    sections.push('- Keep all links, code blocks, brand names, and URLs unchanged');
    sections.push('- Keep the same Markdown structure (headings, lists, etc.)');
    sections.push('');
  }

  // --- Tool Descriptions ---
  const tools = manifest.tools;
  if (tools && tools.items && Object.keys(tools.items).length > 0) {
    hasTasks.tools = true;
    sections.push('## Task: Tool Descriptions\n');
    sections.push('Source: `src/data/build-data.json` (approved tools)\n');

    for (const [slug, toolInfo] of Object.entries(tools.items)) {
      const needsWork = Object.entries(toolInfo.locales).filter(([, s]) => s !== 'up_to_date');
      if (needsWork.length === 0) continue;

      const missing = needsWork.filter(([, s]) => s === 'missing').map(([l]) => l);
      const outdated = needsWork.filter(([, s]) => s === 'hash_mismatch').map(([l]) => l);

      const parts = [`\`${slug}\` (hash: \`${toolInfo.sourceHash}\`)`];
      if (missing.length > 0) parts.push(`create: ${missing.map(l => `\`${l}\``).join(', ')}`);
      if (outdated.length > 0) parts.push(`update: ${outdated.map(l => `\`${l}\``).join(', ')}`);
      sections.push(`- ${parts.join(' — ')}`);
    }

    sections.push('');
    sections.push('Rules:');
    sections.push('- Translate `description`, `coreTask`, `seoTitle`, `seoDescription`, `seoFocusKeyword`, and `seoTaskPhrase` fields');
    sections.push('- Keep tool names in English');
    sections.push('- Store `_hash` alongside each translation');
    sections.push('- Write valid JSON with 2-space indentation');
    sections.push('');
  }

  // --- Quality Guidelines (always included) ---
  sections.push('## Translation Quality Guidelines');
  sections.push('**FIRST**: Read `scripts/translation-guidelines.md` for detailed per-language style instructions. Follow them precisely.\n');
  sections.push('Core principle: REWRITE, don\'t translate. The output must read as if originally written in the target language.');
  sections.push('- Break long English sentences into shorter target-language sentences');
  sections.push('- Replace English idioms with natural target-language equivalents');
  sections.push('- Adapt paragraph structure and rhythm for target-language reading habits');
  sections.push('- For blog posts: match the tone of popular tech blogs in each locale\'s culture (see guidelines for specific references)');
  sections.push('- Do NOT translate: brand names, URLs, code snippets, {placeholders}');
  sections.push('- For Chinese (zh): use Simplified Chinese, 少数派/V2EX style');
  sections.push('- For Japanese (ja): use 敬体 (です/ます調), Zenn.dev/Qiita style');
  sections.push('- For Korean (ko): use 해요체, velog.io style');
  sections.push('- For Spanish (es): use tú, Xataka/Genbeta style');
  sections.push('- For French (fr): use tu, Korben.info style; respect French punctuation spacing');
  sections.push('- For German (de): use du, t3n.de/heise.de style');
  sections.push('- For Portuguese (pt): use Brazilian Portuguese (pt-BR), Tecnoblog style');

  // --- Important ---
  sections.push('\n## Important');
  sections.push('- Only modify translation files. Do NOT modify any English source files.');
  sections.push('- If no changes are needed, report "All translations up to date" and exit.');

  return sections.join('\n');
}

// --- Main execution (stdin → stdout) ---
const isMain = !process.argv[1] || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
const isTestEnv = !!process.env.NODE_TEST_CONTEXT;

if (isMain && !isTestEnv) {
  let input = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const manifest = JSON.parse(input);
      const body = generateIssueBody(manifest);
      process.stdout.write(body);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });
}
