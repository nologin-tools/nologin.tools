// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Route Resilience & Middleware Safety', () => {
  const SKIP_REDIRECT_REGEX = /^\/(api|admin|ssr|_astro)(\/|$)/;

  it('skips redirect for /admin without trailing slash', () => {
    assert.equal(SKIP_REDIRECT_REGEX.test('/admin'), true);
  });

  it('skips redirect for /admin/ with trailing slash', () => {
    assert.equal(SKIP_REDIRECT_REGEX.test('/admin/'), true);
  });

  it('skips redirect for /api and /api/ endpoints', () => {
    assert.equal(SKIP_REDIRECT_REGEX.test('/api'), true);
    assert.equal(SKIP_REDIRECT_REGEX.test('/api/submit'), true);
    assert.equal(SKIP_REDIRECT_REGEX.test('/api/resubmit'), true);
  });

  it('skips redirect for /ssr and /_astro', () => {
    assert.equal(SKIP_REDIRECT_REGEX.test('/ssr/tool/foo'), true);
    assert.equal(SKIP_REDIRECT_REGEX.test('/_astro/style.css'), true);
  });

  it('does not skip redirect for user content paths', () => {
    assert.equal(SKIP_REDIRECT_REGEX.test('/'), false);
    assert.equal(SKIP_REDIRECT_REGEX.test('/about'), false);
    assert.equal(SKIP_REDIRECT_REGEX.test('/submit'), false);
    assert.equal(SKIP_REDIRECT_REGEX.test('/blog'), false);
    assert.equal(SKIP_REDIRECT_REGEX.test('/blog/my-post'), false);
    assert.equal(SKIP_REDIRECT_REGEX.test('/tool/excalidraw-com'), false);
  });
});

describe('Blog Fallback Route Generation', () => {
  it('generates fallback props for untranslated posts', () => {
    const englishPosts = [{ id: 'untranslated-guide', data: {} }];
    const allPosts = [{ id: 'untranslated-guide', data: {} }];
    const targetLocales = ['zh', 'ja'];

    const paths = [];
    for (const lang of targetLocales) {
      for (const englishPost of englishPosts) {
        const slug = englishPost.id;
        const translatedPost = allPosts.find(
          (p) => p.id === `${lang}/${slug}` || (p.data?.originalSlug === slug && p.id.startsWith(`${lang}/`))
        );
        paths.push({
          params: { lang, slug },
          props: {
            post: translatedPost || englishPost,
            locale: lang,
            isFallback: !translatedPost,
          },
        });
      }
    }

    assert.equal(paths.length, 2);
    assert.equal(paths[0].params.lang, 'zh');
    assert.equal(paths[0].props.isFallback, true);
    assert.equal(paths[0].props.post.id, 'untranslated-guide');
    assert.equal(paths[1].params.lang, 'ja');
    assert.equal(paths[1].props.isFallback, true);
  });

  it('prefers translated post when available', () => {
    const englishPosts = [{ id: 'welcome', data: {} }];
    const allPosts = [
      { id: 'welcome', data: {} },
      { id: 'zh/welcome', data: { title: '欢迎' } },
    ];
    const targetLocales = ['zh', 'ja'];

    const paths = [];
    for (const lang of targetLocales) {
      for (const englishPost of englishPosts) {
        const slug = englishPost.id;
        const translatedPost = allPosts.find(
          (p) => p.id === `${lang}/${slug}` || (p.data?.originalSlug === slug && p.id.startsWith(`${lang}/`))
        );
        paths.push({
          params: { lang, slug },
          props: {
            post: translatedPost || englishPost,
            locale: lang,
            isFallback: !translatedPost,
          },
        });
      }
    }

    assert.equal(paths[0].params.lang, 'zh');
    assert.equal(paths[0].props.isFallback, false);
    assert.equal(paths[0].props.post.id, 'zh/welcome');

    assert.equal(paths[1].params.lang, 'ja');
    assert.equal(paths[1].props.isFallback, true);
    assert.equal(paths[1].props.post.id, 'welcome');
  });
});
