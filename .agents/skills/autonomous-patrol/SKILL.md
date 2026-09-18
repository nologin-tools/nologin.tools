---
name: autonomous-patrol
description: >-
  Autonomous daily operations, vetting, and maintenance runbook for nologin.tools.
  Use this skill to review pending tool submissions, audit edit suggestions, perform
  daily rolling health & dead-link patrols (1000 tools), verify NoLogin Verified badges
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
4. **Execution Environment & Concurrency Guardrails**:
   - Remote D1 CLI: `npx wrangler d1 execute nologin-tools-db --remote --json --command "<SQL>"`
   - Browser: Always use `ego-browser` with `{ waitUntil: "domcontentloaded", timeout: 20000 }` to avoid hanging on streaming connections.
   - **Strict Serial Execution (Concurrency = 1)**: All browser operations (`ego-browser`, `inspect-tool-dogfood.mjs`, `benchmark.mjs`) MUST run sequentially. **Never spawn parallel subagents running ego-browser simultaneously**.
   - **Mandatory TaskSpace Cleanup**: Every browser session must be closed upon completion via `await task.finish({ keep: [] })`. Never leave orphan TaskSpaces in memory. Run `node scripts/clean-browser-spaces.mjs` before/after batch patrol runs to sweep any dangling spaces.

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

5. **Cognitive Agentic Dogfooding & Evaluation Protocol (CADES)**:
   For candidate tools (both new submissions and rolling audits), never rely solely on homepage marketing text or naive DOM heuristics. Execute the CADES inspection harness:
   ```bash
   node scripts/inspect-tool-dogfood.mjs "<URL>" --slug "<slug>" --json
   ```
   Or run with human-readable terminal output and visual checkpoint links:
   ```bash
   node scripts/inspect-tool-dogfood.mjs "<URL>" --slug "<slug>"
   ```

   **The CADES Harness Rigorously Executes in 3 Adaptive Stages**:
   1. **Stage 1: Intent Discovery & Visual Checkpoint 1 (Initial Impression)**:
      - **Zero Cold-Start Perception**: Tools are submitted with only `url` (no `core_task` exists yet). The harness extracts `<title>`, `meta[description]`, `h1/h2`, visible input placeholders (e.g. `"Paste cURL command..."`, `"Enter crontab..."`), and primary action buttons.
      - **Visual Checkpoint 1**: Takes an immediate full-screen capture (`/tmp/dogfood-<slug>-intent-*.png`). Checks for dark pattern ad-clutter, deceptive Google AdSense download buttons, and blocking modal overlays.
      - **Archetype Deduction**: Informs the Agent whether the tool is a JWT debugger, Regex matcher, SQL formatter, cURL converter, Markdown editor, Color palette generator, or Canvas whiteboard.
   2. **Stage 2: Context-Aware Dual-Modality Dogfooding**:
      - **Authentic Payload Injection**: Injects context-appropriate data (valid JWT tokens, regex patterns, SQL queries, cURL requests, or Markdown) instead of generic strings that cause syntax crashes in specialized tools.
      - **Canvas & Palette Interaction**: Simulates spacebar rolls on palette generators, or pointerdown/move strokes on interactive HTML5 canvases.
      - **Network Privacy Sniffing**: Hooks in-page `fetch` and `XMLHttpRequest` to strictly classify:
        - `data: Local Only` & `offline: Offline Capable`: Zero external backend POST payloads (Wasm, Canvas, client-side).
        - `data: Cloud Processed` & `offline: Online Only`: Remote cloud payload transmission.
      - **Export / Download Gatekeeper**: Arms `download` event listeners and clicks export/copy triggers, strictly detecting post-action bait traps ("Sign in to download", "Enter email").
   3. **Stage 3: Outcome Delivery & Visual Checkpoint 2 (Verification)**:
      - **Visual Checkpoint 2**: Captures outcome snapshot (`/tmp/dogfood-<slug>-outcome-*.png`).
      - **Visual Proof & Watermark Hunt**: Agent views the outcome image to verify that the Canvas/diagram actually rendered (bypassing DOM blindness) and confirms zero burned-in commercial watermarks ("Canva Free", "Trial Version").
      - **Task Crystallization**: Synthesizes the verified `core_task` directly from successful trial execution.

     **Step 5: Agent-Driven Cognitive Dogfooding via Native `ego-browser`**:
     **Strict Prohibition on Automated Rubber-Stamping**: Never approve a tool based solely on automated script output. The Agent MUST personally unleash its full cognitive capabilities directly through `ego-browser`:

     1. **Launch Dedicated TaskSpace & Inject Zero-Egress Network Snooper**:
        The Agent initiates an isolated `ego-browser` session with network payload interception:
        ```bash
        ego-browser nodejs <<'EOF'
        const task = await taskSpace("audit-<slug>");
        const page = task.page("p1");

        // Network snooper for zero-egress data sovereignty check
        await page.evaluate(() => {
          window.__netPayloads = [];
          const isTelemetry = (u) => /google-analytics|googletagmanager|clarity\.ms|sentry\.io|doubleclick|pagead|googlesyndication|pub\.network|adnxs|rubicon|criteo|fundingchoicesmessages|cloudflareinsights|fonts\.googleapis|cdnjs\.cloudflare/i.test(u);
          const origFetch = window.fetch;
          window.fetch = function(...args) {
            try {
              const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
              const method = (args[1]?.method || (typeof args[0] === 'object' ? args[0]?.method : 'GET') || 'GET').toUpperCase();
              if (Boolean(args[1]?.body) && !isTelemetry(url)) {
                window.__netPayloads.push({ type: 'fetch', method, url: url.slice(0, 150) });
              }
            } catch (e) {}
            return origFetch.apply(this, args);
          };
          const origXhrSend = XMLHttpRequest.prototype.send;
          const origXhrOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url) {
            this.__method = method ? method.toUpperCase() : 'GET';
            this.__url = url;
            return origXhrOpen.apply(this, arguments);
          };
          XMLHttpRequest.prototype.send = function(body) {
            try {
              if (body && !isTelemetry(this.__url || '')) {
                window.__netPayloads.push({ type: 'xhr', method: this.__method, url: (this.__url || '').slice(0, 150) });
              }
            } catch (e) {}
            return origXhrSend.apply(this, arguments);
          };
        }).catch(() => false);

        await page.goto("<URL>", { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: "/tmp/audit-<slug>-initial.png" });
        console.log("INITIAL_URL:", await page.url());
        console.log("SNAPSHOT:", await page.snapshot());
        EOF
        ```
        - If the site redirects to Google/GitHub login walls or a pure login screen, **immediately reject the tool**.

     2. **Agent Visual Eye-Check (Checkpoint 1)**:
        - The Agent MUST use `view_file` to personally inspect the initial screenshot: `/tmp/audit-<slug>-initial.png`.
        - Verify overall UI polish, layout clarity, and absence of deceptive fake download banners or obstructive popups.

     3. **Authentic Interaction & Grounded Fixture Injection via `ego-browser`**:
        The Agent formulates a tool-specific testing plan and exercises the tool's core utility:
        - **File Upload Tools**: Inject standard lab fixtures (`scripts/lab/fixtures/sample.png`, `sample.svg`, `sample.pdf`, `sample.json`, `sample.md`, `sample.wav`):
          ```js
          await page.setInputFiles('input[type="file"]', '/Users/lin/hime/nologin.tools/scripts/lab/fixtures/sample.png');
          ```
        - **Text / Code Tools**: Fill inputs with context-aware data (`await page.fill(...)`), click transform/calculate buttons (`await page.click(...)`).
        - **Interactive Canvas / Audio Tools**: Agent can freely trigger drag-and-drop, sliders, and canvas operations using native `page.mouse` or `page.dragAndDrop()`.
        - **Self-Healing**: If popups or cookie dialogs obstruct the view, the Agent dynamically dismisses them in the session.

     4. **Visual Verification of Outcome (Checkpoint 2)**:
        - Capture post-action outcome screenshot:
          ```js
          await page.screenshot({ path: "/tmp/audit-<slug>-outcome.png" });
          ```
        - The Agent MUST use `view_file` to inspect the outcome image. Confirm that the canvas/diagram actually rendered (not blank or whiteout) and that no unexpected commercial watermark appeared.

     5. **Artifact Inspection & Zero-Egress Network Audit**:
        - If an export/download was performed, run a quick node one-liner to inspect the downloaded artifact via `output-inspector.mjs`:
          ```bash
          node -e '
          import { inspectArtifact } from "./scripts/lab/inspectors/output-inspector.mjs";
          console.log(JSON.stringify(inspectArtifact("/path/to/downloaded-file"), null, 2));
          '
          ```
          *Verifies Magic Bytes format integrity (guards against bait-and-switch HTML login traps) and scans for commercial watermarks.*
        - Inspect outgoing network payloads (`await page.evaluate(() => window.__netPayloads)`). If zero non-telemetry requests were sent, verify as `data:Local Only` & `offline:Offline Capable`.
        - Clean up the session: `await task.finish({ keep: [] })`.

     6. **Authentic Editorial Synthesis & Grounded Benchmark Notes**:
        - The Agent personally determines the 5-dimension scores:
          - Frictionless UX (0–20)
          - Functional Depth & Fidelity (0–25)
          - Export Freedom (0–20)
          - Privacy & Data Sovereignty (0–20)
          - Stability & Polish (0–15)
        - **Grounded Benchmark Notes**: The Agent records exact real-world test details in `src/data/tool-editorial.json` (e.g. *"CADES Agent 实测通过：上传 800x600 标准 PNG 样本，纯前端 WebAssembly 本地压缩处理，耗时 320ms，零网络外溢，无损无水印导出。"*).
        - **Hard Gate**: If total product score < 70, or if an auth barrier/commercial watermark is detected, **immediately reject the tool**.


6. **Final Evaluation, D1 Write & Multi-Language Translation**:
   - **Approve (Tier S/A: ≥ 22 pts | Tier B: 16–21 pts & Product Score ≥ 70)**:
     - The tool functions directly without mandatory login, successfully passes the export/download gatekeeper check, has **NoLogin Lab Product Score ≥ 70**, and has zero anti-bait traps.
     - Tools scoring **≥ 90 (Editor's Choice)** should also be evaluated for `is_featured` toggle.
     - **Synthesize Metadata** (from dogfood inspection results, stripping marketing buzzwords):
       - `name`: Clean brand name from inspection `metadata.name`.
       - `description`: 1-2 objective, factual English sentences explaining exact capabilities and processing mode.
       - `core_task`: Action phrase summarizing the verified no-login utility crystallized in Stage 3.
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
     - **Synchronize Deep Editorial Review into `src/data/tool-editorial.json` (Required)**:
       Whenever approving a tool, the Agent MUST upgrade the preliminary entry in `src/data/tool-editorial.json` (both `en` and `zh`) with authentic qualitative insights derived from dogfooding:
       - `bestFor`: Exact workflow scenario and target persona it serves best.
       - `pros`: 3 specific, technically accurate advantages.
       - `cons`: 1-2 honest trade-offs, browser performance boundaries, or missing power features.
       - `privacyVerdict`: Architectural privacy qualitative verdict based on network traffic & storage inspections.
       - `alternativeTo`: Commercial / proprietary desktop or SaaS apps it can effectively replace.
    - **Reject (Tier C: < 16 pts, Product Score < 70, or Hard Gate Blocker)**:
      - Initial Auth Wall: `rejection_reason = '首屏强制要求注册/登录 (' || reason || ')'`
      - Bait-and-Switch (Export gatekeeper failed): `rejection_reason = '诱导拦截 (Bait-and-Switch): 核心操作/导出时弹出强制登录 (' || details || ')'`
      - Lab Product Score < 70 or Watermark: `rejection_reason = 'NoLogin Lab 实测未达标 (< 70分) 或存在导出限制/强制商业水印'`
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

### Phase 2: Rolling Health & Dead-Link Patrol (1000 Tools)

1. Select 1000 approved tools using dynamic priority with platform subdomain risk weighting:
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
   LIMIT 1000;
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

### Phase 2: Dual-Track Daily Rolling Patrol & Continuous Dogfooding

To prevent approved tools from silently introducing commercial watermarks, export login walls, or suffering from stale descriptions, the daily patrol operates on a **Dual-Track Cadence** across the ~296 approved tools catalog:

#### Track A: High-Frequency Liveness & Dead-Link Patrol (1000 Tools)
1. Select 1000 approved tools using dynamic priority:
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
   LIMIT 1000;
   ```
2. For each tool:
   - Check connectivity and latency.
   - Record check in `health_checks`:
     ```sql
     INSERT INTO health_checks (tool_id, checked_at, is_online, http_status, response_time_ms)
     VALUES (?, unixepoch(), ?, ?, ?);
     ```
   - If site is dead (404, DNS error, expired parking page):
     - Mark as `unstable`: `UPDATE tools SET status = 'unstable' WHERE id = ?;`

#### Track B: Rolling Scheduled CADES Level 2 Dogfooding (15–25 Tools/Day)
**Never restrict Level 2 solely to anomalies.** Normal-looking homepages can hide post-action paywalls, burned-in watermarks, and feature upgrades. All ~296 approved tools must cycle through full Level 2 CADES dogfooding on a rolling 12–15 day cadence:
1. **Execute Rolling CADES Dogfooding**:
   ```bash
   node scripts/inspect-tool-dogfood.mjs --rolling 20 --sync
   ```
   *The `--rolling` engine automatically sorts by oldest `testedAt` first, ensuring every tool is thoroughly dogfooded every 2 weeks.*
2. **What CADES Continuously Audits**:
   - **Post-Action Traps**: Clicks export/download buttons to verify no silent "Sign in to download" paywalls were added.
   - **Visual Watermark Hunt**: Inspects outcome screenshots to catch commercial watermarks or broken canvas renders.
   - **Metadata Self-Healing**: Automatically detects functional drift and updates `core_task` and `description` in D1 if the tool expanded features:
     ```sql
     UPDATE tools SET core_task = ?, description = ? WHERE slug = ?;
     ```
   - **Freshness**: Refreshes `tool-editorial.json` with updated `testedAt` and empirical scores.

#### Track C: Immediate Anomaly Escalation Protocol
If Track A (or user feedback) flags unexpected 301/302 redirects, title changes, or connection drops on an approved tool:
1. Immediately prioritize the tool into a single-tool CADES inspection:
   ```bash
   node scripts/inspect-tool-dogfood.mjs "<URL>" --slug "<slug>" --existing-task "<core_task>"
   ```
2. If degradation or login trap is confirmed:
   - Mark as `unstable`:
     ```sql
     UPDATE tools SET status = 'unstable', rejection_reason = '日常复测异常: 发现后置诱导登录、强制商业水印或导出中断' WHERE slug = ?;
     ```
   - Remove `is_featured` if present:
     ```sql
     UPDATE tools SET is_featured = 0, featured_at = NULL WHERE slug = ?;
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
- **Rolling Patrol (1000 Tools)**:
  - Healthy (Online): A
  - Abnormal / Unstable: B (list names & detected issues)
  - Redirects Self-Healed: C (list old -> new URLs)
- **Badge Detections**:
  - Newly detected explicit badges: D (list tools)
- **GitHub Sync**:
  - Repositories refreshed: E
```

