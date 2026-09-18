---
name: daily-seo-audit
description: >-
  Daily technical SEO, crawlability, schema, internal-link, cache-header, and AI
  discovery audit for nologin.tools. Audits every sitemap locale and submits
  IndexNow only after a clean audit, with endpoint-level result reporting.
---

# Daily SEO Audit

This workflow is read-only for D1 and tool approval data.

## Audit production

```bash
node scripts/daily-seo-audit.mjs --remote
```

The remote audit always loads the live production sitemap and treats every URL in it—including English, Chinese, Japanese, Korean, Spanish, French, German, and Portuguese routes—as indexable. It checks:

- successful HTTP responses and response time;
- non-empty title and meta description;
- exact normalized self-canonical URL;
- absence of `noindex` on sitemap URLs;
- valid JSON-LD plus route-specific required schema types and fields;
- internal page links;
- `Cache-Control` coverage;
- production `robots.txt`, `llms.txt`, and `llms-full.txt`, including the declared sitemap and GPTBot, ClaudeBot, and PerplexityBot directives.

For a freshly built local artifact, run:

```bash
pnpm build
node scripts/daily-seo-audit.mjs --both
```

Do not claim a category passed if the command exited nonzero. Fix or report the concrete URL and rule.

## IndexNow gate

Only after the chosen audit mode exits successfully:

```bash
node scripts/push-indexnow.mjs
```

The submitter prefers the live sitemap and only falls back to `dist/sitemap.xml` when production is unavailable. Report each endpoint separately. Overall submission succeeds only when both configured endpoints succeed; partial success must remain partial and any total failure must be reported as failure.

## Briefing

Report:

- audit mode and number of pages actually audited;
- error and warning counts with affected URLs;
- internal-link count and cache-header coverage;
- average production response time when available;
- discovery-resource status;
- whether IndexNow was skipped, fully successful, partially successful, or failed, including endpoint statuses.

Never publish a 100% or “zero broken links” claim unless the full, unbounded sitemap audit completed successfully.
