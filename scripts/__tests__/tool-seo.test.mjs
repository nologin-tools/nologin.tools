// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLocalizedToolStaticPaths,
  buildToolSeoMeta,
  getToolCanonicalPath,
  getLocalizedToolFields,
  hasLocalizedToolContent,
  resolveToolCanonicalLocale,
} from '../../src/lib/tool-seo.mjs';

describe('buildToolSeoMeta', () => {
  it('prefers explicit SEO fields when present', () => {
    const seo = buildToolSeoMeta({
      name: 'Excalidraw',
      description: 'A virtual whiteboard for sketching hand-drawn like diagrams.',
      coreTask: 'Create hand-drawn style diagrams in the browser',
      seoTitle: 'Excalidraw: Create hand-drawn style diagrams without signup',
      seoDescription: 'Excalidraw helps you create hand-drawn style diagrams without signup.',
      seoTaskPhrase: 'create hand-drawn style diagrams without signup',
      seoFocusKeyword: 'Excalidraw no login diagram tool',
      seoIntent: 'task',
    });

    assert.equal(seo.title, 'Excalidraw: Create hand-drawn style diagrams without signup');
    assert.equal(seo.description, 'Excalidraw helps you create hand-drawn style diagrams without signup.');
    assert.equal(seo.taskPhrase, 'create hand-drawn style diagrams without signup');
    assert.equal(seo.intent, 'task');
  });

  it('builds fallback title and description from the no-login task', () => {
    const seo = buildToolSeoMeta({
      name: 'When2meet',
      description: 'A simple scheduling grid for groups.',
      coreTask: 'Find a meeting time that works for everyone',
    });

    assert.match(seo.title, /^When2meet:/);
    assert.match(seo.description, /without/i);
    assert.match(seo.taskPhrase, /without/i);
    assert.equal(seo.intent, 'task');
  });

  it('builds localized fallback SEO without leaking english explicit fields', () => {
    const localizedTool = getLocalizedToolFields(
      {
        name: 'When2meet',
        description: 'A simple scheduling grid for groups.',
        coreTask: 'Find a meeting time that works for everyone',
        seoTitle: 'When2meet: Find a meeting time without signup',
        seoDescription: 'When2meet helps you find a meeting time without signup.',
        seoFocusKeyword: 'When2meet no login scheduler',
        seoTaskPhrase: 'find a meeting time without signup',
      },
      {
        description: 'Una cuadrícula sencilla para coordinar horarios en grupo.',
        coreTask: 'Encontrar un horario de reunión que funcione para todos',
      },
      'es'
    );

    const seo = buildToolSeoMeta(localizedTool, 'es');

    assert.equal(localizedTool.seoTitle, null);
    assert.equal(localizedTool.seoDescription, null);
    assert.equal(localizedTool.seoFocusKeyword, null);
    assert.match(seo.title, /sin registro/i);
    assert.doesNotMatch(seo.title, /without signup|without login|No Login Required/i);
    assert.match(seo.description, /sin registro/i);
    assert.match(seo.description, /Una cuadrícula sencilla/i);
  });
});

describe('getToolCanonicalPath', () => {
  it('returns localized canonical paths', () => {
    assert.equal(getToolCanonicalPath('when2meet-com', 'en'), '/tool/when2meet-com');
    assert.equal(getToolCanonicalPath('when2meet-com', 'de'), '/de/tool/when2meet-com');
  });
});

describe('localized tool helpers', () => {
  it('treats a locale as localized only when both description and core task exist', () => {
    assert.equal(hasLocalizedToolContent({ description: 'Beschreibung', coreTask: 'Aufgabe' }), true);
    assert.equal(hasLocalizedToolContent({ description: 'Beschreibung' }), false);
    assert.equal(hasLocalizedToolContent({ coreTask: 'Aufgabe' }), false);
  });

  it('falls back canonical locale to english when a locale has no localized copy', () => {
    const availableLocales = new Set(['en', 'de']);
    assert.equal(resolveToolCanonicalLocale('de', availableLocales), 'de');
    assert.equal(resolveToolCanonicalLocale('ja', availableLocales), 'en');
    assert.equal(
      getToolCanonicalPath('when2meet-com', resolveToolCanonicalLocale('ja', availableLocales)),
      '/tool/when2meet-com'
    );
  });

  it('builds static paths only for localized non-default locales', () => {
    const paths = buildLocalizedToolStaticPaths(
      [
        { slug: 'when2meet-com' },
        { slug: 'hat-sh' },
      ],
      ['en', 'zh', 'de'],
      'en',
      (tool) => (tool.slug === 'when2meet-com' ? new Set(['en', 'de']) : new Set(['en', 'zh', 'de']))
    );

    assert.deepEqual(
      paths.map((path) => path.params),
      [
        { lang: 'de', slug: 'when2meet-com' },
        { lang: 'zh', slug: 'hat-sh' },
        { lang: 'de', slug: 'hat-sh' },
      ]
    );
  });
});
