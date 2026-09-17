---
name: autonomous-patrol
description: >-
  Autonomous daily operations, vetting, and maintenance runbook for nologin.tools.
  Use this skill to review pending tool submissions, audit edit suggestions, perform
  daily rolling health & dead-link patrols (100 tools), verify NoLogin Verified badges
  across homepage DOM and GitHub README, refresh open-source repository metadata, and
  update remote Cloudflare D1 database autonomously.
---

# Autonomous Daily Patrol & Review (`autonomous-patrol`)

This skill defines the autonomous operations runbook for `nologin.tools`. The Agent is fully authorized to query and update the remote Cloudflare D1 database (`nologin-tools-db`) using `npx wrangler d1 execute nologin-tools-db --remote`. No manual user confirmation is required for high-confidence decisions.

---

## 1. Operating Principles & Safety Guardrails

1. **Zero Destructive Deletes**: Never execute `DELETE FROM tools`. Inactive, dead, or non-compliant tools are marked `status = 'unstable'` or `'rejected'`. All operations must remain reversible.
2. **High-Confidence Autonomous Action**:
   - Approve when no-login capability is verified on the live site.
   - Reject when mandatory login, dead-links (404/DNS failure), domain parking, or scam/spam is confirmed. Always record a clear `rejection_reason`.
   - Ambiguous/edge cases: Keep `status = 'pending'` and highlight in the daily summary.
3. **Domain Quality Gates & Anti-Spam Rigor**:
   - Treat hosting domain as a primary signal of tool longevity and intent.
   - Prohibit ephemeral tunnels, preview/branch builds, storefronts, and SEO multi-slicing.
   - Fast-track verified open-source static tools (`*.github.io`) with active repositories.
   - Strictly limit platform subdomains (`*.vercel.app`, `*.pages.dev`, `*.netlify.app`) to 1 high-quality tool per root host.
4. **Execution Environment**:
   - Remote D1 CLI: `npx wrangler d1 execute nologin-tools-db --remote --json --command "<SQL>"`
   - Browser: Always use `ego-browser` with `{ waitUntil: "domcontentloaded", timeout: 20000 }` to avoid hanging on streaming connections.

---

## 2. Execution Workflow

### Phase 1: Clear Pending Queue (Submissions & Edit Suggestions)

#### A. Pending Tools (`status = 'pending'`)
> **Note on Simplified Submission**: Tools are submitted with only `url` (and optional `submitter_email`). During review, the Agent inspects the URL against domain quality gates, opens valid candidates with `ego-browser`, confirms no-login usability, synthesizes objective metadata, and assigns taxonomy tags automatically.

1. Query pending tools:
   ```bash
   npx wrangler d1 execute nologin-tools-db --remote --json --command "SELECT id, name, url, description, core_task, submitter_email, repo_url FROM tools WHERE status = 'pending' ORDER BY id ASC;"
   ```

2. **Quality Gate 1: Immediate Hard Rejection Filters (Pre-Browser Checks)**
   Before launching browser sessions, immediately reject non-compliant submissions matching any of the following patterns:
   - **Ephemeral Tunnels & Temporary Hosts**: Host contains `trycloudflare.com`, `ngrok`, `localtunnel`, `catbox.moe`, `drive.google.com`, `dropbox.com`, or `*.chatgpt.site`.
     - `rejection_reason = '临时穿透隧道/临时网盘直链/chatgpt.site临时子域'`
   - **Preview & Branch Deployments**: Host matches `*-git-*.vercel.app`, `*-preview-*.pages.dev`, `*-preview.netlify.app`, or contains preview/PR hashes. Tools must be on a stable, production canonical URL.
     - `rejection_reason = '临时构建预览/非生产环境部署分支链接'`
   - **Direct Repositories & Non-Web Apps**: URL starts with `https://github.com/` (un-deployed code repo), or links to Chrome Web Store / desktop-only installers without an in-browser web app.
     - `rejection_reason = '直接提交 GitHub 仓库链接 (未部署为在线 Web 工具)'` or `'本地客户端软件下载/Chrome扩展插件 (非免登录网页工具)'`
   - **Commercial Stores & Paid Downloads**: Host contains `gumroad.com`, `lemonsqueezy.com`, `/shop/`, or task indicates paid digital downloads / Stripe checkout.
     - `rejection_reason = '数字商品销售页/付费软件下载/Shopify商店'`
   - **SEO Campaign & Tracking Pollution**: URL contains bulk marketing query parameters (`utm_campaign=`, `utm_source=nologin`, `utm_medium=directory`).
     - `rejection_reason = '携带批量外链推广跟踪参数'`
   - **Low-Quota Paywall Bait**: Description or task indicates 1 free query, 3 free tasks/day before a hard paywall.
     - `rejection_reason = '极低单日免费额度诱饵/本质为付费漏斗'`
   - **Entertainment & Divination**: Horoscope, tarot, astrology, casual mini-games, or quizzes that do not belong in productivity/utility/privacy directory.
     - `rejection_reason = '游戏试玩/星座占卜/心理测试/娱乐休闲内容 (不符合生产力/隐私免登录工具定位)'`
   - **Spam Bots & Dummy Submissions**: Submitter email from automated agent pools (`@agent.qq.com`, `foundagent.net`), or core_task is placeholder/trivial (length < 10, "use tool", "check", "所有事情").
     - `rejection_reason = '自动化脚本提交/无意义核心任务描述'`

3. **Quality Gate 2: Platform Subdomain Rules (`vercel.app`, `pages.dev`, `netlify.app`, `hf.space`, `streamlit.app`)**
   - **Anti-Slicing Policy (Max 1 Tool Per Host)**: Check if the database already contains an approved or pending tool with the same hostname. If the submitter created multiple slices (e.g. `domain.pages.dev/tool-1`, `domain.pages.dev/tool-2`):
     - Keep only the primary/most comprehensive root tool.
     - Reject all redundant slices: `rejection_reason = '同一主域名重复切片/重复提交 (已存在首选条目)'`.
   - **Finished Production State**: In `ego-browser`, verify the site is not an unfinished starter template, demo assignment, or sample app containing `Lorem ipsum` or blank placeholders.

4. **Quality Gate 3: Open-Source Green Channel (`*.github.io`)**
   - If URL is on `*.github.io` and has an associated GitHub repository:
     - Verify the repo is active and not impersonated.
     - Prioritize approval for client-side privacy-first web apps (e.g., CyberChef, SVGOMG).
     - Automatically populate `repo_url` and assign `source:Open Source`.

5. For surviving candidates, open with `ego-browser`:
   ```bash
   ego-browser nodejs <<'INNER'
   const task = await taskSpace("inspect pending tool");
   const page = task.page("p1");
   await page.goto("<URL>", { waitUntil: "domcontentloaded", timeout: 20000 });
   const info = await page.evaluate(() => {
     const text = document.body.innerText;
     const hasLogin = /sign in|log in|create account|register/i.test(text);
     const fileInputs = document.querySelectorAll('input[type="file"]').length;
     const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                      document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
     const ogTitle = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
                     document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
     const githubLink = document.querySelector('a[href*="github.com/"]')?.getAttribute('href') || '';
     return { title: document.title, ogTitle, metaDesc, githubLink, hasLogin, fileInputs, textSnippet: text.slice(0, 1000) };
   });
   console.log(JSON.stringify(info));
   await task.finish({ keep: [] });
INNER
   ```

6. Final evaluation & D1 write:
   - **Approve**: Tool functions directly in the browser without mandatory login or account creation.
     - **Synthesize Metadata**:
       - `name`: Clean brand name from title/ogTitle (strip " - Free Online...", " | Best...", etc.).
       - `description`: 1-2 objective, neutral English sentences explaining what the tool does.
       - `core_task`: Action phrase summarizing the no-login utility (e.g., "Draw diagrams and export to PNG").
       - `repo_url`: Extracted GitHub repo URL if found (or null).
       - `category`: Exactly one of the 11 valid categories: `AI`, `Design`, `Writing`, `Development`, `Productivity`, `Utilities`, `Media`, `Security`, `Math`, `Finance`, `Privacy`.
       - Other tags: `pricing` (Free/Freemium), `type` (Web App/API/CLI), `data` (Local Only/Cloud Processed), `hosting` (Self-Hostable/Cloud Only), `offline` (Offline Capable/Online Only).
     - **Update Remote D1**:
       ```sql
       UPDATE tools SET
         name = ?,
         description = ?,
         core_task = ?,
         repo_url = ?,
         status = 'approved',
         approved_at = unixepoch()
       WHERE id = ?;
       ```
     - **Insert Tags**:
       Insert category and other taxonomy tags into `tags` table (`tool_id`, `tag_key`, `tag_value`). If `repo_url` is present, insert `source:Open Source`.
   - **Reject**:
     - Hard login wall (cannot use core task without account) -> `rejection_reason = '强制注册登录才能使用核心功能'`.
     - Dead link (404, 500, DNS failure, timeout) -> `rejection_reason = '站点无法访问/已失效 (HTTP 404/DNS错误)'`.
     - Domain parking ("domain for sale", registrar landing page) -> `rejection_reason = '域名停放/已过期转售'`.
     - Update status: `UPDATE tools SET status = 'rejected', rejection_reason = ? WHERE id = ?;`

#### B. Pending Edit Suggestions (`status = 'pending'`)
1. Query suggestions:
   ```bash
   npx wrangler d1 execute nologin-tools-db --remote --json --command "SELECT * FROM edit_suggestions WHERE status = 'pending';"
   ```
2. Verify proposed changes:
   - New `url`: Verify it is accessible, adheres to domain quality gates, and resolves to the same legitimate service. If valid, update `tools.url` and `tools.slug`.
   - New `repo_url`: Verify GitHub repo exists and matches the tool.
   - Tag/Description updates: Ensure objective language and accuracy.
3. Apply:
   - Approved: Update `tools` table, then `UPDATE edit_suggestions SET status = 'approved' WHERE id = ?;`
   - Rejected: `UPDATE edit_suggestions SET status = 'rejected' WHERE id = ?;`

---

### Phase 2: Rolling Health & Dead-Link Patrol (100 Tools)

1. Select 100 approved tools using dynamic priority with platform subdomain risk weighting:
   - Priority 1: Tools currently marked `status = 'unstable'` (recheck for recovery).
   - Priority 2: Tools on high-churn platform subdomains (`%.vercel.app%`, `%.pages.dev%`, `%.netlify.app%`, `%.hf.space%`) not checked in the last 24 hours.
   - Priority 3: Tools with oldest or missing `last_checked_at` in `health_checks`.
   ```sql
   SELECT t.id, t.name, t.url, t.status, t.repo_url,
          (SELECT MAX(checked_at) FROM health_checks WHERE tool_id = t.id) as last_checked
   FROM tools t
   WHERE t.status IN ('approved', 'unstable')
   ORDER BY
     (CASE WHEN t.status = 'unstable' THEN 0
           WHEN t.url LIKE '%.vercel.app%' OR t.url LIKE '%.pages.dev%' OR t.url LIKE '%.netlify.app%' THEN 1
           ELSE 2 END) ASC,
     last_checked ASC NULLS FIRST
   LIMIT 100;
   ```
2. For each tool:
   - Check connectivity and latency.
   - If redirects occur: detect if domain permanently migrated (301) and update `url` and `slug`.
   - If site is dead (404, DNS error, expired parking page) or stealth login wall was added:
     - Mark as `unstable`: `UPDATE tools SET status = 'unstable' WHERE id = ?;`
   - Record check in `health_checks`:
     ```sql
     INSERT INTO health_checks (tool_id, checked_at, is_online, http_status, response_time_ms)
     VALUES (?, unixepoch(), ?, ?, ?);
     ```

---

### Phase 3: Dual-Surface Badge Verification

Inspect both the **Tool Primary Website** and **GitHub README** for official badges:

1. **Homepage DOM Check (`ego-browser`)**:
   - Inspect rendered DOM for badge indicators:
     - Explicit: `nologin.tools/badge`, `nologintools.org/badge` in `<img>` or `<a>` href/src.
     - Implicit: mentions of `nologin.tools`, `nologintools.org`, or `Verified by NoLoginTools`.
2. **GitHub README Check** (if `repo_url` is present):
   - Fast fetch: `https://raw.githubusercontent.com/<owner>/<repo>/HEAD/README.md`
   - Check for badge markdown/html.
3. Update `badge_displays` table:
   ```sql
   INSERT INTO badge_displays (tool_id, display_type, last_checked_at)
   VALUES (?, ?, unixepoch())
   ON CONFLICT(tool_id) DO UPDATE SET
     display_type = excluded.display_type,
     last_checked_at = excluded.last_checked_at;
   ```
   *(Note: `explicit` awards +10 recommendation points on homepage; `implicit` awards +5 points)*

---

### Phase 4: Open-Source Metadata Refresh

For tools with `repo_url`:
1. Parse repo owner and name.
2. Query GitHub API: `https://api.github.com/repos/<owner>/<repo>`.
3. Update `tools` table:
   ```sql
   UPDATE tools SET
     github_stars = ?,
     github_forks = ?,
     github_license = ?,
     github_language = ?,
     github_updated_at = ?,
     github_fetched_at = unixepoch()
   WHERE id = ?;
   ```

---

### Phase 5: Generate Daily Briefing

At the conclusion of the run, format and output a concise report:

```markdown
### 🤖 Daily Operations Briefing (<YYYY-MM-DD>)

- **Pending Submissions**:
  - Approved: X (list names & categories)
  - Rejected: Y
    - 🚫 Hard Login Wall: Y1
    - 🌐 Domain / Tunnel / Branch Preview: Y2
    - ✂️ Slicing / SEO Spam / Bot: Y3
    - 💀 Dead Link / DNS Failure: Y4
    - 📦 Desktop Client / Storefront: Y5
  - Pending Review: Z (ambiguous items)
- **Edit Suggestions**:
  - Approved: X | Rejected: Y
- **Rolling Patrol (100 Tools)**:
  - Healthy (Online): A
  - Abnormal / Unstable: B (list names & detected issues)
  - Redirects Self-Healed: C (list old -> new URLs)
- **Badge Detections**:
  - Newly detected explicit badges: D (list tools)
- **GitHub Sync**:
  - Repositories refreshed: E
```

