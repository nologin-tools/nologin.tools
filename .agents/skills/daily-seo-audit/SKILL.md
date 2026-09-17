---
name: daily-seo-audit
description: >-
  Autonomous daily technical SEO audit, broken-link prevention, crawlability verification,
  Schema.org validation, and search indexation runbook for nologin.tools.
  Use this skill to audit all indexable pages in sitemap.xml, check Canonical/Robots directives,
  verify AI crawler files (robots.txt, llms.txt), submit fresh URLs to IndexNow, and output a
  concise morning SEO briefing.
---

# Daily SEO Audit & Technical Growth (`daily-seo-audit`)

This skill defines the autonomous daily technical SEO audit and search engine indexation runbook for `nologin.tools`. The Agent audits online and local technical health, ensures zero broken indexable links, validates schema integrity, pushes URLs to search engines via IndexNow, and generates a clean daily briefing.

---

## 1. Operating Principles & Safety Guardrails

1. **Zero Database Tampering**: This skill is strictly **read-only** with respect to the tool database. It NEVER modifies tool records, approval statuses (`approved`/`rejected`/`pending`), or taxonomy tags in Cloudflare D1. All tool vetting and queue processing are strictly reserved for `autonomous-patrol`.
2. **Production-First Remote Verification**: Audits live production endpoints (`https://nologin.tools`) by default to detect real-world crawler accessibility, HTTP 200 health, latency, and edge CDN cache headers.
3. **Automated Search Engine Pings**: Automatically triggers IndexNow pings for all validated sitemap URLs to accelerate discovery by Bing, Yandex, Seznam, and Naver.
4. **Deterministic & Fast Execution**: Runs directly via Node.js CLI scripts without launching heavy browser instances unless deep DOM inspection is explicitly warranted.

---

## 2. Execution Workflow

### Phase 1: Remote Production Technical SEO Audit

Execute the comprehensive SEO audit script against live production:

```bash
node scripts/daily-seo-audit.mjs --remote
```

The script inspects all URLs listed in `https://nologin.tools/sitemap.xml`:
- **HTTP Availability**: Verifies HTTP 200 response with zero 404, 500, or network drops.
- **Title & Meta Description**: Checks for non-empty `<title>` and `<meta name="description">`.
- **Canonical Consistency**: Validates that `<link rel="canonical">` matches the expected self-referencing or localized target.
- **Robots Directives**: Ensures indexable routes (`/`, `/zh/*`, `/tool/*`) allow indexing, while non-target locales enforce `noindex` as intended.
- **Schema.org JSON-LD**: Parses `<script type="application/ld+json">` for valid JSON syntax and required properties (`Review`, `SoftwareApplication`, `WebSite`, etc.).
- **Response Latency**: Measures edge response times and average round-trip latency.

*(Optional: If local `dist/` was freshly built or offline checks are requested, run `node scripts/daily-seo-audit.mjs --both`)*

---

### Phase 2: IndexNow Real-Time Search Engine Submission

Submit all indexable sitemap URLs to the IndexNow protocol:

```bash
node scripts/push-indexnow.mjs
```

- Target engines: Bing, Yandex, Seznam, Naver.
- Uses verification key: `c8d3e2b14f6a7905182746359012abcd` (hosted at `/c8d3e2b14f6a7905182746359012abcd.txt`).
- Reports total URLs submitted and HTTP response code from search engine endpoints.

---

### Phase 3: AI Crawler & GEO Discovery Verification

Verify that modern AI search bots (Perplexity, ChatGPT, Claude) and open web crawlers can discover site context:

1. **`robots.txt`**: Fetch `https://nologin.tools/robots.txt` and confirm:
   - Sitemap directive: `Sitemap: https://nologin.tools/sitemap.xml`
   - LLMs.txt directive: `llms-txt: https://nologin.tools/llms.txt`
   - Proper permissions for crawlers (e.g. `GPTBot`, `ClaudeBot`, `PerplexityBot`).
2. **`llms.txt` & `llms-full.txt`**: Fetch `https://nologin.tools/llms.txt` and `https://nologin.tools/llms-full.txt` to ensure HTTP 200 and valid markdown structure.

---

### Phase 4: Output Daily SEO Briefing (`每日 SEO 晨报`)

Conclude the run by presenting a structured, concise briefing to the user:

```markdown
### 📊 每日 SEO 与技术健康晨报 (<YYYY-MM-DD>)

- **核心页面巡检**:
  - 页面总数: <N> 页
  - HTTP 200 达标率: 100% (异常: 0)
  - 平均边缘响应时间: <N> ms
- **技术 SEO 指标**:
  - Canonical 标签一致性: ✅ 正常
  - Robots 索引策略隔离: ✅ 严格
  - Schema.org JSON-LD 语法: ✅ 校验通过 (<N> 个结构化数据)
- **搜索引擎分发 (IndexNow)**:
  - 提交 URL 数量: <N> 个
  - 提交状态: ✅ 成功推送至 Bing / Yandex
- **AI / GEO 可发现性**:
  - robots.txt / llms.txt: ✅ 正常可访问
- **待关注隐患或优化建议**:
  - 无异常 / 或列出发现的具体告警与建议
```
