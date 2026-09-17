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

5. **Interactive Ego-Browser Dogfooding & Verification Protocol**:
   For surviving candidates, never rely solely on homepage text or meta descriptions. Execute the standardized dogfooding inspection script:
   ```bash
   node scripts/inspect-tool-dogfood.mjs "<URL>" --json
   ```
   Or run with human-readable terminal report:
   ```bash
   node scripts/inspect-tool-dogfood.mjs "<URL>"
   ```

   **The Automated Dogfooding Harness Rigorously Verifies**:
   1. **Initial Blocker & Auth Wall Scan**:
      - Detects full-screen modal overlays, cookie consent vs blocking auth traps, and pure login/registration entry pages with `<input type="password">`.
   2. **Interactive Surface Discovery**:
      - Identifies active inputs (`textarea`, Monaco/CodeMirror editors, `contenteditable`), file dropzones/inputs (`input[type="file"]`), interactive HTML5 canvases, and operational action buttons.
   3. **Live Core Functional Dogfooding**:
      - Injects test payload (e.g. JSON structure / text) into input controls.
      - Triggers core action buttons (`Format`, `Beautify`, `Convert`, `Generate`, `Run`, `Compress`, `Validate`, `Calculate`).
      - Confirms whether live output/results are rendered without error.
   4. **Export / Download Gatekeeper Check (Anti-Bait-and-Switch)**:
      - Searches for and clicks `Download`, `Export`, `Copy`, `Save` controls.
      - Arms browser download event listener (`page.waitForEvent('download')`).
      - Strictly catches post-action deceptive traps: newly opened modals demanding "Sign in with Google", "Enter your email to download", or redirection to paywalls/auth routes.
   5. **Network Traffic & Privacy Architecture Sniffing**:
      - Hooks in-page `fetch` and `XMLHttpRequest` to capture outgoing network payloads (filtering standard CDN and privacy analytics).
      - Classifies architecture:
        - `data: Local Only` & `offline: Offline Capable`: Zero external backend POST payloads, executes client-side (WebAssembly, WebWorker, Canvas).
        - `data: Cloud Processed` & `offline: Online Only`: User payload is transmitted to remote cloud APIs for server-side processing.
   6. **Five-Dimension Scorecard (25 Points)**:
      - `No-Login Completeness (1–5)`: 5 = completely free & unhindered; 1 = bait-and-switch or auth trap.
      - `Privacy & Architecture (1–5)`: 5 = local-first / Wasm / open-source; 3 = cloud processed; 1 = heavy tracking / ad trap.
      - `Utility & Independence (1–5)`: 5 = full universal utility; 1 = doorway page / empty template.
      - `Clean UX & Design (1–5)`: 5 = modern, distraction-free; 1 = ad-cluttered.
      - `Health & Stability (1–5)`: 5 = fast HTTPS on dedicated domain; 1–2 = hobby subdomains, 404/500 errors.

6. **Final Evaluation, D1 Write & Multi-Language Translation**:
   - **Approve (Tier S/A: ≥ 22 pts | Tier B: 16–21 pts)**:
     - The tool functions directly without mandatory login, successfully passes the export/download gatekeeper check, and scores ≥ 16.
     - **Synthesize Metadata** (from dogfood inspection results, stripping marketing buzzwords):
       - `name`: Clean brand name from inspection `metadata.name`.
       - `description`: 1-2 objective, factual English sentences explaining exact capabilities and processing mode.
       - `core_task`: Action phrase summarizing the no-login utility (e.g., "Format and validate JSON data in browser").
       - `repo_url`: Extracted GitHub repository URL if present.
       - `category`: Exactly one of the 11 valid categories (`AI`, `Design`, `Writing`, `Development`, `Productivity`, `Utilities`, `Media`, `Security`, `Math`, `Finance`, `Privacy`).
       - `tags`: Generated taxonomy tags:
         - `category:<Cat>`
         - `data:Local Only` or `data:Cloud Processed`
         - `privacy:No Tracking` or `privacy:Minimal`
         - `type:Web App` (or API/CLI)
         - `hosting:Cloud Only` or `hosting:Self-Hostable`
         - `offline:Offline Capable` or `offline:Online Only`
         - `pricing:Free` or `pricing:Freemium`
         - `source:Open Source` (if `repo_url` is present)
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
     - **Synchronize Multi-Language Translations (Required)**:
       Whenever approving a tool, the Agent MUST immediately generate and commit translations for all 7 supported non-English locales (`zh`, `ja`, `ko`, `es`, `fr`, `de`, `pt`) into `src/data/translations/{locale}.json`:
       1. Synthesize authentic, natural translations for `description` and `coreTask` (action-oriented phrase starting with an action verb, incorporating natural no-login phrasing like "无需登录", "ログイン不要", "sin registro", "ohne Anmeldung", "côté client").
       2. Write the payload to a scratch file and apply:
          ```bash
          node scripts/sync-tool-translations.mjs --apply <payload.json>
          ```
       3. Verify all 7 locales now contain the tool: `node scripts/sync-tool-translations.mjs --status`.
   - **Reject (Tier C: < 16 pts or Hard Gate Blocker)**:
     - Initial Auth Wall: `rejection_reason = '首屏强制要求注册/登录 (' || reason || ')'`
     - Bait-and-Switch (Export gatekeeper failed): `rejection_reason = '诱导拦截 (Bait-and-Switch): 核心操作/导出时弹出强制登录 (' || details || ')'`
     - Dead link / Timeout: `rejection_reason = '站点无法访问/已失效 (HTTP 404/DNS错误/超时)'`
     - Domain parking: `rejection_reason = '域名停放/已过期转售'`
     - Low Score / Poor UX: `rejection_reason = '综合评分过低 (< 16分)，工具体验或独立性不佳'`
     - Update status:
       ```sql
       UPDATE tools SET status = 'rejected', rejection_reason = ? WHERE id = ?;
       ```

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
   - If `description` or `core_task` was modified: The Agent must update and re-sync the translations for all 7 locales via `node scripts/sync-tool-translations.mjs --apply <payload.json>`.
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

